import React, { useState } from 'react';
import { Chapter } from '../../types/reader';
import {
  Mail,
  Send,
  FileText,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Reply,
  Forward
} from 'lucide-react';

interface EmailModeProps {
  currentChapter: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const EmailMode: React.FC<EmailModeProps> = ({
  currentChapter,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [fontSize, setFontSize] = useState(14);
  const [selectedMailIndex, setSelectedMailIndex] = useState(0);

  const mailList = [
    {
      id: 'm1',
      sender: '周明瑞 (架构师)',
      avatar: '周',
      subject: `【工作周报】${currentChapter.title} - 业务指标推进说明`,
      time: '14:28',
      preview: '关于当前季度的系统核心模块重构进展与业务指标分析...',
      unread: false,
      isCurrent: true
    },
    {
      id: 'm2',
      sender: '张总 (项目总监)',
      avatar: '张',
      subject: '【通知】2026年度 Q3 战略复盘与各部门预算指标下发',
      time: '11:15',
      preview: '请各部门负责人于本周五前提交本季度预算执行明细...',
      unread: false,
      isCurrent: false
    },
    {
      id: 'm3',
      sender: '李工 (DevOps)',
      avatar: '李',
      subject: '【告警解除】分布式生产集群网关负载均衡已恢复正常',
      time: '09:40',
      preview: '今晨 08:30 的流量洪峰已平稳度过，节点资源已释放...',
      unread: false,
      isCurrent: false
    }
  ];

  const paragraphs = currentChapter.content
    ? currentChapter.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : ['(暂无正文内容)'];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#f3f4f6',
        color: '#1e293b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'text',
        overflow: 'hidden'
      }}
    >
      {/* 1. Outlook Top Ribbon Header */}
      <div
        style={{
          height: '42px',
          background: '#0078d4',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Mail size={18} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Outlook - 企业邮箱客户端 (365 企业版)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onPrevChapter}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#ffffff',
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="上一封邮件 / 上一章"
          >
            <ChevronLeft size={13} />
            <span>上一封</span>
          </button>
          <button
            onClick={onNextChapter}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#ffffff',
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="下一封邮件 / 下一章"
          >
            <span>下一封</span>
            <ChevronRight size={13} />
          </button>

          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.3)', margin: '0 4px' }} />

          <button
            onClick={() => setFontSize((f) => Math.max(12, f - 1))}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
          >
            A-
          </button>
          <span style={{ fontSize: '11.5px' }}>{fontSize}px</span>
          <button
            onClick={() => setFontSize((f) => Math.min(22, f + 1))}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
          >
            A+
          </button>

          <button
            onClick={onExit}
            style={{
              background: 'rgba(239, 68, 68, 0.85)',
              border: 'none',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11.5px',
              fontWeight: 600,
              marginLeft: '8px'
            }}
            title="退出伪装模式 (Esc)"
          >
            退出邮箱 [Esc]
          </button>
        </div>
      </div>

      {/* 2. Main 3-Column Outlook Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Folders Sidebar */}
        <div
          style={{
            width: '160px',
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 8px',
            gap: '4px',
            flexShrink: 0
          }}
        >
          <div style={{ fontSize: '11px', color: '#94a3b8', padding: '4px 8px', fontWeight: 600 }}>收藏夹</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer' }}>
            <Mail size={14} />
            <span>收件箱 (3)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', color: '#64748b', fontSize: '12.5px', cursor: 'pointer' }}>
            <Send size={14} />
            <span>已发送邮件</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', color: '#64748b', fontSize: '12.5px', cursor: 'pointer' }}>
            <FileText size={14} />
            <span>草稿箱 (1)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', color: '#64748b', fontSize: '12.5px', cursor: 'pointer' }}>
            <Archive size={14} />
            <span>归档文件</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', color: '#64748b', fontSize: '12.5px', cursor: 'pointer' }}>
            <Trash2 size={14} />
            <span>已删除邮件</span>
          </div>
        </div>

        {/* Middle: Mail List */}
        <div
          style={{
            width: '260px',
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            flexShrink: 0
          }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', color: '#334155' }}>
            收件箱 - 全部邮件
          </div>
          {mailList.map((mail, idx) => {
            const isSelected = idx === selectedMailIndex;
            return (
              <div
                key={mail.id}
                onClick={() => setSelectedMailIndex(idx)}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #f1f5f9',
                  background: isSelected ? '#f8fafc' : '#ffffff',
                  borderLeft: isSelected ? '3px solid #0078d4' : '3px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a' }}>{mail.sender}</span>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{mail.time}</span>
                </div>
                <div style={{ fontSize: '11.5px', color: isSelected ? '#0078d4' : '#334155', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                  {mail.subject}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {mail.preview}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Email Reading Body (Novel Stream) */}
        <div
          style={{
            flex: 1,
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Email Metadata Card */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#fafafa' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              【工作周报】{currentChapter.title} - 业务指标推进说明
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#0078d4',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  周
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                    周明瑞 &lt;mr.zhou@corporation.com&gt;
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    收件人: 项目核心业务组 &lt;core-project@corporation.com&gt;
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="frosted-btn" style={{ padding: '4px 8px', fontSize: '11.5px', borderRadius: '4px' }}>
                  <Reply size={12} />
                  <span>回复</span>
                </button>
                <button className="frosted-btn" style={{ padding: '4px 8px', fontSize: '11.5px', borderRadius: '4px' }}>
                  <Forward size={12} />
                  <span>转发</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Body Content (The Novel) */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 32px',
              fontSize: `${fontSize}px`,
              lineHeight: 1.8,
              color: '#334155'
            }}
          >
            <p style={{ color: '#64748b', fontSize: `${fontSize - 1}px`, marginBottom: '16px' }}>
              各位领导、同事好：
              <br />
              现将本阶段业务执行明细与战略规划汇报如下，请审阅：
            </p>

            {paragraphs.map((p, idx) => (
              <p key={idx} style={{ marginBottom: '14px', textIndent: '2em' }}>
                {p}
              </p>
            ))}

            <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '12px' }}>
              ---
              <br />
              发自 Microsoft Outlook 365 企业安全移动端
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
