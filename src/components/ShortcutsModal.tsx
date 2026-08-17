import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: '阅读与翻页',
      items: [
        { key: 'Space', desc: '开启 / 暂停自动滚屏' },
        { key: '← / →', desc: '上一章 / 下一章' },
        { key: 'J / K', desc: '极客翻页 (下一章 / 上一章)' },
        { key: 'PageUp / PageDown', desc: '快速上下滚屏' }
      ]
    },
    {
      category: '办公隐蔽与伪装',
      items: [
        { key: 'Alt + `', desc: '极速老板键 (0ms 瞬间隐身/唤醒)' },
        { key: 'Alt + E', desc: '一键进入 / 退出 Excel 表格伪装' },
        { key: 'Alt + C', desc: '一键进入 / 退出 VS Code 代码伪装' },
        { key: 'Alt + I', desc: '一键进入 / 退出 IntelliJ IDEA 伪装' },
        { key: 'Alt + 1', desc: '一键切换为 24px 极简单行状态条' },
        { key: 'Esc', desc: '退出任何伪装模式 / 关闭侧边栏' }
      ]
    },
    {
      category: '控制与导航',
      items: [
        { key: 'Alt + M', desc: '打开 / 关闭侧边控制中心' },
        { key: 'Ctrl + F', desc: '全局搜书 / 书源管理' },
        { key: '?', desc: '打开快捷键指引' }
      ]
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="frosted-panel animate-ios-spring"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '24px',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          border: '1px solid var(--glass-border-hover)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Keyboard size={16} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                全局快捷键指南
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                高效率摸鱼与阅读键盘操作
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="frosted-btn"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Command size={12} />
                <span>{group.category}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      borderRadius: '10px',
                      background: 'var(--glass-surface)',
                      border: '1px solid var(--glass-border)',
                      fontSize: '12px'
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{item.desc}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'var(--glass-surface-active)',
                        border: '1px solid var(--glass-border-hover)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {item.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
