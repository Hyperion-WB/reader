import React from 'react';
import { Bookmark } from '../../types/reader';
import { Bookmark as BookmarkIcon, Trash2, Clock, ChevronRight } from 'lucide-react';

interface BookmarksViewProps {
  bookmarks: Bookmark[];
  activeBookId: string | null;
  onSelectBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  activeBookId,
  onSelectBookmark,
  onDeleteBookmark
}) => {
  const currentBookBookmarks = bookmarks.filter((b) => !activeBookId || b.bookId === activeBookId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookmarkIcon size={14} style={{ color: 'var(--accent-color)' }} />
          <span>本书书签 ({currentBookBookmarks.length})</span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '2px 2px 8px 2px'
        }}
      >
        {currentBookBookmarks.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '50px 20px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              gap: '10px'
            }}
          >
            <BookmarkIcon size={36} strokeWidth={1.5} />
            <div style={{ fontSize: '13px' }}>暂无书签</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              在阅读界面中选中任意文字，即可快速添加精选书签
            </div>
          </div>
        ) : (
          currentBookBookmarks.map((bm) => (
            <div
              key={bm.id}
              onClick={() => onSelectBookmark(bm)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '12px 14px',
                borderRadius: '16px',
                background: 'var(--glass-surface)',
                border: '1px solid var(--glass-border)',
                cursor: 'pointer',
                transition: 'background 0.2s var(--ios-spring), border-color 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--glass-surface-hover)';
                e.currentTarget.style.borderColor = 'var(--glass-border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--glass-surface)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--accent-color)' }}>
                  {bm.chapterTitle}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBookmark(bm.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="删除书签"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5',
                  borderLeft: '2px solid var(--accent-color)',
                  paddingLeft: '8px',
                  fontStyle: 'italic',
                  opacity: 0.9
                }}
              >
                "{bm.selectedText}"
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} />
                  {new Date(bm.timestamp).toLocaleDateString()} {new Date(bm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  跳转 <ChevronRight size={11} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
