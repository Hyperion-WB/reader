import React from 'react';
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
  return (
    <div
      className="ios-floating-bar animate-ios-spring tauri-no-drag"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(4px, 1vw, 8px)',
        padding: '5px clamp(8px, 1.5vw, 14px)',
        zIndex: 500,
        maxWidth: 'calc(100vw - 24px)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)'
      }}
    >
      {/* Previous Chapter */}
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

      {/* Chapter Slider & Progress Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalChapters - 1)}
          value={currentChapterIndex}
          onChange={(e) => onJumpChapter(Number(e.target.value))}
          style={{ width: 'clamp(50px, 8vw, 90px)', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '38px', textAlign: 'right' }}>
          {currentChapterIndex + 1}/{totalChapters}
        </span>
      </div>

      {/* Next Chapter */}
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

      {/* Separator */}
      <div style={{ width: '1px', height: '14px', background: 'var(--glass-border)', flexShrink: 0 }} />

      {/* Auto Scroll Toggle */}
      <button
        onClick={onToggleAutoScroll}
        className="frosted-btn"
        style={{
          padding: '4px 9px',
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
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '20px', textAlign: 'center' }}>
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
      {wordCount > 0 && (
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            padding: '2px 6px',
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
          padding: '4px 7px',
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
        style={{ padding: '4px 7px', borderRadius: '9999px', flexShrink: 0 }}
        title="切换深浅主题"
      >
        {themeConfig.themePreset === 'dark-oled' ? <Sun size={13} /> : <Moon size={13} />}
      </button>

      {/* Shortcuts Modal Guide Button */}
      <button
        onClick={onOpenShortcuts}
        className="frosted-btn"
        style={{ padding: '4px 7px', borderRadius: '9999px', color: 'var(--text-secondary)', flexShrink: 0 }}
        title="快捷键指引 (?)"
      >
        <HelpCircle size={13} />
      </button>
    </div>
  );
};
