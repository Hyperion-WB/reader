import React, { useState, useEffect } from 'react';
import { Book, BookSource, SearchResultItem } from '../types/reader';
import { BookSourceEngine } from '../services/bookSourceEngine';
import { Shuffle, Loader2, X, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

interface SourceSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBook: Book | null;
  sources: BookSource[];
  onSwitchBookSource: (updatedBook: Book) => void;
}

export const SourceSwitcherModal: React.FC<SourceSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentBook,
  sources,
  onSwitchBookSource
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<SearchResultItem[]>([]);
  const [switchingDetailUrl, setSwitchingDetailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentBook) {
      handleSearchAcrossSources();
    } else {
      setCandidates([]);
      setSwitchingDetailUrl(null);
    }
  }, [isOpen, currentBook?.id]);

  const handleSearchAcrossSources = async () => {
    if (!currentBook) return;
    setIsSearching(true);
    setCandidates([]);

    const engine = new BookSourceEngine(sources.filter((s) => s.enabled));
    try {
      const results = await engine.searchAcrossSources(currentBook.title, (streaming) => {
        setCandidates([...streaming]);
      });
      // Sort to prioritize exact title matches
      const sorted = [...results].sort((a, b) => {
        const aExact = a.title.trim() === currentBook.title.trim() ? 1 : 0;
        const bExact = b.title.trim() === currentBook.title.trim() ? 1 : 0;
        return bExact - aExact;
      });
      setCandidates(sorted);
    } catch (err) {
      console.warn('Source switch search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectNewSource = async (item: SearchResultItem) => {
    if (!currentBook) return;
    setSwitchingDetailUrl(item.detailUrl);

    try {
      const source = sources.find((s) => s.id === item.sourceId) || {
        id: item.sourceId,
        name: item.sourceName,
        url: item.sourceUrl,
        enabled: true
      };

      const engine = new BookSourceEngine(sources);
      const newChapters = await engine.fetchToc(item.detailUrl, source);

      if (newChapters.length === 0) {
        alert('该书源目录解析为空，请选择其他书源');
        return;
      }

      // Smart Chapter Alignment: Try to find matching chapter by current title or index
      let targetChapterIndex = currentBook.currentChapterIndex;
      const currentChapterTitle = currentBook.chapters[currentBook.currentChapterIndex]?.title || '';

      if (currentChapterTitle) {
        const cleanTitle = currentChapterTitle.replace(/^(第[0-9一二三四五六七八九十百千]+[章回节卷])\s*/, '').trim();
        const foundIdx = newChapters.findIndex(
          (c) => c.title.includes(cleanTitle) || cleanTitle.includes(c.title.replace(/^(第[0-9一二三四五六七八九十百千]+[章回节卷])\s*/, '').trim())
        );
        if (foundIdx !== -1) {
          targetChapterIndex = foundIdx;
        } else if (targetChapterIndex >= newChapters.length) {
          targetChapterIndex = Math.max(0, newChapters.length - 1);
        }
      }

      // Fetch first chapter content immediately
      const targetChapter = newChapters[targetChapterIndex];
      if (targetChapter && targetChapter.url) {
        try {
          const content = await engine.fetchChapterContent(targetChapter.url, source);
          targetChapter.content = content;
        } catch {}
      }

      const updatedBook: Book = {
        ...currentBook,
        sourceId: item.sourceId,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        detailUrl: item.detailUrl,
        chapters: newChapters,
        currentChapterIndex: targetChapterIndex,
        isOnlineSource: true,
        lastReadTime: Date.now()
      };

      onSwitchBookSource(updatedBook);
      onClose();
    } catch (err: any) {
      alert(`切换书源失败: ${err.message || err}`);
    } finally {
      setSwitchingDetailUrl(null);
    }
  };

  if (!isOpen || !currentBook) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="frosted-panel animate-ios-spring"
        style={{
          width: '560px',
          maxWidth: '92vw',
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          padding: '18px 20px',
          boxSizing: 'border-box',
          gap: '12px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.55)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', background: 'var(--accent-color)', borderRadius: '10px', color: '#fff', display: 'flex' }}>
              <Shuffle size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                一键无缝换源
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                当前书籍: <strong>{currentBook.title}</strong> (已对齐当前第 {currentBook.currentChapterIndex + 1} 章进度)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleSearchAcrossSources}
              disabled={isSearching}
              className="frosted-btn"
              style={{ padding: '5px 10px', borderRadius: '9999px', fontSize: '11px' }}
              title="重新检索所有可用书源"
            >
              {isSearching ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              <span>{isSearching ? '检索中...' : '重新扫描'}</span>
            </button>
            <button
              onClick={onClose}
              className="frosted-btn"
              style={{ padding: '5px', borderRadius: '9999px' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Current Source Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 12px',
            background: 'var(--glass-surface-hover)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            fontSize: '11.5px',
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={13} color="var(--accent-color)" />
            <span>
              当前使用源: <strong style={{ color: 'var(--text-primary)' }}>{currentBook.sourceName}</strong>
            </span>
          </div>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
            共包含 {currentBook.chapters.length} 章节
          </span>
        </div>

        {/* Candidate Sources List */}
        <div
          className="smooth-scroll"
          style={{
            flex: 1,
            minHeight: '220px',
            maxHeight: '380px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '2px'
          }}
        >
          {isSearching && candidates.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', gap: '10px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-color)' }} />
              <span>正在全网书源库中快速匹配《{currentBook.title}》...</span>
            </div>
          ) : candidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>
              暂未在其他启用书源中检索到同名书籍，可前往“控制中心-书源管理”启用或导入更多书源。
            </div>
          ) : (
            candidates.map((item, idx) => {
              const isCurrent = currentBook.sourceId === item.sourceId;
              const isSwitching = switchingDetailUrl === item.detailUrl;

              return (
                <div
                  key={`${item.sourceId}-${item.detailUrl}-${idx}`}
                  className="frosted-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    border: isCurrent ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
                    background: isCurrent ? 'var(--glass-surface-active)' : 'var(--glass-surface)',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '3px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '9999px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: 'var(--accent-color)',
                          fontWeight: 500,
                          flexShrink: 0
                        }}
                      >
                        {item.sourceName}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>作者: {item.author || '未知'}</span>
                      {item.latestChapter && (
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          最新: {item.latestChapter}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {isCurrent ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-color)', fontWeight: 600, padding: '4px 8px' }}>
                        <CheckCircle2 size={13} />
                        <span>使用中</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectNewSource(item)}
                        disabled={isSwitching}
                        className="frosted-btn frosted-btn-primary"
                        style={{ padding: '5px 12px', borderRadius: '9999px', fontSize: '11.5px' }}
                      >
                        {isSwitching ? <Loader2 size={12} className="animate-spin" /> : <Shuffle size={12} />}
                        <span>{isSwitching ? '切源中' : '无缝换源'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
