import { Book, Bookmark, BookSource, StealthConfig, ThemeConfig } from '../types/reader';
import { DEFAULT_BOOK_SOURCES } from './defaultSources';

const STORAGE_KEYS = {
  BOOKS: 'liquid_reader_books',
  ACTIVE_BOOK_ID: 'liquid_reader_active_id',
  OPEN_TABS: 'liquid_reader_open_tabs',
  SOURCES: 'liquid_reader_sources',
  THEME: 'liquid_reader_theme',
  STEALTH: 'liquid_reader_stealth',
  BOOKMARKS: 'liquid_reader_bookmarks'
};

export const defaultThemeConfig: ThemeConfig = {
  glassLevel: 'l2',
  customGlassOpacity: 0.65,
  glassBlurRadius: 28,
  themePreset: 'dark-oled',
  fontSize: 16,
  lineHeight: 1.8,
  letterSpacing: 0.5,
  paragraphIndent: 2,
  paragraphSpacing: 14,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  textColor: '#e6e6ea',
  backgroundColor: 'rgba(18, 18, 22, 0.72)',
  glassBorder: true,
  pageMode: 'scroll'
};

export const defaultStealthConfig: StealthConfig = {
  bossKeyShortcut: 'Alt+`',
  mouseAutoFade: true,
  mouseAutoFadeDuration: 300,
  mouseLeaveOpacity: 0.05,
  clickThrough: false,
  alwaysOnTop: true,
  skipTaskbar: false,
  defaultChameleonMode: 'none',
  tickerSpeed: 20,
  tickerFontSize: 13
};

export class StorageService {
  public static getBooks(): Book[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveBooks(books: Book[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    } catch (err) {
      console.warn('Failed to save books:', err);
    }
  }

  public static getActiveBookId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BOOK_ID);
  }

  public static saveActiveBookId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BOOK_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_BOOK_ID);
    }
  }

  public static getOpenTabs(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPEN_TABS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveOpenTabs(tabs: string[]): void {
    localStorage.setItem(STORAGE_KEYS.OPEN_TABS, JSON.stringify(tabs));
  }

  public static getSources(): BookSource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOURCES);
      return data ? JSON.parse(data) : DEFAULT_BOOK_SOURCES;
    } catch {
      return DEFAULT_BOOK_SOURCES;
    }
  }

  public static saveSources(sources: BookSource[]): void {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  }

  public static getThemeConfig(): ThemeConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME);
      return data ? { ...defaultThemeConfig, ...JSON.parse(data) } : defaultThemeConfig;
    } catch {
      return defaultThemeConfig;
    }
  }

  public static saveThemeConfig(theme: ThemeConfig): void {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
  }

  public static getStealthConfig(): StealthConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STEALTH);
      return data ? { ...defaultStealthConfig, ...JSON.parse(data) } : defaultStealthConfig;
    } catch {
      return defaultStealthConfig;
    }
  }

  public static saveStealthConfig(config: StealthConfig): void {
    localStorage.setItem(STORAGE_KEYS.STEALTH, JSON.stringify(config));
  }

  public static getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveBookmarks(bookmarks: Bookmark[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }

  // Full Export/Import for WebDAV / Backup
  public static exportAllData(): string {
    const backup = {
      version: '1.0',
      timestamp: Date.now(),
      books: this.getBooks(),
      sources: this.getSources(),
      theme: this.getThemeConfig(),
      stealth: this.getStealthConfig(),
      bookmarks: this.getBookmarks()
    };
    return JSON.stringify(backup, null, 2);
  }

  public static importAllData(jsonStr: string): boolean {
    try {
      const backup = JSON.parse(jsonStr);
      if (backup.books) this.saveBooks(backup.books);
      if (backup.sources) this.saveSources(backup.sources);
      if (backup.theme) this.saveThemeConfig(backup.theme);
      if (backup.stealth) this.saveStealthConfig(backup.stealth);
      if (backup.bookmarks) this.saveBookmarks(backup.bookmarks);
      return true;
    } catch {
      return false;
    }
  }
}
