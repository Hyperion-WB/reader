import React, { useRef } from 'react';
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
  EyeOff
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

  const openBooks = openTabIds
    .map((id) => books.find((b) => b.id === id))
    .filter((b): b is Book => b !== undefined);

  return (
    <div
      className="floating-tab-bar tauri-drag-handle"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '42px',
        padding: '0 10px',
        background: 'var(--glass-bg-base)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        borderBottom: '1px solid var(--glass-border-color)',
        boxShadow: 'var(--glass-inner-glow)',
        zIndex: 1000,
        gap: '8px'
      }}
    >
      {/* Left Menu & Quick Tools */}
      <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={onToggleDrawer}
          className="liquid-glass-btn"
          title="打开侧边面板 (书架/目录/设置/书源) [Alt+M]"
          style={{ padding: '6px 9px', borderRadius: '10px' }}
        >
          <Menu size={16} />
        </button>

        <button
          onClick={onTriggerBossKey}
          className="liquid-glass-btn"
          title="老板键极速隐蔽 [Alt+`]"
          style={{ padding: '6px 9px', borderRadius: '10px' }}
        >
          <EyeOff size={15} />
        </button>
      </div>

      {/* Center Tabs with Apple Spring Motion */}
      <div
        ref={tabsContainerRef}
        className="tauri-no-drag"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          maxWidth: 'calc(100vw - 360px)',
          scrollbarWidth: 'none',
          padding: '2px 0'
        }}
      >
        {openBooks.map((book) => {
          const isActive = book.id === activeBookId;
          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book.id)}
              className="tab-pill animate-fade-in"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)',
                border: isActive
                  ? '1px solid rgba(255, 255, 255, 0.45)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.08), var(--glass-inner-glow)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.24s var(--spring-smooth)',
                whiteSpace: 'nowrap',
                maxWidth: '160px'
              }}
            >
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
                  opacity: isActive ? 0.8 : 0.4,
                  transition: 'opacity 0.2s',
                  marginLeft: '2px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = isActive ? '0.8' : '0.4')}
              >
                <X size={12} />
              </span>
            </div>
          );
        })}

        <button
          onClick={onOpenNewBook}
          className="liquid-glass-btn"
          title="打开新书籍 / 本地导入"
          style={{ padding: '5px 8px', borderRadius: '10px' }}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Right Controls: Chameleon Switcher & Window Controls */}
      <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {/* Chameleon Mode Quick Switcher */}
        <div style={{ display: 'flex', gap: '3px', background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '10px' }}>
          <button
            onClick={() => onChangeChameleonMode(chameleonMode === 'excel' ? 'none' : 'excel')}
            className="liquid-glass-btn"
            title="切换 Excel 伪装模式 [Alt+E]"
            style={{
              padding: '4px 6px',
              borderRadius: '8px',
              background: chameleonMode === 'excel' ? '#107c41' : 'transparent',
              color: chameleonMode === 'excel' ? '#fff' : 'inherit'
            }}
          >
            <FileSpreadsheet size={13} />
          </button>
          <button
            onClick={() => onChangeChameleonMode(chameleonMode === 'vscode' ? 'none' : 'vscode')}
            className="liquid-glass-btn"
            title="切换 VS Code 伪装模式 [Alt+C]"
            style={{
              padding: '4px 6px',
              borderRadius: '8px',
              background: chameleonMode === 'vscode' ? '#007acc' : 'transparent',
              color: chameleonMode === 'vscode' ? '#fff' : 'inherit'
            }}
          >
            <Code2 size={13} />
          </button>
          <button
            onClick={() => onChangeChameleonMode(chameleonMode === 'stickynote' ? 'none' : 'stickynote')}
            className="liquid-glass-btn"
            title="切换 Win11 便签伪装模式"
            style={{
              padding: '4px 6px',
              borderRadius: '8px',
              background: chameleonMode === 'stickynote' ? '#eab308' : 'transparent',
              color: chameleonMode === 'stickynote' ? '#fff' : 'inherit'
            }}
          >
            <StickyNote size={13} />
          </button>
          <button
            onClick={() => onChangeChameleonMode(chameleonMode === 'ticker' ? 'none' : 'ticker')}
            className="liquid-glass-btn"
            title="切换 单行极简状态条模式 [Alt+1]"
            style={{
              padding: '4px 6px',
              borderRadius: '8px',
              background: chameleonMode === 'ticker' ? 'var(--accent-color)' : 'transparent',
              color: chameleonMode === 'ticker' ? '#fff' : 'inherit'
            }}
          >
            <Activity size={13} />
          </button>
        </div>

        {/* Pin On Top */}
        <button
          onClick={onToggleAlwaysOnTop}
          className="liquid-glass-btn"
          title={alwaysOnTop ? '窗口已置顶' : '点击置顶窗口'}
          style={{
            padding: '5px 7px',
            borderRadius: '9px',
            color: alwaysOnTop ? 'var(--accent-color)' : 'var(--text-muted)'
          }}
        >
          <Pin size={13} />
        </button>

        {/* Native-style Window Actions */}
        <button
          onClick={() => windowControls.minimize()}
          className="liquid-glass-btn"
          title="最小化"
          style={{ padding: '5px 7px', borderRadius: '8px' }}
        >
          <Minus size={13} />
        </button>
        <button
          onClick={() => windowControls.toggleMaximize()}
          className="liquid-glass-btn"
          title="最大化 / 还原"
          style={{ padding: '5px 7px', borderRadius: '8px' }}
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => windowControls.close()}
          className="liquid-glass-btn"
          title="关闭"
          style={{ padding: '5px 7px', borderRadius: '8px' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};
