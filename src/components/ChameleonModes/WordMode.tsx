import React, { useState, useEffect } from 'react';
import { Chapter } from '../../types/reader';

interface WordModeProps {
  currentChapter?: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const WordMode: React.FC<WordModeProps> = ({
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
    : ['（暂无正文段落）'];

  const parasPerPage = 8;
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

  const wordRibbonTabs = ['文件', '开始', '插入', '绘图', '设计', '布局', '引用', '邮件', '审阅', '视图', '帮助'];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        background: '#e6e6e6',
        color: '#222222',
        fontFamily: '"Segoe UI", "SimSun", "Songti SC", "Microsoft YaHei", sans-serif',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Top Blue Ribbon Header */}
      <div
        data-tauri-drag-region="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#2b579a',
          color: '#ffffff',
          height: '32px',
          padding: '0 12px',
          fontSize: '12px'
        }}
      >
        <div data-tauri-drag-region="true" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, background: '#1c3e73', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>自动保存 [开启]</span>
          <span style={{ fontWeight: 500 }}>关于推进2026年度企业数智化转型与核心业务发展战略规划纲要.docx - Word</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onExit}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              padding: '2px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            退出伪装 (Esc)
          </button>
        </div>
      </div>

      {/* Ribbon Navigation Menu Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '4px 16px',
          background: '#f3f2f1',
          borderBottom: '1px solid #e1dfdd',
          fontSize: '12px'
        }}
      >
        {wordRibbonTabs.map((tab, idx) => (
          <span
            key={idx}
            style={{
              fontWeight: idx === 1 ? 600 : 400,
              color: idx === 1 ? '#2b579a' : '#323130',
              borderBottom: idx === 1 ? '2px solid #2b579a' : 'none',
              padding: '4px 2px',
              cursor: 'pointer'
            }}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Ruler */}
      <div
        style={{
          height: '14px',
          background: '#ffffff',
          borderBottom: '1px solid #d2d0ce',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          color: '#8a8886',
          letterSpacing: '12px'
        }}
      >
        |···1···|···2···|···3···|···4···|···5···|···6···|···7···|···8···|···9···|···10···|···11···|···12···|···13···|···14···|···15···|
      </div>

      {/* Main Document Paper Workspace */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          padding: '20px 10px',
          boxSizing: 'border-box'
        }}
      >
        {/* A4 Document Paper */}
        <div
          style={{
            width: '100%',
            maxWidth: '780px',
            minHeight: '100%',
            background: '#ffffff',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.15)',
            padding: '36px 48px',
            boxSizing: 'border-box',
            color: '#1a1a1a',
            fontFamily: '"SimSun", "Songti SC", "STSong", serif',
            fontSize: '14px',
            lineHeight: '1.8'
          }}
        >
          {/* Document Header Title */}
          <div
            style={{
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '18px',
              marginBottom: '18px',
              fontFamily: '"SimHei", "Microsoft YaHei", sans-serif',
              color: '#000000'
            }}
          >
            {currentChapter ? currentChapter.title : '项目工作汇报'}
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginBottom: '24px' }}>
            编撰部门：战略规划与技术发展委员会 · 密级：内部公文 · 第 {pageIndex + 1} 页 / 共 {totalPages} 页
          </div>

          {/* Paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentParas.map((p, idx) => (
              <p key={idx} style={{ margin: 0, textIndent: '2em', textAlign: 'justify', letterSpacing: '0.2px' }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Word Bottom Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#2b579a',
          color: '#ffffff',
          padding: '2px 14px',
          fontSize: '11px'
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>第 {pageIndex + 1} 页，共 {totalPages} 页</span>
          <span>字数: {currentChapter?.wordCount || 1240}</span>
          <span>中文 (中国)</span>
          <span>辅助功能: 良好</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>单页视图</span>
          <span>页面宽度</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
