import React, { useState, useEffect } from 'react';
import { Chapter } from '../../types/reader';
import { Files, Search, GitBranch, Play, Settings } from 'lucide-react';

interface VSCodeModeProps {
  currentChapter?: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const VSCodeMode: React.FC<VSCodeModeProps> = ({
  currentChapter,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [scrollIndex, setScrollIndex] = useState(0);

  const paragraphs = currentChapter?.content
    ? currentChapter.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : ['// No content loaded'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'j') {
        e.preventDefault();
        if (scrollIndex + 12 < paragraphs.length) {
          setScrollIndex((prev) => prev + 4);
        } else {
          onNextChapter();
          setScrollIndex(0);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (scrollIndex > 0) {
          setScrollIndex((prev) => Math.max(0, prev - 4));
        } else {
          onPrevChapter();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollIndex, paragraphs.length]);

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        background: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: '13px',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Left Activity Bar */}
      <div
        style={{
          width: '46px',
          background: '#333333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 0',
          gap: '20px',
          color: '#858585'
        }}
      >
        <Files size={20} color="#ffffff" style={{ borderLeft: '2px solid #ffffff', paddingLeft: '2px' }} />
        <Search size={20} />
        <GitBranch size={20} />
        <Play size={20} />
        <div style={{ marginTop: 'auto' }}>
          <Settings size={20} />
        </div>
      </div>

      {/* Main VSCode Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Tab Header */}
        <div
          className="tauri-drag-handle"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#252526',
            height: '35px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                background: '#1e1e1e',
                color: '#ffffff',
                padding: '8px 14px',
                fontSize: '12px',
                borderTop: '1px solid #007acc',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ color: '#519aba' }}>TS</span>
              <span>{`pipeline_service.ts - [${currentChapter?.title || 'Chapter'}]`}</span>
            </div>
            <div style={{ padding: '8px 14px', fontSize: '12px', color: '#969696' }}>
              <span style={{ color: '#dea584' }}>RS</span>
              <span style={{ marginLeft: '6px' }}>kernel_worker.rs</span>
            </div>
          </div>

          <div className="tauri-no-drag" style={{ paddingRight: '12px' }}>
            <button
              onClick={onExit}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#cccccc',
                padding: '2px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Exit Disguise (Esc)
            </button>
          </div>
        </div>

        {/* Code / Novel Content Display Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflowY: 'auto',
            padding: '12px 0',
            lineHeight: 1.6
          }}
        >
          {/* Line Numbers */}
          <div
            style={{
              width: '48px',
              textAlign: 'right',
              paddingRight: '16px',
              color: '#858585',
              fontSize: '12px'
            }}
          >
            {Array.from({ length: 45 }).map((_, i) => (
              <div key={i}>{i + 1 + scrollIndex}</div>
            ))}
          </div>

          {/* Fake Code with Integrated Chapter Narrative */}
          <div style={{ flex: 1, paddingRight: '20px' }}>
            <div style={{ color: '#c586c0' }}>
              import <span style={{ color: '#9cdcfe' }}>&#123; createEngine, DataBuffer &#125;</span> from{' '}
              <span style={{ color: '#ce9178' }}>'@core/engine'</span>;
            </div>
            <div style={{ color: '#6a9955', margin: '8px 0' }}>
              /**
              <br />
              &nbsp;* === CHAPTER CONTEXT PIPELINE: {currentChapter?.title || 'NARRATIVE'} ===
              <br />
              &nbsp;* Status: Running (Press Space/Arrow to advance line)
              <br />
              &nbsp;*/
            </div>
            <div style={{ color: '#569cd6' }}>
              export async function <span style={{ color: '#dcdcaa' }}>processStreamingBuffer</span>(): Promise&lt;
              <span style={{ color: '#4ec9b0' }}>void</span>&gt; &#123;
            </div>

            {/* Injected Paragraphs as Code Comments */}
            {paragraphs.slice(scrollIndex, scrollIndex + 25).map((para, idx) => (
              <div key={idx} style={{ margin: '4px 0 4px 18px', color: '#6a9955', fontSize: '13px' }}>
                <span style={{ color: '#6a9955' }}>// {para}</span>
              </div>
            ))}

            <div style={{ marginLeft: '18px', color: '#569cd6', marginTop: '10px' }}>
              await <span style={{ color: '#dcdcaa' }}>syncThreadMemory</span>();
            </div>
            <div style={{ color: '#569cd6' }}>&#125;</div>
          </div>
        </div>

        {/* Bottom VSCode Blue Status Bar */}
        <div
          style={{
            height: '22px',
            background: '#007acc',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            fontSize: '11px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>main*</span>
            <span>0 errors, 0 warnings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>{`Ln ${scrollIndex + 1}, Col 1`}</span>
            <span>UTF-8</span>
            <span>TypeScript</span>
            <span>Prettier</span>
          </div>
        </div>
      </div>
    </div>
  );
};
