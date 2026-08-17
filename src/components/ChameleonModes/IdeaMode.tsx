import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  Play,
  Bug,
  RotateCw,
  Terminal,
  Settings,
  GitBranch,
  ChevronRight,
  X,
  Search
} from 'lucide-react';
import { Book } from '../../types/reader';

interface IdeaModeProps {
  book: Book | null;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const IdeaMode: React.FC<IdeaModeProps> = ({
  book,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [activeTab, setActiveTab] = useState<'java' | 'kt'>('java');
  const [projectTreeOpen, setProjectTreeOpen] = useState(true);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'j') {
        onNextChapter();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'k') {
        onPrevChapter();
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextChapter, onPrevChapter, onExit]);

  const currentChapter = book ? book.chapters[book.currentChapterIndex] : null;
  const paragraphs = currentChapter?.content
    ? currentChapter.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : ['// No content available.'];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#1e1f22',
        color: '#bcbec4',
        fontFamily: '"JetBrains Mono", Consolas, "Courier New", monospace',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'text',
        fontSize: '12px'
      }}
    >
      {/* Top IDEA Main Toolbar & Header */}
      <div
        className="tauri-drag-handle"
        style={{
          height: '38px',
          background: '#2b2d30',
          borderBottom: '1px solid #1e1f22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* IntelliJ App Icon */}
          <div
            style={{
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #fe2857 0%, #000000 50%, #087cfa 100%)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '11px',
              color: '#fff'
            }}
          >
            IJ
          </div>

          {/* Project Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#dfe1e5' }}>
            <span>cloud-enterprise-backend</span>
            <span style={{ color: '#6f737a', fontSize: '11px' }}>[main]</span>
          </div>

          {/* Menu Items */}
          <div className="tauri-no-drag" style={{ display: 'flex', gap: '10px', color: '#9da0a8', fontSize: '11.5px', marginLeft: '10px' }}>
            <span style={{ cursor: 'pointer' }}>File</span>
            <span style={{ cursor: 'pointer' }}>Edit</span>
            <span style={{ cursor: 'pointer' }}>View</span>
            <span style={{ cursor: 'pointer' }}>Navigate</span>
            <span style={{ cursor: 'pointer' }}>Code</span>
            <span style={{ cursor: 'pointer' }}>Refactor</span>
            <span style={{ cursor: 'pointer' }}>Build</span>
            <span style={{ cursor: 'pointer' }}>Run</span>
            <span style={{ cursor: 'pointer' }}>Tools</span>
          </div>
        </div>

        {/* Center: Search Everywhere */}
        <div
          className="tauri-no-drag"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1e1f22',
            padding: '4px 14px',
            borderRadius: '6px',
            border: '1px solid #393b40',
            color: '#6f737a',
            fontSize: '11px',
            width: '260px',
            cursor: 'pointer'
          }}
        >
          <Search size={13} />
          <span>Search Everywhere (Double ⇧)</span>
        </div>

        {/* Right Run / Debug & Exit Camouflage */}
        <div className="tauri-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e1f22', padding: '3px 8px', borderRadius: '4px', border: '1px solid #393b40' }}>
            <span style={{ color: '#57965c', display: 'flex', alignItems: 'center' }}><Play size={13} fill="#57965c" /></span>
            <span style={{ color: '#dfe1e5', fontSize: '11.5px' }}>Application [Run]</span>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#8b8e96', cursor: 'pointer' }}><Bug size={14} /></button>
          <button style={{ background: 'transparent', border: 'none', color: '#8b8e96', cursor: 'pointer' }}><RotateCw size={14} /></button>

          {/* Quick Exit Camouflage Button */}
          <button
            onClick={onExit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#393b40',
              border: 'none',
              color: '#dfe1e5',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
            title="退出伪装，返回阅读器 (Esc)"
          >
            <X size={12} />
            <span>退出伪装</span>
          </button>
        </div>
      </div>

      {/* Main Body: Project Tree + Editor Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side Tool Strip */}
        <div style={{ width: '36px', background: '#2b2d30', borderRight: '1px solid #1e1f22', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: '14px' }}>
          <button
            onClick={() => setProjectTreeOpen(!projectTreeOpen)}
            style={{ background: projectTreeOpen ? '#393b40' : 'transparent', border: 'none', color: '#dfe1e5', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
            title="Project (Alt+1)"
          >
            <Folder size={16} />
          </button>
          <button style={{ background: 'transparent', border: 'none', color: '#6f737a', padding: '6px', cursor: 'pointer' }}><GitBranch size={16} /></button>
          <button style={{ background: 'transparent', border: 'none', color: '#6f737a', padding: '6px', cursor: 'pointer' }}><Terminal size={16} /></button>
          <div style={{ marginTop: 'auto' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#6f737a', padding: '6px', cursor: 'pointer' }}><Settings size={16} /></button>
          </div>
        </div>

        {/* Left Project File Tree */}
        {projectTreeOpen && (
          <div
            style={{
              width: '240px',
              background: '#2b2d30',
              borderRight: '1px solid #1e1f22',
              display: 'flex',
              flexDirection: 'column',
              padding: '6px 0',
              overflowY: 'auto'
            }}
          >
            <div style={{ padding: '4px 10px', fontSize: '11px', color: '#6f737a', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>PROJECT</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', color: '#dfe1e5' }}>
                <FolderOpen size={14} color="#68a3f8" />
                <span>cloud-enterprise-backend</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px 3px 24px', color: '#9da0a8' }}>
                <FolderOpen size={14} color="#68a3f8" />
                <span>src/main/java/com/service</span>
              </div>

              <div
                onClick={() => setActiveTab('java')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px 4px 38px',
                  background: activeTab === 'java' ? '#2e436e' : 'transparent',
                  color: activeTab === 'java' ? '#ffffff' : '#dfe1e5',
                  cursor: 'pointer'
                }}
              >
                <FileCode size={14} color="#f07178" />
                <span>NovelEngineService.java</span>
              </div>

              <div
                onClick={() => setActiveTab('kt')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px 4px 38px',
                  background: activeTab === 'kt' ? '#2e436e' : 'transparent',
                  color: activeTab === 'kt' ? '#ffffff' : '#9da0a8',
                  cursor: 'pointer'
                }}
              >
                <FileCode size={14} color="#c792ea" />
                <span>SecurityConfig.kt</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px 3px 24px', color: '#6f737a' }}>
                <Folder size={14} color="#68a3f8" />
                <span>src/main/resources</span>
              </div>
            </div>
          </div>
        )}

        {/* Center: Editor Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1f22', overflow: 'hidden' }}>
          {/* Editor Tab Bar */}
          <div style={{ height: '34px', background: '#2b2d30', borderBottom: '1px solid #1e1f22', display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 14px',
                background: '#1e1f22',
                borderTop: '2px solid #3574f0',
                color: '#dfe1e5',
                fontSize: '12px',
                borderRight: '1px solid #2b2d30'
              }}
            >
              <FileCode size={14} color="#f07178" />
              <span>NovelEngineService.java</span>
              <X size={12} style={{ marginLeft: '6px', cursor: 'pointer', opacity: 0.6 }} />
            </div>

            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 14px',
                color: '#6f737a',
                fontSize: '12px'
              }}
            >
              <FileCode size={14} color="#c792ea" />
              <span>SecurityConfig.kt</span>
            </div>
          </div>

          {/* Breadcrumb Path */}
          <div style={{ height: '22px', background: '#1e1f22', borderBottom: '1px solid #2b2d30', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 12px', fontSize: '11px', color: '#6f737a' }}>
            <span>cloud-enterprise</span>
            <ChevronRight size={11} />
            <span>src</span>
            <ChevronRight size={11} />
            <span>com.service</span>
            <ChevronRight size={11} />
            <span style={{ color: '#bcbec4' }}>NovelEngineService</span>
            <ChevronRight size={11} />
            <span style={{ color: '#56a8f5' }}>{currentChapter?.title || 'execute()'}</span>
          </div>

          {/* Real Code Body with Injected Novel Text */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              padding: '12px 0',
              lineHeight: '1.7',
              fontSize: '13px'
            }}
          >
            {/* Line Numbers Margin */}
            <div
              style={{
                width: '46px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                paddingRight: '14px',
                color: '#4b5059',
                userSelect: 'none',
                flexShrink: 0
              }}
            >
              {Array.from({ length: Math.max(35, paragraphs.length * 3 + 15) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Java Code & Camouflaged Novel Text */}
            <div style={{ flex: 1, paddingRight: '24px' }}>
              <div><span style={{ color: '#cf8e6d' }}>package</span> <span style={{ color: '#bcbec4' }}>com.company.reader.service;</span></div>
              <br />
              <div><span style={{ color: '#cf8e6d' }}>import</span> <span style={{ color: '#bcbec4' }}>org.springframework.stereotype.Service;</span></div>
              <div><span style={{ color: '#cf8e6d' }}>import</span> <span style={{ color: '#bcbec4' }}>org.springframework.transaction.annotation.Transactional;</span></div>
              <div><span style={{ color: '#cf8e6d' }}>import</span> <span style={{ color: '#bcbec4' }}>lombok.extern.slf4j.Slf4j;</span></div>
              <br />
              <div><span style={{ color: '#b3ae60' }}>@Slf4j</span></div>
              <div><span style={{ color: '#b3ae60' }}>@Service</span></div>
              <div>
                <span style={{ color: '#cf8e6d' }}>public class</span> <span style={{ color: '#56a8f5', fontWeight: 600 }}>NovelEngineService</span> {'{'}
              </div>
              <br />

              {/* Injected Chapter Title */}
              <div style={{ paddingLeft: '24px', color: '#7a7e85' }}>
                /**
                <br />
                &nbsp;* <b>Current Chapter:</b> {currentChapter?.title || 'Chapter Execution'}
                <br />
                &nbsp;* <b>Keyboard:</b> [J] / [K] or Left/Right to turn page. [Esc] to exit.
                <br />
                &nbsp;*/
              </div>

              <div style={{ paddingLeft: '24px' }}>
                <span style={{ color: '#b3ae60' }}>@Transactional</span>(readOnly = <span style={{ color: '#cf8e6d' }}>true</span>)
              </div>
              <div style={{ paddingLeft: '24px' }}>
                <span style={{ color: '#cf8e6d' }}>public void</span> <span style={{ color: '#56a8f5' }}>executePipeline</span>() {'{'}
              </div>

              {/* Injected Novel Paragraphs as realistic Java Logging and Javadoc comments */}
              {paragraphs.map((para, idx) => (
                <div key={idx} style={{ paddingLeft: '48px', margin: '8px 0' }}>
                  <div style={{ color: '#6aab73' }}>
                    log.info(<span style={{ color: '#6aab73' }}>"{para}"</span>);
                  </div>
                </div>
              ))}

              <div style={{ paddingLeft: '48px', color: '#6f737a' }}>
                // TODO: Sync metrics to dashboard
              </div>
              <div style={{ paddingLeft: '24px' }}>{'}'}</div>
              <div>{'}'}</div>
            </div>
          </div>

          {/* Bottom IDEA Status Bar */}
          <div
            style={{
              height: '24px',
              background: '#2b2d30',
              borderTop: '1px solid #1e1f22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              fontSize: '11px',
              color: '#6f737a'
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#57965c' }}>
                <GitBranch size={12} /> main
              </span>
              <span>UTF-8</span>
              <span>4 spaces</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span>
                {book ? `第 ${book.currentChapterIndex + 1}/${book.chapters.length} 章` : 'No Active Book'}
              </span>
              <span>Memory: 512M / 2048M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
