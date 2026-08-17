import React, { useState, useEffect, useCallback } from 'react';
import {
  Book,
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
import { StickyNoteMode } from './components/ChameleonModes/StickyNoteMode';
import { TickerBarMode } from './components/ChameleonModes/TickerBarMode';
import {
  isTauri,
  openLocalFileDialog,
  registerBossKeyShortcut,
  windowControls
} from './services/tauriBridge';
import { parseEpubFile, parseTxtFile } from './services/localFileParser';
import { Upload, Plus } from 'lucide-react';
import { CuteAppIcon } from './components/CuteAppIcon';
import './styles/glass.css';

export function App() {
  // Main State
  const [books, setBooks] = useState<Book[]>(() => StorageService.getBooks());
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
    return initialBooks.length > 0 ? initialBooks.map((b) => b.id) : [];
  });
  const [sources, setSources] = useState<BookSource[]>(() => StorageService.getSources());
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => StorageService.getThemeConfig());
  const [stealthConfig, setStealthConfig] = useState<StealthConfig>(() => StorageService.getStealthConfig());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => StorageService.getBookmarks());

  // UI Control State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chameleonMode, setChameleonMode] = useState<ChameleonModeType>('none');
  const [isMouseFaded, setIsMouseFaded] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(true);

  const activeBook = books.find((b) => b.id === activeBookId) || null;
  const currentChapter = activeBook?.chapters[activeBook.currentChapterIndex];

  // Auto-sync State to LocalStorage
  useEffect(() => {
    StorageService.saveBooks(books);
  }, [books]);

  useEffect(() => {
    StorageService.saveActiveBookId(activeBookId);
  }, [activeBookId]);

  useEffect(() => {
    StorageService.saveOpenTabs(openTabIds);
  }, [openTabIds]);

  useEffect(() => {
    StorageService.saveSources(sources);
  }, [sources]);

  useEffect(() => {
    StorageService.saveThemeConfig(themeConfig);
  }, [themeConfig]);

  useEffect(() => {
    StorageService.saveStealthConfig(stealthConfig);
  }, [stealthConfig]);

  useEffect(() => {
    StorageService.saveBookmarks(bookmarks);
  }, [bookmarks]);

  // Boss Key Trigger Action
  const handleBossKeyTrigger = useCallback(async () => {
    if (isTauri()) {
      await windowControls.hide();
    } else {
      setChameleonMode((prev) => (prev === 'excel' ? 'none' : 'excel'));
    }
  }, []);

  // Register Global Boss Key Shortcut in Tauri
  useEffect(() => {
    registerBossKeyShortcut(stealthConfig.bossKeyShortcut, handleBossKeyTrigger);
  }, [stealthConfig.bossKeyShortcut, handleBossKeyTrigger]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle Drawer on Alt+M
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setIsDrawerOpen((prev) => !prev);
      }
      // Toggle Excel Camouflage on Alt+E
      else if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setChameleonMode((prev) => (prev === 'excel' ? 'none' : 'excel'));
      }
      // Toggle VS Code Camouflage on Alt+C
      else if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setChameleonMode((prev) => (prev === 'vscode' ? 'none' : 'vscode'));
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
    const remaining = openTabIds.filter((tabId) => tabId !== id);
    setOpenTabIds(remaining);
    if (activeBookId === id) {
      setActiveBookId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  const handleAddBookToShelf = (newBook: Book) => {
    setBooks((prev) => {
      const exists = prev.find((b) => b.id === newBook.id || b.title === newBook.title);
      if (exists) return prev;
      return [newBook, ...prev];
    });
    handleSelectBook(newBook.id);
  };

  const handleDeleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setOpenTabIds((prev) => prev.filter((tabId) => tabId !== id));
    if (activeBookId === id) {
      setActiveBookId(null);
    }
  };

  // Chapter Progress & Navigation
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
    if (activeBook.currentChapterIndex < activeBook.chapters.length - 1) {
      handleUpdateBookProgress(activeBook.currentChapterIndex + 1, 0);
    }
  };

  const handlePrevChapter = () => {
    if (!activeBook) return;
    if (activeBook.currentChapterIndex > 0) {
      handleUpdateBookProgress(activeBook.currentChapterIndex - 1, 0);
    }
  };

  const handleJumpChapter = (index: number) => {
    if (!activeBook) return;
    if (index >= 0 && index < activeBook.chapters.length) {
      handleUpdateBookProgress(index, 0);
    }
  };

  // Local File Import Dialog (TXT / EPUB)
  const handleImportLocalFile = async () => {
    try {
      const fileData = await openLocalFileDialog([
        { name: '小说书籍文件 (*.txt, *.epub, *.md)', extensions: ['txt', 'epub', 'md'] }
      ]);

      if (fileData) {
        let importedBook: Book;
        if (fileData.buffer) {
          importedBook = await parseEpubFile(fileData.name, fileData.buffer);
        } else if (fileData.text) {
          importedBook = parseTxtFile(fileData.name, fileData.text);
        } else {
          return;
        }
        handleAddBookToShelf(importedBook);
        setIsDrawerOpen(false);
      }
    } catch (err: any) {
      alert(`导入文件失败: ${err.message || err}`);
    }
  };

  // HTML5 Fallback File Picker
  const handleHTML5FileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    if (file.name.toLowerCase().endsWith('.epub')) {
      reader.onload = async (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          const book = await parseEpubFile(file.name, buffer);
          handleAddBookToShelf(book);
          setIsDrawerOpen(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const book = parseTxtFile(file.name, text);
          handleAddBookToShelf(book);
          setIsDrawerOpen(false);
        }
      };
      reader.readAsText(file);
    }
  };

  // Mouse Auto-Fade Handlers
  const handleWindowMouseEnter = () => {
    if (stealthConfig.mouseAutoFade) {
      setIsMouseFaded(false);
    }
  };

  const handleWindowMouseLeave = () => {
    if (stealthConfig.mouseAutoFade) {
      setIsMouseFaded(true);
    }
  };

  // Render Chameleon Modes
  if (chameleonMode === 'excel') {
    return (
      <ExcelMode
        currentChapter={currentChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'vscode') {
    return (
      <VSCodeMode
        currentChapter={currentChapter}
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

  if (chameleonMode === 'stickynote') {
    return (
      <StickyNoteMode
        currentChapter={currentChapter}
        onExit={() => setChameleonMode('none')}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
      />
    );
  }

  if (chameleonMode === 'ticker') {
    return (
      <TickerBarMode
        currentChapter={currentChapter}
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
        background: 'var(--bg-app)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        opacity: windowOpacity,
        transition: `opacity ${stealthConfig.mouseAutoFadeDuration}ms var(--ios-spring)`,
        boxSizing: 'border-box'
      }}
    >
      {/* Hidden HTML5 File Input for Web Mode */}
      <input
        id="html5-file-input"
        type="file"
        accept=".txt,.epub,.md"
        onChange={handleHTML5FileInput}
        style={{ display: 'none' }}
      />

      {/* Dynamic Liquid Glass Tab Bar */}
      <FloatingTabBar
        books={books}
        openTabIds={openTabIds}
        activeBookId={activeBookId}
        onSelectBook={handleSelectBook}
        onCloseTab={handleCloseTab}
        onOpenNewBook={() => setIsDrawerOpen(true)}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        chameleonMode={chameleonMode}
        onChangeChameleonMode={setChameleonMode}
        alwaysOnTop={alwaysOnTop}
        onToggleAlwaysOnTop={async () => {
          const next = !alwaysOnTop;
          setAlwaysOnTop(next);
          await windowControls.setAlwaysOnTop(next);
        }}
        onTriggerBossKey={handleBossKeyTrigger}
      />

      {/* Main Canvas: Reader or Welcome Screen */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeBook ? (
          <MainReader
            key={activeBook.id}
            book={activeBook}
            sources={sources}
            themeConfig={themeConfig}
            onUpdateTheme={setThemeConfig}
            onUpdateBookProgress={handleUpdateBookProgress}
            onAddBookmark={(bm) => setBookmarks((prev) => [bm, ...prev])}
            onNextChapter={handleNextChapter}
            onPrevChapter={handlePrevChapter}
            onJumpChapter={handleJumpChapter}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '20px'
            }}
          >
            <div
              className="frosted-panel animate-ios-spring"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 44px',
                borderRadius: '24px',
                textAlign: 'center',
                maxWidth: '460px',
                width: '100%',
                gap: '18px'
              }}
            >
              {/* Cute Mascot App Icon */}
              <CuteAppIcon size={84} style={{ marginBottom: '4px' }} />

              {/* Title & Subtitle with Crisp Contrast */}
              <div>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.4px'
                  }}
                >
                  LiquidReader
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginTop: '6px',
                    lineHeight: 1.5
                  }}
                >
                  Windows 通透磨砂风 · 摸鱼沉浸双模小说阅读器
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '6px' }}>
                <button
                  onClick={() => {
                    if (isTauri()) {
                      handleImportLocalFile();
                    } else {
                      document.getElementById('html5-file-input')?.click();
                    }
                  }}
                  className="frosted-btn frosted-btn-primary"
                  style={{ flex: 1, padding: '11px 18px', fontSize: '13.5px', borderRadius: '9999px' }}
                >
                  <Upload size={16} />
                  <span>导入本地 (TXT / EPUB)</span>
                </button>

                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="frosted-btn"
                  style={{ flex: 1, padding: '11px 18px', fontSize: '13.5px', borderRadius: '9999px' }}
                >
                  <Plus size={16} />
                  <span>全网书源搜书</span>
                </button>
              </div>

              {/* Shortcut Cheat Badges */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '8px'
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'rgba(0,0,0,0.12)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}
                >
                  老板键: Alt+`
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'rgba(0,0,0,0.12)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}
                >
                  Excel伪装: Alt+E
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'rgba(0,0,0,0.12)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}
                >
                  VSCode伪装: Alt+C
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'rgba(0,0,0,0.12)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}
                >
                  单行极简: Alt+1
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liquid Glass Side Drawer */}
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
        onSelectBook={handleSelectBook}
        onDeleteBook={handleDeleteBook}
        onImportLocal={() => {
          if (isTauri()) {
            handleImportLocalFile();
          } else {
            document.getElementById('html5-file-input')?.click();
          }
        }}
        onSelectChapter={handleJumpChapter}
        onSelectBookmark={(bm) => {
          if (bm.bookId !== activeBookId) {
            handleSelectBook(bm.bookId);
          }
          handleJumpChapter(bm.chapterIndex);
        }}
        onDeleteBookmark={(bmId) => {
          const updated = bookmarks.filter((b) => b.id !== bmId);
          setBookmarks(updated);
          StorageService.saveBookmarks(updated);
        }}
        onAddBookToShelf={handleAddBookToShelf}
        onUpdateSources={setSources}
        onUpdateTheme={setThemeConfig}
        onUpdateStealth={setStealthConfig}
        onUpdateBookCover={(bookId, cover) => {
          const updated = books.map((b) => (b.id === bookId ? { ...b, cover } : b));
          setBooks(updated);
          StorageService.saveBooks(updated);
        }}
        onReloadAllData={() => {
          setBooks(StorageService.getBooks());
          setSources(StorageService.getSources());
          setThemeConfig(StorageService.getThemeConfig());
          setStealthConfig(StorageService.getStealthConfig());
          setBookmarks(StorageService.getBookmarks());
        }}
      />
    </div>
  );
}

export default App;
