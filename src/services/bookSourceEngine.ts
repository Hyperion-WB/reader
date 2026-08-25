import { BookSource, Chapter, SearchResultItem } from '../types/reader';
import { universalFetch, decodeResponseText } from './tauriBridge';
import { DEFAULT_BOOK_SOURCES } from './defaultSources';

export class BookSourceEngine {
  private sources: BookSource[] = [];
  private contentCache = new Map<string, string>(); // url -> text

  constructor(initialSources: BookSource[] = []) {
    this.sources = initialSources;
  }

  public setSources(sources: BookSource[]) {
    this.sources = sources;
  }

  public getSources(): BookSource[] {
    return this.sources;
  }

  // Resolve relative URLs accurately
  public static resolveUrl(relativeUrl: string, baseUrl: string): string {
    if (!relativeUrl) return baseUrl;
    const cleanRel = relativeUrl.trim();
    if (cleanRel.startsWith('//')) {
      return `https:${cleanRel}`;
    }
    if (cleanRel.startsWith('http://') || cleanRel.startsWith('https://')) {
      return cleanRel;
    }
    try {
      return new URL(cleanRel, baseUrl).href;
    } catch {
      if (cleanRel.startsWith('/')) {
        const match = baseUrl.match(/^(https?:\/\/[^\/]+)/i);
        return match ? `${match[1]}${cleanRel}` : cleanRel;
      }
      return `${baseUrl.replace(/\/+$/, '')}/${cleanRel.replace(/^\/+/, '')}`;
    }
  }

  // Extract text or attribute using rule format e.g. "h3 a@text", "a@href", "img@src", "$.name"
  public static extractByRule(container: Element | Document, ruleStr?: string): string {
    if (!ruleStr) return '';
    try {
      const parts = ruleStr.split('@');
      const selector = parts[0].trim();
      const attr = parts[1]?.trim()?.toLowerCase() || 'text';

      let targetEl: Element | null = null;
      if (selector === '' || selector === 'text' || selector === 'href' || selector === 'src') {
        targetEl = container as Element;
      } else {
        const selectors = selector.split(',');
        for (const s of selectors) {
          try {
            targetEl = container.querySelector(s.trim());
            if (targetEl) break;
          } catch {}
        }
      }

      if (!targetEl) return '';

      if (attr === 'href') {
        return targetEl.getAttribute('href') || (targetEl as HTMLAnchorElement).href || '';
      } else if (attr === 'src') {
        return (
          targetEl.getAttribute('src') ||
          targetEl.getAttribute('data-src') ||
          targetEl.getAttribute('data-original') ||
          targetEl.getAttribute('data-echo') ||
          targetEl.getAttribute('data-lazy-src') ||
          targetEl.getAttribute('data-cfsrc') ||
          (targetEl as HTMLImageElement).src ||
          ''
        );
      } else if (attr === 'html') {
        return targetEl.innerHTML || '';
      } else {
        return targetEl.textContent?.trim() || '';
      }
    } catch {
      return '';
    }
  }

  // Helper to extract value from nested JSON object using dot or JSONPath notation
  private static extractFromJson(item: any, keyNames: string[]): string {
    if (!item || typeof item !== 'object') return '';
    for (const k of keyNames) {
      if (!k) continue;
      const cleanKey = k.replace(/^\$\.?/, '').trim();
      if (cleanKey.includes('.')) {
        const parts = cleanKey.split('.');
        let cur = item;
        for (const p of parts) {
          if (cur && typeof cur === 'object' && p in cur) {
            cur = cur[p];
          } else {
            cur = undefined;
            break;
          }
        }
        if (cur !== undefined && cur !== null && typeof cur !== 'object') {
          return String(cur).trim();
        }
      } else if (cleanKey in item && item[cleanKey] !== undefined && item[cleanKey] !== null) {
        if (typeof item[cleanKey] !== 'object') {
          return String(item[cleanKey]).trim();
        }
      }
    }
    return '';
  }

