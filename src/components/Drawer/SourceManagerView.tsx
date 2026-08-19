import React, { useState, useMemo } from 'react';
import { BookSource } from '../../types/reader';
import { BookSourceEngine } from '../../services/bookSourceEngine';
import { DEFAULT_BOOK_SOURCES } from '../../services/defaultSources';
import {
  Plus,
  Download,
  Trash2,
  RotateCcw,
  Search,
  Folder,
  ChevronRight,
  ChevronDown,
  Layers,
  X
} from 'lucide-react';
import { universalFetch } from '../../services/tauriBridge';
import { IOSSwitch } from '../IOSSwitch';

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
  const [customGroupName, setCustomGroupName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '官方内置精选': true
  });

  // Group Sources by groupName
  const groupedSources = useMemo(() => {
    const map = new Map<string, BookSource[]>();
    const q = searchQuery.toLowerCase().trim();

    for (const source of sources) {
      const gName = source.groupName || '默认导入组';
      if (q) {
        const matches =
          source.name.toLowerCase().includes(q) ||
          source.url.toLowerCase().includes(q) ||
          gName.toLowerCase().includes(q);
        if (!matches) continue;
      }
      if (!map.has(gName)) {
        map.set(gName, []);
      }
      map.get(gName)!.push(source);
    }
    return map;
  }, [sources, searchQuery]);

  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Toggle single source enable/disable
  const handleToggleEnable = (id: string) => {
    const updated = sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    onUpdateSources(updated);
  };

  // Delete single source
  const handleDeleteSource = (id: string, name: string) => {
    if (confirm(`确定删除书源【${name}】吗？`)) {
      const updated = sources.filter((s) => s.id !== id);
      onUpdateSources(updated);
    }
  };

  // Toggle entire group enable/disable
  const handleToggleGroup = (groupName: string, enable: boolean) => {
    const updated = sources.map((s) => {
      const sGroup = s.groupName || '默认导入组';
      return sGroup === groupName ? { ...s, enabled: enable } : s;
    });
    onUpdateSources(updated);
  };

  // Delete entire group
  const handleDeleteGroup = (groupName: string, count: number) => {
    if (confirm(`⚠️ 危险操作：确定一键删除【${groupName}】整组的全部 ${count} 个书源吗？`)) {
      const updated = sources.filter((s) => (s.groupName || '默认导入组') !== groupName);
      onUpdateSources(updated);
    }
  };

  // Global actions
  const handleEnableAll = () => {
    onUpdateSources(sources.map((s) => ({ ...s, enabled: true })));
  };

  const handleDisableAll = () => {
    onUpdateSources(sources.map((s) => ({ ...s, enabled: false })));
  };

  const handleClearAllSources = () => {
    if (confirm('⚠️ 警告：确定清空所有书源吗？清空后可通过“恢复默认”重新载入内置书源。')) {
      onUpdateSources([]);
    }
  };

  const handleRestoreDefaults = () => {
    if (confirm('确定恢复为内置默认精选书源吗？（会保留已导入的其他分组书源）')) {
      const nonDefault = sources.filter((s) => (s.groupName || '') !== '官方内置精选');
      const defaultWithGroup = DEFAULT_BOOK_SOURCES.map((s) => ({ ...s, groupName: '官方内置精选' }));
      onUpdateSources([...defaultWithGroup, ...nonDefault]);
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
      const groupTitle = customGroupName.trim() || `导入书源 ${new Date().toLocaleDateString()}`;
      const newSources = BookSourceEngine.parseLegadoSource(parsed, groupTitle);

      if (newSources.length === 0) {
        alert('未能解析出有效的书源规则，请检查格式（支持阅读 3.0 / Legado JSON 格式）');
        return;
      }

      const merged = [...newSources, ...sources];
      onUpdateSources(merged);
      setImportInput('');
      setCustomGroupName('');
      setImportModalOpen(false);
      setExpandedGroups((prev) => ({ ...prev, [groupTitle]: true }));
      alert(`🎉 成功导入 ${newSources.length} 个书源至分组【${groupTitle}】！`);
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

  const totalEnabled = sources.filter((s) => s.enabled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      {/* Search & Import Header */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder={`搜索 ${sources.length} 个书源或分组名...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="frosted-input"
            style={{ paddingLeft: '30px', padding: '6px 10px 6px 30px', fontSize: '12px', borderRadius: '9999px' }}
          />
        </div>

        <button
          onClick={() => setImportModalOpen(true)}
          className="frosted-btn frosted-btn-primary"
          style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', flexShrink: 0 }}
        >
          <Plus size={13} />
          <span>导入书源</span>
        </button>
      </div>

      {/* Batch Control Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 6px',
          background: 'var(--glass-surface)',
          borderRadius: '10px',
          border: '1px solid var(--glass-border)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={13} color="var(--accent-color)" />
          <span>
            共 <strong>{sources.length}</strong> 个书源 (已启用 <strong>{totalEnabled}</strong> 个)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={handleEnableAll}
            className="frosted-btn"
            style={{ padding: '2px 6px', fontSize: '10.5px', borderRadius: '6px' }}
            title="全选启用全部书源"
          >
            全启用
          </button>
          <button
            onClick={handleDisableAll}
            className="frosted-btn"
            style={{ padding: '2px 6px', fontSize: '10.5px', borderRadius: '6px' }}
            title="全选禁用全部书源"
          >
            全禁用
          </button>
          <button
            onClick={handleExportJson}
            className="frosted-btn"
            style={{ padding: '2px 6px', fontSize: '10.5px', borderRadius: '6px' }}
            title="导出 JSON 备份"
          >
            <Download size={11} />
          </button>
          <button
            onClick={handleRestoreDefaults}
            className="frosted-btn"
            style={{ padding: '2px 6px', fontSize: '10.5px', borderRadius: '6px' }}
            data-tooltip="恢复内置默认书源"
            data-tooltip-pos="bottom"
          >
            <RotateCcw size={11} />
          </button>
          <button
            onClick={handleClearAllSources}
            className="frosted-btn"
            style={{ padding: '2px 6px', fontSize: '10.5px', borderRadius: '6px', color: '#ef4444' }}
            data-tooltip="一键清空全部书源"
            data-tooltip-pos="bottom"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Grouped Book Sources Scroll Container (Zero Lag) */}
      <div className="smooth-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '2px 2px 36px 2px', boxSizing: 'border-box' }}>
        {groupedSources.size === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>
            未找到任何匹配的书源或书源列表为空
          </div>
        ) : (
          Array.from(groupedSources.entries()).map(([groupName, groupList]) => {
            const isExpanded = expandedGroups[groupName] !== false;
            const groupEnabledCount = groupList.filter((s) => s.enabled).length;
            const allEnabled = groupEnabledCount === groupList.length;

            return (
              <div
                key={groupName}
                style={{
                  background: 'var(--glass-surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Group Accordion Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--glass-surface-hover)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => toggleGroupExpand(groupName)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    {isExpanded ? <ChevronDown size={13} color="var(--text-muted)" /> : <ChevronRight size={13} color="var(--text-muted)" />}
                    <Folder size={13} color="var(--accent-color)" />
                    <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                      {groupName}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', background: 'var(--glass-surface)', padding: '1px 6px', borderRadius: '9999px' }}>
                      {groupEnabledCount}/{groupList.length}
                    </span>
                  </div>

                  {/* Group Action Buttons */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleToggleGroup(groupName, !allEnabled)}
                      className="frosted-btn"
                      style={{ padding: '3px 8px', fontSize: '10.5px', borderRadius: '9999px' }}
                      data-tooltip={allEnabled ? '禁用本组全部书源' : '启用本组全部书源'}
                      data-tooltip-pos="left"
                    >
                      {allEnabled ? '禁用此组' : '启用此组'}
                    </button>

                    <button
                      onClick={() => handleDeleteGroup(groupName, groupList.length)}
                      className="frosted-btn"
                      style={{ padding: '3px 6px', fontSize: '10.5px', borderRadius: '9999px', color: '#ef4444' }}
                      data-tooltip="一键删除本组所有书源"
                      data-tooltip-pos="left"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Group Sources Item List */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', padding: '4px' }}>
                    {groupList.map((source) => (
                      <div
                        key={source.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          background: 'var(--glass-surface)',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '2px', paddingRight: '8px' }}>
                          <span style={{ fontWeight: 500, color: source.enabled ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {source.name}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {source.url}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <IOSSwitch
                            checked={source.enabled}
                            onChange={() => handleToggleEnable(source.id)}
                            size="sm"
                          />
                          <button
                            onClick={() => handleDeleteSource(source.id, source.name)}
                            className="frosted-btn"
                            style={{
                              width: '24px',
                              height: '24px',
                              padding: 0,
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-muted)'
                            }}
                            data-tooltip="删除书源"
                            data-tooltip-pos="left"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--text-muted)';
                              e.currentTarget.style.background = 'var(--glass-surface)';
                              e.currentTarget.style.borderColor = 'var(--glass-border)';
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Import Modal */}
      {importModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '16px'
          }}
          onClick={() => setImportModalOpen(false)}
        >
          <div
            className="frosted-panel animate-ios-spring"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '18px',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-app)',
              border: '1px solid var(--glass-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                批量导入 Legado 3.0 书源
              </span>
              <button
                onClick={() => setImportModalOpen(false)}
                className="frosted-btn"
                style={{ padding: '4px', borderRadius: '50%' }}
              >
                <X size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                自定义这一组书源名称（便于分组管理与批量删除）：
              </label>
              <input
                type="text"
                placeholder="例如: 优质笔趣阁合集 / 玄幻精品源"
                value={customGroupName}
                onChange={(e) => setCustomGroupName(e.target.value)}
                className="frosted-input"
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                书源网络链接 (URL) 或 粘贴 JSON 规则文本：
              </label>
              <textarea
                placeholder="支持以 http:// 或 https:// 开头的在线书源链接，或直接粘贴 Legado 3.0 书源 JSON 数组..."
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                className="frosted-input"
                style={{
                  height: '110px',
                  resize: 'none',
                  fontSize: '11.5px',
                  lineHeight: '1.4',
                  fontFamily: 'monospace',
                  padding: '8px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                onClick={() => setImportModalOpen(false)}
                className="frosted-btn"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                取消
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={isImporting || !importInput.trim()}
                className="frosted-btn frosted-btn-primary"
                style={{ padding: '6px 16px', fontSize: '12px' }}
              >
                {isImporting ? '正在解析导入...' : '立即导入'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
