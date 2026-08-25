import React, { useState } from 'react';
import { Book } from '../../types/reader';
import {
  BookOpen,
  Trash2,
  Plus,
  Upload,
  LayoutGrid,
  List,
  AlignLeft,
  Palette,
  Search
} from 'lucide-react';
import { CoverCustomizerModal } from '../CoverCustomizerModal';

interface BookshelfViewProps {
  books: Book[];
  activeBookId: string | null;
  onSelectBook: (id: string) => void;
  onDeleteBook: (id: string) => void;
  onImportLocal: () => void;
  onOpenSearch: () => void;
  onUpdateBookCover?: (bookId: string, cover: string) => void;
}

export type BookshelfViewMode = 'grid' | 'list' | 'minimal';

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  activeBookId,
  onSelectBook,
  onDeleteBook,
  onImportLocal,
  onOpenSearch,
  onUpdateBookCover
}) => {
  const [viewMode, setViewMode] = useState<BookshelfViewMode>('list');
  const [searchFilter, setSearchFilter] = useState('');
  const [editingCoverBook, setEditingCoverBook] = useState<Book | null>(null);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.author.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', gap: '10px', padding: '2px 0' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', gap: '8px', padding: '2px 0' }}>
        <button
          onClick={onImportLocal}
          className="frosted-btn frosted-btn-primary"
          style={{ flex: 1, padding: '8px 12px', borderRadius: '9999px', fontSize: '12.5px' }}
        >
          <Upload size={13} />
          <span>导入本地 (TXT/EPUB/漫画/MD)</span>
        </button>
        <button
          onClick={onOpenSearch}
          className="frosted-btn"
          style={{ flex: 1, padding: '8px 12px', borderRadius: '9999px', fontSize: '12.5px' }}
        >
          <Plus size={13} />
          <span>全网搜书 / 书源</span>
        </button>
      </div>

      {/* Search & Layout View Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="在书架中搜索..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="frosted-input"
            style={{ paddingLeft: '30px', padding: '6px 10px 6px 30px', fontSize: '11.5px', borderRadius: '9999px' }}
          />
        </div>

        {/* View Mode Pills */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.16)',
            padding: '2px',
            borderRadius: '9999px',
            border: '1px solid var(--glass-border)',
            gap: '2px'
          }}
        >
          <button
            onClick={() => setViewMode('list')}
            className="frosted-btn"
            title="紧凑单行列表模式 (适合多书/高隐蔽)"
            style={{
              padding: '4px 7px',
              borderRadius: '9999px',
              background: viewMode === 'list' ? 'var(--accent-color)' : 'transparent',
              color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            <List size={13} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className="frosted-btn"
            title="精美网格卡片模式"
            style={{
              padding: '4px 7px',
              borderRadius: '9999px',
              background: viewMode === 'grid' ? 'var(--accent-color)' : 'transparent',
              color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            <LayoutGrid size={13} />
          </button>
          <button
            onClick={() => setViewMode('minimal')}
            className="frosted-btn"
            title="极简无图模式 (极致摸鱼)"
            style={{
              padding: '4px 7px',
              borderRadius: '9999px',
              background: viewMode === 'minimal' ? 'var(--accent-color)' : 'transparent',
              color: viewMode === 'minimal' ? '#fff' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            <AlignLeft size={13} />
          </button>
        </div>
      </div>

      {/* Book List / Grid / Minimal */}
      <div
        className="smooth-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: viewMode === 'minimal' ? '4px' : '8px',
          padding: '4px 2px 48px 2px',
          boxSizing: 'border-box'
        }}
      >
        {filteredBooks.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              gap: '10px'
            }}
          >
            <BookOpen size={36} strokeWidth={1.5} />
            <div style={{ fontSize: '13px' }}>书架无匹配小说</div>
          </div>
        ) : (
          filteredBooks.map((book) => {
            const isActive = book.id === activeBookId;
            const progress = Math.round(
              ((book.currentChapterIndex + 1) / Math.max(1, book.chapters.length)) * 100
            );

            // 1. Compact List View Mode
            if (viewMode === 'list') {
              return (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
                    background: isActive ? 'var(--glass-surface-active)' : 'var(--glass-surface)',
                    transition: 'background 0.2s var(--ios-spring), border-color 0.2s ease',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--glass-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--glass-surface)';
                  }}
                >
                  {/* Mini Cover Badge with referrerPolicy and gradient fallback */}
                  <div
                    style={{
                      width: '28px',
                      height: '36px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(139, 92, 246, 0.7) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '11px',
                      flexShrink: 0,
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    {book.cover && (
                      <img
                        src={book.cover}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                      />
                    )}
                    <span style={{ zIndex: 0 }}>{book.title.slice(0, 1)}</span>
                  </div>

                  {/* Title & Author */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {book.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                      <span>{book.author}</span>
                      <span>·</span>
                      <span>第 {book.currentChapterIndex + 1}/{book.chapters.length} 章 ({progress}%)</span>
                    </div>
                  </div>

                  {/* Quick Actions - Pixel-Perfect Axis Alignment */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCoverBook(book);
                      }}
                      className="frosted-btn"
                      style={{
                        width: '28px',
                        height: '28px',
                        padding: 0,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      data-tooltip="更换封面 / 隐蔽书皮"
                      data-tooltip-pos="left"
                    >
                      <Palette size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定从书架移除《${book.title}》吗？`)) {
                          onDeleteBook(book.id);
                        }
                      }}
                      className="frosted-btn"
                      style={{
                        width: '28px',
                        height: '28px',
                        padding: 0,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        flexShrink: 0
                      }}
                      data-tooltip="从书架移除"
                      data-tooltip-pos="left"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'var(--glass-surface)';
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            }

            // 2. Minimalist Text-Only Mode (Zero distraction)
            if (viewMode === 'minimal') {
              return (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: isActive ? '1px solid var(--accent-color)' : '1px solid transparent',
                    background: isActive ? 'var(--glass-surface-active)' : 'transparent',
                    fontSize: '12.5px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--glass-surface)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontWeight: isActive ? 600 : 400, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    《{book.title}》
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {progress}%
                  </span>
                </div>
              );
            }

            // 3. Grid Card Mode
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book.id)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
                  background: isActive ? 'var(--glass-surface-active)' : 'var(--glass-surface)',
                  transition: 'background 0.2s var(--ios-spring), border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--glass-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--glass-surface)';
                }}
              >
                {/* Book Cover with no-referrer bypass and gradient fallback */}
                <div
                  style={{
                    width: '56px',
                    height: '76px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    flexShrink: 0,
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  {book.cover && (
                    <img
                      src={book.cover}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                    />
                  )}
                  <span style={{ zIndex: 0, textAlign: 'center', padding: '4px', lineHeight: 1.2, wordBreak: 'break-all' }}>
                    {book.title.slice(0, 4)}
                  </span>
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {book.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {book.author} · {book.sourceName}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      <span>第 {book.currentChapterIndex + 1}/{book.chapters.length} 章</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '3px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.15)', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>

                {/* Actions - Matching Circular Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定从书架移除《${book.title}》吗？`)) {
                        onDeleteBook(book.id);
                      }
                    }}
                    className="frosted-btn"
                    style={{
                      width: '26px',
                      height: '26px',
                      padding: 0,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)'
                    }}
                    data-tooltip="从书架移除"
                    data-tooltip-pos="left"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'var(--glass-surface)';
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                    }}
                  >
                    <Trash2 size={12} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCoverBook(book);
                    }}
                    className="frosted-btn"
                    style={{
                      width: '26px',
                      height: '26px',
                      padding: 0,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    data-tooltip="更换封面 / 隐蔽书皮"
                    data-tooltip-pos="left"
                  >
                    <Palette size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cover Customizer Modal */}
      <CoverCustomizerModal
        book={editingCoverBook}
        isOpen={Boolean(editingCoverBook)}
        onClose={() => setEditingCoverBook(null)}
        onUpdateCover={(bookId, newCover) => {
          if (onUpdateBookCover) {
            onUpdateBookCover(bookId, newCover);
          }
        }}
      />
    </div>
  );
};
