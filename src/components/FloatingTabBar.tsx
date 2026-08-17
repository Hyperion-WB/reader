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
  BookOpen,
  Shield,
  ChevronDown
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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showDisguiseMenu, setShowDisguiseMenu] = useState(false);
  const disguiseMenuRef = useRef<HTMLDivElement>(null);

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
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      updateTabIndicator();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeBookId, openTabIds, openBooks.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (disguiseMenuRef.current && !disguiseMenuRef.current.contains(e.target as Node)) {
        setShowDisguiseMenu(false);
      }
    };
    if (showDisguiseMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDisguiseMenu]);

  const isCompactView = windowWidth < 740;

  return (
    <div
      className="tauri-drag-handle"
      data-tauri-drag-region="true"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('.tauri-no-drag, button, input, select, a, textarea')) {
          return;
        }
        windowControls.startDragging();
      }}
      style={{
        padding: '6px 8px 0 8px',
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 1000,
        userSelect: 'none'
      }}
    >
      <div
        className="ios-floating-bar"
        data-tauri-drag-region="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '42px',
          padding: '0 8px',
          gap: '6px',
          overflow: 'visible',
          position: 'relative'
        }}
      >
        {/* Left: Cute App Logo, Drawer Menu & Boss Key */}
        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <CuteAppIcon size={26} style={{ cursor: 'pointer' }} />

          <button
            onClick={onToggleDrawer}
            className="frosted-btn"
            title="控制中心 (书架/目录/书签/搜书/设置) [Alt+M]"
            style={{ padding: '5px 9px', borderRadius: '9999px', color: 'var(--text-primary)' }}
          >
            <Menu size={14} />
            {!isCompactView && <span style={{ fontSize: '12px', fontWeight: 600 }}>菜单</span>}
          </button>

          <button
            onClick={onTriggerBossKey}
            className="frosted-btn"
            title="老板键瞬隐 [Alt+`]"
            style={{ padding: '5px 7px', borderRadius: '9999px', color: 'var(--text-primary)' }}
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
            minWidth: '40px',
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
                  maxWidth: 'clamp(60px, 14vw, 150px)',
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
                    opacity: isActive ? 0.8 : 0.4,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = isActive ? '0.8' : '0.4';
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
              flexShrink: 0,
              color: 'var(--text-secondary)'
            }}
            title="打开新书"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Right: Camouflage Disguises & Window Controls */}
        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Responsive Disguise Switcher */}
          {isCompactView ? (
            <div ref={disguiseMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDisguiseMenu(!showDisguiseMenu)}
                className="frosted-btn"
                title="摸鱼伪装模式菜单"
                style={{
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  background: chameleonMode !== 'none' ? 'var(--accent-color)' : 'transparent',
                  color: chameleonMode !== 'none' ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '11px',
                  gap: '4px'
                }}
              >
                <Shield size={13} />
                <ChevronDown size={11} />
              </button>

              {/* Popover Menu for Camouflage on Small Windows */}
              {showDisguiseMenu && (
                <div
                  className="frosted-panel animate-ios-spring"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '6px',
                    borderRadius: '14px',
                    minWidth: '140px',
                    zIndex: 99999,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                    background: 'var(--bg-app)',
                    backdropFilter: 'blur(32px)'
                  }}
                >
                  <button
                    onClick={() => {
                      onChangeChameleonMode(chameleonMode === 'excel' ? 'none' : 'excel');
                      setShowDisguiseMenu(false);
                    }}
                    className="frosted-btn"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '6px 10px',
                      fontSize: '11.5px',
                      background: chameleonMode === 'excel' ? '#107c41' : 'transparent',
                      color: chameleonMode === 'excel' ? '#fff' : 'var(--text-primary)'
                    }}
                  >
                    <FileSpreadsheet size={13} />
                    <span>Excel 表格 (Alt+E)</span>
                  </button>

                  <button
                    onClick={() => {
                      onChangeChameleonMode(chameleonMode === 'vscode' ? 'none' : 'vscode');
                      setShowDisguiseMenu(false);
                    }}
                    className="frosted-btn"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '6px 10px',
                      fontSize: '11.5px',
                      background: chameleonMode === 'vscode' ? '#007acc' : 'transparent',
                      color: chameleonMode === 'vscode' ? '#fff' : 'var(--text-primary)'
                    }}
                  >
                    <Code2 size={13} />
                    <span>VS Code 代码 (Alt+C)</span>
                  </button>

                  <button
                    onClick={() => {
                      onChangeChameleonMode(chameleonMode === 'idea' ? 'none' : 'idea');
                      setShowDisguiseMenu(false);
                    }}
                    className="frosted-btn"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '6px 10px',
                      fontSize: '11.5px',
                      background: chameleonMode === 'idea' ? '#fe315d' : 'transparent',
                      color: chameleonMode === 'idea' ? '#fff' : 'var(--text-primary)'
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '11px' }}>IJ</span>
                    <span>IntelliJ IDEA (Alt+I)</span>
                  </button>

                  <button
                    onClick={() => {
                      onChangeChameleonMode(chameleonMode === 'stickynote' ? 'none' : 'stickynote');
                      setShowDisguiseMenu(false);
                    }}
                    className="frosted-btn"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '6px 10px',
                      fontSize: '11.5px',
                      background: chameleonMode === 'stickynote' ? '#eab308' : 'transparent',
                      color: chameleonMode === 'stickynote' ? '#fff' : 'var(--text-primary)'
                    }}
                  >
                    <StickyNote size={13} />
                    <span>便签小窗模式</span>
                  </button>

                  <button
                    onClick={() => {
                      onChangeChameleonMode(chameleonMode === 'ticker' ? 'none' : 'ticker');
                      setShowDisguiseMenu(false);
                    }}
                    className="frosted-btn"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '6px 10px',
                      fontSize: '11.5px',
                      background: chameleonMode === 'ticker' ? 'var(--accent-color)' : 'transparent',
                      color: chameleonMode === 'ticker' ? '#fff' : 'var(--text-primary)'
                    }}
                  >
                    <Activity size={13} />
                    <span>24px 单行滚动 (Alt+1)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Inline Disguise Buttons for Wide Screens */
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
                  color: chameleonMode === 'excel' ? '#ffffff' : 'var(--text-primary)',
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
                  color: chameleonMode === 'vscode' ? '#ffffff' : 'var(--text-primary)',
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
                  color: chameleonMode === 'idea' ? '#ffffff' : 'var(--text-primary)',
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
                  color: chameleonMode === 'ticker' ? '#ffffff' : 'var(--text-primary)',
                  border: 'none'
                }}
              >
                <Activity size={13} />
              </button>
            </div>
          )}

          {/* Always On Top Toggle */}
          <button
            onClick={onToggleAlwaysOnTop}
            className="frosted-btn"
            title={alwaysOnTop ? '取消置顶' : '窗口置顶'}
            style={{
              padding: '5px 7px',
              borderRadius: '9999px',
              color: alwaysOnTop ? 'var(--accent-color)' : 'var(--text-primary)',
              background: alwaysOnTop ? 'var(--glass-surface-active)' : 'transparent'
            }}
          >
            <Pin size={13} style={{ transform: alwaysOnTop ? 'rotate(45deg)' : 'none' }} />
          </button>

          {/* Window Control Buttons with High-Contrast Text & Crisp Close X */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '2px' }}>
            <button
              onClick={() => windowControls.minimize()}
              className="frosted-btn"
              style={{
                padding: '5px 7px',
                borderRadius: '9999px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)'
              }}
              title="最小化"
            >
              <Minus size={13} style={{ color: 'var(--text-primary)' }} />
            </button>
            <button
              onClick={() => windowControls.toggleMaximize()}
              className="frosted-btn"
              style={{
                padding: '5px 7px',
                borderRadius: '9999px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)'
              }}
              title="最大化 / 还原"
            >
              <Square size={11} style={{ color: 'var(--text-primary)' }} />
            </button>
            <button
              onClick={() => windowControls.close()}
              className="frosted-btn"
              style={{
                padding: '5px 7px',
                borderRadius: '9999px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                transition: 'background 0.15s ease, color 0.15s ease'
              }}
              title="关闭应用"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = '#ffffff';
                const svg = e.currentTarget.querySelector('svg');
                if (svg) svg.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
                const svg = e.currentTarget.querySelector('svg');
                if (svg) svg.style.color = 'var(--text-primary)';
              }}
            >
              <X size={13} style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
