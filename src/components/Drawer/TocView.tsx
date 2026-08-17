import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Chapter } from '../../types/reader';
import { Search, Hash, ArrowUpDown, LocateFixed, FastForward, Check } from 'lucide-react';

interface TocViewProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onSelectChapter: (index: number) => void;
}

const ITEM_HEIGHT = 40; // Fixed row height in px for instant virtual rendering
const OVERSCAN = 12; // Extra buffer items above and below

export const TocView: React.FC<TocViewProps> = ({
  chapters,
  currentChapterIndex,
  onSelectChapter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isReversed, setIsReversed] = useState(false);
  const [showChunkJump, setShowChunkJump] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  // Filter and sort chapters with useMemo for zero lag
  const displayList = useMemo(() => {
    let list = chapters;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = chapters.filter((c) => c.title.toLowerCase().includes(q) || String(c.index + 1).includes(q));
    }
    return isReversed ? [...list].reverse() : list;
  }, [chapters, searchQuery, isReversed]);

  // Update container height
  useEffect(() => {
    if (scrollContainerRef.current) {
      setContainerHeight(scrollContainerRef.current.clientHeight || 400);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollTop(scrollContainerRef.current.scrollTop);
    }
  }, []);

  // Jump smoothly to current chapter
  const scrollToCurrentChapter = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const targetIdx = isReversed
      ? displayList.length - 1 - currentChapterIndex
      : currentChapterIndex;
    if (targetIdx >= 0 && targetIdx < displayList.length) {
      const targetScroll = Math.max(0, targetIdx * ITEM_HEIGHT - containerHeight / 2 + ITEM_HEIGHT / 2);
      scrollContainerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, [currentChapterIndex, displayList.length, isReversed, containerHeight]);

  // Auto scroll to current chapter on mount
  useEffect(() => {
    const timer = setTimeout(scrollToCurrentChapter, 100);
    return () => clearTimeout(timer);
  }, []);

  // Virtual Window Calculation
  const totalCount = displayList.length;
  const totalHeight = totalCount * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(totalCount, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN);

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      if (displayList[i]) {
        items.push({
          index: i,
          chapter: displayList[i],
          offsetTop: i * ITEM_HEIGHT
        });
      }
    }
    return items;
  }, [startIndex, endIndex, displayList]);

  // Chapter Segments for Fast 100-chapter jumping (for 1000+ chapter novels)
  const segments = useMemo(() => {
    const segs: { label: string; index: number }[] = [];
    const step = 100;
    for (let i = 0; i < chapters.length; i += step) {
      const end = Math.min(i + step, chapters.length);
      segs.push({
        label: `${i + 1}~${end}章`,
        index: i
      });
    }
    return segs;
  }, [chapters.length]);

  const handleJumpToSegment = (targetIndex: number) => {
    if (!scrollContainerRef.current) return;
    const targetScroll = isReversed
      ? (displayList.length - 1 - targetIndex) * ITEM_HEIGHT
      : targetIndex * ITEM_HEIGHT;
    scrollContainerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
    setShowChunkJump(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      {/* Search & Actions Header */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
            placeholder={`在 ${chapters.length} 章节中快速搜索...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="frosted-input"
            style={{ paddingLeft: '30px', padding: '6px 10px 6px 30px', fontSize: '12px', borderRadius: '9999px' }}
          />
        </div>

        {/* Locate Current Chapter Button */}
        <button
          onClick={scrollToCurrentChapter}
          className="frosted-btn"
          style={{ padding: '6px 9px', borderRadius: '9999px' }}
          title="定位到正在阅读的章节"
        >
          <LocateFixed size={13} />
        </button>

        {/* Fast Segment Jump Menu Toggle */}
        {chapters.length > 100 && (
          <button
            onClick={() => setShowChunkJump(!showChunkJump)}
            className="frosted-btn"
            style={{
              padding: '6px 9px',
              borderRadius: '9999px',
              background: showChunkJump ? 'var(--accent-color)' : 'var(--glass-surface)',
              color: showChunkJump ? '#fff' : 'var(--text-primary)'
            }}
            title="按百章分卷快速直达"
          >
            <FastForward size={13} />
          </button>
        )}

        {/* Reverse Order Toggle */}
        <button
          onClick={() => setIsReversed(!isReversed)}
          className="frosted-btn"
          style={{ padding: '6px 9px', borderRadius: '9999px' }}
          title={isReversed ? '切换为正序' : '切换为倒序'}
        >
          <ArrowUpDown size={13} />
        </button>
      </div>

      {/* Segment Fast Jump Drawer / Popover (For 1000+ chapter novels) */}
      {showChunkJump && (
        <div
          className="frosted-panel animate-ios-spring"
          style={{
            maxHeight: '140px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
            gap: '4px',
            padding: '8px',
            borderRadius: '14px',
            background: 'var(--glass-surface-active)'
          }}
        >
          {segments.map((seg, sIdx) => (
            <button
              key={sIdx}
              onClick={() => handleJumpToSegment(seg.index)}
              className="frosted-btn"
              style={{
                padding: '4px 6px',
                fontSize: '11px',
                borderRadius: '8px',
                justifyContent: 'center'
              }}
            >
              {seg.label}
            </button>
          ))}
        </div>
      )}

      {/* Chapter Stats Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', padding: '0 4px' }}>
        <span>共 {chapters.length} 章节 {searchQuery && `(匹配 ${displayList.length} 条)`}</span>
        <span>当前阅读: 第 {currentChapterIndex + 1} 章</span>
      </div>

      {/* High-Performance Virtualized Chapter Scroll Container (Supports 10,000+ Chapters with zero lag) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          borderRadius: '14px'
        }}
      >
        {totalCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
            未找到匹配的章节
          </div>
        ) : (
          <div style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}>
            {visibleItems.map(({ chapter, offsetTop }) => {
              const isCurrent = chapter.index === currentChapterIndex;
              return (
                <div
                  key={chapter.id || chapter.index}
                  onClick={() => onSelectChapter(chapter.index)}
                  style={{
                    position: 'absolute',
                    top: `${offsetTop}px`,
                    left: 0,
                    right: 0,
                    height: `${ITEM_HEIGHT - 4}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isCurrent ? 'var(--accent-color)' : 'var(--glass-surface)',
                    color: isCurrent ? '#ffffff' : 'var(--text-primary)',
                    border: isCurrent ? '1px solid rgba(255,255,255,0.4)' : '1px solid var(--glass-border)',
                    fontSize: '12.5px',
                    fontWeight: isCurrent ? 600 : 400,
                    boxShadow: isCurrent ? 'var(--accent-glow)' : 'none',
                    transition: 'background 0.15s ease, border-color 0.15s ease',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.background = 'var(--glass-surface-hover)';
                      e.currentTarget.style.borderColor = 'var(--glass-border-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.background = 'var(--glass-surface)';
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <Hash size={12} style={{ opacity: isCurrent ? 0.9 : 0.4, flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chapter.title}
                    </span>
                  </div>

                  {isCurrent && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', opacity: 0.95, flexShrink: 0 }}>
                      <Check size={12} strokeWidth={2.5} />
                      <span>正在阅读</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
