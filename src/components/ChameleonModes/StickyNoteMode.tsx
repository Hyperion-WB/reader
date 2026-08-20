import React, { useState, useEffect } from 'react';
import { Chapter } from '../../types/reader';
import { Plus, X } from 'lucide-react';

interface StickyNoteModeProps {
  currentChapter?: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const StickyNoteMode: React.FC<StickyNoteModeProps> = ({
  currentChapter,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [page, setPage] = useState(0);

  const paragraphs = currentChapter?.content
    ? currentChapter.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : ['(暂无备忘记录)'];

  const perPage = 3;
  const totalPages = Math.ceil(paragraphs.length / perPage);
  const currentParas = paragraphs.slice(page * perPage, (page + 1) * perPage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (page + 1 < totalPages) {
          setPage((p) => p + 1);
        } else {
          onNextChapter();
          setPage(0);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (page > 0) {
          setPage((p) => p - 1);
        } else {
          onPrevChapter();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, totalPages]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        background: '#fff9c4', // Post-it Yellow
        color: '#333333',
        fontFamily: '"Segoe UI", "Segoe UI Emoji", sans-serif',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Sticky Top Header */}
      <div
        className="tauri-drag-handle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '36px',
          padding: '0 12px',
          background: '#fff59d'
        }}
      >
        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} style={{ cursor: 'pointer', color: '#555' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>便签备忘录</span>
        </div>

        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>
            {page + 1}/{totalPages || 1}
          </span>
          <button
            onClick={onExit}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#555',
              padding: '2px'
            }}
            title="退出伪装 (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Note Body */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          fontSize: '14px',
          lineHeight: '1.7',
          color: '#2c3e50'
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '12px', color: '#b78103' }}>
          待办备忘 / {currentChapter?.title || '今日计划'}
        </div>
        {currentParas.map((para, idx) => (
          <p key={idx} style={{ marginBottom: '10px', textIndent: '1.5em' }}>
            {para}
          </p>
        ))}
      </div>

      {/* Note Bottom Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '32px',
          padding: '0 12px',
          background: '#fff59d',
          fontSize: '11px',
          color: '#777'
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => page > 0 && setPage((p) => p - 1)}>
            ◀ 上一段
          </span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => (page + 1 < totalPages ? setPage((p) => p + 1) : onNextChapter())}
          >
            下一段 ▶
          </span>
        </div>
        <span>按空格 / 方向键翻段</span>
      </div>
    </div>
  );
};
