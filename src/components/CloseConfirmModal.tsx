import React, { useState } from 'react';
import {
  Minimize2,
  Power,
  CheckCircle2,
  X
} from 'lucide-react';

interface CloseConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (action: 'tray' | 'exit', remember: boolean) => void;
}

export const CloseConfirmModal: React.FC<CloseConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm
}) => {
  const [selectedAction, setSelectedAction] = useState<'tray' | 'exit'>('tray');
  const [rememberChoice, setRememberChoice] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onCancel}
    >
      <div
        className="frosted-panel tauri-no-drag animate-ios-spring"
        style={{
          width: '420px',
          maxWidth: 'calc(100vw - 32px)',
          borderRadius: '24px',
          padding: '24px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/moyu_logo.png"
              alt="摸鱼阅读"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                关闭摸鱼阅读
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                请选择您希望执行的操作
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="frosted-btn"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Option 1: Minimize to Tray */}
          <div
            onClick={() => setSelectedAction('tray')}
            className="frosted-card"
            style={{
              padding: '12px 14px',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              border: selectedAction === 'tray' ? '1.5px solid var(--accent-color)' : '1px solid var(--glass-border)',
              background: selectedAction === 'tray' ? 'rgba(56, 189, 248, 0.12)' : 'var(--glass-surface)',
              transition: 'all 0.2s ease'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: selectedAction === 'tray' ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedAction === 'tray' ? '#ffffff' : 'var(--text-secondary)',
                flexShrink: 0,
                marginTop: '2px'
              }}
            >
              <Minimize2 size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  最小化到系统托盘 (推荐)
                </span>
                {selectedAction === 'tray' && <CheckCircle2 size={16} style={{ color: 'var(--accent-color)' }} />}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>
                保持后台运行，随时可通过老板键 <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', fontSize: '10px' }}>Alt + `</kbd> 极速唤回。
              </div>
            </div>
          </div>

          {/* Option 2: Exit Application */}
          <div
            onClick={() => setSelectedAction('exit')}
            className="frosted-card"
            style={{
              padding: '12px 14px',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              border: selectedAction === 'exit' ? '1.5px solid #ef4444' : '1px solid var(--glass-border)',
              background: selectedAction === 'exit' ? 'rgba(239, 68, 68, 0.12)' : 'var(--glass-surface)',
              transition: 'all 0.2s ease'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: selectedAction === 'exit' ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedAction === 'exit' ? '#ffffff' : 'var(--text-secondary)',
                flexShrink: 0,
                marginTop: '2px'
              }}
            >
              <Power size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  彻底退出程序
                </span>
                {selectedAction === 'exit' && <CheckCircle2 size={16} style={{ color: '#ef4444' }} />}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>
                完全关闭摸鱼阅读并释放内存占用，下次需重新点击图标启动。
              </div>
            </div>
          </div>
        </div>

        {/* Remember Choice Checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            userSelect: 'none'
          }}
        >
          <input
            type="checkbox"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: 'var(--accent-color)' }}
          />
          <span>记住我的选择，以后不再提示 (可在控制中心【摸鱼设置】中修改)</span>
        </label>

        {/* Actions Footer */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            onClick={onCancel}
            className="frosted-btn"
            style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '12.5px' }}
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(selectedAction, rememberChoice)}
            className="frosted-btn primary"
            style={{
              padding: '8px 22px',
              borderRadius: '12px',
              fontSize: '12.5px',
              background: selectedAction === 'exit' ? '#ef4444' : 'var(--accent-color)',
              color: '#ffffff',
              fontWeight: 600,
              border: 'none',
              boxShadow: selectedAction === 'exit' ? '0 4px 14px rgba(239, 68, 68, 0.4)' : 'var(--accent-glow)'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
