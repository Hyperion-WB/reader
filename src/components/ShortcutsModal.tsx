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
      category: '双阅读模式与操作',
      items: [
        { key: 'D / → / Space', desc: '翻页模式：翻向下一页' },
        { key: 'A / ←', desc: '翻页模式：翻向上一页' },
        { key: 'Space 空格', desc: '滚动模式：开启 / 暂停自动滚屏' },
        { key: '] / J', desc: '快速跳转至下一章' },
        { key: '[ / K', desc: '快速跳转至上一章' },
        { key: 'PageUp / PageDn', desc: '快速上下滚屏 / 翻页' },
        { key: 'Ctrl + + / -', desc: '快速放大 / 缩小阅读字号' },
        { key: 'Ctrl + F', desc: '呼出正文全文关键词搜索条' }
      ]
    },
    {
      category: '10 大办公摸鱼伪装',
      items: [
        { key: 'Alt + `', desc: '0ms 老板键 (瞬间抹除隐身 / 唤回)' },
        { key: 'Alt + E', desc: 'Excel 365 商业统计表格' },
        { key: 'Alt + W', desc: 'Word 经典商务公文排版' },
        { key: 'Alt + O', desc: 'Outlook 商务邮件客户端' },
        { key: 'Alt + C', desc: '企业微信 / 钉钉群聊消息流' },
        { key: 'Alt + V', desc: 'VS Code 编辑器代码模式' },
        { key: 'Alt + I', desc: 'IntelliJ IDEA 工程模式' },
        { key: 'Alt + P', desc: 'PowerPoint 汇报幻灯片' },
        { key: 'Alt + N', desc: '桌面便利贴小贴片' },
        { key: 'Alt + T', desc: '24px 极窄底部股票行情条' },
        { key: 'Esc', desc: '退出任何伪装模式 / 关闭侧边栏' }
      ]
    },
    {
      category: '控制中心与窗口',
      items: [
        { key: 'Alt + M', desc: '打开 / 关闭控制中心 (书架/目录/搜书)' },
        { key: 'F1 / ?', desc: '随时查看本快捷键指南' },
        { key: '拖拽顶栏', desc: '任意移动无边框悬浮小窗位置' }
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
