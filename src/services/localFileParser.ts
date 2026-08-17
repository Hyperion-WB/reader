import JSZip from 'jszip';
import { Book, Chapter } from '../types/reader';

// TXT Smart Parser
export const parseTxtFile = (filename: string, content: string): Book => {
  const bookTitle = filename.replace(/\.(txt|md|text)$/i, '');
  const chapters: Chapter[] = [];

  // Robust Regular Expressions for Chinese and English Chapter Titles
  const chapterRegex = /(?:^|\r?\n)\s*(第[0-9一二三四五六七八九十百千万零两]+[章回卷节集篇部][^\r\n]{0,35}|Chapter\s+[0-9]+[^\r\n]{0,35}|[0-9]{1,4}[\.、\s]+[^\r\n]{1,35})/gi;

  const matches: { index: number; title: string; length: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = chapterRegex.exec(content)) !== null) {
    matches.push({
      index: match.index,
      title: match[1].trim(),
      length: match[0].length
    });
  }

  if (matches.length >= 3) {
    // Has detected chapter titles
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const startPos = current.index;
      const endPos = next ? next.index : content.length;
      const chapterRaw = content.slice(startPos, endPos).trim();

      // Separate title from body
      const lines = chapterRaw.split(/\r?\n/);
      const title = lines[0].trim() || `第 ${i + 1} 章`;
      const body = lines.slice(1).join('\n').trim();

      chapters.push({
        id: `ch-${i + 1}`,
        title,
        content: body || '(本章暂无正文)',
        index: i,
        wordCount: chapterRaw.length
      });
    }

    // Check if there was preamble / prologue before the first match
    if (matches[0].index > 100) {
      const prologueContent = content.slice(0, matches[0].index).trim();
      if (prologueContent.length > 20) {
        chapters.unshift({
          id: 'ch-0',
          title: '序言 / 楔子',
          content: prologueContent,
          index: 0,
          wordCount: prologueContent.length
        });
        // Re-index
        chapters.forEach((ch, idx) => (ch.index = idx));
      }
    }
  } else {
    // Fallback: Split by fixed word length chunks (e.g. ~3000 chars per virtual chapter)
    const chunkSize = 2500;
    const totalLength = content.length;
    let currentIdx = 0;
    let chapterNum = 1;

    while (currentIdx < totalLength) {
      let nextIdx = currentIdx + chunkSize;
      if (nextIdx < totalLength) {
        // Try to find the nearest paragraph break
        const nearestBreak = content.indexOf('\n', nextIdx);
        if (nearestBreak !== -1 && nearestBreak - nextIdx < 500) {
          nextIdx = nearestBreak + 1;
        }
      } else {
        nextIdx = totalLength;
      }

      const chunkText = content.slice(currentIdx, nextIdx).trim();
      chapters.push({
        id: `ch-${chapterNum}`,
        title: `第 ${chapterNum} 部分`,
        content: chunkText,
        index: chapterNum - 1,
        wordCount: chunkText.length
      });

      currentIdx = nextIdx;
      chapterNum++;
    }
  }

  return {
    id: `book-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: bookTitle,
    author: '本地文件',
    intro: `本地 TXT 导入，共 ${chapters.length} 章节，约 ${Math.round(content.length / 10000)} 万字。`,
    sourceId: 'local-txt',
    sourceName: '本地 TXT',
    chapters,
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    lastReadTime: Date.now(),
    totalWordCount: content.length,
    isOnlineSource: false
  };
};

// EPUB Parser using JSZip and DOMParser
export const parseEpubFile = async (filename: string, arrayBuffer: ArrayBuffer): Promise<Book> => {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const parser = new DOMParser();

  // 1. Find META-INF/container.xml
  const containerXmlStr = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXmlStr) {
    throw new Error('无效的 EPUB 文件：未找到 container.xml');
  }

  const containerDoc = parser.parseFromString(containerXmlStr, 'application/xml');
  const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
  if (!rootfilePath) {
    throw new Error('无效的 EPUB 文件：未找到 rootfile 路径');
  }

  // 2. Read OPF file
  const opfDir = rootfilePath.includes('/') ? rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1) : '';
  const opfStr = await zip.file(rootfilePath)?.async('text');
  if (!opfStr) {
    throw new Error('未找到 EPUB OPF 文件');
  }

  const opfDoc = parser.parseFromString(opfStr, 'application/xml');

  // Extract Metadata
  const title = opfDoc.querySelector('metadata > title, metadata > dc\\:title')?.textContent || filename.replace(/\.epub$/i, '');
  const author = opfDoc.querySelector('metadata > creator, metadata > dc\\:creator')?.textContent || '未知作者';
  const intro = opfDoc.querySelector('metadata > description, metadata > dc\\:description')?.textContent || 'EPUB 电子书';

  // Extract Manifest items: id -> href
  const manifestItems: Record<string, string> = {};
  opfDoc.querySelectorAll('manifest > item').forEach((item) => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) {
      manifestItems[id] = href;
    }
  });

  // Extract Spine order
  const spineItemRefs: string[] = [];
  opfDoc.querySelectorAll('spine > itemref').forEach((itemref) => {
    const idref = itemref.getAttribute('idref');
    if (idref && manifestItems[idref]) {
      spineItemRefs.push(manifestItems[idref]);
    }
  });

  const chapters: Chapter[] = [];
  let totalWordCount = 0;

  for (let i = 0; i < spineItemRefs.length; i++) {
    const rawHref = spineItemRefs[i];
    const fullPath = opfDir ? `${opfDir}${rawHref}` : rawHref;
    const file = zip.file(fullPath) || zip.file(decodeURIComponent(fullPath));

    if (file) {
      const xhtmlStr = await file.async('text');
      const doc = parser.parseFromString(xhtmlStr, 'text/html');

      // Remove script, style, and comments
      doc.querySelectorAll('script, style, link').forEach((el) => el.remove());

      const chapterTitle =
        doc.querySelector('h1, h2, h3, title')?.textContent?.trim() || `第 ${i + 1} 节`;

      // Extract Clean Text / Formatted Paragraphs
      const paragraphs: string[] = [];
      doc.querySelectorAll('p, div, h1, h2, h3, h4, section').forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length > 0 && !paragraphs.includes(text)) {
          paragraphs.push(text);
        }
      });

      const bodyText = paragraphs.length > 0 ? paragraphs.join('\n\n') : doc.body.textContent?.trim() || '';

      if (bodyText.length > 0) {
        totalWordCount += bodyText.length;
        chapters.push({
          id: `epub-ch-${i + 1}`,
          title: chapterTitle,
          content: bodyText,
          index: chapters.length,
          wordCount: bodyText.length
        });
      }
    }
  }

  return {
    id: `book-epub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    author,
    intro,
    sourceId: 'local-epub',
    sourceName: '本地 EPUB',
    chapters,
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    lastReadTime: Date.now(),
    totalWordCount,
    isOnlineSource: false
  };
};
