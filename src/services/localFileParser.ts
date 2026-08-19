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
    isOnlineSource: false,
    bookFormat: 'epub'
  };
};

// Comic CBZ / ZIP Archive Parser (支持漫画包、图集、绘本)
export const parseComicArchive = async (filename: string, arrayBuffer: ArrayBuffer): Promise<Book> => {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const imageRegex = /\.(jpe?g|png|webp|avif|gif|bmp)$/i;

  const imageFiles: { path: string; file: JSZip.JSZipObject }[] = [];

  zip.forEach((relativePath, file) => {
    if (!file.dir && imageRegex.test(relativePath) && !relativePath.startsWith('__MACOSX/')) {
      imageFiles.push({ path: relativePath, file });
    }
  });

  if (imageFiles.length === 0) {
    throw new Error('无效的漫画压缩包：压缩包内未找到任何 JPG/PNG/WebP 漫画图片');
  }

  // Natural alphanumeric sort for comic page sequences (e.g. 1.jpg, 2.jpg, 10.jpg)
  imageFiles.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: 'base' }));

  const comicImages: string[] = [];
  for (let i = 0; i < imageFiles.length; i++) {
    const base64 = await imageFiles[i].file.async('base64');
    const ext = imageFiles[i].path.split('.').pop()?.toLowerCase() || 'jpg';
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
    comicImages.push(`data:${mime};base64,${base64}`);
  }

  const bookTitle = filename.replace(/\.(cbz|zip|cbr|rar|7z)$/i, '');

  const chapters: Chapter[] = [
    {
      id: 'comic-ch-1',
      title: '全本图集 / 连载画卷',
      index: 0,
      isComic: true,
      comicImages,
      wordCount: comicImages.length
    }
  ];

  return {
    id: `book-comic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: bookTitle,
    author: '漫画图集',
    cover: comicImages[0], // First page as cover
    intro: `本地漫画图集，共包含 ${comicImages.length} 页高清画幅。`,
    sourceId: 'local-comic',
    sourceName: '本地漫画',
    chapters,
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    lastReadTime: Date.now(),
    totalWordCount: comicImages.length,
    isOnlineSource: false,
    isComic: true,
    bookFormat: 'comic-cbz'
  };
};

// Markdown Document Parser
export const parseMarkdownFile = (filename: string, content: string): Book => {
  const bookTitle = filename.replace(/\.md$/i, '');
  const chapters: Chapter[] = [];

  // Split by top-level Markdown headers (# or ##)
  const headerRegex = /(?:^|\n)(#{1,2}\s+[^\n]+)/g;
  const matches: { index: number; title: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(content)) !== null) {
    matches.push({
      index: match.index,
      title: match[1].replace(/^#+\s*/, '').trim()
    });
  }

  if (matches.length >= 2) {
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const startPos = current.index;
      const endPos = next ? next.index : content.length;
      const chapterRaw = content.slice(startPos, endPos).trim();

      chapters.push({
        id: `md-ch-${i + 1}`,
        title: current.title || `第 ${i + 1} 节`,
        content: chapterRaw,
        index: i,
        wordCount: chapterRaw.length
      });
    }
  } else {
    // Single document chapter
    chapters.push({
      id: 'md-ch-1',
      title: bookTitle,
      content,
      index: 0,
      wordCount: content.length
    });
  }

  return {
    id: `book-md-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: bookTitle,
    author: 'Markdown 笔记',
    intro: `本地 Markdown 导入文档，共 ${chapters.length} 章节。`,
    sourceId: 'local-md',
    sourceName: '本地 Markdown',
    chapters,
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    lastReadTime: Date.now(),
    totalWordCount: content.length,
    isOnlineSource: false,
    bookFormat: 'markdown'
  };
};

// Universal Local File Parser Dispatcher
export const parseUniversalLocalFile = async (file: File): Promise<Book> => {
  const name = file.name;
  const ext = name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'txt' || ext === 'text') {
    const text = await file.text();
    return parseTxtFile(name, text);
  }

  if (ext === 'md' || ext === 'markdown') {
    const text = await file.text();
    return parseMarkdownFile(name, text);
  }

  if (ext === 'epub') {
    const buffer = await file.arrayBuffer();
    return parseEpubFile(name, buffer);
  }

  if (ext === 'cbz' || ext === 'zip') {
    const buffer = await file.arrayBuffer();
    return parseComicArchive(name, buffer);
  }

  // Fallback for text-based unknown files
  const text = await file.text();
  return parseTxtFile(name, text);
};