  // Convert Legado 3.0 Book Source JSON to unified BookSource model
  public static parseLegadoSource(rawJson: any, defaultGroupName?: string): BookSource[] {
    const list = Array.isArray(rawJson) ? rawJson : [rawJson];
    const results: BookSource[] = [];

    for (const item of list) {
      if (!item) continue;
      const name = item.bookSourceName || item.name || '未命名书源';
      const url = item.bookSourceUrl || item.url || '';
      if (!url) continue;

      const groupName = defaultGroupName?.trim() || item.bookSourceGroup || item.groupName || '默认导入组';
      const ruleSearch = item.ruleSearch || {};
      const ruleToc = item.ruleToc || {};
      const ruleContent = item.ruleBookContent || item.ruleContent || {};

      results.push({
        id: `source-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        url,
        enabled: item.enabled !== false,
        groupName,
        weight: item.weight || item.customOrder || 50,
        type: 'legado',
        rule: {
          searchUrl: item.searchUrl || '',
          ruleSearch: {
            bookList: ruleSearch.bookList || ruleSearch.authorList || '',
            name: ruleSearch.name || ruleSearch.bookName || '',
            author: ruleSearch.author || '',
            intro: ruleSearch.intro || '',
            coverUrl: ruleSearch.coverUrl || '',
            bookUrl: ruleSearch.bookUrl || '',
            latestChapter: ruleSearch.latestChapter || ''
          },
          ruleToc: {
            chapterList: ruleToc.chapterList || '',
            chapterName: ruleToc.chapterName || '',
            chapterUrl: ruleToc.chapterUrl || ''
          },
          ruleContent: {
            content: ruleContent.content || ''
          }
        },
        customHeaders: typeof item.header === 'string' ? undefined : item.header
      });
    }
    return results;
  }

  // Multi-source Parallel Search Aggregator with streaming callback & per-source timeout
  public async searchAcrossSources(
    keyword: string,
    onProgress?: (results: SearchResultItem[]) => void
  ): Promise<SearchResultItem[]> {
    const cleanKeyword = keyword.trim();
    if (!cleanKeyword) return [];

    const userEnabled = this.sources.filter((s) => s.enabled && s.rule?.searchUrl);
    const combinedSourcesMap = new Map<string, BookSource>();
    userEnabled.forEach((s) => combinedSourcesMap.set(s.url || s.id, s));
    DEFAULT_BOOK_SOURCES.forEach((s) => {
      if (!combinedSourcesMap.has(s.url || s.id)) {
        combinedSourcesMap.set(s.url || s.id, s);
      }
    });
    const candidateSources = Array.from(combinedSourcesMap.values());

    const aggregatedResults: SearchResultItem[] = [];
    const seenTitles = new Set<string>();

    const searchPromises = candidateSources.map(async (source) => {
      try {
        let rawSearchRule = source.rule?.searchUrl || '';
        if (!rawSearchRule) return;

        let method = 'GET';
        let requestBody: any = undefined;
        let requestHeaders: Record<string, string> = {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json, text/html, application/xhtml+xml, */*',
          ...source.customHeaders
        };

        let targetUrl = rawSearchRule;

        // Parse Legado POST / JSON options format: url,{"method":"POST","body":...}
        if (targetUrl.includes(',{')) {
          const splitIdx = targetUrl.indexOf(',{');
          const urlPart = targetUrl.slice(0, splitIdx).trim();
          const optPart = targetUrl.slice(splitIdx + 1).trim();
          targetUrl = urlPart;
          try {
            const opts = JSON.parse(optPart);
            if (opts.method) method = String(opts.method).toUpperCase();
            if (opts.headers) Object.assign(requestHeaders, opts.headers);
            if (opts.body) {
              if (typeof opts.body === 'string') {
                requestBody = opts.body
                  .replace(/\{\{\s*(?:key|keyword)\s*\}\}/gi, encodeURIComponent(cleanKeyword))
                  .replace(/\{\s*(?:key|keyword)\s*\}/gi, encodeURIComponent(cleanKeyword));
              } else {
                requestBody = JSON.stringify(opts.body)
                  .replace(/\{\{\s*(?:key|keyword)\s*\}\}/gi, cleanKeyword)
                  .replace(/\{\s*(?:key|keyword)\s*\}/gi, cleanKeyword);
              }
            }
          } catch {}
        } else if (targetUrl.includes('@post->')) {
          const parts = targetUrl.split('@post->');
          targetUrl = parts[0].trim();
          method = 'POST';
          requestBody = parts[1]
            ?.trim()
            .replace(/\{\{\s*(?:key|keyword)\s*\}\}/gi, encodeURIComponent(cleanKeyword))
            .replace(/\{\s*(?:key|keyword)\s*\}/gi, encodeURIComponent(cleanKeyword));
          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        // Replace keyword placeholders in URL
        targetUrl = targetUrl
          .replace(/\{\{\s*(?:key|keyword)\s*\}\}/gi, encodeURIComponent(cleanKeyword))
          .replace(/\{\s*(?:key|keyword)\s*\}/gi, encodeURIComponent(cleanKeyword));

        // Resolve relative URL
        targetUrl = BookSourceEngine.resolveUrl(targetUrl, source.url);

        // Fetch with 8s timeout limit
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await universalFetch(targetUrl, {
          method,
          headers: requestHeaders,
          body: requestBody,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const responseText = await decodeResponseText(response);
        if (!responseText || responseText.trim().length === 0) return;

        const sourceResults: SearchResultItem[] = [];

        // Check if response is JSON
        let isJson = false;
        let jsonData: any = null;
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          try {
            jsonData = JSON.parse(responseText);
            isJson = true;
          } catch {}
        }

        if (isJson && jsonData) {
          // Parse JSON Books List
          let rawList: any[] = [];
          if (Array.isArray(jsonData)) {
            rawList = jsonData;
          } else if (Array.isArray(jsonData.data)) {
            rawList = jsonData.data;
          } else if (Array.isArray(jsonData.list)) {
            rawList = jsonData.list;
          } else if (Array.isArray(jsonData.books)) {
            rawList = jsonData.books;
          } else if (Array.isArray(jsonData.result)) {
            rawList = jsonData.result;
          } else if (Array.isArray(jsonData.results)) {
            rawList = jsonData.results;
          } else if (jsonData.data && Array.isArray(jsonData.data.list)) {
            rawList = jsonData.data.list;
          } else if (jsonData.data && Array.isArray(jsonData.data.books)) {
            rawList = jsonData.data.books;
          }

          for (const item of rawList) {
            if (!item || typeof item !== 'object') continue;

            const title = BookSourceEngine.extractFromJson(item, [
              source.rule?.ruleSearch?.name || '',
              'name',
              'book_name',
              'bookName',
              'title',
              'articlename',
              'Name'
            ]);
            const author = BookSourceEngine.extractFromJson(item, [
              source.rule?.ruleSearch?.author || '',
              'author',
              'author_name',
              'authorName',
              'writer',
              'Author'
            ]);
            const bookUrl = BookSourceEngine.extractFromJson(item, [
              source.rule?.ruleSearch?.bookUrl || '',
              'url',
              'book_url',
              'bookUrl',
              'detail_url',
              'link',
              'id',
              'bookId'
            ]);
            const cover = BookSourceEngine.extractFromJson(item, [
              source.rule?.ruleSearch?.coverUrl || '',
              'cover',
              'cover_url',
              'coverUrl',
              'img',
              'image',
              'pic'
            ]);
            const intro = BookSourceEngine.extractFromJson(item, [
              source.rule?.ruleSearch?.intro || '',
              'intro',
              'desc',
              'description',
              'summary',
              'abstract'
            ]);
            const latestChapter = BookSourceEngine.extractFromJson(item, [
              source.rule?.ruleSearch?.latestChapter || '',
              'latest_chapter',
              'latestChapter',
              'lastChapter',
              'last_chapter'
            ]);

            if (title) {
              let fullBookUrl = bookUrl;
              if (fullBookUrl && !fullBookUrl.startsWith('http://') && !fullBookUrl.startsWith('https://')) {
                if (fullBookUrl.startsWith('/')) {
                  fullBookUrl = BookSourceEngine.resolveUrl(fullBookUrl, source.url);
                } else if (/^\d+$/.test(fullBookUrl)) {
                  fullBookUrl = `${source.url}/book/${fullBookUrl}`;
                } else {
                  fullBookUrl = BookSourceEngine.resolveUrl(fullBookUrl, source.url);
                }
              }
              if (!fullBookUrl) fullBookUrl = source.url;

              const fullCoverUrl = cover ? BookSourceEngine.resolveUrl(cover, source.url) : undefined;
              const uniqueKey = `${title.toLowerCase()}-${(author || '').toLowerCase()}`;

              if (!seenTitles.has(uniqueKey)) {
                seenTitles.add(uniqueKey);
                const searchItem: SearchResultItem = {
                  title,
                  author: author || '未知作者',
                  cover: fullCoverUrl,
                  intro: intro || '暂无简介',
                  latestChapter: latestChapter || undefined,
                  detailUrl: fullBookUrl,
                  sourceId: source.id,
                  sourceName: source.name,
                  sourceUrl: source.url
                };
                sourceResults.push(searchItem);
                aggregatedResults.push(searchItem);
              }
            }
          }
        } else {
          // Parse HTML DOM
          const parser = new DOMParser();
          const doc = parser.parseFromString(responseText, 'text/html');

          const bookListSelector =
            source.rule?.ruleSearch?.bookList ||
            '.bookbox, .search-list li, .novelslist2 li, .grid tr, .item, .book-item, table tr:not(:first-child), dl dd, .list-item, div.mybox';

          let items: NodeListOf<Element> | Element[] = [];
          try {
            items = doc.querySelectorAll(bookListSelector);
          } catch {}

          if (items.length === 0) {
            items = Array.from(doc.querySelectorAll('a')).filter(
              (a) => a.textContent && a.textContent.toLowerCase().includes(cleanKeyword.toLowerCase())
            );
          }

          items.forEach((el) => {
            let title = BookSourceEngine.extractByRule(
              el,
              source.rule?.ruleSearch?.name || 'h3 a, h2 a, a.name, .bookname a, td:nth-child(1) a@text'
            );
            let bookUrl = BookSourceEngine.extractByRule(
              el,
              source.rule?.ruleSearch?.bookUrl || 'h3 a, h2 a, a.name, .bookname a, td:nth-child(1) a, a@href'
            );
            let author = BookSourceEngine.extractByRule(
              el,
              source.rule?.ruleSearch?.author || '.author, span:nth-child(2), td:nth-child(3)@text'
            );
            let intro = BookSourceEngine.extractByRule(el, source.rule?.ruleSearch?.intro || '.intro, p, ol@text');
            let latestChapter = BookSourceEngine.extractByRule(
              el,
              source.rule?.ruleSearch?.latestChapter || '.latest, .update, td:nth-child(2)@text'
            );
            let cover = BookSourceEngine.extractByRule(el, source.rule?.ruleSearch?.coverUrl || 'img@src');

            if (!title) {
              const firstA = el.tagName === 'A' ? (el as HTMLAnchorElement) : el.querySelector('a');
              if (firstA) {
                title = firstA.textContent?.trim() || '';
                bookUrl = firstA.getAttribute('href') || '';
              }
            }

            if (title && bookUrl) {
              const fullBookUrl = BookSourceEngine.resolveUrl(bookUrl, source.url);
              const fullCoverUrl = cover ? BookSourceEngine.resolveUrl(cover, source.url) : undefined;
              const uniqueKey = `${title.toLowerCase()}-${(author || '').toLowerCase()}`;

              if (!seenTitles.has(uniqueKey)) {
                seenTitles.add(uniqueKey);
                const searchItem: SearchResultItem = {
                  title,
                  author: author || '未知作者',
                  cover: fullCoverUrl,
                  intro: intro || '暂无简介',
                  latestChapter: latestChapter || undefined,
                  detailUrl: fullBookUrl,
                  sourceId: source.id,
                  sourceName: source.name,
                  sourceUrl: source.url
                };
                sourceResults.push(searchItem);
                aggregatedResults.push(searchItem);
              }
            }
          });
        }

        if (sourceResults.length > 0 && onProgress) {
          onProgress([...aggregatedResults]);
        }
      } catch (err) {
        // Silently skip source network errors
      }
    });

    await Promise.allSettled(searchPromises);
    return aggregatedResults;
  }

  // Fetch TOC (Table of Contents) from Online Source (Supports both HTML and JSON APIs)
  public async fetchToc(bookUrl: string, source: BookSource): Promise<Chapter[]> {
    const resolvedUrl = BookSourceEngine.resolveUrl(bookUrl, source.url);
    const response = await universalFetch(resolvedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json, text/html, application/xhtml+xml, */*'
      }
    });

    const responseText = await decodeResponseText(response);
    const chapters: Chapter[] = [];

    // Check if JSON TOC
    let isJson = false;
    let jsonData: any = null;
    if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
      try {
        jsonData = JSON.parse(responseText);
        isJson = true;
      } catch {}
    }

    if (isJson && jsonData) {
      let rawChapters: any[] = [];
      if (Array.isArray(jsonData)) rawChapters = jsonData;
      else if (Array.isArray(jsonData.data)) rawChapters = jsonData.data;
      else if (Array.isArray(jsonData.chapters)) rawChapters = jsonData.chapters;
      else if (Array.isArray(jsonData.list)) rawChapters = jsonData.list;
      else if (jsonData.data && Array.isArray(jsonData.data.chapters)) rawChapters = jsonData.data.chapters;
      else if (jsonData.data && Array.isArray(jsonData.data.list)) rawChapters = jsonData.data.list;

      rawChapters.forEach((ch, index) => {
        const title = BookSourceEngine.extractFromJson(ch, [
          source.rule?.ruleToc?.chapterName || '',
          'title',
          'name',
          'chapter_name',
          'chapterName'
        ]);
        const chUrl = BookSourceEngine.extractFromJson(ch, [
          source.rule?.ruleToc?.chapterUrl || '',
          'url',
          'chapter_url',
          'chapterUrl',
          'link',
          'id'
        ]);
        if (title) {
          const fullUrl = chUrl ? BookSourceEngine.resolveUrl(chUrl, resolvedUrl) : `${resolvedUrl}#${index}`;
          chapters.push({
            id: `online-ch-${index + 1}`,
            title,
            url: fullUrl,
            index,
            wordCount: 0
          });
        }
      });
    } else {
      // HTML TOC
      const parser = new DOMParser();
      const doc = parser.parseFromString(responseText, 'text/html');

      const chapterListSelector =
        source.rule?.ruleToc?.chapterList ||
        '#list dd a, #chapterlist li a, .catalog ul li a, .centent ul li a, dl dd a, .chapter-list a, .listmain dl dd a';

      let items: NodeListOf<Element> | Element[] = [];
      try {
        items = doc.querySelectorAll(chapterListSelector);
      } catch {}

      if (items.length === 0) {
        items = doc.querySelectorAll('a[href*="read"], a[href*="chapter"], a[href*="html"]');
      }

      items.forEach((el, index) => {
        const chapterTitle = el.textContent?.trim();
        const href = el.getAttribute('href');

        if (chapterTitle && href && !href.startsWith('javascript:')) {
          const fullUrl = BookSourceEngine.resolveUrl(href, resolvedUrl);
          chapters.push({
            id: `online-ch-${index + 1}`,
            title: chapterTitle,
            url: fullUrl,
            index,
            wordCount: 0
          });
        }
      });
    }

