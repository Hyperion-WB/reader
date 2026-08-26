import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, Bookmark, BookSource, ThemeConfig } from '../types/reader';
import { BookSourceEngine } from '../services/bookSourceEngine';
import { HUDControls } from './HUDControls';
import { TTSBar } from './TTSBar';
import { TTSService } from '../services/ttsService';
import { ShortcutsModal } from './ShortcutsModal';
import { ChapterSearchBar } from './ChapterSearchBar';
import { SourceSwitcherModal } from './SourceSwitcherModal';
import { Loader2, BookmarkPlus, Pause, Bookmark as BookmarkIcon, DownloadCloud, Image as ImageIcon } from 'lucide-react';

interface MainReaderProps {
  book: Book;
  sources: BookSource[];
  themeConfig: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
  onUpdateBookProgress: (chapterIndex: number, progressPercent: number) => void;
  onAddBookmark: (bookmark: Bookmark) => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  onJumpChapter: (index: number) => void;
  onSwitchBookSource?: (updatedBook: Book) => void;
}

export const MainReader: React.FC<MainReaderProps> = ({
  book,
  sources,
  themeConfig,
  onUpdateTheme,
  onUpdateBookProgress,
  onAddBookmark,
  onNextChapter,
  onPrevChapter,
  onJumpChapter,
  onSwitchBookSource
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHUD, setShowHUD] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [currentChapterContent, setCurrentChapterContent] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPos, setSelectionPos] = useState<{ x: number; y: number } | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showSourceSwitcher, setShowSourceSwitcher] = useState(false);
  const [showBatchCacheModal, setShowBatchCacheModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-Chapter Keyword Search
  const [showChapterSearch, setShowChapterSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);

  // Auto Scroll Engine
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(2); // 1 to 5
  const autoScrollRafRef = useRef<number | null>(null);
  const isHoveredOrTouching = useRef<boolean>(false);

  // TTS State
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [ttsRate, setTtsRate] = useState(1.0);

  const currentChapter = book.chapters[book.currentChapterIndex] || {
    id: 'ch-0',
    title: '暂无章节',
    index: 0
  };

  // Fetch or load chapter content
  useEffect(() => {
    let isCancelled = false;

    const loadChapter = async () => {
      if (currentChapter.content) {
        setCurrentChapterContent(currentChapter.content);
        return;
      }

      if (book.isOnlineSource && currentChapter.url) {
        setLoadingContent(true);
        try {
          const source = sources.find((s) => s.id === book.sourceId) || {
            id: book.sourceId,
            name: book.sourceName,
            url: book.sourceUrl || '',
            enabled: true
          };

          const engine = new BookSourceEngine(sources);
          const content = await engine.fetchChapterContent(currentChapter.url, source);
          if (!isCancelled) {
            setCurrentChapterContent(content);
            currentChapter.content = content; // cache in memory
          }
        } catch (err: any) {
          if (!isCancelled) {
            setCurrentChapterContent(`章节内容加载失败: ${err.message || '网络请求超时'}`);
          }
        } finally {
          if (!isCancelled) {
            setLoadingContent(false);
            // Intelligent Background Prefetch for Next Chapter (0ms instant page flip)
            const nextChapter = book.chapters[book.currentChapterIndex + 1];
            if (nextChapter && !nextChapter.content && nextChapter.url) {
              const source = sources.find((s) => s.id === book.sourceId) || {
                id: book.sourceId,
                name: book.sourceName,
                url: book.sourceUrl || '',
                enabled: true
              };
              const engine = new BookSourceEngine(sources);
              engine.fetchChapterContent(nextChapter.url, source).then((nextContent) => {
                if (nextContent) nextChapter.content = nextContent;
              }).catch(() => {});
            }
          }
        }
      } else {
        setCurrentChapterContent(currentChapter.content || '(本章暂无内容)');
      }
    };

    loadChapter();

    // Reset scroll when chapter changes
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }

    return () => {
      isCancelled = true;
    };
  }, [book.id, book.currentChapterIndex, currentChapter.id, currentChapter.url]);

  // Throttled Scroll Progress Sync using requestAnimationFrame & delta checks (Zero-Lag 120 FPS)
  const lastProgressRef = useRef<number>(-1);
  const scrollRafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (scrollRafRef.current) return;

    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const progress = Math.min(100, Math.round((scrollTop / Math.max(1, scrollHeight - clientHeight)) * 100));
        if (progress !== lastProgressRef.current) {
          lastProgressRef.current = progress;
          onUpdateBookProgress(book.currentChapterIndex, progress);
        }
      }
    });
  }, [book.currentChapterIndex, onUpdateBookProgress]);

  // Auto-scroll loop
  const autoScrollStep = useCallback(() => {
    if (!isAutoScrolling) return;

    if (!isHoveredOrTouching.current && containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setIsAutoScrolling(false);
        onNextChapter();
        return;
      }
      containerRef.current.scrollTop += autoScrollSpeed * 0.7;
    }

    autoScrollRafRef.current = requestAnimationFrame(autoScrollStep);
  }, [isAutoScrolling, autoScrollSpeed, onNextChapter]);

  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollRafRef.current = requestAnimationFrame(autoScrollStep);
    } else if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
    }
    return () => {
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);
    };
  }, [isAutoScrolling, autoScrollStep]);

  const paragraphs = currentChapterContent
    ? currentChapterContent
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : [];

  const wordCount = currentChapterContent ? currentChapterContent.replace(/\s+/g, '').length : 0;

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  const lastWheelTimeRef = React.useRef<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDoubleCol = themeConfig.columns === 'double' || (themeConfig.columns === 'auto' && windowWidth >= 1024);

  // Exact Viewport-based Page Slicing Formula (100% fits on 1 screen, never scrolls vertically!)
  const pageLines = Math.max(6, Math.floor((viewportHeight - 160) / (themeConfig.fontSize * themeConfig.lineHeight + (themeConfig.paragraphSpacing * 0.6))));
  const singleColWidth = isDoubleCol ? (Math.min(windowWidth, 1240) - 100) / 2 : Math.min(windowWidth - 60, 860);
  const charsPerLine = Math.max(14, Math.floor(singleColWidth / (themeConfig.fontSize * 1.05)));
  const charsPerPage = isDoubleCol ? pageLines * charsPerLine * 2 : pageLines * charsPerLine;

  const pages: string[][] = React.useMemo(() => {
    if (paragraphs.length === 0) return [['(本章暂无内容)']];
    const result: string[][] = [];
    let currentBatch: string[] = [];
    let currentBatchLen = 0;

    for (const para of paragraphs) {
      if (currentBatchLen + para.length > charsPerPage && currentBatch.length > 0) {
        result.push(currentBatch);
        currentBatch = [para];
        currentBatchLen = para.length;
      } else {
        currentBatch.push(para);
        currentBatchLen += para.length;
      }
    }
    if (currentBatch.length > 0) {
      result.push(currentBatch);
    }
    return result.length > 0 ? result : [['(本章暂无内容)']];
  }, [paragraphs, charsPerPage]);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageTurnDir, setPageTurnDir] = useState<'next' | 'prev' | null>(null);

  // Clamp current page on content changes
  useEffect(() => {
    if (currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [pages.length]);

  // Reset page to 0 when switching chapters
  useEffect(() => {
    setCurrentPage(0);
    setPageTurnDir(null);
  }, [book.currentChapterIndex]);

  const handleNextPage = useCallback(() => {
    setPageTurnDir('next');
    if (currentPage < pages.length - 1) {
      const nextP = currentPage + 1;
      setCurrentPage(nextP);
      const progress = Math.round(((nextP + 1) / pages.length) * 100);
      onUpdateBookProgress(book.currentChapterIndex, progress);
    } else {
      if (book.currentChapterIndex < book.chapters.length - 1) {
        onNextChapter();
      }
    }
  }, [currentPage, pages.length, book.currentChapterIndex, book.chapters.length, onNextChapter, onUpdateBookProgress]);

  const handlePrevPage = useCallback(() => {
    setPageTurnDir('prev');
    if (currentPage > 0) {
      const prevP = currentPage - 1;
      setCurrentPage(prevP);
      const progress = Math.round(((prevP + 1) / pages.length) * 100);
      onUpdateBookProgress(book.currentChapterIndex, progress);
    } else {
      if (book.currentChapterIndex > 0) {
        onPrevChapter();
      }
    }
  }, [currentPage, pages.length, book.currentChapterIndex, onPrevChapter, onUpdateBookProgress]);

  // Handle Mouse Wheel in Paginated Mode to Flip Pages Instantly
  const handleWheelOnReader = (e: React.WheelEvent) => {
    if (themeConfig.pageMode !== 'paginated') return;
    const now = Date.now();
    if (now - lastWheelTimeRef.current > 200) {
      if (e.deltaY > 20) {
        handleNextPage();
        lastWheelTimeRef.current = now;
      } else if (e.deltaY < -20) {
        handlePrevPage();
        lastWheelTimeRef.current = now;
      }
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setShowChapterSearch((prev) => !prev);
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (themeConfig.pageMode === 'paginated') {
          handleNextPage();
        } else {
          setIsAutoScrolling((prev) => !prev);
        }
      } else if (e.key === '?') {
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (themeConfig.pageMode === 'paginated') {
          handleNextPage();
        } else {
          onNextChapter();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (themeConfig.pageMode === 'paginated') {
          handlePrevPage();
        } else {
          onPrevChapter();
        }
      } else if (e.key === ']' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        onNextChapter();
      } else if (e.key === '[' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        onPrevChapter();
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        if (themeConfig.pageMode === 'paginated') {
          handleNextPage();
        } else if (containerRef.current) {
          containerRef.current.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
        }
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        if (themeConfig.pageMode === 'paginated') {
          handlePrevPage();
        } else if (containerRef.current) {
          containerRef.current.scrollBy({ top: -window.innerHeight * 0.75, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowDown') {
        if (containerRef.current) {
          containerRef.current.scrollBy({ top: 80, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp') {
        if (containerRef.current) {
          containerRef.current.scrollBy({ top: -80, behavior: 'smooth' });
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        onUpdateTheme({ ...themeConfig, fontSize: Math.min(36, themeConfig.fontSize + 1) });
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        onUpdateTheme({ ...themeConfig, fontSize: Math.max(11, themeConfig.fontSize - 1) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextChapter, onPrevChapter, onUpdateTheme, themeConfig, handleNextPage, handlePrevPage]);

  // Handle Text Selection for Bookmarking
  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const text = sel.toString().trim();
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    } else {
      setSelectedText('');
      setSelectionPos(null);
    }
  };

  const handleSaveSelectionAsBookmark = () => {
    if (selectedText) {
      onAddBookmark({
        id: `bm-${Date.now()}`,
        bookId: book.id,
        chapterIndex: book.currentChapterIndex,
        chapterTitle: currentChapter.title,
        selectedText,
        timestamp: Date.now()
      });
      setSelectedText('');
      setSelectionPos(null);
      setToastMessage('已成功添加所选高亮书签');
      setTimeout(() => setToastMessage(null), 2200);
    }
  };

  const handleQuickAddBookmark = () => {
    const excerpt = paragraphs[0] ? paragraphs[0].slice(0, 80) : currentChapter.title;
    onAddBookmark({
      id: `bm-${Date.now()}`,
      bookId: book.id,
      chapterIndex: book.currentChapterIndex,
      chapterTitle: currentChapter.title,
      selectedText: selectedText || excerpt,
      timestamp: Date.now()
    });
    setSelectedText('');
    setSelectionPos(null);
    setToastMessage(`已为【${currentChapter.title}】添加书签`);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // TTS Speech Actions
  const handleStartTTS = () => {
    if (!currentChapterContent) return;
    setIsTTSActive(true);
    setIsTTSPlaying(true);
    TTSService.speak(currentChapterContent, {
      rate: ttsRate,
      onEnd: () => {
        setIsTTSPlaying(false);
        onNextChapter();
      }
    });
  };

  const handlePauseTTS = () => {
    TTSService.pause();
    setIsTTSPlaying(false);
  };

  const handleStopTTS = () => {
    TTSService.stop();
    setIsTTSPlaying(false);
    setIsTTSActive(false);
  };

  // Calculate search matches
  const totalSearchMatches = searchQuery.trim()
    ? (currentChapterContent.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    : 0;

  const hudHideTimerRef = useRef<any>(null);
  const isHudHoveredRef = useRef(false);

  const handleMouseMove = () => {
    setShowHUD(true);
    if (hudHideTimerRef.current) clearTimeout(hudHideTimerRef.current);
    hudHideTimerRef.current = setTimeout(() => {
      if (!isHudHoveredRef.current && !isAutoScrolling) {
        setShowHUD(false);
      }
    }, 5000);
  };

  // Dynamic Reading Background Computation
  const getReadingBackgroundStyle = (): { bg: string; color?: string } => {
    switch (themeConfig.backgroundPreset) {
      case 'parchment':
        return { bg: '#f6f1e5', color: '#382c1e' };
      case 'rice-paper':
        return { bg: '#f7f6f2', color: '#27272a' };
      case 'eyecare-green':
        return { bg: '#dceada', color: '#1f3a24' };
      case 'warm-latte':
        return { bg: '#f4ece1', color: '#3d352e' };
      case 'slate-gray':
        return { bg: '#262b36', color: '#e2e8f0' };
      case 'kraft-wood':
        return { bg: '#e8dbca', color: '#332617' };
      case 'navy-night':
        return { bg: '#0b1120', color: '#cbd5e1' };
      case 'pure-black':
        return { bg: '#000000', color: '#a1a1aa' };
      case 'custom':
        return {
          bg: themeConfig.customBgColor || 'transparent',
          color: themeConfig.textColor || 'var(--text-primary)'
        };
      case 'default':
      default:
        return { bg: 'transparent', color: 'var(--text-primary)' };
    }
  };

  const readingBg = getReadingBackgroundStyle();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: readingBg.bg,
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowHUD(true)}
      onMouseLeave={() => {
        if (!isAutoScrolling) {
          setShowHUD(false);
        }
      }}
    >
      {/* Custom Wallpaper Layer if active */}
      {themeConfig.backgroundPreset === 'custom' && themeConfig.customBgImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${themeConfig.customBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: themeConfig.bgImageOpacity ?? 0.85,
            filter: `blur(${themeConfig.bgImageBlur ?? 4}px)`,
            transform: 'scale(1.05)',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'opacity 0.3s ease, filter 0.3s ease'
          }}
        />
      )}

      {/* In-Chapter Keyword Search Bar */}
      <ChapterSearchBar
        isOpen={showChapterSearch}
        onClose={() => {
          setShowChapterSearch(false);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onChangeQuery={(q) => {
          setSearchQuery(q);
          setMatchIndex(0);
        }}
        currentIndex={matchIndex}
        totalMatches={totalSearchMatches}
        onNextMatch={() => setMatchIndex((prev) => (prev + 1) % Math.max(1, totalSearchMatches))}
        onPrevMatch={() => setMatchIndex((prev) => (prev - 1 + totalSearchMatches) % Math.max(1, totalSearchMatches))}
      />

      {/* Reading Viewport Area (Zero-Scroll in Paginated Mode, Smooth-Scroll in Scroll Mode) */}
      <div
        ref={containerRef}
        onScroll={themeConfig.pageMode !== 'paginated' ? handleScroll : undefined}
        onWheel={themeConfig.pageMode === 'paginated' ? handleWheelOnReader : undefined}
        onMouseUp={handleMouseUp}
        className={themeConfig.pageMode === 'paginated' ? 'reader-scroll-viewport' : 'smooth-scroll reader-scroll-viewport'}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          overflowY: themeConfig.pageMode === 'paginated' ? 'hidden' : 'auto',
          overflowX: 'hidden',
          padding:
            themeConfig.pageMode === 'paginated'
              ? '16px clamp(14px, 3.5vw, 36px) 14px clamp(14px, 3.5vw, 36px)'
              : '24px clamp(14px, 4vw, 36px) 140px clamp(14px, 4vw, 36px)',
          boxSizing: 'border-box',
          fontFamily: themeConfig.fontFamily,
          fontSize: `${themeConfig.fontSize}px`,
          lineHeight: themeConfig.lineHeight,
          letterSpacing: `${themeConfig.letterSpacing}px`,
          color: readingBg.color || 'var(--text-primary)',
          transform: 'translateZ(0)',
          contain: 'paint layout'
        }}
      >
        {/* Chapter Title (Only displayed in Vertical Scroll Mode) */}
        {themeConfig.pageMode !== 'paginated' && (
          <div
            style={{
              fontWeight: 700,
              fontSize: `${themeConfig.fontSize + 8}px`,
              marginBottom: '24px',
              color: 'var(--text-primary)',
              textAlign: 'center',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '14px',
              letterSpacing: '-0.3px'
            }}
          >
            {currentChapter.title}
          </div>
        )}

        {/* Comic / Manga Rendering Canvas with Flow & Filter Controls */}
        {(book.isComic || currentChapter.isComic || (currentChapter.comicImages && currentChapter.comicImages.length > 0)) ? (
          <div className="animate-chapter-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '960px', margin: '0 auto' }}>
            {/* Floating Comic Quick Controls Toolbar */}
            <div
              className="frosted-menu-solid"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                marginBottom: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ImageIcon size={12} color="var(--accent-color)" />
                <span>画卷 ({currentChapter.comicImages?.length || 0}P)</span>
              </div>
              <div style={{ width: '1px', height: '12px', background: 'var(--glass-border)' }} />
              {/* Flow Mode Switcher */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <button
                  onClick={() => onUpdateTheme({ ...themeConfig, comicFlowMode: 'stream' })}
                  className="frosted-btn"
                  style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    borderRadius: '6px',
                    background: (themeConfig.comicFlowMode || 'stream') === 'stream' ? 'var(--accent-color)' : 'transparent',
                    color: (themeConfig.comicFlowMode || 'stream') === 'stream' ? '#fff' : 'inherit'
                  }}
                >
                  条漫瀑布
                </button>
                <button
                  onClick={() => onUpdateTheme({ ...themeConfig, comicFlowMode: 'rtl' })}
                  className="frosted-btn"
                  style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    borderRadius: '6px',
                    background: themeConfig.comicFlowMode === 'rtl' ? 'var(--accent-color)' : 'transparent',
                    color: themeConfig.comicFlowMode === 'rtl' ? '#fff' : 'inherit'
                  }}
                  data-tooltip="日漫翻页习惯 (从右往左)"
                  data-tooltip-pos="top"
                >
                  日漫 RTL
                </button>
              </div>
              <div style={{ width: '1px', height: '12px', background: 'var(--glass-border)' }} />
              {/* Filter Switcher */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <button
                  onClick={() => onUpdateTheme({ ...themeConfig, comicFilter: themeConfig.comicFilter === 'invert' ? 'normal' : 'invert' })}
                  className="frosted-btn"
                  style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    borderRadius: '6px',
                    background: themeConfig.comicFilter === 'invert' ? 'var(--accent-color)' : 'transparent',
                    color: themeConfig.comicFilter === 'invert' ? '#fff' : 'inherit'
                  }}
                  data-tooltip="夜间黑白反转 (夜读不刺眼)"
                  data-tooltip-pos="top"
                >
                  夜间反色
                </button>
                <button
                  onClick={() => onUpdateTheme({ ...themeConfig, comicFilter: themeConfig.comicFilter === 'contrast' ? 'normal' : 'contrast' })}
                  className="frosted-btn"
                  style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    borderRadius: '6px',
                    background: themeConfig.comicFilter === 'contrast' ? 'var(--accent-color)' : 'transparent',
                    color: themeConfig.comicFilter === 'contrast' ? '#fff' : 'inherit'
                  }}
                  data-tooltip="高清对比度增强"
                  data-tooltip-pos="top"
                >
                  清晰增强
                </button>
              </div>
            </div>

            {/* Comic Images List */}
            {currentChapter.comicImages?.map((imgSrc, imgIdx) => (
              <div
                key={imgIdx}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                  background: 'rgba(0,0,0,0.2)',
                  filter:
                    themeConfig.comicFilter === 'invert'
                      ? 'invert(0.92) hue-rotate(180deg) contrast(1.1)'
                      : themeConfig.comicFilter === 'contrast'
                      ? 'contrast(1.25) brightness(1.05)'
                      : 'none',
                  transition: 'filter 0.3s ease'
                }}
              >
                <img
                  src={imgSrc}
                  alt={`第 ${imgIdx + 1} 页`}
                  loading="lazy"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px'
                  }}
                />
              </div>
            ))}
          </div>
        ) : loadingContent ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              gap: '12px',
              color: 'var(--text-muted)'
            }}
          >
            <Loader2 size={32} className="animate-spin" />
            <div style={{ fontSize: '13px' }}>正在为您加载章节内容...</div>
          </div>
        ) : themeConfig.pageMode === 'paginated' ? (
          /* 2. True Paginated Mode (Zero Vertical Scroll, Pure Screen-Sized Page Turn) */
          <div
            key={`page-${book.currentChapterIndex}-${currentPage}`}
            className={pageTurnDir === 'next' ? 'page-anim-next' : pageTurnDir === 'prev' ? 'page-anim-prev' : 'animate-chapter-fade'}
            style={{
              maxWidth: isDoubleCol ? '1240px' : '860px',
              width: '100%',
              height: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              userSelect: 'none'
            }}
          >
            {/* Clickable Paging Hotspots: Left 28% (Prev), Center 44% (Toggle HUD), Right 28% (Next) */}
            <div
              onClick={handlePrevPage}
              data-tooltip="上一页 (A / ← / 滚轮向上)"
              data-tooltip-pos="right"
              style={{
                position: 'absolute',
                top: 0,
                bottom: '36px',
                left: 0,
                width: '28%',
                zIndex: 40,
                cursor: 'w-resize'
              }}
            />
            <div
              onClick={() => setShowHUD((prev) => !prev)}
              data-tooltip="点击切换控制栏显隐"
              data-tooltip-pos="top"
              style={{
                position: 'absolute',
                top: 0,
                bottom: '36px',
                left: '28%',
                width: '44%',
                zIndex: 40,
                cursor: 'pointer'
              }}
            />
            <div
              onClick={handleNextPage}
              data-tooltip="下一页 (D / → / 空格 / 滚轮向下)"
              data-tooltip-pos="left"
              style={{
                position: 'absolute',
                top: 0,
                bottom: '36px',
                right: 0,
                width: '28%',
                zIndex: 40,
                cursor: 'e-resize'
              }}
            />

            {/* Top Page Header (Apple Books Style) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginBottom: '10px',
                paddingBottom: '6px',
                borderBottom: '1px solid var(--glass-border)',
                flexShrink: 0
              }}
            >
              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                {book.title} · {currentChapter.title}
              </span>
              <span>
                第 {currentPage + 1} / {pages.length} 页
              </span>
            </div>

            {/* Current Page Content Paragraphs (Strictly constrained within remaining height) */}
            <div
              style={{
                flex: '1 1 0px',
                minHeight: 0,
                overflow: 'hidden',
                columnCount: isDoubleCol ? 2 : 1,
                columnGap: isDoubleCol ? '52px' : 'normal',
                columnRule: isDoubleCol ? '1px solid var(--glass-border)' : 'none',
                textAlign: 'justify'
              }}
            >
              {(pages[currentPage] || []).map((para, idx) => {
                if (searchQuery.trim().length > 0) {
                  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                  const parts = para.split(regex);
                  return (
                    <p
                      key={idx}
                      style={{
                        marginBottom: `${themeConfig.paragraphSpacing}px`,
                        textIndent: `${themeConfig.paragraphIndent}em`,
                        textAlign: 'justify'
                      }}
                    >
                      {parts.map((part, pIdx) =>
                        regex.test(part) ? (
                          <mark
                            key={pIdx}
                            style={{
                              background: '#fef08a',
                              color: '#713f12',
                              padding: '1px 3px',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}
                          >
                            {part}
                          </mark>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  );
                }

                return (
                  <p
                    key={idx}
                    style={{
                      marginBottom: `${themeConfig.paragraphSpacing}px`,
                      textIndent: `${themeConfig.paragraphIndent}em`,
                      textAlign: 'justify'
                    }}
                  >
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Bottom Page Navigation Controls */}
            <div
              className="tauri-no-drag"
              style={{
                paddingTop: '8px',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                color: 'var(--text-muted)',
                userSelect: 'none',
                flexShrink: 0,
                zIndex: 50
              }}
            >
              <button
                onClick={handlePrevPage}
                className="frosted-btn"
                style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '11px' }}
              >
                <span>‹ 上一页</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  第 {currentPage + 1} / {pages.length} 页
                </span>
                <span>·</span>
                <span>进度 {Math.round(((currentPage + 1) / pages.length) * 100)}%</span>
              </div>

              <button
                onClick={handleNextPage}
                className="frosted-btn"
                style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '11px' }}
              >
                <span>下一页 ›</span>
              </button>
            </div>
          </div>
        ) : (
          /* 3. Continuous Vertical Scroll Mode with Single/Double Column support */
          <div
            key={currentChapter.index}
            className="animate-chapter-fade"
            style={{
              maxWidth: isDoubleCol ? '1240px' : '860px',
              margin: '0 auto',
              columnCount: isDoubleCol ? 2 : 1,
              columnGap: isDoubleCol ? '52px' : 'normal',
              columnRule: isDoubleCol ? '1px solid var(--glass-border)' : 'none',
              textAlign: 'justify'
            }}
          >
            {paragraphs.map((para, idx) => {
              if (searchQuery.trim().length > 0) {
                const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                const parts = para.split(regex);
                return (
                  <p
                    key={idx}
                    style={{
                      marginBottom: `${themeConfig.paragraphSpacing}px`,
                      textIndent: `${themeConfig.paragraphIndent}em`,
                      textAlign: 'justify'
                    }}
                  >
                    {parts.map((part, pIdx) =>
                      regex.test(part) ? (
                        <mark
                          key={pIdx}
                          style={{
                            background: '#fef08a',
                            color: '#713f12',
                            padding: '1px 3px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        >
                          {part}
                        </mark>
                      ) : (
                        part
                      )
                    )}
                  </p>
                );
              }

              return (
                <p
                  key={idx}
                  style={{
                    marginBottom: `${themeConfig.paragraphSpacing}px`,
                    textIndent: `${themeConfig.paragraphIndent}em`,
                    textAlign: 'justify'
                  }}
                >
                  {para}
                </p>
              );
            })}

            {/* Bottom Chapter End Reading Stats Footer */}
            <div
              style={{
                marginTop: '48px',
                paddingTop: '20px',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'var(--text-muted)',
                letterSpacing: '0.5px'
              }}
            >
              <span>—— 本章完 · 约 {wordCount} 字 · 全书进度 {book.currentProgressPercent}% ——</span>
            </div>
          </div>
        )}
      </div>

      {/* Text Selection Floating Bookmark Popup */}
      {selectionPos && selectedText && (
        <div
          className="frosted-panel animate-ios-spring tauri-no-drag"
          style={{
            position: 'fixed',
            left: `${selectionPos.x}px`,
            top: `${selectionPos.y}px`,
            transform: 'translate(-50%, -100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            zIndex: 1000
          }}
        >
          <button
            onClick={handleSaveSelectionAsBookmark}
            className="frosted-btn"
            style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '9999px' }}
          >
            <BookmarkPlus size={13} style={{ color: 'var(--accent-color)' }} />
            <span>添加书签</span>
          </button>
        </div>
      )}

      {/* Floating Auto-Scroll Speed Controller Pill (Bottom Right) */}
      {isAutoScrolling && (
        <div
          className="ios-floating-bar animate-ios-spring tauri-no-drag"
          style={{
            position: 'absolute',
            bottom: '76px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            zIndex: 600,
            background: 'var(--accent-gradient)',
            color: '#fff',
            boxShadow: 'var(--accent-glow)'
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '11.5px' }}>自动滚屏</span>
          <button
            onClick={() => setIsAutoScrolling(false)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            data-tooltip="暂停滚屏 (空格 Space)"
            data-tooltip-pos="top"
          >
            <Pause size={13} />
          </button>

          {/* Speed Buttons */}
          <div style={{ display: 'flex', gap: '3px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '9999px' }}>
            {[1, 2, 3, 4, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setAutoScrollSpeed(speed)}
                style={{
                  background: autoScrollSpeed === speed ? '#ffffff' : 'transparent',
                  color: autoScrollSpeed === speed ? '#000000' : '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '2px 6px',
                  fontSize: '10.5px',
                  fontWeight: autoScrollSpeed === speed ? 700 : 400,
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating TTS Speech Controller */}
      {isTTSActive && (
        <TTSBar
          isPlaying={isTTSPlaying}
          onPlay={() => {
            TTSService.resume();
            setIsTTSPlaying(true);
          }}
          onPause={handlePauseTTS}
          onStop={handleStopTTS}
          rate={ttsRate}
          onChangeRate={(rate) => {
            setTtsRate(rate);
            handleStartTTS();
          }}
        />
      )}

      {/* Bottom Floating Hover HUD with Silky Slide Animation */}
      <HUDControls
        isVisible={showHUD}
        onHoverChange={(hovered) => {
          isHudHoveredRef.current = hovered;
          if (hovered) setShowHUD(true);
        }}
        currentChapterIndex={book.currentChapterIndex}
        totalChapters={book.chapters.length}
        progressPercent={book.currentProgressPercent}
        wordCount={wordCount}
        onPrevChapter={onPrevChapter}
        onNextChapter={onNextChapter}
        onJumpChapter={onJumpChapter}
        themeConfig={themeConfig}
        onUpdateTheme={onUpdateTheme}
        isTTSPlaying={isTTSPlaying}
        onToggleTTS={() => {
          if (isTTSPlaying) handleStopTTS();
          else handleStartTTS();
        }}
        isAutoScrolling={isAutoScrolling}
        onToggleAutoScroll={() => setIsAutoScrolling((prev) => !prev)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onAddBookmark={handleQuickAddBookmark}
        onOpenSourceSwitcher={() => setShowSourceSwitcher(true)}
        onBatchCache={() => setShowBatchCacheModal(true)}
      />

      {/* Floating Toast Notification Pill */}
      {toastMessage && (
        <div
          className="frosted-menu-solid animate-ios-spring tauri-no-drag"
          style={{
            position: 'fixed',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 18px',
            borderRadius: '9999px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.45)'
          }}
        >
          <BookmarkIcon size={14} style={{ color: 'var(--accent-color)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Shortcuts Guide Modal */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Seamless Source Switcher Modal */}
      <SourceSwitcherModal
        isOpen={showSourceSwitcher}
        onClose={() => setShowSourceSwitcher(false)}
        currentBook={book}
        sources={sources}
        onSwitchBookSource={(newBook) => {
          onSwitchBookSource?.(newBook);
          setToastMessage(`🎉 已无缝切换至书源【${newBook.sourceName}】！`);
        }}
      />

      {/* Batch Offline Cache Modal */}
      {showBatchCacheModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowBatchCacheModal(false)}
        >
          <div
            className="frosted-panel animate-ios-spring"
            style={{
              width: '420px',
              maxWidth: '92vw',
              borderRadius: '20px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.55)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', background: 'var(--accent-color)', borderRadius: '10px', color: '#fff', display: 'flex' }}>
                <DownloadCloud size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>全书离线一键批量缓存</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>下载正文到本地，无网断网环境下随时畅读</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={async () => {
                  setShowBatchCacheModal(false);
                  if (!book.isOnlineSource) {
                    setToastMessage('本地书籍无需缓存');
                    return;
                  }
                  const startIdx = book.currentChapterIndex;
                  const targets = book.chapters.slice(startIdx, startIdx + 50).filter((c) => !c.content && c.url);
                  if (targets.length === 0) {
                    setToastMessage('后 50 章已全部缓存！');
                    return;
                  }
                  const source = sources.find((s) => s.id === book.sourceId) || { id: book.sourceId, name: book.sourceName, url: book.sourceUrl || '', enabled: true };
                  const engine = new BookSourceEngine(sources);
                  setToastMessage(`正在缓存后 50 章 (${targets.length} 篇待下)...`);
                  let done = 0;
                  for (const ch of targets) {
                    if (ch.url) {
                      try {
                        ch.content = await engine.fetchChapterContent(ch.url, source);
                        done++;
                        setToastMessage(`正在缓存: ${done}/${targets.length} (${Math.round((done / targets.length) * 100)}%)`);
                      } catch {}
                    }
                  }
                  setToastMessage(`🎉 成功缓存 ${done} 个章节！`);
                }}
                className="frosted-btn frosted-btn-primary"
                style={{ padding: '8px 12px', borderRadius: '12px', fontSize: '12.5px', justifyContent: 'flex-start' }}
              >
                <DownloadCloud size={14} />
                <span>缓存后 50 章 (推荐)</span>
              </button>

              <button
                onClick={async () => {
                  setShowBatchCacheModal(false);
                  if (!book.isOnlineSource) {
                    setToastMessage('本地书籍无需缓存');
                    return;
                  }
                  const startIdx = book.currentChapterIndex;
                  const targets = book.chapters.slice(startIdx, startIdx + 200).filter((c) => !c.content && c.url);
                  if (targets.length === 0) {
                    setToastMessage('所选章节已全部缓存！');
                    return;
                  }
                  const source = sources.find((s) => s.id === book.sourceId) || { id: book.sourceId, name: book.sourceName, url: book.sourceUrl || '', enabled: true };
                  const engine = new BookSourceEngine(sources);
                  setToastMessage(`正在缓存后 200 章 (${targets.length} 篇待下)...`);
                  let done = 0;
                  for (const ch of targets) {
                    if (ch.url) {
                      try {
                        ch.content = await engine.fetchChapterContent(ch.url, source);
                        done++;
                        setToastMessage(`正在缓存: ${done}/${targets.length} (${Math.round((done / targets.length) * 100)}%)`);
                      } catch {}
                    }
                  }
                  setToastMessage(`🎉 成功缓存 ${done} 个章节！`);
                }}
                className="frosted-btn"
                style={{ padding: '8px 12px', borderRadius: '12px', fontSize: '12.5px', justifyContent: 'flex-start' }}
              >
                <DownloadCloud size={14} />
                <span>缓存后 200 章</span>
              </button>

              <button
                onClick={async () => {
                  setShowBatchCacheModal(false);
                  if (!book.isOnlineSource) {
                    setToastMessage('本地书籍无需缓存');
                    return;
                  }
                  const targets = book.chapters.filter((c) => !c.content && c.url);
                  if (targets.length === 0) {
                    setToastMessage('全本章节已全部完成离线缓存！');
                    return;
                  }
                  const source = sources.find((s) => s.id === book.sourceId) || { id: book.sourceId, name: book.sourceName, url: book.sourceUrl || '', enabled: true };
                  const engine = new BookSourceEngine(sources);
                  setToastMessage(`开始缓存全本 (${targets.length} 章节)...`);
                  let done = 0;
                  for (const ch of targets) {
                    if (ch.url) {
                      try {
                        ch.content = await engine.fetchChapterContent(ch.url, source);
                        done++;
                        if (done % 5 === 0 || done === targets.length) {
                          setToastMessage(`全本缓存中: ${done}/${targets.length} (${Math.round((done / targets.length) * 100)}%)`);
                        }
                      } catch {}
                    }
                  }
                  setToastMessage(`🎉 全本离线缓存完成！共下载 ${done} 个章节。`);
                }}
                className="frosted-btn"
                style={{ padding: '8px 12px', borderRadius: '12px', fontSize: '12.5px', justifyContent: 'flex-start' }}
              >
                <DownloadCloud size={14} />
                <span>缓存全本全部章节 ({book.chapters.length} 章)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
