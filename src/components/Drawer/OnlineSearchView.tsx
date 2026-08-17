import React, { useState } from 'react';
import { Book, BookSource, SearchResultItem } from '../../types/reader';
import { BookSourceEngine } from '../../services/bookSourceEngine';
import { Search, Loader2, BookPlus } from 'lucide-react';

interface OnlineSearchViewProps {
  sources: BookSource[];
  onAddBookToShelf: (book: Book) => void;
}

export const OnlineSearchView: React.FC<OnlineSearchViewProps> = ({
  sources,
  onAddBookToShelf
}) => {
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loadingBookUrl, setLoadingBookUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const engine = new BookSourceEngine(sources);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;

    setIsSearching(true);
    setResults([]);
    setStatusMessage(`正在并发检索 ${sources.filter((s) => s.enabled).length} 个书源...`);

    try {
      const searchResults = await engine.searchAcrossSources(keyword, (streamingResults) => {
        setResults([...streamingResults]);
      });
      setResults(searchResults);
      setStatusMessage(
        searchResults.length > 0
          ? `共找到 ${searchResults.length} 条相关结果`
          : '未找到相关小说，可尝试在书源管理中导入更多 Legado 书源'
      );
    } catch (err) {
      console.warn('Search failed:', err);
      setStatusMessage('搜索出现异常，请检查网络连接或书源配置');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = async (item: SearchResultItem) => {
    setLoadingBookUrl(item.detailUrl);
    try {
      const source = sources.find((s) => s.id === item.sourceId) || {
        id: item.sourceId,
        name: item.sourceName,
        url: item.sourceUrl,
        enabled: true
      };

      const chapters = await engine.fetchToc(item.detailUrl, source);

      if (chapters.length === 0) {
        alert('解析目录失败，该书源可能已失效或需要验证，请尝试其他书源结果');
        return;
      }

      const newBook: Book = {
        id: `online-book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: item.title,
        author: item.author,
        cover: item.cover,
        intro: item.intro,
        sourceId: item.sourceId,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        detailUrl: item.detailUrl,
        chapters,
        currentChapterIndex: 0,
        currentProgressPercent: 0,
        lastReadTime: Date.now(),
        isOnlineSource: true
      };

      onAddBookToShelf(newBook);
    } catch (err: any) {
      alert(`获取小说目录失败: ${err.message || err}`);
    } finally {
      setLoadingBookUrl(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="输入书名或作者（如：诡秘之主、辰东、大奉打更人）..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="liquid-glass-input"
            style={{ paddingLeft: '34px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="liquid-glass-btn liquid-glass-btn-primary"
          style={{ padding: '0 16px', minWidth: '80px' }}
        >
          {isSearching ? <Loader2 size={14} className="animate-spin" /> : '搜索'}
        </button>
      </form>

      {/* Status Bar */}
      {statusMessage && (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isSearching && <Loader2 size={12} className="animate-spin" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Results List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingRight: '4px'
        }}
      >
        {results.map((item, idx) => {
          const isLoadingThis = loadingBookUrl === item.detailUrl;

          return (
            <div
              key={`${item.sourceId}-${item.detailUrl}-${idx}`}
              className="liquid-glass-panel"
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--glass-border-color)'
              }}
            >
              {/* Cover */}
              <div
                style={{
                  width: '52px',
                  height: '70px',
                  borderRadius: '6px',
                  background: item.cover
                    ? `url(${item.cover}) center/cover`
                    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '16px',
                  flexShrink: 0
                }}
              >
                {!item.cover && item.title.slice(0, 1)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.15)',
                        color: 'var(--accent-color)'
                      }}
                    >
                      {item.sourceName}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    作者：{item.author}
                  </div>

                  {item.latestChapter && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      最新：{item.latestChapter}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button
                    disabled={isLoadingThis}
                    onClick={() => handleSelectResult(item)}
                    className="liquid-glass-btn liquid-glass-btn-primary"
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                  >
                    {isLoadingThis ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>正在解析章节...</span>
                      </>
                    ) : (
                      <>
                        <BookPlus size={12} />
                        <span>加入书架并阅读</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