    return chapters;
  }

  // Fetch Single Chapter Content (Supports Text Novel and Comic Manga Image extraction)
  public async fetchChapterContent(chapterUrl: string, source: BookSource): Promise<string> {
    if (this.contentCache.has(chapterUrl)) {
      return this.contentCache.get(chapterUrl)!;
    }

    const resolvedUrl = BookSourceEngine.resolveUrl(chapterUrl, source.url);
    const response = await universalFetch(resolvedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json, text/html, application/xhtml+xml, */*'
      }
    });

    const responseText = await decodeResponseText(response);

    // Check if JSON Content
    let isJson = false;
    let jsonData: any = null;
    if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
      try {
        jsonData = JSON.parse(responseText);
        isJson = true;
      } catch {}
    }

    if (isJson && jsonData) {
      const content = BookSourceEngine.extractFromJson(jsonData, [
        source.rule?.ruleContent?.content || '',
        'content',
        'text',
        'chapter_content',
        'chapterContent',
        'data'
      ]);
      if (content) {
        this.contentCache.set(chapterUrl, content);
        return content;
      }
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, 'text/html');

    // Remove noise elements
    doc
      .querySelectorAll('script, style, iframe, .ads, .ad, header, footer, nav, .bottem, .button, .read-nav')
      .forEach((el) => el.remove());

    const contentSelector =
      source.rule?.ruleContent?.content || '#content, #htmlContent, .txtnav, #chaptercontent, .content, .read-content';
    let contentEl: Element | null = null;
    try {
      contentEl = doc.querySelector(contentSelector);
    } catch {}

    if (!contentEl) {
      contentEl = doc.querySelector('article, .article-content, #BookText, .entry-content');
    }

    // Check for Comic Manga Images inside Chapter
    const imgElements = (contentEl || doc.body).querySelectorAll('img');
    const comicImages: string[] = [];
    imgElements.forEach((img) => {
      const src =
        img.getAttribute('src') ||
        img.getAttribute('data-src') ||
        img.getAttribute('data-original') ||
        (img as HTMLImageElement).src;
      if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('banner')) {
        comicImages.push(BookSourceEngine.resolveUrl(src, resolvedUrl));
      }
    });

    let rawText = '';
    if (comicImages.length > 1) {
      // Return formatted comic markdown images
      rawText = comicImages.map((src, i) => `![第 ${i + 1} 页](${src})`).join('\n\n');
    } else if (contentEl) {
      const cloned = contentEl.cloneNode(true) as HTMLElement;
      cloned.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
      cloned.querySelectorAll('p').forEach((p) => p.append('\n'));
      rawText = cloned.textContent || '';
    } else {
      rawText = doc.body.textContent || '';
    }

    // Clean common web scraper garbage watermarks
    const cleaned = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => {
        if (!line) return false;
        if (/请记住本站域名|一秒记住|笔趣阁|最新章节列表|加入书签|手机版阅读|投推荐票|返回顶部/i.test(line)) {
          return false;
        }
        return true;
      })
      .join('\n\n');

    this.contentCache.set(chapterUrl, cleaned);
    return cleaned;
  }
}
