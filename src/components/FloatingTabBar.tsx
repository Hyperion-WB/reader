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
  ChevronDown,
  FileText,
  FileBadge
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

  const openBooks = books.filter((b) => openTabIds.includes(b.id));

  const updateTabIndicator = () => {
    if (!activeBookId || !tabRefs.current[activeBookId] || !tabsContainerRef.current) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const activeEl = tabRefs.current[activeBookId];
    const containerEl = tabsContainerRef.current;
    if (activeEl && containerEl) {
      const activeRect = activeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      setIndicatorStyle({
        left: activeRect.left - containerRect.left + containerEl.scrollLeft,
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

  const isCompactView = windowWidth < 820;

  return (
    <div
      data-tauri-drag-region="true"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 9000,
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 1. Android / iPadOS Style Floating Window Top Drag Handle */}
      <div
        data-tauri-drag-region="true"
        onMouseDown={(e) => {
          e.preventDefault();
          windowControls.startDragging();
        }}
        style={{
          width: '100%',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'move',
          userSelect: 'none',
          paddingTop: '4px',
          boxSizing: 'border-box'
        }}
        title="按住横条或顶栏任意空白处拖动窗口"
      >
        <div
          data-tauri-drag-region="true"
          style={{
            width: '56px',
            height: '5px',
            borderRadius: '9999px',
            background: 'var(--text-muted)',
            opacity: 0.6,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            cursor: 'move'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.background = 'var(--accent-color)';
            e.currentTarget.style.width = '72px';
            e.currentTarget.style.boxShadow = 'var(--accent-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.background = 'var(--text-muted)';
            e.currentTarget.style.width = '56px';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
          }}
        />
      </div>

      {/* 2. Frosted Floating Glass Navigation Bar */}
      <div data-tauri-drag-region="true" style={{ padding: '0 8px 6px 8px', width: '100%', boxSizing: 'border-box' }}>
        <div
          className="ios-floating-bar"
          data-tauri-drag-region="true"
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).closest('.tauri-no-drag, button, input, select, a, textarea')) {
              return;
            }
            windowControls.startDragging();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '40px',
            padding: '0 8px',
            gap: '6px',
            overflow: 'visible',
            position: 'relative'
          }}
        >
          {/* Left: Cute App Mascot Logo, Control Drawer & Boss Key */}
          <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <CuteAppIcon size={26} style={{ cursor: 'pointer' }} />

            <button
              onClick={onToggleDrawer}
              className="frosted-btn"
              title="控制中心 (书架/目录/书签/搜书/设置) [Alt+M]"
              style={{ padding: '4px 8px', borderRadius: '9999px', color: 'var(--text-primary)' }}
            >
              <Menu size={13} />
              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>菜单</span>
            </button>

            <button
              onClick={onTriggerBossKey}
              className="frosted-btn"
              title="一键极速老板键 [Alt+`]"
              style={{ padding: '4px 7px', borderRadius: '9999px', color: 'var(--text-secondary)' }}
            >
              <EyeOff size={13} />
            </button>
          </div>

          {/* Center: Fluid iOS Morphing Tabs */}
          <div
            ref={tabsContainerRef}
            className="tauri-no-drag"
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              flex: '1 1 auto',
              minWidth: '40px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              padding: '2px',
              gap: '4px'
            }}
          >
            {/* Morphing Sliding Indicator Pill */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                bottom: '2px',
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                background: 'var(--glass-surface-active)',
                border: '1px solid var(--glass-border-hover)',
                boxShadow: 'var(--accent-glow)',
                borderRadius: '9999px',
                opacity: indicatorStyle.opacity,
                transition:
                  'transform 0.32s cubic-bezier(0.2, 0.9, 0.1, 1), width 0.28s cubic-bezier(0.2, 0.9, 0.1, 1), opacity 0.2s ease',
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
                    maxWidth: 'clamp(50px, 14vw, 140px)',
                    padding: '4px 8px',
                    fontSize: '11.5px'
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

          {/* Right: Camouflage Disguises & Apple-Styled Window Controls */}
          <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            {/* Responsive Disguise Switcher */}
            {isCompactView ? (
              <div ref={disguiseMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDisguiseMenu(!showDisguiseMenu)}
                  className="frosted-btn"
                  title="摸鱼伪装模式菜单"
                  style={{
                    padding: '4px 7px',
                    borderRadius: '9999px',
                    background: chameleonMode !== 'none' ? 'var(--accent-color)' : 'transparent',
                    color: chameleonMode !== 'none' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '11px',
                    gap: '3px'
                  }}
                >
                  <Shield size={12} />
                  <span style={{ fontSize: '11px' }}>伪装</span>
                  <ChevronDown size={10} style={{ transform: showDisguiseMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {showDisguiseMenu && (
                  <div
                    className="frosted-panel animate-ios-spring"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 6px)',
                      width: '180px',
                      padding: '6px',
                      borderRadius: '14px',
                      zIndex: 999999,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', padding: '2px 8px', fontWeight: 600 }}>
                      一键摸鱼伪装矩阵
                    </div>
                    <button
                      onClick={() => { onChangeChameleonMode(chameleonMode === 'excel' ? 'none' : 'excel'); setShowDisguiseMenu(false); }}
                      className="frosted-btn"
                      style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'excel' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'excel' ? '#fff' : 'var(--text-primary)' }}
                    >
                      <FileSpreadsheet size={13} color="#107c41" />
                      <span>Excel 表格模式 [Alt+E]</span>
                    </button>
                    <button
                      onClick={() => { onChangeChameleonMode(chameleonMode === 'word' ? 'none' : 'word'); setShowDisguiseMenu(false); }}
                      className="frosted-btn"
                      style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'word' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'word' ? '#fff' : 'var(--text-primary)' }}
                    >
                      <FileText size={13} color="#2b579a" />
                      <span>Word 公文模式 [Alt+W]</span>
                    </button>
                    <button
                      onClick={() => { onChangeChameleonMode(chameleonMode === 'vscode' ? 'none' : 'vscode'); setShowDisguiseMenu(false); }}
                      className="frosted-btn"
                      style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'vscode' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'vscode' ? '#fff' : 'var(--text-primary)' }}
                    >
                      <Code2 size={13} color="#007acc" />
                      <span>VS Code 代码 [Alt+C]</span>
                    </button>
                    <button
                      onClick={() => { onChangeChameleonMode(chameleonMode === 'idea' ? 'none' : 'idea'); setShowDisguiseMenu(false); }}
                      className="frosted-btn"
                      style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'idea' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'idea' ? '#fff' : 'var(--text-primary)' }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '11px', color: '#ff318c' }}>IJ</span>
                      <span>IDEA 终端模式 [Alt+I]</span>
                    </button>
                    <button
                      onClick={() => { onChangeChameleonMode(chameleonMode === 'pdf' ? 'none' : 'pdf'); setShowDisguiseMenu(false); }}
                      className="frosted-btn"
                      style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'pdf' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'pdf' ? '#fff' : 'var(--text-primary)' }}
                    >
                      <FileBadge size={13} color="#ff4d4f" />
                      <span>PDF 论文文献模式</span>
                    </button>
                    <button
                      onClick={() => { onChangeChameleonMode(chameleonMode === 'stickynote' ? 'none' : 'stickynote'); setShowDisguiseMenu(false); }}
                      className="frosted-btn"
                      style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'stickynote' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'stickynote' ? '#fff' : 'var(--text-primary)' }}
                    >
                      <StickyNote size={13} color="#eab308" />
                      <span>便签备忘录模式</span>
                    </button>
                    <button
                      onClick={() => { onChangeChameleonMode(chameleonMode === 'ticker' ? 'none' : 'ticker'); setShowDisguiseMenu(false); }}
                      className="frosted-btn"
                      style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'ticker' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'ticker' ? '#fff' : 'var(--text-primary)' }}
                    >
                      <Activity size={13} color="#10b981" />
                      <span>24px 极窄状态条 [Alt+1]</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button
                  onClick={() => onChangeChameleonMode(chameleonMode === 'excel' ? 'none' : 'excel')}
                  className="frosted-btn"
                  title="Excel 电子表格伪装 [Alt+E]"
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
                  onClick={() => onChangeChameleonMode(chameleonMode === 'word' ? 'none' : 'word')}
                  className="frosted-btn"
                  title="Word 公文报告伪装 [Alt+W]"
                  style={{
                    padding: '4px 6px',
                    borderRadius: '9999px',
                    background: chameleonMode === 'word' ? '#2b579a' : 'transparent',
                    color: chameleonMode === 'word' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none'
                  }}
                >
                  <FileText size={13} />
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
                  title="IntelliJ IDEA 代码伪装 [Alt+I]"
                  style={{
                    padding: '4px 6px',
                    borderRadius: '9999px',
                    background: chameleonMode === 'idea' ? '#353b48' : 'transparent',
                    color: chameleonMode === 'idea' ? '#fe315d' : 'var(--text-secondary)',
                    border: 'none'
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '11px' }}>IJ</span>
                </button>

                <button
                  onClick={() => onChangeChameleonMode(chameleonMode === 'pdf' ? 'none' : 'pdf')}
                  className="frosted-btn"
                  title="PDF 论文文献伪装"
                  style={{
                    padding: '4px 6px',
                    borderRadius: '9999px',
                    background: chameleonMode === 'pdf' ? '#ff4d4f' : 'transparent',
                    color: chameleonMode === 'pdf' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none'
                  }}
                >
                  <FileBadge size={13} />
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
                padding: '4px 6px',
                borderRadius: '9999px',
                color: alwaysOnTop ? 'var(--accent-color)' : 'var(--text-primary)',
                background: alwaysOnTop ? 'var(--glass-surface-active)' : 'transparent'
              }}
            >
              <Pin size={12} style={{ transform: alwaysOnTop ? 'rotate(45deg)' : 'none' }} />
            </button>

            {/* Redesigned Apple Luxury Traffic Light Window Control Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '4px' }}>
              {/* Minimize (Amber Glow) */}
              <button
                onClick={() => windowControls.minimize()}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'all 0.18s cubic-bezier(0.2, 0.9, 0.1, 1)'
                }}
                title="最小化窗口"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f59e0b';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.6)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Minus size={10} strokeWidth={2.5} />
              </button>

              {/* Maximize / Restore (Emerald Green Glow) */}
              <button
                onClick={() => windowControls.toggleMaximize()}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'all 0.18s cubic-bezier(0.2, 0.9, 0.1, 1)'
                }}
                title="最大化 / 还原窗口"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#10b981';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.6)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Square size={9} strokeWidth={2.5} />
              </button>

              {/* Close (Crimson Red Glow) */}
              <button
                onClick={() => windowControls.close()}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'all 0.18s cubic-bezier(0.2, 0.9, 0.1, 1)'
                }}
                title="关闭应用"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.7)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
