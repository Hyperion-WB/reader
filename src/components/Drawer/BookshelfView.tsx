import React from 'react';
import { Book } from '../../types/reader';
import { BookOpen, Trash2, Plus, Upload } from 'lucide-react';

interface BookshelfViewProps {
  books: Book[];
  activeBookId: string | null;
  onSelectBook: (id: string) => void;
  onDeleteBook: (id: string) => void;
  onImportLocal: () => void;
  onOpenSearch: () => void;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  activeBookId,
  onSelectBook,
  onDeleteBook,
  onImportLocal,
  onOpenSearch
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onImportLocal}
          className="liquid-glass-btn liquid-glass-btn-primary"
          style={{ flex: 1, padding: '8px 12px' }}
        >
          <Upload size={14} />
          <span>导入本地 (TXT / EPUB)</span>
        </button>
        <button
          onClick={onOpenSearch}
          className="liquid-glass-btn"
          style={{ flex: 1, padding: '8px 12px' }}
        >
          <Plus size={14} />
          <span>全网搜书 / 导入书源</span>
        </button>
      </div>

      {/* Book Grid / List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '12px',
          paddingRight: '4px'
        }}
      >
        {books.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              gap: '12px'
            }}
          >
            <BookOpen size={40} strokeWidth={1.5} />
            <div>书架还是空的，快导入本地小说或搜索网络书源吧</div>
          </div>
        ) : (
          books.map((book) => {
            const isActive = book.id === activeBookId;
            const progress = Math.round(
              ((book.currentChapterIndex + 1) / Math.max(1, book.chapters.length)) * 100
            );

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book.id)}
                className="liquid-glass-panel"
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--glass-border-color)',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.22s var(--spring-smooth)'
                }}
              >
                {/* Book Cover Placeholder or Image */}
                <div
                  style={{
                    width: '60px',
                    height: '80px',
                    borderRadius: '8px',
                    background: book.cover
                      ? `url(${book.cover}) center/cover`
                      : 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '18px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    flexShrink: 0
                  }}
                >
                  {!book.cover && book.title.slice(0, 1)}
                </div>

                {/* Book Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={book.title}
                    >
                      {book.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {book.author} · {book.sourceName}
                    </div>
                  </div>

                  {/* Progress Bar & Chapter Info */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>
                        第 {book.currentChapterIndex + 1}/{book.chapters.length} 章
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: 'var(--accent-color)',
                          borderRadius: '9999px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`确定从书架移除《${book.title}》吗？`)) {
                      onDeleteBook(book.id);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    alignSelf: 'flex-start'
                  }}
                  title="删除书籍"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
