import React, { useState, useEffect, useCallback } from 'react';
import {
  Book,
  Chapter,
  Bookmark,
  BookSource,
  ChameleonModeType,
  StealthConfig,
  ThemeConfig
} from './types/reader';
import { StorageService } from './services/storageService';
import { FloatingTabBar } from './components/FloatingTabBar';
import { MainReader } from './components/MainReader';
import { GlassDrawer } from './components/GlassDrawer';
import { ExcelMode } from './components/ChameleonModes/ExcelMode';
import { VSCodeMode } from './components/ChameleonModes/VSCodeMode';
import { IdeaMode } from './components/ChameleonModes/IdeaMode';
import { WordMode } from './components/ChameleonModes/WordMode';
import { PdfMode } from './components/ChameleonModes/PdfMode';
import { EmailMode } from './components/ChameleonModes/EmailMode';
import { ChatMode } from './components/ChameleonModes/ChatMode';
import { PptMode } from './components/ChameleonModes/PptMode';
import { StickyNoteMode } from './components/ChameleonModes/StickyNoteMode';
import { TickerBarMode } from './components/ChameleonModes/TickerBarMode';
import {
  isTauri,
  openLocalFileDialog,
  readLocalBinaryFile,
  readLocalTextFile,
  registerBossKeyShortcut,
  windowControls
} from './services/tauriBridge';
import {
  parseEpubFile,
  parseTxtFile,
  parseComicArchive,
  parseMarkdownFile,
  parseUniversalLocalFile
} from './services/localFileParser';
import { Upload, Plus } from 'lucide-react';
import { CuteAppIcon } from './components/CuteAppIcon';
import { WindowResizeHandles } from './components/WindowResizeHandles';
import { OnboardingModal } from './components/OnboardingModal';
import './styles/glass.css';

