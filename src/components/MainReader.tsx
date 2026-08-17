import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, Bookmark, BookSource, ThemeConfig } from '../types/reader';
import { BookSourceEngine } from '../services/bookSourceEngine';
import { HUDControls } from './HUDControls';
import { TTSBar } from './TTSBar';
import { TTSService } from '../services/ttsService';
import { ShortcutsModal } from './ShortcutsModal';
import { Loader2, BookmarkPlus, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

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
  onJumpChapter
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHUD, setShowHUD] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [currentChapterContent, setCurrentChapterContent] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPos, setSelectionPos] = useState<{ x: number; y: number } | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

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

  // Handle Scroll Progress
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const progress = Math.min(100, Math.round((scrollTop / Math.max(1, scrollHeight - clientHeight)) * 100));
      onUpdateBookProgress(book.currentChapterIndex, progress);
    }
  };

  // Auto-scroll loop
  const autoScrollStep = useCallback(() => {
    if (!isAutoScrolling) return;

    if (!isHoveredOrTouching.current && containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        // Reached bottom of chapter, turn next chapter automatically!
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

  // Keyboard Shortcuts (Space for Auto-scroll, ? for help, Arrow keys for chapter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoScrolling((prev) => !prev);
      } else if (e.key === '?') {
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        onNextChapter();
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        onPrevChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextChapter, onPrevChapter]);

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
      alert('已保存至书签与高亮！可在控制中心「书签」中查看');
    }
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

  const paragraphs = currentChapterContent
    ? currentChapterContent
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : [];

  const wordCount = currentChapterContent ? currentChapterContent.replace(/\s+/g, '').length : 0;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 42px)',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setShowHUD(true)}
      onMouseLeave={() => setShowHUD(false)}
    >
      {/* Scrollable Reading Content Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onMouseUp={handleMouseUp}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          padding: '28px 36px 90px 36px',
          boxSizing: 'border-box',
          fontFamily: themeConfig.fontFamily,
          fontSize: `${themeConfig.fontSize}px`,
          lineHeight: themeConfig.lineHeight,
          letterSpacing: `${themeConfig.letterSpacing}px`,
          color: 'var(--text-primary)'
        }}
      >
        {/* Chapter Title */}
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

        {/* Content Body */}
        {loadingContent ? (
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
        ) : (
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            {paragraphs.map((para, idx) => (
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
            ))}

            {/* Bottom Chapter End Navigator & Reading Stats */}
            <div
              style={{
                marginTop: '48px',
                paddingTop: '20px',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}
            >
              <button
                onClick={onPrevChapter}
                disabled={book.currentChapterIndex <= 0}
                className="frosted-btn"
                style={{ padding: '6px 14px', borderRadius: '9999px' }}
              >
                <ChevronLeft size={14} />
                <span>上一章</span>
              </button>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                <span>本章约 {wordCount} 字</span>
                <span>·</span>
                <span>进度 {book.currentProgressPercent}%</span>
              </div>

              <button
                onClick={onNextChapter}
                disabled={book.currentChapterIndex >= book.chapters.length - 1}
                className="frosted-btn frosted-btn-primary"
                style={{ padding: '6px 14px', borderRadius: '9999px' }}
              >
                <span>下一章</span>
                <ChevronRight size={14} />
              </button>
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
            title="暂停滚屏 (空格 Space)"
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

      {/* Bottom Floating Hover HUD */}
      {showHUD && (
        <HUDControls
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
        />
      )}

      {/* Shortcuts Guide Modal */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
};
