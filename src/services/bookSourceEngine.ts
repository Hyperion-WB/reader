import { BookSource, Chapter, SearchResultItem } from '../types/reader';
import { universalFetch } from './tauriBridge';

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

  // Resolve relative URLs
  public static resolveUrl(relativeUrl: string, baseUrl: string): string {
    if (!relativeUrl) return baseUrl;
    try {
      if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
        return relativeUrl;
      }
      const base = new URL(baseUrl);
      return new URL(relativeUrl, base.origin + (base.pathname.endsWith('/') ? base.pathname : '/')).href;
    } catch {
      if (relativeUrl.startsWith('/')) {
        const match = baseUrl.match(/^(https?:\/\/[^\/]+)/i);
        return match ? `${match[1]}${relativeUrl}` : relativeUrl;
      }
      return `${baseUrl.replace(/\/+$/, '')}/${relativeUrl.replace(/^\/+/, '')}`;
    }
  }

  // Extract text or attribute using rule format e.g. "h3 a@text", "a@href", "img@src"
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
        // Multi-selector fallback split by comma
        const selectors = selector.split(',');
        for (const s of selectors) {
          targetEl = container.querySelector(s.trim());
          if (targetEl) break;
        }
      }

      if (!targetEl) return '';

      if (attr === 'href') {
        return targetEl.getAttribute('href') || (targetEl as HTMLAnchorElement).href || '';
      } else if (attr === 'src') {
        return targetEl.getAttribute('src') || (targetEl as HTMLImageElement).src || '';
      } else if (attr === 'html') {
        return targetEl.innerHTML || '';
      } else {
        return targetEl.textContent?.trim() || '';
      }
    } catch {
      return '';
    }
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
        }
      });
    }
    return results;
  }

  // Multi-source Parallel Search Aggregator with streaming callback
  public async searchAcrossSources(
    keyword: string,
    onProgress?: (results: SearchResultItem[]) => void
  ): Promise<SearchResultItem[]> {
    if (!keyword.trim()) return [];

    const enabledSources = this.sources.filter((s) => s.enabled && s.rule?.searchUrl);
    const aggregatedResults: SearchResultItem[] = [];
    const seenTitles = new Set<string>();

    const searchPromises = enabledSources.map(async (source) => {
      try {
        const searchUrl = (source.rule!.searchUrl || '')
          .replace('{{key}}', encodeURIComponent(keyword))
          .replace('{{keyword}}', encodeURIComponent(keyword));

        const response = await universalFetch(searchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
            ...source.customHeaders
          }
        });

        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const bookListSelector = source.rule?.ruleSearch?.bookList || '.bookbox, .search-list li, .novelslist2 li, table tr';
        const items = doc.querySelectorAll(bookListSelector);

        const sourceResults: SearchResultItem[] = [];

        items.forEach((el) => {
          let title = BookSourceEngine.extractByRule(el, source.rule?.ruleSearch?.name || 'h3 a, h2 a, a.name, td a@text');
          let bookUrl = BookSourceEngine.extractByRule(el, source.rule?.ruleSearch?.bookUrl || 'h3 a, h2 a, a.name, a@href');
          let author = BookSourceEngine.extractByRule(el, source.rule?.ruleSearch?.author || '.author, span:nth-child(2)@text');
          let intro = BookSourceEngine.extractByRule(el, source.rule?.ruleSearch?.intro || '.intro, p@text');
          let latestChapter = BookSourceEngine.extractByRule(el, source.rule?.ruleSearch?.latestChapter || '.latest, .update@text');
          let cover = BookSourceEngine.extractByRule(el, source.rule?.ruleSearch?.coverUrl || 'img@src');

          if (!title) {
            const firstA = el.querySelector('a');
            if (firstA) {
              title = firstA.textContent?.trim() || '';
              bookUrl = firstA.getAttribute('href') || '';
            }
          }

          if (title && bookUrl) {
            const fullBookUrl = BookSourceEngine.resolveUrl(bookUrl, source.url);
            const fullCoverUrl = cover ? BookSourceEngine.resolveUrl(cover, source.url) : undefined;
            const uniqueKey = `${title}-${author || source.name}`;

            if (!seenTitles.has(uniqueKey)) {
              seenTitles.add(uniqueKey);
              const item: SearchResultItem = {
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
              sourceResults.push(item);
              aggregatedResults.push(item);
            }
          }
        });

        if (sourceResults.length > 0 && onProgress) {
          onProgress([...aggregatedResults]);
        }
      } catch (err) {
        console.warn(`Search error on source ${source.name}:`, err);
      }
    });

    await Promise.allSettled(searchPromises);
    return aggregatedResults;
  }

  // Fetch TOC (Table of Contents) from Online Source
  public async fetchToc(bookUrl: string, source: BookSource): Promise<Chapter[]> {
    const response = await universalFetch(bookUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    const chapterListSelector =
      source.rule?.ruleToc?.chapterList || '#list dd a, #chapterlist li a, .catalog ul li a, .centent ul li a, dl dd a';

    const items = doc.querySelectorAll(chapterListSelector);
    const chapters: Chapter[] = [];

    items.forEach((el, index) => {
      const chapterTitle = el.textContent?.trim();
      const href = el.getAttribute('href');

      if (chapterTitle && href) {
        const fullUrl = BookSourceEngine.resolveUrl(href, bookUrl);
        chapters.push({
          id: `online-ch-${index + 1}`,
          title: chapterTitle,
          url: fullUrl,
          index,
          wordCount: 0
        });
      }
    });

    return chapters;
  }

  // Fetch Single Chapter Content & Clean Text
  public async fetchChapterContent(chapterUrl: string, source: BookSource): Promise<string> {
    if (this.contentCache.has(chapterUrl)) {
      return this.contentCache.get(chapterUrl)!;
    }

    const response = await universalFetch(chapterUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Remove noise elements
    doc.querySelectorAll('script, style, iframe, .ads, .ad, header, footer, nav, .bottem, .button').forEach((el) =>
      el.remove()
    );

    const contentSelector = source.rule?.ruleContent?.content || '#content, #htmlContent, .txtnav, #chaptercontent';
    let contentEl = doc.querySelector(contentSelector);

    if (!contentEl) {
      // Fallback search
      contentEl = doc.querySelector('article, .article-content, #BookText, .read-content');
    }

    let rawText = '';
    if (contentEl) {
      // Replace <br> and <p> with newlines
      const cloned = contentEl.cloneNode(true) as HTMLElement;
      cloned.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
      cloned.querySelectorAll('p').forEach((p) => p.append('\n'));
      rawText = cloned.textContent || '';
    } else {
      rawText = doc.body.textContent || '';
    }

    // Clean common web scrap garbage watermarks
    const cleaned = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => {
        if (!line) return false;
        if (/请记住本站域名|一秒记住|笔趣阁|最新章节列表|加入书签|手机版阅读|投推荐票/i.test(line)) {
          return false;
        }
        return true;
      })
      .join('\n\n');

    this.contentCache.set(chapterUrl, cleaned);
    return cleaned;
  }
}
