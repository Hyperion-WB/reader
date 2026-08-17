import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0
  });

  const selectedOption = options.find((opt) => opt.value === value);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest('.frosted-select-portal')
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative', width: typeof width === 'number' ? `${width}px` : width, userSelect: 'none' }}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
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

      {/* Popover rendered via React Portal to Document Body (100% Immune to Stacking Context Issues) */}
      {isOpen &&
        createPortal(
          <div
            className="frosted-select-portal animate-ios-spring"
            style={{
              position: 'fixed',
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              width: `${popoverPos.width}px`,
              maxHeight: '230px',
              overflowY: 'auto',
              borderRadius: '14px',
              padding: '5px',
              boxSizing: 'border-box',
              background: 'var(--bg-app)',
              backdropFilter: 'blur(36px) saturate(200%)',
              WebkitBackdropFilter: 'blur(36px) saturate(200%)',
              zIndex: 999999,
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35), 0 2px 10px rgba(0, 0, 0, 0.15)',
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
          </div>,
          document.body
        )}
    </div>
  );
};
