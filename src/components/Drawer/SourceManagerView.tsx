import React, { useState } from 'react';
import { BookSource } from '../../types/reader';
import { BookSourceEngine } from '../../services/bookSourceEngine';
import { DEFAULT_BOOK_SOURCES } from '../../services/defaultSources';
import { Plus, Download, Trash2, RotateCcw } from 'lucide-react';
import { universalFetch } from '../../services/tauriBridge';

interface SourceManagerViewProps {
  sources: BookSource[];
  onUpdateSources: (sources: BookSource[]) => void;
}

export const SourceManagerView: React.FC<SourceManagerViewProps> = ({
  sources,
  onUpdateSources
}) => {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleToggleEnable = (id: string) => {
    const updated = sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    onUpdateSources(updated);
  };

  const handleDeleteSource = (id: string) => {
    if (confirm('确定删除该书源吗？')) {
      const updated = sources.filter((s) => s.id !== id);
      onUpdateSources(updated);
    }
  };

  const handleRestoreDefaults = () => {
    if (confirm('确定恢复为内置默认书源吗？')) {
      onUpdateSources(DEFAULT_BOOK_SOURCES);
    }
  };

  const handleImportSubmit = async () => {
    if (!importInput.trim()) return;
    setIsImporting(true);

    try {
      let rawJsonText = importInput.trim();

      // If it's a URL, fetch it first
      if (rawJsonText.startsWith('http://') || rawJsonText.startsWith('https://')) {
        const res = await universalFetch(rawJsonText);
        rawJsonText = await res.text();
      }

      const parsed = JSON.parse(rawJsonText);
      const newSources = BookSourceEngine.parseLegadoSource(parsed);

      if (newSources.length === 0) {
        alert('未能解析出有效的书源规则，请检查格式（支持阅读 3.0 / Legado JSON 格式）');
        return;
      }

      const merged = [...newSources, ...sources];
      onUpdateSources(merged);
      setImportInput('');
      setImportModalOpen(false);
      alert(`成功导入 ${newSources.length} 个书源！`);
    } catch (err: any) {
      alert(`导入书源失败: ${err.message || 'JSON 格式解析错误'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportJson = () => {
    const json = JSON.stringify(sources, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liquid_reader_sources_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setImportModalOpen(true)}
          className="frosted-btn frosted-btn-primary"
          style={{ flex: 1, padding: '8px 12px', borderRadius: '12px' }}
        >
          <Plus size={14} />
          <span>导入 Legado 3.0 书源</span>
        </button>

        <button
          onClick={handleExportJson}
          className="frosted-btn"
          style={{ padding: '8px 12px', borderRadius: '12px' }}
          title="导出书源 JSON"
        >
          <Download size={14} />
          <span>导出</span>
        </button>

        <button
          onClick={handleRestoreDefaults}
          className="frosted-btn"
          style={{ padding: '8px 12px', borderRadius: '12px' }}
          title="恢复内置书源"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Sources List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px'
        }}
      >
        {sources.map((source) => (
          <div
            key={source.id}
            className="frosted-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '14px',
              background: source.enabled ? 'var(--glass-surface-hover)' : 'var(--glass-surface)',
              opacity: source.enabled ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {source.name}
                </span>
                {source.weight && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    权重: {source.weight}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '240px'
                }}
              >
                {source.url}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => handleToggleEnable(source.id)}
                className="frosted-btn"
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  background: source.enabled ? 'var(--accent-color)' : 'rgba(0,0,0,0.1)',
                  color: source.enabled ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {source.enabled ? '已启用' : '已禁用'}
              </button>

              <button
                onClick={() => handleDeleteSource(source.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Import Modal */}
      {importModalOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1100
          }}
        >
          <div
            className="frosted-panel animate-ios-spring"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '22px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
              导入 Legado 3.0 / 阅读书源
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              支持粘贴单个/批量书源 JSON 内容，或直接输入网络书源 URL（以 http/https 开头）：
            </div>

            <textarea
              rows={8}
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder="在此粘贴书源 JSON 或书源链接..."
              className="frosted-input"
              style={{ resize: 'none', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={() => setImportModalOpen(false)}
                className="frosted-btn"
                style={{ padding: '7px 14px', borderRadius: '10px' }}
              >
                取消
              </button>
              <button
                disabled={isImporting}
                onClick={handleImportSubmit}
                className="frosted-btn frosted-btn-primary"
                style={{ padding: '7px 16px', borderRadius: '10px' }}
              >
                {isImporting ? '解析中...' : '确认导入'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