export default function App() {
  // Main State
  const [books, setBooks] = useState<Book[]>(() => StorageService.getBooks());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem('liquid_reader_has_seen_onboarding_v2') !== 'true';
    } catch {
      return false;
    }
  });
  const [activeBookId, setActiveBookId] = useState<string | null>(() => {
    const saved = StorageService.getActiveBookId();
    if (saved) return saved;
    const initialBooks = StorageService.getBooks();
    return initialBooks.length > 0 ? initialBooks[0].id : null;
  });
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => {
    const saved = StorageService.getOpenTabs();
    if (saved.length > 0) return saved;
    const initialBooks = StorageService.getBooks();
    return initialBooks.length > 0 ? [initialBooks[0].id] : [];
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => StorageService.getThemeConfig());
  const [stealthConfig, setStealthConfig] = useState<StealthConfig>(() =>
    StorageService.getStealthConfig()
  );
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => StorageService.getBookmarks());
  const [sources, setSources] = useState<BookSource[]>(() => StorageService.getSources());

  // UI Transient States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chameleonMode, setChameleonMode] = useState<ChameleonModeType>('none');
  const [isMouseFaded, setIsMouseFaded] = useState(false);
  const [isBossHidden, setIsBossHidden] = useState(false);

  // Active Book computation
  const activeBook = books.find((b) => b.id === activeBookId) || null;
  const currentChapter =
    activeBook && activeBook.chapters[activeBook.currentChapterIndex]
      ? activeBook.chapters[activeBook.currentChapterIndex]
      : undefined;

  // Sync to Storage on changes
  useEffect(() => {
    StorageService.saveBooks(books);
  }, [books]);

  useEffect(() => {
    if (activeBookId) StorageService.saveActiveBookId(activeBookId);
  }, [activeBookId]);

  useEffect(() => {
    StorageService.saveOpenTabs(openTabIds);
  }, [openTabIds]);

  useEffect(() => {
    StorageService.saveThemeConfig(themeConfig);
  }, [themeConfig]);

  useEffect(() => {
    StorageService.saveStealthConfig(stealthConfig);
  }, [stealthConfig]);

  useEffect(() => {
    StorageService.saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    StorageService.saveSources(sources);
  }, [sources]);

  // Global Boss Key Handler
  const handleBossKeyTrigger = useCallback(async () => {
    if (isTauri()) {
      if (isBossHidden) {
        await windowControls.show();
        setIsBossHidden(false);
      } else {
        await windowControls.hide();
        setIsBossHidden(true);
      }
    } else {
      setIsBossHidden((prev) => !prev);
    }
  }, [isBossHidden]);

  // Register Global Boss Key in Desktop Mode
  useEffect(() => {
    if (stealthConfig.bossKeyShortcut) {
      registerBossKeyShortcut(stealthConfig.bossKeyShortcut, handleBossKeyTrigger);
    }
  }, [stealthConfig.bossKeyShortcut, handleBossKeyTrigger]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle Menu Drawer on Alt+M
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setIsDrawerOpen((prev) => !prev);
      }
      // Toggle Excel Camouflage on Alt+E
      else if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setChameleonMode((prev) => (prev === 'excel' ? 'none' : 'excel'));
      }
      // Toggle Word Camouflage on Alt+W
      else if (e.altKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        setChameleonMode((prev) => (prev === 'word' ? 'none' : 'word'));
      }
      // Toggle VS Code Camouflage on Alt+C
      else if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setChameleonMode((prev) => (prev === 'vscode' ? 'none' : 'vscode'));
      }
      // Toggle IDEA Camouflage on Alt+I
      else if (e.altKey && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        setChameleonMode((prev) => (prev === 'idea' ? 'none' : 'idea'));
      }
      // Toggle Ticker Bar on Alt+1
      else if (e.altKey && e.key === '1') {
        e.preventDefault();
        setChameleonMode((prev) => (prev === 'ticker' ? 'none' : 'ticker'));
      }
      // Toggle Click Through on Alt+P
      else if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        const newVal = !stealthConfig.clickThrough;
        setStealthConfig((prev) => ({ ...prev, clickThrough: newVal }));
        windowControls.setClickThrough(newVal);
      }
      // Boss key in web fallback
      else if (e.altKey && e.key === '`') {
        e.preventDefault();
        handleBossKeyTrigger();
      }
      // Chapter Navigation Shortcuts: [ and ]
      else if (e.key === '[' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        handlePrevChapter();
      } else if (e.key === ']' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        handleNextChapter();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [stealthConfig, handleBossKeyTrigger]);

  // Tab & Book Actions
  const handleSelectBook = (id: string) => {
    setActiveBookId(id);
    if (!openTabIds.includes(id)) {
      setOpenTabIds((prev) => [...prev, id]);
    }
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = openTabIds.filter((tabId) => tabId !== id);
    setOpenTabIds(newTabs);
    if (activeBookId === id) {
      if (newTabs.length > 0) {
        setActiveBookId(newTabs[newTabs.length - 1]);
      } else {
        setActiveBookId(null);
      }
    }
  };

  const handleAddBookToShelf = (newBook: Book) => {
    setBooks((prev) => {
      const exists = prev.find((b) => b.id === newBook.id || (b.title === newBook.title && b.author === newBook.author));
      if (exists) {
        setActiveBookId(exists.id);
        if (!openTabIds.includes(exists.id)) {
          setOpenTabIds((tabs) => [...tabs, exists.id]);
        }
        return prev;
      }
      setActiveBookId(newBook.id);
      if (!openTabIds.includes(newBook.id)) {
        setOpenTabIds((tabs) => [...tabs, newBook.id]);
      }
      return [newBook, ...prev];
    });
  };

  const handleDeleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setOpenTabIds((prev) => prev.filter((tabId) => tabId !== id));
    if (activeBookId === id) {
      const remaining = openTabIds.filter((tabId) => tabId !== id);
      setActiveBookId(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleUpdateBookProgress = (chapterIndex: number, progressPercent: number) => {
    if (!activeBookId) return;
    setBooks((prev) =>
      prev.map((b) =>
        b.id === activeBookId
          ? {
              ...b,
              currentChapterIndex: chapterIndex,
              currentProgressPercent: progressPercent,
              lastReadTime: Date.now()
            }
          : b
      )
    );
  };

  const handleNextChapter = () => {
    if (!activeBook) return;
    const nextIdx = activeBook.currentChapterIndex + 1;
    if (nextIdx < activeBook.chapters.length) {
      handleUpdateBookProgress(nextIdx, 0);
    }
  };

  const handlePrevChapter = () => {
    if (!activeBook) return;
    const prevIdx = activeBook.currentChapterIndex - 1;
    if (prevIdx >= 0) {
      handleUpdateBookProgress(prevIdx, 0);
    }
  };

  const handleJumpChapter = (index: number) => {
    if (!activeBook) return;
    if (index >= 0 && index < activeBook.chapters.length) {
      handleUpdateBookProgress(index, 0);
    }
  };

  // Local File Import Dialog (TXT / EPUB / MD / CBZ / ZIP Comic)
  const handleImportLocalFile = async () => {
    try {
      const filePath = await openLocalFileDialog([
        { name: '小说与漫画书籍 (*.txt, *.epub, *.md, *.cbz, *.zip, *.cbr)', extensions: ['txt', 'epub', 'md', 'cbz', 'zip', 'cbr'] }
      ]);

      if (filePath) {
        const fileName = filePath.split(/[/\\]/).pop() || '未命名书籍';
        const lowerName = fileName.toLowerCase();
        let importedBook: Book;
        if (lowerName.endsWith('.epub')) {
          const buffer = await readLocalBinaryFile(filePath);
          importedBook = await parseEpubFile(fileName, buffer);
        } else if (lowerName.endsWith('.cbz') || lowerName.endsWith('.zip') || lowerName.endsWith('.cbr')) {
          const buffer = await readLocalBinaryFile(filePath);
          importedBook = await parseComicArchive(fileName, buffer);
        } else if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) {
          const text = await readLocalTextFile(filePath);
          importedBook = parseMarkdownFile(fileName, text);
        } else {
          const text = await readLocalTextFile(filePath);
          importedBook = parseTxtFile(fileName, text);
        }
        handleAddBookToShelf(importedBook);
        setIsDrawerOpen(false);
      }
    } catch (err: any) {
      alert(`导入文件失败: ${err.message || err}`);
    }
  };

  // HTML5 Fallback File Picker (Supports all formats)
  const handleHTML5FileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await parseUniversalLocalFile(file);
      handleAddBookToShelf(imported);
      setIsDrawerOpen(false);
    } catch (err: any) {
      alert(`导入文件失败: ${err.message || err}`);
    }
  };

  const [isFadeLocked, setIsFadeLocked] = useState(false);

  // Mouse Auto-Fade on Hover Leave (Stealth Feature)
  const handleWindowMouseEnter = () => {
    if (stealthConfig.mouseAutoFade && !isFadeLocked) {
      setIsMouseFaded(false);
    }
  };

  const handleWindowMouseLeave = () => {
    // DO NOT FADE IF:
    // 1. User locked brightness (isFadeLocked === true)
    // 2. An input or textarea is currently focused (prevents IME candidate window from hiding the page!)
    const activeEl = document.activeElement;
    const isInputFocused =
      activeEl &&
      (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true');

    if (stealthConfig.mouseAutoFade && !isFadeLocked && !isInputFocused) {
      setIsMouseFaded(true);
    }
  };

  // If Boss Key is Triggered in Web Fallback
  if (isBossHidden) {
    return (
      <div
        onClick={handleBossKeyTrigger}
        style={{
          width: '100vw',
          height: '100vh',
          background: 'transparent',
          cursor: 'default'
        }}
      />
    );
  }

  // Chameleon Fullscreen Modes with fallback safeChapter
  const safeChapter: Chapter = currentChapter || {
    id: 'demo-chapter',
    title: '暂无章节',
    content: '暂无章节内容，请在书架选择书籍或导入本地小说开始阅读。',
    index: 0
  };

  if (chameleonMode === 'excel') {
    return (
      <ExcelMode
        currentChapter={safeChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'word') {
    return (
      <WordMode
        currentChapter={safeChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'vscode') {
    return (
      <VSCodeMode
        currentChapter={safeChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'idea') {
    return (
      <IdeaMode
        book={activeBook}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'pdf') {
    return (
      <PdfMode
        currentChapter={safeChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'email') {
    return (
      <EmailMode
        currentChapter={safeChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'chat') {
    return (
      <ChatMode
        currentChapter={safeChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'ppt') {
    return (
      <PptMode
        currentChapter={safeChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'stickynote') {
    return (
      <StickyNoteMode
        currentChapter={safeChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'ticker') {
    return (
      <TickerBarMode
        currentChapter={safeChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  // Calculate Active Theme & Glass Classes
  const themeClass = `theme-${themeConfig.themePreset} glass-${themeConfig.glassLevel}`;
  const windowOpacity = isMouseFaded ? stealthConfig.mouseLeaveOpacity : 1.0;

  return (
    <div
      className={`app-root ${themeClass}`}
      onMouseEnter={handleWindowMouseEnter}
      onMouseLeave={handleWindowMouseLeave}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
        boxShadow: 'inset 0 0 0 1px var(--glass-border), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        background: 'var(--bg-app)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        opacity: windowOpacity,
        transition: `opacity ${stealthConfig.mouseAutoFadeDuration}ms var(--ios-spring)`,
        boxSizing: 'border-box'
      }}
    >
      {/* Frameless Window Edge Resize Handles */}
      <WindowResizeHandles />

      {/* Hidden HTML5 File Input for Web Mode */}
      <input
        id="html5-file-input"
        type="file"
        accept=".txt,.epub,.md"
        onChange={handleHTML5FileInput}
        style={{ display: 'none' }}
      />

      {/* Dynamic Liquid Glass Tab Bar with Android Drag Handle */}
      <FloatingTabBar
        books={books}
        openTabIds={openTabIds}
        activeBookId={activeBookId}
        onSelectBook={handleSelectBook}
        onCloseTab={handleCloseTab}
        onOpenNewBook={() => {
          if (isTauri()) {
            handleImportLocalFile();
          } else {
            document.getElementById('html5-file-input')?.click();
          }
        }}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        chameleonMode={chameleonMode}
        onChangeChameleonMode={setChameleonMode}
        alwaysOnTop={stealthConfig.alwaysOnTop}
        onToggleAlwaysOnTop={() => {
          const newVal = !stealthConfig.alwaysOnTop;
          setStealthConfig((prev) => ({ ...prev, alwaysOnTop: newVal }));
          windowControls.setAlwaysOnTop(newVal);
        }}
        isFadeLocked={isFadeLocked}
        onToggleFadeLock={() => setIsFadeLocked((prev) => !prev)}
        onTriggerBossKey={handleBossKeyTrigger}
      />

      {/* Main Reading Workspace or Empty Welcome State */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeBook ? (
          <MainReader
            book={activeBook}
            sources={sources}
            onUpdateBookProgress={handleUpdateBookProgress}
            onPrevChapter={handlePrevChapter}
            onNextChapter={handleNextChapter}
            onJumpChapter={handleJumpChapter}
            themeConfig={themeConfig}
            onUpdateTheme={setThemeConfig}
            onAddBookmark={(bm) => setBookmarks((prev) => [bm, ...prev])}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '18px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <CuteAppIcon size={80} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                欢迎使用 摸鱼阅读
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: '1.5' }}>
                通透磨砂玻璃质感 · 小说与漫画双引擎 · 全网 Legado 聚合搜书 · 10 大办公摸鱼伪装矩阵
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (isTauri()) {
                    handleImportLocalFile();
                  } else {
                    document.getElementById('html5-file-input')?.click();
                  }
                }}
                className="frosted-btn frosted-btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Upload size={14} />
                <span>导入本地小说 (TXT / EPUB)</span>
              </button>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="frosted-btn"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <Plus size={14} />
                <span>全网搜书 & 书源</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Glassmorphic Side Drawer */}
      <GlassDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        books={books}
        activeBook={activeBook}
        activeBookId={activeBookId}
        bookmarks={bookmarks}
        sources={sources}
        themeConfig={themeConfig}
        stealthConfig={stealthConfig}
        onSelectBook={(bookId: string) => {
          handleSelectBook(bookId);
          setIsDrawerOpen(false);
        }}
        onDeleteBook={handleDeleteBook}
        onImportLocal={handleImportLocalFile}
        onSelectChapter={(chapterIndex: number) => {
          handleJumpChapter(chapterIndex);
          setIsDrawerOpen(false);
        }}
        onSelectBookmark={(bm: Bookmark) => {
          if (bm.bookId === activeBookId) {
            handleJumpChapter(bm.chapterIndex);
            setIsDrawerOpen(false);
          } else {
            handleSelectBook(bm.bookId);
            setTimeout(() => handleJumpChapter(bm.chapterIndex), 100);
            setIsDrawerOpen(false);
          }
        }}
        onDeleteBookmark={(id: string) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
        onAddBookToShelf={handleAddBookToShelf}
        onUpdateSources={setSources}
        onUpdateTheme={setThemeConfig}
        onUpdateStealth={setStealthConfig}
        onReloadAllData={() => {
          setBooks(StorageService.getBooks());
          setSources(StorageService.getSources());
          setThemeConfig(StorageService.getThemeConfig());
          setStealthConfig(StorageService.getStealthConfig());
          setBookmarks(StorageService.getBookmarks());
        }}
        onUpdateBookCover={(bookId: string, cover: string) => {
          setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, cover } : b)));
        }}
        onChangeChameleonMode={setChameleonMode}
        onOpenGuide={() => setShowOnboarding(true)}
      />

      {/* First-Time Welcome & User Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          try {
            localStorage.setItem('liquid_reader_has_seen_onboarding_v2', 'true');
          } catch {}
        }}
      />
    </div>
  );
}
