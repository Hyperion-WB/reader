import React from 'react';
import {
  Shield,
  BookOpen,
  Keyboard,
  CheckCircle,
  Move,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
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
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="frosted-panel animate-ios-spring"
        style={{
          width: '540px',
          maxWidth: '92vw',
          maxHeight: '88vh',
          borderRadius: '24px',
          padding: '24px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/moyu_logo.png"
            alt="摸鱼阅读"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              objectFit: 'cover',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              border: 'none',
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              欢迎使用 摸鱼阅读
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              通透磨砂玻璃 · 全格式小说与漫画 · 10 大办公摸鱼伪装系统
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          <div className="frosted-card" style={{ padding: '12px', borderRadius: '14px', display: 'flex', gap: '10px' }}>
            <Layers size={18} style={{ color: 'var(--accent-color)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>亚克力通透磨砂</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                极简无边框悬浮小窗，磨砂模糊度与透明度随意调节。
              </div>
            </div>
          </div>

          <div className="frosted-card" style={{ padding: '12px', borderRadius: '14px', display: 'flex', gap: '10px' }}>
            <Shield size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>10 大办公摸鱼伪装</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                一键秒变 Excel、Word、Outlook、企微群聊、VSCode、IDEA 等。
              </div>
            </div>
          </div>

          <div className="frosted-card" style={{ padding: '12px', borderRadius: '14px', display: 'flex', gap: '10px' }}>
            <ImageIcon size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>小说 + 漫画多格式支持</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                支持 TXT、EPUB、Markdown 以及 ZIP/CBZ 漫画图集高清连续流。
              </div>
            </div>
          </div>

          <div className="frosted-card" style={{ padding: '12px', borderRadius: '14px', display: 'flex', gap: '10px' }}>
            <BookOpen size={18} style={{ color: '#8b5cf6', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>经典背景与自定义壁纸</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                内置 9 大护眼纸张质感，支持上传本地图片作为阅读毛玻璃壁纸。
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operation & Keyboard Guide */}
        <div className="frosted-card" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Keyboard size={15} style={{ color: 'var(--accent-color)' }} />
            <span>核心效率快捷键与手势</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>老板键 0ms 隐形</span>
              <kbd style={{ background: 'var(--glass-surface-active)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Alt + `</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>打开控制中心菜单</span>
              <kbd style={{ background: 'var(--glass-surface-active)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Alt + M</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>开始 / 暂停自动滚屏</span>
              <kbd style={{ background: 'var(--glass-surface-active)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Space 空格</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>上一章 / 下一章</span>
              <kbd style={{ background: 'var(--glass-surface-active)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>[ / ] 或 J / K</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>移动小窗位置</span>
              <span style={{ color: 'var(--accent-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Move size={11} /> 拖住顶栏横条
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>切换 10 大伪装</span>
              <kbd style={{ background: 'var(--glass-surface-active)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Alt+E / W / O...</kbd>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="frosted-btn frosted-btn-primary"
          style={{
            padding: '10px',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '4px'
          }}
        >
          <CheckCircle size={16} />
          <span>开始我的沉浸阅读之旅</span>
        </button>
      </div>
    </div>
  );
};
