import React, { useState, useEffect, useRef } from 'react';
import { Book, Bookmark, BookSource, ThemeConfig } from '../types/reader';
import { BookSourceEngine } from '../services/bookSourceEngine';
import { HUDControls } from './HUDControls';
import { TTSBar } from './TTSBar';
import { TTSService } from '../services/ttsService';
import { Loader2, BookmarkPlus } from 'lucide-react';

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

    // Scroll to top when changing chapter
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
      alert('已保存至书签与高亮！');
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
          padding: '24px 32px 80px 32px',
          boxSizing: 'border-box',
          fontFamily: themeConfig.fontFamily,
          fontSize: `${themeConfig.fontSize}px`,
          lineHeight: themeConfig.lineHeight,
          letterSpacing: `${themeConfig.letterSpacing}px`,
          color: themeConfig.textColor
        }}
      >
        {/* Chapter Title */}
        <div
          style={{
            fontWeight: 700,
            fontSize: `${themeConfig.fontSize + 6}px`,
            marginBottom: '20px',
            color: 'var(--text-primary)',
            textAlign: 'center',
            borderBottom: '1px solid var(--glass-border-color)',
            paddingBottom: '12px'
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
          <div style={{ maxWidth: '840px', margin: '0 auto' }}>
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
            borderRadius: '10px',
            zIndex: 1000
          }}
        >
          <button
            onClick={handleSaveSelectionAsBookmark}
            className="frosted-btn"
            style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '8px' }}
          >
            <BookmarkPlus size={12} />
            <span>添加书签</span>
          </button>
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
        />
      )}
    </div>
  );
};
