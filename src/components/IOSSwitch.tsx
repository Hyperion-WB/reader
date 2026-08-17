import React from 'react';

interface IOSSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const IOSSwitch: React.FC<IOSSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md'
}) => {
  const isSm = size === 'sm';
  const width = isSm ? 38 : 46;
  const height = isSm ? 22 : 26;
  const thumbSize = isSm ? 18 : 22;
  const translate = isSm ? 16 : 20;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: `${width}px`,
        height: `${height}px`,
        padding: '2px',
        borderRadius: '9999px',
        background: checked ? 'var(--accent-color, #0a84ff)' : 'rgba(120, 120, 128, 0.28)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'background-color 0.25s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease',
        boxShadow: checked
          ? '0 0 12px rgba(10, 132, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
          : 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Moving iOS Thumb */}
      <span
        style={{
          width: `${thumbSize}px`,
          height: `${thumbSize}px`,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.35), 0 0 1px rgba(0, 0, 0, 0.2)',
          transform: checked ? `translateX(${translate}px)` : 'translateX(0px)',
          transition: 'transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1), width 0.18s ease',
          pointerEvents: 'none'
        }}
      />
    </button>
  );
};
