import React from 'react';

interface CuteAppIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CuteAppIcon: React.FC<CuteAppIconProps> = ({ size = 32, className = '', style = {} }) => {
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style
      }}
    >
      <img
        src="/app-icon.svg"
        alt="Liquid Reader Icon"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: `${Math.round(size * 0.22)}px`,
          boxShadow: '0 4px 16px rgba(56, 189, 248, 0.25)'
        }}
      />
    </div>
  );
};
