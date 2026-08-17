import React from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { FrostedSelect } from './FrostedSelect';

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
  const rateOptions = [
    { label: '0.8x 慢速', value: 0.8 },
    { label: '1.0x 原速', value: 1.0 },
    { label: '1.25x 适中', value: 1.25 },
    { label: '1.5x 快速', value: 1.5 },
    { label: '2.0x 极速', value: 2.0 }
  ];

  return (
    <div
      className="ios-floating-bar animate-ios-spring tauri-no-drag"
      style={{
        position: 'absolute',
        top: '56px',
        right: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 12px',
        fontSize: '12px',
        zIndex: 600
      }}
    >
      <Volume2 size={14} style={{ color: 'var(--accent-color)' }} />
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>TTS 听书</span>

      {isPlaying ? (
        <button onClick={onPause} className="frosted-btn" style={{ padding: '3px 6px', borderRadius: '8px' }}>
          <Pause size={12} />
        </button>
      ) : (
        <button onClick={onPlay} className="frosted-btn" style={{ padding: '3px 6px', borderRadius: '8px' }}>
          <Play size={12} />
        </button>
      )}

      <button onClick={onStop} className="frosted-btn" style={{ padding: '3px 6px', borderRadius: '8px' }}>
        <Square size={12} />
      </button>

      {/* Frosted Speed Selector */}
      <div style={{ width: '100px' }}>
        <FrostedSelect
          options={rateOptions}
          value={rate}
          onChange={(val) => onChangeRate(Number(val))}
          width={100}
        />
      </div>
    </div>
  );
};
