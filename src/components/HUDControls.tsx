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
        bottom: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        zIndex: 500,
        maxWidth: '92vw',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)'
      }}
    >
      {/* Previous Chapter */}
      <button
        onClick={onPrevChapter}
        disabled={currentChapterIndex <= 0}
        className="frosted-btn"
        style={{ padding: '5px 9px', borderRadius: '9999px' }}
        title="上一章 ([ 或 ←)"
      >
        <ChevronLeft size={14} />
        <span style={{ fontSize: '11px' }}>上一章</span>
      </button>

      {/* Chapter Slider & Progress Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalChapters - 1)}
          value={currentChapterIndex}
          onChange={(e) => onJumpChapter(Number(e.target.value))}
          style={{ width: '90px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', minWidth: '42px', textAlign: 'right' }}>
          {currentChapterIndex + 1}/{totalChapters}
        </span>
      </div>

      {/* Next Chapter */}
      <button
        onClick={onNextChapter}
        disabled={currentChapterIndex >= totalChapters - 1}
        className="frosted-btn"
        style={{ padding: '5px 9px', borderRadius: '9999px' }}
        title="下一章 (] 或 →)"
      >
        <span style={{ fontSize: '11px' }}>下一章</span>
        <ChevronRight size={14} />
      </button>

      {/* Separator */}
      <div style={{ width: '1px', height: '16px', background: 'var(--glass-border)' }} />

      {/* Auto Scroll Toggle */}
      <button
        onClick={onToggleAutoScroll}
        className="frosted-btn"
        style={{
          padding: '5px 10px',
          borderRadius: '9999px',
          background: isAutoScrolling ? 'var(--accent-color)' : 'transparent',
          color: isAutoScrolling ? '#ffffff' : 'var(--text-primary)',
          boxShadow: isAutoScrolling ? 'var(--accent-glow)' : 'none'
        }}
        title="自动滚屏阅读 (快捷键: 空格 Space)"
      >
        {isAutoScrolling ? <Pause size={13} /> : <Play size={13} />}
        <span style={{ fontSize: '11px' }}>{isAutoScrolling ? '滚屏中' : '自动滚屏'}</span>
      </button>

      {/* Font Size Quick Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <button
          onClick={() =>
            onUpdateTheme({ ...themeConfig, fontSize: Math.max(11, themeConfig.fontSize - 1) })
          }
          className="frosted-btn"
          style={{ padding: '4px 7px', fontSize: '11px', borderRadius: '9999px' }}
          title="缩小字号 (A-)"
        >
          A-
        </button>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '22px', textAlign: 'center' }}>
          {themeConfig.fontSize}
        </span>
        <button
          onClick={() =>
            onUpdateTheme({ ...themeConfig, fontSize: Math.min(32, themeConfig.fontSize + 1) })
          }
          className="frosted-btn"
          style={{ padding: '4px 7px', fontSize: '11px', borderRadius: '9999px' }}
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
            border: '1px solid var(--glass-border)'
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
          padding: '5px 8px',
          borderRadius: '9999px',
          color: isTTSPlaying ? 'var(--accent-color)' : 'var(--text-primary)'
        }}
        title={isTTSPlaying ? '停止朗读' : '开启静默朗读听书'}
      >
        {isTTSPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
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
        style={{ padding: '5px 8px', borderRadius: '9999px' }}
        title="切换深浅主题"
      >
        {themeConfig.themePreset === 'dark-oled' ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      {/* Shortcuts Modal Guide Button */}
      <button
        onClick={onOpenShortcuts}
        className="frosted-btn"
        style={{ padding: '5px 8px', borderRadius: '9999px', color: 'var(--text-secondary)' }}
        title="快捷键指引 (?)"
      >
        <HelpCircle size={14} />
      </button>
    </div>
  );
};
