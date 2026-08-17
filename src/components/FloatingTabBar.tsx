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
import { CuteAppIcon } from './CuteAppIcon';

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
        padding: '6px 10px 0 10px',
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
          height: '42px',
          padding: '0 8px',
          gap: '6px',
          overflow: 'hidden'
        }}
      >
        {/* Left: Cute App Logo, Drawer Menu & Boss Key */}
        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <CuteAppIcon size={26} style={{ marginRight: '2px', cursor: 'pointer' }} />
          
          <button
            onClick={onToggleDrawer}
            className="frosted-btn"
            title="控制中心 (书架/目录/书签/搜书/设置) [Alt+M]"
            style={{ padding: '5px 10px', borderRadius: '9999px' }}
          >
            <Menu size={14} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>菜单</span>
          </button>

          <button
            onClick={onTriggerBossKey}
            className="frosted-btn"
            title="老板键瞬隐 [Alt+`]"
            style={{ padding: '5px 7px', borderRadius: '9999px' }}
          >
            <EyeOff size={13} />
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
            gap: '3px',
            background: 'rgba(0, 0, 0, 0.16)',
            padding: '2px 4px',
            borderRadius: '9999px',
            border: '1px solid var(--glass-border)',
            overflowX: 'auto',
            flex: '1 1 auto',
            minWidth: '60px',
            maxWidth: '100%',
            scrollbarWidth: 'none'
          }}
        >
          {/* Active Sliding Highlight Pill */}
          <div
            style={{
              position: 'absolute',
              top: '2px',
              bottom: '2px',
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
                  maxWidth: 'clamp(70px, 15vw, 150px)',
                  padding: '4px 8px',
                  fontSize: '12px'
                }}
              >
                <BookOpen size={12} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
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
                    width: '14px',
                    height: '14px',
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
                  <X size={10} />
                </span>
              </div>
            );
          })}

          <button
            onClick={onOpenNewBook}
            className="frosted-btn"
            style={{
              padding: '4px 6px',
              borderRadius: '9999px',
              border: 'none',
              background: 'transparent',
              flexShrink: 0
            }}
            title="打开新书"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Right: Camouflage Modes Pill & Window Controls */}
        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Chameleon Disguise Group */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
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
                padding: '4px 6px',
                borderRadius: '9999px',
                background: chameleonMode === 'excel' ? '#107c41' : 'transparent',
                color: chameleonMode === 'excel' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none'
              }}
            >
              <FileSpreadsheet size={13} />
            </button>

            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'vscode' ? 'none' : 'vscode')}
              className="frosted-btn"
              title="VS Code 代码伪装 [Alt+C]"
              style={{
                padding: '4px 6px',
                borderRadius: '9999px',
                background: chameleonMode === 'vscode' ? '#007acc' : 'transparent',
                color: chameleonMode === 'vscode' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none'
              }}
            >
              <Code2 size={13} />
            </button>

            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'idea' ? 'none' : 'idea')}
              className="frosted-btn"
              title="IntelliJ IDEA 伪装 [Alt+I]"
              style={{
                padding: '4px 6px',
                borderRadius: '9999px',
                background: chameleonMode === 'idea' ? '#fe315d' : 'transparent',
                color: chameleonMode === 'idea' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 800,
                fontSize: '11px',
                lineHeight: 1
              }}
            >
              <span>IJ</span>
            </button>

            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'stickynote' ? 'none' : 'stickynote')}
              className="frosted-btn"
              title="便签条伪装"
              style={{
                padding: '4px 6px',
                borderRadius: '9999px',
                background: chameleonMode === 'stickynote' ? '#eab308' : 'transparent',
                color: chameleonMode === 'stickynote' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none'
              }}
            >
              <StickyNote size={13} />
            </button>

            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'ticker' ? 'none' : 'ticker')}
              className="frosted-btn"
              title="24px 极简单行滚动条 [Alt+1]"
              style={{
                padding: '4px 6px',
                borderRadius: '9999px',
                background: chameleonMode === 'ticker' ? 'var(--accent-color)' : 'transparent',
                color: chameleonMode === 'ticker' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none'
              }}
            >
              <Activity size={13} />
            </button>
          </div>

          {/* Always On Top Toggle */}
          <button
            onClick={onToggleAlwaysOnTop}
            className="frosted-btn"
            title={alwaysOnTop ? '取消置顶' : '窗口置顶'}
            style={{
              padding: '5px 7px',
              borderRadius: '9999px',
              color: alwaysOnTop ? 'var(--accent-color)' : 'var(--text-secondary)',
              background: alwaysOnTop ? 'var(--glass-surface-active)' : 'transparent'
            }}
          >
            <Pin size={13} style={{ transform: alwaysOnTop ? 'rotate(45deg)' : 'none' }} />
          </button>

          {/* Window Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '2px' }}>
            <button
              onClick={() => windowControls.minimize()}
              className="frosted-btn"
              style={{ padding: '5px 7px', borderRadius: '9999px', border: 'none', background: 'transparent' }}
              title="最小化"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={() => windowControls.toggleMaximize()}
              className="frosted-btn"
              style={{ padding: '5px 7px', borderRadius: '9999px', border: 'none', background: 'transparent' }}
              title="最大化 / 还原"
            >
              <Square size={11} />
            </button>
            <button
              onClick={() => windowControls.close()}
              className="frosted-btn"
              style={{ padding: '5px 7px', borderRadius: '9999px', border: 'none', background: 'transparent' }}
              title="关闭"
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
