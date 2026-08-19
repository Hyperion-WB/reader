import React, { useState, useRef, useEffect } from 'react';
import { Chapter } from '../../types/reader';
import {
  MessageSquare,
  Users,
  Smile,
  Paperclip,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ChatModeProps {
  currentChapter: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const ChatMode: React.FC<ChatModeProps> = ({
  currentChapter,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [inputText, setInputText] = useState('');
  const [displayedParagraphsCount, setDisplayedParagraphsCount] = useState(6);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const paragraphs = currentChapter.content
    ? currentChapter.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : ['(暂无聊天正文)'];

  const colleagues = [
    { name: '王工 (架构师)', avatar: '王', color: '#0284c7' },
    { name: '李经理 (产品总监)', avatar: '李', color: '#10b981' },
    { name: '张工 (前端技术专家)', avatar: '张', color: '#8b5cf6' },
    { name: '赵主管 (研发交付)', avatar: '赵', color: '#f59e0b' }
  ];

  const handleSendNext = () => {
    if (displayedParagraphsCount < paragraphs.length) {
      setDisplayedParagraphsCount((prev) => Math.min(paragraphs.length, prev + 3));
    } else {
      onNextChapter();
      setDisplayedParagraphsCount(6);
    }
    setInputText('');
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedParagraphsCount, currentChapter.index]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#ece5dd',
        color: '#1e293b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        overflow: 'hidden'
      }}
    >
      {/* 1. Left Narrow Icons Sidebar */}
      <div
        style={{
          width: '56px',
          background: '#2e3238',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          gap: '20px',
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#07c160',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px'
          }}
        >
          我
        </div>

        <div style={{ color: '#07c160', cursor: 'pointer' }}>
          <MessageSquare size={22} />
        </div>
        <div style={{ color: '#8c939d', cursor: 'pointer' }}>
          <Users size={22} />
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={onExit}
          style={{
            background: '#ef4444',
            border: 'none',
            color: '#fff',
            padding: '4px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer',
            fontWeight: 600
          }}
          title="退出工作群聊伪装 (Esc)"
        >
          退出
        </button>
      </div>

      {/* 2. Chat Groups Channel List */}
      <div
        style={{
          width: '240px',
          background: '#e6e5e5',
          borderRight: '1px solid #d6d6d6',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}
      >
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #dcdcdc', fontWeight: 600, fontSize: '13px', color: '#333' }}>
          工作会话列表
        </div>

        <div
          style={{
            padding: '10px 14px',
            background: '#c5c4c4',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              background: '#07c160',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}
          >
            群
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#191919', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              【技术架构方案推进组】(18)
            </span>
            <span style={{ fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentChapter.title}
            </span>
          </div>
        </div>

        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
            企
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#191919' }}>【2026战略汇报同步】</span>
            <span style={{ fontSize: '11px', color: '#666' }}>张总: 请准时提交本季度复盘</span>
          </div>
        </div>
      </div>

      {/* 3. Main Chat Conversation Feed */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f5f5', overflow: 'hidden' }}>
        {/* Chat Room Header */}
        <div
          style={{
            height: '48px',
            background: '#f5f5f5',
            borderBottom: '1px solid #e7e7e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            flexShrink: 0
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#191919' }}>
            【技术核心架构推进组】 - {currentChapter.title}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onPrevChapter}
              style={{ background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11.5px' }}
            >
              <ChevronLeft size={13} /> 上一章
            </button>
            <button
              onClick={onNextChapter}
              style={{ background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11.5px' }}
            >
              下一章 <ChevronRight size={13} />
            </button>
            <button
              onClick={onExit}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, marginLeft: '6px' }}
            >
              退出 [Esc]
            </button>
          </div>
        </div>

        {/* Chat Messages Bubble Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <span style={{ fontSize: '11px', color: '#999', background: '#dadada', padding: '2px 8px', borderRadius: '4px' }}>
              今天 14:30 · 群公告: 《{currentChapter.title}》技术方案讨论
            </span>
          </div>

          {paragraphs.slice(0, displayedParagraphsCount).map((p, idx) => {
            const colleague = colleagues[idx % colleagues.length];
            return (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: colleague.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '13px',
                    flexShrink: 0
                  }}
                >
                  {colleague.avatar}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '80%' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>{colleague.name}</span>
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '10px 14px',
                      borderRadius: '2px 10px 10px 10px',
                      fontSize: '13.5px',
                      lineHeight: '1.65',
                      color: '#191919',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                      wordBreak: 'break-word'
                    }}
                  >
                    {p}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Message Input Bar */}
        <div
          style={{
            height: '110px',
            background: '#ffffff',
            borderTop: '1px solid #e7e7e7',
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 16px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', gap: '12px', color: '#666', marginBottom: '6px' }}>
            <Smile size={18} style={{ cursor: 'pointer' }} />
            <Paperclip size={18} style={{ cursor: 'pointer' }} />
          </div>

          <textarea
            placeholder="在工作群中输入消息讨论，或按 Enter 发送下一段剧情..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendNext();
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '13px',
              fontFamily: 'inherit',
              lineHeight: '1.4'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSendNext}
              style={{
                background: '#07c160',
                color: '#fff',
                border: 'none',
                padding: '4px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              发送 [Enter]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
