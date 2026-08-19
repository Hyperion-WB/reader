// Types for LiquidReader (Windows Liquid Glass Novel Reader)

export interface Chapter {
  id: string;
  title: string;
  url?: string;
  content?: string;
  index: number;
  wordCount?: number;
  isComic?: boolean;
  comicImages?: string[]; // Base64 or Blob URLs of comic manga pages
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  intro?: string;
  category?: string;
  sourceId: string; // 'local-txt', 'local-epub', 'local-comic', etc.
  sourceName: string;
  sourceUrl?: string;
  detailUrl?: string;
  tocUrl?: string;
  chapters: Chapter[];
  currentChapterIndex: number;
  currentProgressPercent: number; // 0 - 100
  scrollPosition?: number;
  currentPage?: number;
  lastReadTime: number;
  totalWordCount?: number;
  isOnlineSource?: boolean;
  isComic?: boolean;
  bookFormat?: 'txt' | 'epub' | 'comic-cbz' | 'comic-zip' | 'markdown' | 'pdf' | 'custom';
}

export interface BookSourceRule {
  searchUrl?: string;
  ruleSearch?: {
    bookList?: string;
    name?: string;
    author?: string;
    intro?: string;
    kind?: string;
    coverUrl?: string;
    bookUrl?: string;
    latestChapter?: string;
  };
  ruleBookInfo?: {
    name?: string;
    author?: string;
    intro?: string;
    kind?: string;
    coverUrl?: string;
    tocUrl?: string;
  };
  ruleToc?: {
    chapterList?: string;
    chapterName?: string;
    chapterUrl?: string;
  };
  ruleContent?: {
    content?: string;
    nextContentUrl?: string;
  };
}

export interface BookSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  groupName?: string;
  weight?: number;
  type?: 'legado' | 'custom' | 'api';
  rule?: BookSourceRule;
  customHeaders?: Record<string, string>;
  charset?: string;
}

export interface SearchResultItem {
  title: string;
  author: string;
  cover?: string;
  intro?: string;
  category?: string;
  latestChapter?: string;
  detailUrl: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
}

export type GlassOpacityLevel = 'l0' | 'l1' | 'l2' | 'l3'; // L0: transparent, L1: 25%, L2: 55%, L3: 85%

export type ColorThemePreset = 'day-glass' | 'dark-oled' | 'parchment' | 'forest' | 'hacker' | 'stealth-pure';

export type ReadingBackgroundPreset =
  | 'default'
  | 'parchment'
  | 'rice-paper'
  | 'eyecare-green'
  | 'warm-latte'
  | 'slate-gray'
  | 'kraft-wood'
  | 'navy-night'
  | 'pure-black'
  | 'custom';

export interface ThemeConfig {
  glassLevel: GlassOpacityLevel;
  customGlassOpacity: number; // 0.0 ~ 1.0
  glassBlurRadius: number; // 0px ~ 60px
  themePreset: ColorThemePreset;
  backgroundPreset: ReadingBackgroundPreset;
  customBgImage?: string; // Base64 data URL for uploaded wallpaper
  customBgColor?: string; // Custom Hex color
  bgImageOpacity?: number; // 0.0 ~ 1.0
  bgImageBlur?: number; // 0 ~ 30px
  fontSize: number; // 12 ~ 32px
  lineHeight: number; // 1.2 ~ 2.8
  letterSpacing: number; // 0 ~ 4px
  paragraphIndent: number; // 0 ~ 4em
  paragraphSpacing: number; // 0 ~ 32px
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  glassBorder: boolean;
  pageMode: 'paginated' | 'scroll';
}

export type ChameleonModeType =
  | 'none'
  | 'excel'
  | 'vscode'
  | 'idea'
  | 'word'
  | 'pdf'
  | 'email'
  | 'chat'
  | 'ppt'
  | 'stickynote'
  | 'ticker';

export interface StealthConfig {
  bossKeyShortcut: string; // e.g. "Alt+`"
  mouseAutoFade: boolean;
  mouseAutoFadeDuration: number; // ms
  mouseLeaveOpacity: number; // 0.0 ~ 0.2
  clickThrough: boolean;
  alwaysOnTop: boolean;
  skipTaskbar: boolean;
  defaultChameleonMode: ChameleonModeType;
  tickerSpeed: number; // px per second
  tickerFontSize: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapterIndex: number;
  chapterTitle: string;
  selectedText: string;
  note?: string;
  timestamp: number;
}
