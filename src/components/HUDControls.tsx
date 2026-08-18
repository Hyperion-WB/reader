import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Play,
  Pause,
  HelpCircle
} from 'lucide-react';
import { ThemeConfig } from '../types/reader';

interface HUDControlsProps {
  isVisible?: boolean;
  onHoverChange?: (hovered: boolean) => void;
  currentChapterIndex: number;
  totalChapters: number;
  progressPercent: number;
  wordCount: number;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onJumpChapter: (index: number) => void;
  themeConfig: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
  isTTSPlaying: boolean;
  onToggleTTS: () => void;
  isAutoScrolling: boolean;
  onToggleAutoScroll: () => void;
  onOpenShortcuts: () => void;
}

export const HUDControls: React.FC<HUDControlsProps> = ({
  isVisible = true,
  onHoverChange,
  currentChapterIndex,
  totalChapters,
  wordCount,
  onPrevChapter,
  onNextChapter,
  onJumpChapter,
  themeConfig,
  onUpdateTheme,
  isTTSPlaying,
  onToggleTTS,
  isAutoScrolling,
  onToggleAutoScroll,
  onOpenShortcuts
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isNarrowScreen = windowWidth < 600;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'clamp(28px, 4.5vh, 42px)',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 500,
        padding: '0 14px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="ios-floating-bar tauri-no-drag"
        onMouseEnter={() => onHoverChange?.(true)}
        onMouseLeave={() => onHoverChange?.(false)}
        style={{
          pointerEvents: isVisible ? 'auto' : 'none',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.94)',
          display: 'flex',
          flexDirection: isNarrowScreen ? 'column' : 'row',
          alignItems: 'center',
          gap: isNarrowScreen ? '6px' : 'clamp(3px, 1vw, 7px)',
          padding: isNarrowScreen ? '8px 14px' : '6px clamp(8px, 1.2vw, 14px)',
          maxWidth: 'calc(100vw - 28px)',
          borderRadius: isNarrowScreen ? '20px' : '9999px',
          boxShadow: isVisible
            ? '0 18px 48px rgba(0, 0, 0, 0.44), 0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
            : 'none',
          transition: 'all 0.35s cubic-bezier(0.2, 0.9, 0.1, 1)'
        }}
      >
        {/* Row 1: Chapter Slider & Prev / Next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: isNarrowScreen ? '100%' : 'auto', justifyContent: 'center' }}>
          <button
            onClick={onPrevChapter}
            disabled={currentChapterIndex <= 0}
            className="frosted-btn"
            style={{ padding: '4px 8px', borderRadius: '9999px', flexShrink: 0 }}
            title="上一章 ([ 或 ←)"
          >
            <ChevronLeft size={13} />
            <span style={{ fontSize: '11px' }}>上一章</span>
          </button>

          {/* Chapter Slider & Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: isNarrowScreen ? 1 : 'none' }}>
            <input
              type="range"
              min="0"
              max={Math.max(0, totalChapters - 1)}
              value={currentChapterIndex}
              onChange={(e) => onJumpChapter(Number(e.target.value))}
              style={{
                width: isNarrowScreen ? '100%' : 'clamp(40px, 8vw, 85px)',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '38px', textAlign: 'right' }}>
              {currentChapterIndex + 1}/{totalChapters}
            </span>
          </div>

          <button
            onClick={onNextChapter}
            disabled={currentChapterIndex >= totalChapters - 1}
            className="frosted-btn"
            style={{ padding: '4px 8px', borderRadius: '9999px', flexShrink: 0 }}
            title="下一章 (] 或 →)"
          >
            <span style={{ fontSize: '11px' }}>下一章</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Separator for Wide Screen */}
        {!isNarrowScreen && (
          <div style={{ width: '1px', height: '14px', background: 'var(--glass-border)', flexShrink: 0 }} />
        )}

        {/* Row 2: Reading Actions (Auto-Scroll, Font Zoom, TTS, Theme, Help) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isNarrowScreen ? '6px' : '4px',
            width: isNarrowScreen ? '100%' : 'auto',
            justifyContent: isNarrowScreen ? 'space-between' : 'flex-start',
            paddingTop: isNarrowScreen ? '4px' : '0',
            borderTop: isNarrowScreen ? '1px solid var(--glass-border)' : 'none'
          }}
        >
          {/* Auto Scroll Toggle */}
          <button
            onClick={onToggleAutoScroll}
            className="frosted-btn"
            style={{
              padding: '4px 8px',
              borderRadius: '9999px',
              background: isAutoScrolling ? 'var(--accent-color)' : 'transparent',
              color: isAutoScrolling ? '#ffffff' : 'var(--text-primary)',
              boxShadow: isAutoScrolling ? 'var(--accent-glow)' : 'none',
              flexShrink: 0
            }}
            title="自动滚屏阅读 (快捷键: 空格 Space)"
          >
            {isAutoScrolling ? <Pause size={12} /> : <Play size={12} />}
            <span style={{ fontSize: '11px' }}>{isAutoScrolling ? '滚屏中' : '自动滚屏'}</span>
          </button>

          {/* Font Size Quick Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <button
              onClick={() =>
                onUpdateTheme({ ...themeConfig, fontSize: Math.max(11, themeConfig.fontSize - 1) })
              }
              className="frosted-btn"
              style={{ padding: '3px 6px', fontSize: '11px', borderRadius: '9999px' }}
              title="缩小字号 (A-)"
            >
              A-
            </button>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '18px', textAlign: 'center' }}>
              {themeConfig.fontSize}
            </span>
            <button
              onClick={() =>
                onUpdateTheme({ ...themeConfig, fontSize: Math.min(36, themeConfig.fontSize + 1) })
              }
              className="frosted-btn"
              style={{ padding: '3px 6px', fontSize: '11px', borderRadius: '9999px' }}
              title="放大字号 (A+)"
            >
              A+
            </button>
          </div>

          {/* Chapter Word Count Badge */}
          {wordCount > 0 && !isNarrowScreen && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                padding: '2px 5px',
                background: 'var(--glass-surface)',
                borderRadius: '6px',
                border: '1px solid var(--glass-border)',
                flexShrink: 0
              }}
            >
              {wordCount > 10000 ? `${(wordCount / 10000).toFixed(1)}万字` : `${wordCount}字`}
            </span>
          )}

          {/* TTS Speech Trigger */}
          <button
            onClick={onToggleTTS}
            className="frosted-btn"
            style={{
              padding: '4px 6px',
              borderRadius: '9999px',
              color: isTTSPlaying ? 'var(--accent-color)' : 'var(--text-primary)',
              flexShrink: 0
            }}
            title={isTTSPlaying ? '停止朗读' : '开启静默朗读听书'}
          >
            {isTTSPlaying ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          {/* Quick Theme Toggle (Day / Dark) */}
          <button
            onClick={() =>
              onUpdateTheme({
                ...themeConfig,
                themePreset: themeConfig.themePreset === 'dark-oled' ? 'day-glass' : 'dark-oled'
              })
            }
            className="frosted-btn"
            style={{ padding: '4px 6px', borderRadius: '9999px', flexShrink: 0 }}
            title="切换深浅主题"
          >
            {themeConfig.themePreset === 'dark-oled' ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {/* Shortcuts Modal Guide Button */}
          <button
            onClick={onOpenShortcuts}
            className="frosted-btn"
            style={{ padding: '4px 6px', borderRadius: '9999px', color: 'var(--text-secondary)', flexShrink: 0 }}
            title="快捷键指引 (?)"
          >
            <HelpCircle size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
