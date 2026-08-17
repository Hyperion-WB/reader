import React from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';

interface TTSBarProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  rate: number;
  onChangeRate: (rate: number) => void;
}

export const TTSBar: React.FC<TTSBarProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  rate,
  onChangeRate
}) => {
  return (
    <div
      className="liquid-glass-panel animate-spring-in tauri-no-drag"
      style={{
        position: 'absolute',
        top: '52px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        zIndex: 600
      }}
    >
      <Volume2 size={14} style={{ color: 'var(--accent-color)' }} />
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>TTS 听书</span>

      {isPlaying ? (
        <button onClick={onPause} className="liquid-glass-btn" style={{ padding: '3px 6px' }}>
          <Pause size={12} />
        </button>
      ) : (
        <button onClick={onPlay} className="liquid-glass-btn" style={{ padding: '3px 6px' }}>
          <Play size={12} />
        </button>
      )}

      <button onClick={onStop} className="liquid-glass-btn" style={{ padding: '3px 6px' }}>
        <Square size={12} />
      </button>

      {/* Speed Selector */}
      <select
        value={rate}
        onChange={(e) => onChangeRate(Number(e.target.value))}
        className="liquid-glass-input"
        style={{ padding: '2px 6px', fontSize: '11px', width: '65px' }}
      >
        <option value={0.8} style={{ background: '#222', color: '#fff' }}>0.8x</option>
        <option value={1.0} style={{ background: '#222', color: '#fff' }}>1.0x</option>
        <option value={1.25} style={{ background: '#222', color: '#fff' }}>1.25x</option>
        <option value={1.5} style={{ background: '#222', color: '#fff' }}>1.5x</option>
        <option value={2.0} style={{ background: '#222', color: '#fff' }}>2.0x</option>
      </select>
    </div>
  );
};
