import React, { useState, useEffect } from 'react';
import { Chapter } from '../../types/reader';

interface ExcelModeProps {
  currentChapter?: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const ExcelMode: React.FC<ExcelModeProps> = ({
  currentChapter,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 1, col: 1 });
  const [pageOffset, setPageOffset] = useState(0);

  const paragraphs = currentChapter?.content
    ? currentChapter.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : ['(暂无正文内容)'];

  const rowsPerPage = 20;
  const currentSlice = paragraphs.slice(pageOffset, pageOffset + rowsPerPage);

  const activeText = currentSlice[selectedCell.row - 1] || 'SELECT_DATA()';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (selectedCell.row < currentSlice.length) {
          setSelectedCell((prev) => ({ ...prev, row: prev.row + 1 }));
        } else if (pageOffset + rowsPerPage < paragraphs.length) {
          setPageOffset((prev) => prev + rowsPerPage);
          setSelectedCell({ row: 1, col: 1 });
        } else {
          onNextChapter();
          setPageOffset(0);
          setSelectedCell({ row: 1, col: 1 });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedCell.row > 1) {
          setSelectedCell((prev) => ({ ...prev, row: prev.row - 1 }));
        } else if (pageOffset > 0) {
          setPageOffset((prev) => Math.max(0, prev - rowsPerPage));
          setSelectedCell({ row: rowsPerPage, col: 1 });
        } else {
          onPrevChapter();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, pageOffset, paragraphs, currentSlice.length, onExit, onNextChapter, onPrevChapter]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        background: '#ffffff',
        color: '#222',
        fontFamily: '"Segoe UI", Tahoma, sans-serif',
        fontSize: '12px',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Top Green Ribbon Header */}
      <div
        className="tauri-drag-handle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#107c41',
          color: '#ffffff',
          height: '32px',
          padding: '0 12px',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600 }}>AutoSave [ON]</span>
          <span>Financial_Q3_Projection_Final_v4.xlsx - Excel</span>
        </div>
        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onExit}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            退出伪装 (Esc)
          </button>
        </div>
      </div>

      {/* Excel Menu Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: '#f3f2f1',
          borderBottom: '1px solid #e1dfdd',
          padding: '4px 16px',
          fontSize: '12px'
        }}
      >
        <span style={{ color: '#107c41', fontWeight: 600, borderBottom: '2px solid #107c41', paddingBottom: '2px' }}>
          Home
        </span>
        <span>Insert</span>
        <span>Page Layout</span>
        <span>Formulas</span>
        <span>Data</span>
        <span>Review</span>
        <span>View</span>
      </div>

      {/* Formula Bar (Where the selected novel paragraph is clearly previewed!) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderBottom: '1px solid #d2d0ce',
          background: '#ffffff'
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: '#107c41',
            minWidth: '36px',
            borderRight: '1px solid #e1dfdd',
            paddingRight: '6px'
          }}
        >
          {`A${selectedCell.row + pageOffset}`}
        </span>
        <span style={{ color: '#888', fontStyle: 'italic', fontWeight: 600 }}>fx</span>
        <input
          readOnly
          value={activeText}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: '#111',
            background: 'transparent'
          }}
        />
      </div>

      {/* Excel Grid */}
      <div style={{ flex: 1, overflow: 'auto', background: '#f8f9fa' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: '#f3f2f1', color: '#605e5c', height: '24px' }}>
              <th style={{ width: '40px', border: '1px solid #d2d0ce' }}></th>
              <th style={{ width: '60px', border: '1px solid #d2d0ce' }}>A (ID)</th>
              <th style={{ border: '1px solid #d2d0ce' }}>B (Description / Content Narrative)</th>
              <th style={{ width: '110px', border: '1px solid #d2d0ce' }}>C (Metric Status)</th>
            </tr>
          </thead>
          <tbody>
            {currentSlice.map((para, idx) => {
              const rowNum = idx + 1;
              const isSelected = selectedCell.row === rowNum;
              return (
                <tr
                  key={idx}
                  onClick={() => setSelectedCell({ row: rowNum, col: 1 })}
                  style={{
                    height: '26px',
                    background: isSelected ? '#e8f0fe' : '#ffffff',
                    border: '1px solid #e1dfdd',
                    cursor: 'pointer'
                  }}
                >
                  <td
                    style={{
                      textAlign: 'center',
                      background: '#f3f2f1',
                      border: '1px solid #d2d0ce',
                      color: '#605e5c',
                      fontSize: '11px'
                    }}
                  >
                    {rowNum + pageOffset}
                  </td>
                  <td style={{ textAlign: 'center', border: '1px solid #e1dfdd', color: '#666' }}>
                    {`#${idx + pageOffset + 1001}`}
                  </td>
                  <td
                    style={{
                      padding: '0 8px',
                      border: isSelected ? '2px solid #107c41' : '1px solid #e1dfdd',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: '#202124'
                    }}
                  >
                    {para}
                  </td>
                  <td style={{ textAlign: 'center', border: '1px solid #e1dfdd', color: '#107c41', fontSize: '11px' }}>
                    PROCESSED
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Sheet Tabs & Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '28px',
          background: '#f3f2f1',
          borderTop: '1px solid #d2d0ce',
          padding: '0 12px',
          fontSize: '11px',
          color: '#605e5c'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              background: '#ffffff',
              padding: '3px 12px',
              borderTop: '2px solid #107c41',
              fontWeight: 600,
              color: '#107c41'
            }}
          >
            {currentChapter?.title || 'Sheet1'}
          </div>
          <span>Sheet2</span>
          <span>Sheet3</span>
          <span style={{ cursor: 'pointer' }}>+</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>READY</span>
          <span>Accessibility: Investigate</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
