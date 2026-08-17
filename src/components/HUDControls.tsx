import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ThemeConfig } from '../types/reader';

interface HUDControlsProps {
  currentChapterIndex: number;
  totalChapters: number;
  progressPercent: number;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onJumpChapter: (index: number) => void;
  themeConfig: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
  isTTSPlaying: boolean;
  onToggleTTS: () => void;
}

export const HUDControls: React.FC<HUDControlsProps> = ({
  currentChapterIndex,
  totalChapters,
  onPrevChapter,
  onNextChapter,
  onJumpChapter,
  themeConfig,
  onUpdateTheme,
  isTTSPlaying,
  onToggleTTS
}) => {
  return (
    <div
      className="liquid-glass-panel animate-spring-in tauri-no-drag"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 16px',
        borderRadius: '9999px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        zIndex: 500,
        maxWidth: '90vw'
      }}
    >
      {/* Previous / Next Chapter */}
      <button
        onClick={onPrevChapter}
        disabled={currentChapterIndex <= 0}
        className="liquid-glass-btn"
        style={{ padding: '4px 8px', borderRadius: '8px' }}
        title="上一章 ([)"
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
          style={{ width: '100px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '45px', textAlign: 'right' }}>
          {currentChapterIndex + 1}/{totalChapters}
        </span>
      </div>

      <button
        onClick={onNextChapter}
        disabled={currentChapterIndex >= totalChapters - 1}
        className="liquid-glass-btn"
        style={{ padding: '4px 8px', borderRadius: '8px' }}
        title="下一章 (])"
      >
        <span style={{ fontSize: '11px' }}>下一章</span>
        <ChevronRight size={14} />
      </button>

      {/* Separator */}
      <div style={{ width: '1px', height: '16px', background: 'var(--glass-border-color)' }} />

      {/* Font Size Quick Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() =>
            onUpdateTheme({ ...themeConfig, fontSize: Math.max(11, themeConfig.fontSize - 1) })
          }
          className="liquid-glass-btn"
          style={{ padding: '3px 7px', fontSize: '11px' }}
          title="缩小字号"
        >
          A-
        </button>
        <button
          onClick={() =>
            onUpdateTheme({ ...themeConfig, fontSize: Math.min(32, themeConfig.fontSize + 1) })
          }
          className="liquid-glass-btn"
          style={{ padding: '3px 7px', fontSize: '11px' }}
          title="放大字号"
        >
          A+
        </button>
      </div>

      {/* TTS Speech Trigger */}
      <button
        onClick={onToggleTTS}
        className="liquid-glass-btn"
        style={{
          padding: '4px 8px',
          borderRadius: '8px',
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
        className="liquid-glass-btn"
        style={{ padding: '4px 8px', borderRadius: '8px' }}
        title="切换深浅主题"
      >
        {themeConfig.themePreset === 'dark-oled' ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
};
