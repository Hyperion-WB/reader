import React, { useState, useEffect } from 'react';
import { Chapter } from '../../types/reader';

interface PdfModeProps {
  currentChapter?: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const PdfMode: React.FC<PdfModeProps> = ({
  currentChapter,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [pageIndex, setPageIndex] = useState(0);

  const paragraphs = currentChapter?.content
    ? currentChapter.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : ['(Abstract text not available)'];

  const parasPerPage = 10;
  const totalPages = Math.ceil(paragraphs.length / parasPerPage) || 1;
  const currentParas = paragraphs.slice(pageIndex * parasPerPage, (pageIndex + 1) * parasPerPage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'PageDown' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (pageIndex + 1 < totalPages) {
          setPageIndex((p) => p + 1);
        } else {
          onNextChapter();
          setPageIndex(0);
        }
      } else if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (pageIndex > 0) {
          setPageIndex((p) => p - 1);
        } else {
          onPrevChapter();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageIndex, totalPages, onExit, onNextChapter, onPrevChapter]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        background: '#525659',
        color: '#222222',
        fontFamily: '"Times New Roman", "SimSun", serif',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Top Acrobat Dark Toolbar */}
      <div
        data-tauri-drag-region="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#323639',
          color: '#f1f1f1',
          height: '34px',
          padding: '0 12px',
          fontSize: '12px'
        }}
      >
        <div data-tauri-drag-region="true" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, color: '#ff4d4f' }}>PDF</span>
          <span style={{ fontSize: '11.5px', color: '#e0e0e0' }}>
            [IEEE_Trans_2026] 基于大规模分布式神经网络架构的协同调度优化研究.pdf
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: '#aaa' }}>
            {pageIndex + 1} / {totalPages}
          </span>
          <span style={{ fontSize: '11px', color: '#aaa' }}>100%</span>
          <button
            onClick={onExit}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            退出 (Esc)
          </button>
        </div>
      </div>

      {/* Main Academic Paper Workspace */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 10px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '820px',
            background: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            padding: '36px 44px',
            boxSizing: 'border-box',
            fontSize: '13px',
            lineHeight: '1.7',
            color: '#111111'
          }}
        >
          {/* Paper Title & Authors */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '17px', margin: '0 0 8px 0', fontFamily: 'serif', fontWeight: 'bold' }}>
              {currentChapter ? currentChapter.title : 'Research on Distributed Computing Architecture'}
            </h2>
            <div style={{ fontSize: '11.5px', color: '#555', fontStyle: 'italic' }}>
              Institute of Advanced Computer Science, State Key Laboratory of High Performance Computing
            </div>
          </div>

          {/* Abstract Box */}
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              padding: '10px 14px',
              fontSize: '11.5px',
              marginBottom: '16px',
              lineHeight: '1.5'
            }}
          >
            <strong>Abstract: </strong>
            本文针对分布式多节点环境下的自适应调度展开深入研究，提出了一种高并发低延迟的流式计算模型。理论分析与仿真测试表明，该方法能够显著提升吞吐量并减少资源开销。
            <br />
            <strong>Keywords: </strong> Distributed Systems, Stream Processing, Neural Scheduling.
          </div>

          {/* Double Column or Standard Body */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                1. 理论模型与算法推导
              </div>
              {currentParas.slice(0, Math.ceil(currentParas.length / 2)).map((p, idx) => (
                <p key={idx} style={{ margin: 0, textIndent: '1.5em', textAlign: 'justify' }}>
                  {p}
                </p>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                2. 实验仿真与数据分析
              </div>
              {currentParas.slice(Math.ceil(currentParas.length / 2)).map((p, idx) => (
                <p key={idx} style={{ margin: 0, textIndent: '1.5em', textAlign: 'justify' }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
