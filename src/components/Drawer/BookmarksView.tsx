import React from 'react';
import { Bookmark } from '../../types/reader';
import { Bookmark as BookmarkIcon, Trash2, Clock, ChevronRight, Download } from 'lucide-react';

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

  const handleExportMarkdown = () => {
    if (currentBookBookmarks.length === 0) {
      alert('当前没有可导出的书签');
      return;
    }

    let md = `# 摸鱼阅读 读书笔记与摘录\n\n`;
    md += `> 导出时间: ${new Date().toLocaleString()}\n`;
    md += `> 摘录条数: ${currentBookBookmarks.length} 条\n\n---\n\n`;

    currentBookBookmarks.forEach((bm, i) => {
      md += `### ${i + 1}. ${bm.chapterTitle}\n\n`;
      md += `> ${bm.selectedText}\n\n`;
      md += `*记录于: ${new Date(bm.timestamp).toLocaleString()}*\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reading_Notes_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookmarkIcon size={14} style={{ color: 'var(--accent-color)' }} />
          <span>本书书签 ({currentBookBookmarks.length})</span>
        </div>

        {currentBookBookmarks.length > 0 && (
          <button
            onClick={handleExportMarkdown}
            className="frosted-btn"
            style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '9999px' }}
            title="导出为 Markdown 读书笔记"
          >
            <Download size={12} />
            <span>导出笔记 (.md)</span>
          </button>
        )}
      </div>

      <div
        className="smooth-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '2px 2px 48px 2px',
          boxSizing: 'border-box'
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
                  data-tooltip="删除书签"
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
