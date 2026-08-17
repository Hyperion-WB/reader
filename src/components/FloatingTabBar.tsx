import React from 'react';
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
  const openBooks = openTabIds
    .map((id) => books.find((b) => b.id === id))
    .filter((b): b is Book => b !== undefined);

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
            style={{ padding: '6px 10px', borderRadius: '9999px' }}
          >
            <Menu size={15} />
            <span style={{ fontSize: '12px' }}>菜单</span>
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

        {/* Center: iOS Fluid Floating Segmented Tabs */}
        <div
          className="tauri-no-drag"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.12)',
            padding: '3px 4px',
            borderRadius: '9999px',
            overflowX: 'auto',
            maxWidth: 'calc(100vw - 380px)',
            scrollbarWidth: 'none'
          }}
        >
          {openBooks.map((book) => {
            const isActive = book.id === activeBookId;
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book.id)}
                className={`ios-tab-pill ${isActive ? 'active' : ''}`}
                style={{
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
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
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
            style={{ padding: '5px 8px', borderRadius: '9999px' }}
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
              background: 'rgba(0, 0, 0, 0.15)',
              padding: '2px',
              borderRadius: '9999px',
              gap: '2px'
            }}
          >
            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'excel' ? 'none' : 'excel')}
              className="frosted-btn"
              title="Excel 表格伪装 [Alt+E]"
              style={{
                padding: '4px 7px',
                borderRadius: '9999px',
                background: chameleonMode === 'excel' ? '#107c41' : 'transparent',
                color: chameleonMode === 'excel' ? '#fff' : 'var(--text-secondary)',
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
                padding: '4px 7px',
                borderRadius: '9999px',
                background: chameleonMode === 'vscode' ? '#007acc' : 'transparent',
                color: chameleonMode === 'vscode' ? '#fff' : 'var(--text-secondary)',
                border: 'none'
              }}
            >
              <Code2 size={13} />
            </button>
            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'stickynote' ? 'none' : 'stickynote')}
              className="frosted-btn"
              title="便签备忘录伪装"
              style={{
                padding: '4px 7px',
                borderRadius: '9999px',
                background: chameleonMode === 'stickynote' ? '#d97706' : 'transparent',
                color: chameleonMode === 'stickynote' ? '#fff' : 'var(--text-secondary)',
                border: 'none'
              }}
            >
              <StickyNote size={13} />
            </button>
            <button
              onClick={() => onChangeChameleonMode(chameleonMode === 'ticker' ? 'none' : 'ticker')}
              className="frosted-btn"
              title="24px 极简单行状态条 [Alt+1]"
              style={{
                padding: '4px 7px',
                borderRadius: '9999px',
                background: chameleonMode === 'ticker' ? 'var(--accent-color)' : 'transparent',
                color: chameleonMode === 'ticker' ? '#fff' : 'var(--text-secondary)',
                border: 'none'
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
              padding: '5px 7px',
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
            style={{ padding: '5px 7px', borderRadius: '9999px' }}
          >
            <Minus size={13} />
          </button>
          <button
            onClick={() => windowControls.toggleMaximize()}
            className="frosted-btn"
            title="最大化"
            style={{ padding: '5px 7px', borderRadius: '9999px' }}
          >
            <Square size={11} />
          </button>
          <button
            onClick={() => windowControls.close()}
            className="frosted-btn"
            title="关闭"
            style={{ padding: '5px 7px', borderRadius: '9999px' }}
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
