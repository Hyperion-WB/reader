import React, { useRef, useState, useEffect } from 'react';

export interface SegmentedItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface IOSSegmentedControlProps<T extends string> {
  items: SegmentedItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  height?: number;
  pillColor?: string;
  containerBg?: string;
}

export function IOSSegmentedControl<T extends string>({
  items,
  activeId,
  onChange,
  height = 36,
  pillColor = 'var(--accent-color)',
  containerBg = 'rgba(0, 0, 0, 0.16)'
}: IOSSegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0
  });

  const updateIndicator = () => {
    const activeEl = itemRefs.current[activeId];
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
        opacity: 1
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    // Small delay to handle fonts/layout settling
    const timer = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeId, items]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: containerBg,
        padding: '3px',
        borderRadius: '9999px',
        border: '1px solid var(--glass-border)',
        height: `${height}px`,
        boxSizing: 'border-box',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* The iOS Fluid Spring Sliding Pill Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '3px',
          bottom: '3px',
          left: 0,
          transform: `translateX(${indicatorStyle.left}px)`,
          width: `${indicatorStyle.width}px`,
          background: pillColor,
          borderRadius: '9999px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          opacity: indicatorStyle.opacity,
          transition:
            'transform 0.32s cubic-bezier(0.34, 1.36, 0.64, 1), width 0.28s cubic-bezier(0.34, 1.36, 0.64, 1), opacity 0.2s ease',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Segment Buttons */}
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={(el) => {
              itemRefs.current[item.id] = el;
            }}
            onClick={() => onChange(item.id)}
            style={{
              position: 'relative',
              zIndex: 2,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              height: '100%',
              padding: '0 8px',
              borderRadius: '9999px',
              border: 'none',
              background: 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              outline: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.22s ease, transform 0.15s ease'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {item.icon && <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
