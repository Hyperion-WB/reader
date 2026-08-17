import React, { useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface ChapterSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onChangeQuery: (query: string) => void;
  currentIndex: number;
  totalMatches: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
}

export const ChapterSearchBar: React.FC<ChapterSearchBarProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onChangeQuery,
  currentIndex,
  totalMatches,
  onNextMatch,
  onPrevMatch
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) onPrevMatch();
      else onNextMatch();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="ios-floating-bar animate-ios-spring tauri-no-drag"
      style={{
        position: 'absolute',
        top: '60px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        zIndex: 1200,
        background: 'var(--bg-app)',
        backdropFilter: 'blur(32px) saturate(190%)',
        WebkitBackdropFilter: 'blur(32px) saturate(190%)',
        border: '1px solid var(--glass-border-hover)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}
    >
      <Search size={14} style={{ color: 'var(--accent-color)' }} />
      <input
        ref={inputRef}
        type="text"
        placeholder="在当前章节内搜索 (Enter 下一个)..."
        value={searchQuery}
        onChange={(e) => onChangeQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="frosted-input"
        style={{
          width: '180px',
          padding: '4px 8px',
          fontSize: '12px',
          borderRadius: '8px',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none'
        }}
      />

      {/* Match Counter */}
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '38px', textAlign: 'center' }}>
        {totalMatches > 0 ? `${currentIndex + 1}/${totalMatches}` : searchQuery ? '无匹配' : ''}
      </span>

      {/* Navigation Arrows */}
      <button
        onClick={onPrevMatch}
        disabled={totalMatches === 0}
        className="frosted-btn"
        style={{ padding: '3px 6px', borderRadius: '6px' }}
        title="上一个 (Shift+Enter)"
      >
        <ChevronUp size={13} />
      </button>

      <button
        onClick={onNextMatch}
        disabled={totalMatches === 0}
        className="frosted-btn"
        style={{ padding: '3px 6px', borderRadius: '6px' }}
        title="下一个 (Enter)"
      >
        <ChevronDown size={13} />
      </button>

      <button
        onClick={onClose}
        className="frosted-btn"
        style={{ padding: '3px 6px', borderRadius: '6px' }}
        title="关闭搜索 (Esc)"
      >
        <X size={13} />
      </button>
    </div>
  );
};
