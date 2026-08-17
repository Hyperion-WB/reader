import React, { useState, useEffect } from 'react';
import { Chapter } from '../../types/reader';
import { Maximize2, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface TickerBarModeProps {
  currentChapter?: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const TickerBarMode: React.FC<TickerBarModeProps> = ({
  currentChapter,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Split chapter into sentences or short phrases
  const sentences = currentChapter?.content
    ? currentChapter.content
        .split(/(?<=[。！？；!?;\n])/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : ['(暂无单行内容)'];

  const currentText = sentences[sentenceIndex] || '(本章结束)';

  // Auto-play interval
  useEffect(() => {
    let timer: any = null;
    if (isAutoPlay) {
      timer = setInterval(() => {
        setSentenceIndex((prev) => {
          if (prev + 1 < sentences.length) {
            return prev + 1;
          } else {
            onNextChapter();
            return 0;
          }
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlay, sentences.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'j') {
        e.preventDefault();
        if (sentenceIndex + 1 < sentences.length) {
          setSentenceIndex((prev) => prev + 1);
        } else {
          onNextChapter();
          setSentenceIndex(0);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'k') {
        e.preventDefault();
        if (sentenceIndex > 0) {
          setSentenceIndex((prev) => prev - 1);
        } else {
          onPrevChapter();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sentenceIndex, sentences.length]);

  return (
    <div
      className="tauri-drag-handle"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100vw',
        height: '100vh',
        background: 'rgba(20, 20, 24, 0.92)',
        color: '#e0e0e6',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '0 8px',
        fontSize: '12px',
        fontFamily: '"Segoe UI", sans-serif',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* Fake System Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#68d391', fontSize: '11px', flexShrink: 0 }}>
        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#48bb78' }} />
        <span style={{ color: '#a0aec0' }}>SYS: {sentenceIndex + 1}/{sentences.length}</span>
      </div>

      {/* Main Single-line Text Display */}
      <div
        style={{
          flex: 1,
          padding: '0 12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: '#edf2f7',
          fontWeight: 400
        }}
        title={currentText}
      >
        {currentText}
      </div>

      {/* Micro Control Bar */}
      <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={() => sentenceIndex > 0 && setSentenceIndex((i) => i - 1)}
          style={{ background: 'transparent', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '2px' }}
          title="上一句 (Left)"
        >
          <ChevronLeft size={14} />
        </button>

        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          style={{ background: 'transparent', border: 'none', color: isAutoPlay ? '#48bb78' : '#a0aec0', cursor: 'pointer', padding: '2px' }}
          title={isAutoPlay ? '暂停自动滚动' : '开启自动滚动'}
        >
          {isAutoPlay ? <Pause size={13} /> : <Play size={13} />}
        </button>

        <button
          onClick={() => (sentenceIndex + 1 < sentences.length ? setSentenceIndex((i) => i + 1) : onNextChapter())}
          style={{ background: 'transparent', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '2px' }}
          title="下一句 (Space/Right)"
        >
          <ChevronRight size={14} />
        </button>

        <button
          onClick={onExit}
          style={{ background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '2px', marginLeft: '4px' }}
          title="还原主窗口 (Esc)"
        >
          <Maximize2 size={13} />
        </button>
      </div>
    </div>
  );
};
