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
  FileBadge,
  Lock,
  Unlock,
  Mail,
  MessageSquare,
  Presentation,
  Keyboard
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
  isFadeLocked?: boolean;
  onToggleFadeLock?: () => void;
  onTriggerBossKey: () => void;
  onRequestClose?: () => void;
  onOpenShortcuts?: () => void;
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
  isFadeLocked = false,
  onToggleFadeLock,
  onTriggerBossKey,
  onRequestClose,
  onOpenShortcuts
}) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0
  });

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);
  const [showDisguiseMenu, setShowDisguiseMenu] = useState(false);
  const disguiseMenuRef = useRef<HTMLDivElement>(null);
  const [showBookSwitcherMenu, setShowBookSwitcherMenu] = useState(false);
  const bookSwitcherRef = useRef<HTMLDivElement>(null);

  const isNarrow = windowWidth < 600;
  const isUltraNarrow = windowWidth < 440;

  const openBooks = books.filter((b) => openTabIds.includes(b.id));
  const activeBook = books.find((b) => b.id === activeBookId);

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
    const handleClose = () => {
      setShowDisguiseMenu(false);
      setShowBookSwitcherMenu(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (disguiseMenuRef.current && !disguiseMenuRef.current.contains(e.target as Node)) {
        setShowDisguiseMenu(false);
      }
      if (bookSwitcherRef.current && !bookSwitcherRef.current.contains(e.target as Node)) {
        setShowBookSwitcherMenu(false);
      }
    };

    if (showDisguiseMenu || showBookSwitcherMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('blur', handleClose);
      document.addEventListener('mouseleave', handleClose);
      window.addEventListener('close-all-popups', handleClose);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('blur', handleClose);
      document.removeEventListener('mouseleave', handleClose);
      window.removeEventListener('close-all-popups', handleClose);
    };
  }, [showDisguiseMenu, showBookSwitcherMenu]);

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
          if (e.button === 0) {
            windowControls.startDragging();
          }
        }}
        style={{
          width: '100%',
          height: '22px',
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
          style={{
            width: '60px',
            height: '5px',
            borderRadius: '9999px',
            background: 'var(--text-muted)',
            opacity: 0.65,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            pointerEvents: 'none'
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
          <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <CuteAppIcon size={26} style={{ cursor: 'pointer' }} />

            <button
              onClick={onToggleDrawer}
              className="frosted-btn"
              data-tooltip="控制中心 (书架/目录/书签/搜书/设置) [Alt+M]"
              data-tooltip-pos="bottom"
              style={{ padding: isUltraNarrow ? '4px 6px' : '4px 8px', borderRadius: '9999px', color: 'var(--text-primary)' }}
            >
              <Menu size={13} />
              {!isUltraNarrow && <span style={{ fontSize: '11.5px', fontWeight: 600 }}>菜单</span>}
            </button>

            <button
              onClick={onTriggerBossKey}
              className="frosted-btn"
              data-tooltip="一键极速老板键 [Alt+`]"
              data-tooltip-pos="bottom"
              style={{ padding: '4px 6px', borderRadius: '9999px', color: 'var(--text-secondary)' }}
            >
              <EyeOff size={13} />
            </button>
          </div>

          {/* Center: Responsive Tabs or Smart Book Switcher Capsule (when narrow) */}
          {isNarrow ? (
            <div ref={bookSwitcherRef} className="tauri-no-drag" style={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                onClick={() => setShowBookSwitcherMenu(!showBookSwitcherMenu)}
                className="frosted-btn"
                style={{
                  maxWidth: '100%',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--glass-surface-active)',
                  border: '1px solid var(--glass-border-hover)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}
                data-tooltip={`当前阅读: ${activeBook?.title || '未选择'} (点击快速切换全部 ${openBooks.length} 本小说)`}
                data-tooltip-pos="bottom"
              >
                <BookOpen size={12} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isUltraNarrow ? '70px' : '120px' }}>
                  {activeBook?.title || '选择书籍'}
                </span>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', flexShrink: 0 }}>
                  ({openBooks.length})
                </span>
                <ChevronDown
                  size={10}
                  style={{
                    transform: showBookSwitcherMenu ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                    flexShrink: 0
                  }}
                />
              </button>

              {/* Floating Dropdown for all open books */}
              {showBookSwitcherMenu && (
                <div
                  className="frosted-menu-solid animate-ios-spring"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '230px',
                    padding: '8px',
                    borderRadius: '16px',
                    zIndex: 999999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '2px 6px', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>已打开的书籍 ({openBooks.length})</span>
                    <span>快速切换</span>
                  </div>
                  <div className="smooth-scroll" style={{ maxHeight: '180px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {openBooks.map((b) => {
                      const isCurrent = b.id === activeBookId;
                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            onSelectBook(b.id);
                            setShowBookSwitcherMenu(false);
                          }}
                          className="frosted-btn"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: '10px',
                            background: isCurrent ? 'var(--accent-color)' : 'transparent',
                            color: isCurrent ? '#fff' : 'var(--text-primary)',
                            fontSize: '11.5px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            <BookOpen size={12} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.title}
                            </span>
                          </div>
                          {openBooks.length > 1 && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(b.id, e);
                              }}
                              style={{ padding: '2px 4px', borderRadius: '4px', opacity: 0.7 }}
                            >
                              <X size={10} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      onOpenNewBook();
                      setShowBookSwitcherMenu(false);
                    }}
                    className="frosted-btn"
                    style={{ justifyContent: 'center', padding: '5px', fontSize: '11px', borderRadius: '8px', marginTop: '2px', border: '1px dashed var(--glass-border-hover)' }}
                  >
                    <Plus size={11} />
                    <span>导入 / 打开新书</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
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
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  borderRadius: '9999px',
                  opacity: indicatorStyle.opacity,
                  transition:
                    'left 0.32s cubic-bezier(0.34, 1.36, 0.64, 1), width 0.3s cubic-bezier(0.34, 1.36, 0.64, 1), opacity 0.22s ease',
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
            </div>
          )}

          <button
            onClick={onOpenNewBook}
            className="frosted-btn tauri-no-drag"
            data-tooltip="导入新书籍 / TXT / EPUB / 漫画"
            data-tooltip-pos="bottom"
            style={{
              padding: '4px',
              borderRadius: '50%',
              flexShrink: 0,
              width: '26px',
              height: '26px'
            }}
          >
            <Plus size={13} />
          </button>

          {/* Right: Chameleon Disguise Capsule & System Controls */}
          <div
            className="tauri-no-drag"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}
          >
            {/* Chameleon Mode Matrix Button & Dropdown */}
            <div ref={disguiseMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDisguiseMenu(!showDisguiseMenu)}
                className="frosted-btn"
                data-tooltip="摸鱼伪装矩阵 (10大模式全景)"
                data-tooltip-pos="bottom"
                style={{
                  padding: isUltraNarrow ? '4px 6px' : '4px 8px',
                  borderRadius: '9999px',
                  background: chameleonMode !== 'none' ? 'var(--accent-color)' : 'transparent',
                  color: chameleonMode !== 'none' ? '#ffffff' : 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '11.5px',
                  gap: '4px',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                }}
              >
                <Shield size={12} style={{ color: chameleonMode !== 'none' ? '#fff' : 'var(--accent-color)' }} />
                {!isUltraNarrow && (
                  <span style={{ fontWeight: 600 }}>
                    {chameleonMode === 'none' ? '伪装 (10)' : '伪装中'}
                  </span>
                )}
                <ChevronDown
                  size={10}
                  style={{
                    transform: showDisguiseMenu ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>

              {showDisguiseMenu && (
                <div
                  className="frosted-menu-solid animate-ios-spring"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 6px)',
                    width: '200px',
                    padding: '8px',
                    borderRadius: '16px',
                    zIndex: 999999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '2px 8px', fontWeight: 600 }}>
                    全场景摸鱼伪装矩阵 (10)
                  </div>
                  <button
                    onClick={() => { onChangeChameleonMode(chameleonMode === 'excel' ? 'none' : 'excel'); setShowDisguiseMenu(false); }}
                    className="frosted-btn"
                    style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'excel' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'excel' ? '#fff' : 'var(--text-primary)' }}
                  >
                    <FileSpreadsheet size={13} color="#107c41" />
                    <span>Excel 表格 [Alt+E]</span>
                  </button>
                  <button
                    onClick={() => { onChangeChameleonMode(chameleonMode === 'word' ? 'none' : 'word'); setShowDisguiseMenu(false); }}
                    className="frosted-btn"
                    style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'word' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'word' ? '#fff' : 'var(--text-primary)' }}
                  >
                    <FileText size={13} color="#2b579a" />
                    <span>Word 公文 [Alt+W]</span>
                  </button>
                  <button
                    onClick={() => { onChangeChameleonMode(chameleonMode === 'email' ? 'none' : 'email'); setShowDisguiseMenu(false); }}
                    className="frosted-btn"
                    style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'email' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'email' ? '#fff' : 'var(--text-primary)' }}
                  >
                    <Mail size={13} color="#0078d4" />
                    <span>Outlook 邮箱 [Alt+O]</span>
                  </button>
                  <button
                    onClick={() => { onChangeChameleonMode(chameleonMode === 'chat' ? 'none' : 'chat'); setShowDisguiseMenu(false); }}
                    className="frosted-btn"
                    style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'chat' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'chat' ? '#fff' : 'var(--text-primary)' }}
                  >
                    <MessageSquare size={13} color="#07c160" />
                    <span>企微/钉钉群聊</span>
                  </button>
                  <button
                    onClick={() => { onChangeChameleonMode(chameleonMode === 'ppt' ? 'none' : 'ppt'); setShowDisguiseMenu(false); }}
                    className="frosted-btn"
                    style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'ppt' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'ppt' ? '#fff' : 'var(--text-primary)' }}
                  >
                    <Presentation size={13} color="#d24726" />
                    <span>PowerPoint 演示</span>
                  </button>
                  <button
                    onClick={() => { onChangeChameleonMode(chameleonMode === 'vscode' ? 'none' : 'vscode'); setShowDisguiseMenu(false); }}
                    className="frosted-btn"
                    style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'vscode' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'vscode' ? '#fff' : 'var(--text-primary)' }}
                  >
                    <Code2 size={13} color="#007acc" />
                    <span>VS Code [Alt+C]</span>
                  </button>
                  <button
                    onClick={() => { onChangeChameleonMode(chameleonMode === 'idea' ? 'none' : 'idea'); setShowDisguiseMenu(false); }}
                    className="frosted-btn"
                    style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'idea' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'idea' ? '#fff' : 'var(--text-primary)' }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '11px', color: '#ff318c' }}>IJ</span>
                    <span>IDEA 终端 [Alt+I]</span>
                  </button>
                  <button
                    onClick={() => { onChangeChameleonMode(chameleonMode === 'pdf' ? 'none' : 'pdf'); setShowDisguiseMenu(false); }}
                    className="frosted-btn"
                    style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'pdf' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'pdf' ? '#fff' : 'var(--text-primary)' }}
                  >
                    <FileBadge size={13} color="#ff4d4f" />
                    <span>PDF 论文文献</span>
                  </button>
                  <button
                    onClick={() => { onChangeChameleonMode(chameleonMode === 'stickynote' ? 'none' : 'stickynote'); setShowDisguiseMenu(false); }}
                    className="frosted-btn"
                    style={{ justifyContent: 'flex-start', padding: '6px 8px', borderRadius: '8px', fontSize: '11.5px', background: chameleonMode === 'stickynote' ? 'var(--accent-color)' : 'transparent', color: chameleonMode === 'stickynote' ? '#fff' : 'var(--text-primary)' }}
                  >
                    <StickyNote size={13} color="#eab308" />
                    <span>便签备忘录</span>
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

            {/* Always On Top Toggle */}
            <button
              onClick={onToggleAlwaysOnTop}
              className="frosted-btn"
              data-tooltip={alwaysOnTop ? '取消置顶' : '窗口置顶'}
              data-tooltip-pos="bottom"
              style={{
                padding: '4px 6px',
                borderRadius: '9999px',
                color: alwaysOnTop ? 'var(--accent-color)' : 'var(--text-primary)',
                background: alwaysOnTop ? 'var(--glass-surface-active)' : 'transparent'
              }}
            >
              <Pin size={12} style={{ transform: alwaysOnTop ? 'rotate(45deg)' : 'none' }} />
            </button>

            {/* Lock Auto-Fade Toggle (防隐身常亮锁定) */}
            <button
              onClick={onToggleFadeLock}
              className="frosted-btn"
              data-tooltip={isFadeLocked ? '已锁定常亮 (点击恢复移出淡出)' : '防隐身锁定 (锁定后鼠标移出不隐藏)'}
              data-tooltip-pos="bottom"
              style={{
                padding: '4px 6px',
                borderRadius: '9999px',
                color: isFadeLocked ? '#eab308' : 'var(--text-primary)',
                background: isFadeLocked ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                borderColor: isFadeLocked ? 'rgba(234, 179, 8, 0.4)' : 'transparent'
              }}
            >
              {isFadeLocked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>

            {/* Keyboard Shortcuts Cheatsheet Trigger */}
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="frosted-btn"
                data-tooltip="快捷键速查 (F1 / ?)"
                data-tooltip-pos="bottom"
                style={{
                  padding: '4px 6px',
                  borderRadius: '9999px',
                  color: 'var(--text-primary)'
                }}
              >
                <Keyboard size={12} />
              </button>
            )}

            {/* Redesigned Apple Luxury Traffic Light Window Control Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '4px' }}>
              {/* Minimize (Amber Glow) */}
              <button
                onClick={() => windowControls.minimize()}
                data-tooltip="最小化窗口"
                data-tooltip-pos="bottom"
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
                data-tooltip="最大化 / 还原窗口"
                data-tooltip-pos="bottom"
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
                onClick={() => (onRequestClose ? onRequestClose() : windowControls.close())}
                data-tooltip="关闭摸鱼阅读 (Alt+F4)"
                data-tooltip-pos="bottom"
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
