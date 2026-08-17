import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface FrostedSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  width?: string | number;
  placeholder?: string;
}

export const FrostedSelect: React.FC<FrostedSelectProps> = ({
  options,
  value,
  onChange,
  width = '100%',
  placeholder = '请选择...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        userSelect: 'none',
        zIndex: isOpen ? 1000 : 1
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="frosted-btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderRadius: '12px',
          background: isOpen ? 'var(--glass-surface-active)' : 'var(--glass-surface)',
          border: isOpen ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
          fontSize: '12.5px',
          color: 'var(--text-primary)',
          boxSizing: 'border-box',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 12px rgba(10, 132, 255, 0.25)' : 'none'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s var(--ios-spring)',
            color: 'var(--text-secondary)',
            flexShrink: 0,
            marginLeft: '8px'
          }}
        />
      </button>

      {/* Frosted Dropdown Popover (Rendered above everything) */}
      {isOpen && (
        <div
          className="animate-ios-spring"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            maxHeight: '220px',
            overflowY: 'auto',
            borderRadius: '14px',
            padding: '5px',
            boxSizing: 'border-box',
            background: 'var(--glass-surface-active)',
            backdropFilter: 'blur(32px) saturate(190%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%)',
            zIndex: 99999,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--glass-border-hover)'
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  background: isSelected ? 'var(--accent-color)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--glass-surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {option.icon}
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check size={13} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
