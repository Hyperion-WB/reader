import React, { useState } from 'react';
import { Chapter } from '../../types/reader';
import { Search, Hash, ArrowUpDown } from 'lucide-react';

interface TocViewProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onSelectChapter: (index: number) => void;
}

export const TocView: React.FC<TocViewProps> = ({
  chapters,
  currentChapterIndex,
  onSelectChapter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isReversed, setIsReversed] = useState(false);

  const filteredChapters = chapters.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayList = isReversed ? [...filteredChapters].reverse() : filteredChapters;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      {/* Search & Sort Header */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={14}
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
            placeholder="搜索章节名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="frosted-input"
            style={{ paddingLeft: '32px' }}
          />
        </div>

        <button
          onClick={() => setIsReversed(!isReversed)}
          className="frosted-btn"
          style={{ padding: '8px 12px', borderRadius: '12px' }}
          title={isReversed ? '当前：倒序' : '当前：正序'}
        >
          <ArrowUpDown size={14} />
          <span>{isReversed ? '倒序' : '正序'}</span>
        </button>
      </div>

      {/* Chapters Scroll List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
        {displayList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            未找到匹配章节
          </div>
        ) : (
          displayList.map((chapter) => {
            const isCurrent = chapter.index === currentChapterIndex;
            return (
              <div
                key={chapter.id || chapter.index}
                onClick={() => onSelectChapter(chapter.index)}
                className="frosted-btn"
                style={{
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: '12px',
                  background: isCurrent ? 'var(--accent-color)' : 'var(--glass-surface)',
                  color: isCurrent ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: isCurrent ? 600 : 400,
                  fontSize: '13px',
                  border: isCurrent ? '1px solid rgba(255,255,255,0.35)' : '1px solid var(--glass-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <Hash size={13} style={{ opacity: isCurrent ? 0.9 : 0.4, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chapter.title}
                  </span>
                </div>
                {isCurrent && (
                  <span style={{ fontSize: '11px', opacity: 0.9, flexShrink: 0 }}>当前阅读</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
