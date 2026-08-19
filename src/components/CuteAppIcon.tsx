import React from 'react';

interface CuteAppIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const CuteAppIcon: React.FC<CuteAppIconProps> = ({ size = 26, className = '', style = {}, onClick }) => {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        position: 'relative',
        borderRadius: `${Math.round(size * 0.28)}px`,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        border: '1px solid var(--glass-border)',
        background: '#fef3c7',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
        ...style
      }}
      data-tooltip="摸鱼阅读 · 专为高效摸鱼打造"
      data-tooltip-pos="bottom"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.12) rotate(-4deg)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
      }}
    >
      <img
        src="/moyu_logo.png"
        alt="摸鱼阅读"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
    </div>
  );
};
