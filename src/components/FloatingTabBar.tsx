import React, { useRef, useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  X,
  Minus,
  Square,
  FileSpreadsheet,
  Code2,
  StickyNote,
  Activity,
  Pin,
  EyeOff,
  BookOpen
} from 'lucide-react';
import { Book, ChameleonModeType } from '../types/reader';
import { windowControls } from '../services/tauriBridge';

interface FloatingTabBarProps {
  books: Book[];
  openTabIds: string[];
  activeBookId: string | null;
  onSelectBook: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onOpenNewBook: () => void;
  onToggleDrawer: () => void;
  chameleonMode: ChameleonModeType;
  onChangeChameleonMode: (mode: ChameleonModeType) => void;
  alwaysOnTop: boolean;
  onToggleAlwaysOnTop: () => void;
  onTriggerBossKey: () => void;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  books,
  openTabIds,
  activeBookId,
  onSelectBook,
  onCloseTab,
  onOpenNewBook,
  onToggleDrawer,
  chameleonMode,
  onChangeChameleonMode,
  alwaysOnTop,
  onToggleAlwaysOnTop,
  onTriggerBossKey
}) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0
  });

  const openBooks = openTabIds
    .map((id) => books.find((b) => b.id === id))
    .filter((b): b is Book => b !== undefined);

  const updateTabIndicator = () => {
    if (!activeBookId) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const activeEl = tabRefs.current[activeBookId];
    const container = tabsContainerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: activeRect.left - containerRect.left + container.scrollLeft,
        width: activeRect.width,
        opacity: 1
      });
    }
  };

  useEffect(() => {
    updateTabIndicator();
    const timer = setTimeout(updateTabIndicator, 40);
    window.addEventListener('resize', updateTabIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTabIndicator);
    };
  }, [activeBookId, openTabIds, openBooks.length]);

  return (
    <div
      className="tauri-drag-handle"
      style={{
        padding: '8px 12px 0 12px',
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 1000
      }}
    >
      <div
        className="ios-floating-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '44px',
          padding: '0 10px',
          gap: '8px'
        }}
      >
        {/* Left: Drawer Menu & Boss Key */}
        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onToggleDrawer}
            className="frosted-btn"
            title="控制中心 (书架/目录/搜书/设置) [Alt+M]"
            style={{ padding: '6px 12px', borderRadius: '9999px' }}
          >
            <Menu size={15} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>菜单</span>
          </button>

          <button
            onClick={onTriggerBossKey}
            className="frosted-btn"
            title="老板键瞬隐 [Alt+`]"
            style={{ padding: '6px 8px', borderRadius: '9999px' }}
          >
            <EyeOff size={14} />
          </button>
        </div>

        {/* Center: iOS Fluid Floating Segmented Tabs with Spring Sliding Pill */}
        <div
          ref={tabsContainerRef}
          className="tauri-no-drag"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.16)',
            padding: '3px 4px',
            borderRadius: '9999px',
            border: '1px solid var(--glass-border)',
            overflowX: 'auto',
            maxWidth: 'calc(100vw - 380px)',
            scrollbarWidth: 'none'
          }}
        >
          {/* Active Sliding Highlight Pill */}
          <div
            style={{
              position: 'absolute',
              top: '3px',
              bottom: '3px',
              left: 0,
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
              background: 'var(--glass-surface-active)',
              border: '1px solid var(--glass-border-hover)',
              borderRadius: '9999px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
              opacity: indicatorStyle.opacity,
              transition:
                'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1), width 0.28s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {openBooks.map((book) => {
            const isActive = book.id === activeBookId;
            return (
              <div
                key={book.id}
                ref={(el) => {
                  tabRefs.current[book.id] = el;
                }}
                onClick={() => onSelectBook(book.id)}
                className="ios-tab-pill"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  maxWidth: '160px'
                }}
              >
                <BookOpen size={13} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {book.title}
                </span>
                <span
                  onClick={(e) => onCloseTab(book.id, e)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    marginLeft: '2px',
                    opacity: isActive ? 0.7 : 0.4,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = isActive ? '0.7' : '0.4';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'inherit';
                  }}
                >
                  <X size={11} />
                </span>
              </div>
            );
          })}

          <button
            onClick={onOpenNewBook}
            className="frosted-btn"
            title="添加新书 / 搜书"
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '5px 8px',
              borderRadius: '9999px',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none'
            }}
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Right: Chameleon Disguise Segmented Switcher & Window Controls */}
        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Chameleon Mode Switcher Pills */}
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
              onClick={() => onChangeChameleonMode(chameleonMode === 'excel' ? 'none' : 'excel')}
              className="frosted-btn"
              title="Excel 表格伪装 [Alt+E]"
              style={{
                padding: '4px 8px',
                borderRadius: '9999px',
                background: chameleonMode === 'excel' ? '#107c41' : 'transparent',
                color: chameleonMode === 'excel' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: chameleonMode === 'excel' ? '0 2px 8px rgba(16, 124, 65, 0.4)' : 'none'
              }}
            >
              <FileSpreadsheet size={13} />
            </button>
            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'vscode' ? 'none' : 'vscode')}
              className="frosted-btn"
              title="VS Code 代码伪装 [Alt+C]"
              style={{
                padding: '4px 8px',
                borderRadius: '9999px',
                background: chameleonMode === 'vscode' ? '#007acc' : 'transparent',
                color: chameleonMode === 'vscode' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: chameleonMode === 'vscode' ? '0 2px 8px rgba(0, 122, 204, 0.4)' : 'none'
              }}
            >
              <Code2 size={13} />
            </button>
            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'stickynote' ? 'none' : 'stickynote')}
              className="frosted-btn"
              title="便签备忘录伪装"
              style={{
                padding: '4px 8px',
                borderRadius: '9999px',
                background: chameleonMode === 'stickynote' ? '#d97706' : 'transparent',
                color: chameleonMode === 'stickynote' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: chameleonMode === 'stickynote' ? '0 2px 8px rgba(217, 119, 6, 0.4)' : 'none'
              }}
            >
              <StickyNote size={13} />
            </button>
            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'ticker' ? 'none' : 'ticker')}
              className="frosted-btn"
              title="24px 极简单行状态条 [Alt+1]"
              style={{
                padding: '4px 8px',
                borderRadius: '9999px',
                background: chameleonMode === 'ticker' ? 'var(--accent-color)' : 'transparent',
                color: chameleonMode === 'ticker' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: chameleonMode === 'ticker' ? 'var(--accent-glow)' : 'none'
              }}
            >
              <Activity size={13} />
            </button>
          </div>

          {/* Always On Top Pin */}
          <button
            onClick={onToggleAlwaysOnTop}
            className="frosted-btn"
            title={alwaysOnTop ? '已置顶窗口' : '置顶窗口'}
            style={{
              padding: '5px 8px',
              borderRadius: '9999px',
              color: alwaysOnTop ? 'var(--accent-color)' : 'var(--text-muted)'
            }}
          >
            <Pin size={13} />
          </button>

          {/* Window Native Controls */}
          <button
            onClick={() => windowControls.minimize()}
            className="frosted-btn"
            title="最小化"
            style={{ padding: '5px 8px', borderRadius: '9999px' }}
          >
            <Minus size={13} />
          </button>
          <button
            onClick={() => windowControls.toggleMaximize()}
            className="frosted-btn"
            title="最大化"
            style={{ padding: '5px 8px', borderRadius: '9999px' }}
          >
            <Square size={11} />
          </button>
          <button
            onClick={() => windowControls.close()}
            className="frosted-btn"
            title="关闭"
            style={{ padding: '5px 8px', borderRadius: '9999px' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
