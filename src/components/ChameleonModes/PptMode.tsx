import React, { useState } from 'react';
import { Chapter } from '../../types/reader';
import {
  Presentation,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PptModeProps {
  currentChapter: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const PptMode: React.FC<PptModeProps> = ({
  currentChapter,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [currentSlidePage, setCurrentSlidePage] = useState(0);

  const rawParagraphs = currentChapter.content
    ? currentChapter.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : ['(暂无演示文稿正文)'];

  // 4 paragraphs per slide
  const paragraphsPerSlide = 4;
  const totalSlidePages = Math.max(1, Math.ceil(rawParagraphs.length / paragraphsPerSlide));

  const currentSlideParagraphs = rawParagraphs.slice(
    currentSlidePage * paragraphsPerSlide,
    (currentSlidePage + 1) * paragraphsPerSlide
  );

  const handlePrevSlide = () => {
    if (currentSlidePage > 0) {
      setCurrentSlidePage((p) => p - 1);
    } else {
      onPrevChapter();
      setCurrentSlidePage(0);
    }
  };

  const handleNextSlide = () => {
    if (currentSlidePage < totalSlidePages - 1) {
      setCurrentSlidePage((p) => p + 1);
    } else {
      onNextChapter();
      setCurrentSlidePage(0);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#f1f5f9',
        color: '#1e293b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* 1. PowerPoint Orange Top Ribbon Header */}
      <div
        style={{
          height: '42px',
          background: '#d24726',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Presentation size={18} />
          <span style={{ fontWeight: 600, fontSize: '13.5px' }}>
            PowerPoint - 2026年度业务架构与战略推进方案演示.pptx
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrevSlide}
            style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11.5px' }}
          >
            <ChevronLeft size={13} /> 上一页
          </button>
          <span style={{ fontSize: '11.5px' }}>
            {currentSlidePage + 1} / {totalSlidePages}
          </span>
          <button
            onClick={handleNextSlide}
            style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11.5px' }}
          >
            下一页 <ChevronRight size={13} />
          </button>

          <button
            onClick={onExit}
            style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, marginLeft: '8px' }}
          >
            退出 PPT [Esc]
          </button>
        </div>
      </div>

      {/* 2. Ribbon Tabs */}
      <div
        style={{
          height: '30px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: '16px',
          fontSize: '12px',
          color: '#475569',
          flexShrink: 0
        }}
      >
        <span style={{ color: '#d24726', fontWeight: 600, borderBottom: '2px solid #d24726', padding: '5px 0' }}>开始</span>
        <span>插入</span>
        <span>设计</span>
        <span>切换</span>
        <span>动画</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d24726' }}>
          <Play size={11} /> 幻灯片放映
        </span>
        <span>审阅</span>
        <span>视图</span>
      </div>

      {/* 3. Main Stage with Left Thumbnails & 16:9 Center Canvas */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Slide Thumbnail Deck */}
        <div
          style={{
            width: '180px',
            background: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flexShrink: 0
          }}
        >
          {Array.from({ length: Math.min(10, totalSlidePages) }).map((_, idx) => {
            const isSelected = idx === currentSlidePage;
            return (
              <div
                key={idx}
                onClick={() => setCurrentSlidePage(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '11px', color: '#94a3b8', width: '12px', textAlign: 'right' }}>{idx + 1}</span>
                <div
                  style={{
                    flex: 1,
                    aspectRatio: '16/9',
                    background: '#ffffff',
                    border: isSelected ? '2px solid #d24726' : '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 2px 8px rgba(210,71,38,0.2)' : 'none'
                  }}
                >
                  <div style={{ height: '3px', width: '40%', background: '#d24726', borderRadius: '1px' }} />
                  <div style={{ height: '2px', width: '80%', background: '#cbd5e1', borderRadius: '1px' }} />
                  <div style={{ height: '2px', width: '60%', background: '#cbd5e1', borderRadius: '1px' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: 16:9 Executive Business Slide */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#e2e8f0',
            overflow: 'auto'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '820px',
              aspectRatio: '16/9',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 44px',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            {/* Slide Header */}
            <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#d24726', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                EXECUTIVE STRATEGY · 战略分析与业务演进
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                {currentChapter.title}
              </div>
            </div>

            {/* Slide Content Cards */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              {currentSlideParagraphs.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    borderLeft: '4px solid #d24726'
                  }}
                >
                  <span style={{ color: '#d24726', fontWeight: 700, fontSize: '13px' }}>●</span>
                  <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: '#334155' }}>
                    {p}
                  </p>
                </div>
              ))}
            </div>

            {/* Slide Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '11px', color: '#94a3b8' }}>
              <span>2026 年度企业数字化架构白皮书</span>
              <span>第 {currentSlidePage + 1} 页 / 共 {totalSlidePages} 页</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
