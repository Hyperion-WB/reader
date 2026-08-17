import React from 'react';
import { StealthConfig } from '../../types/reader';
import { StorageService } from '../../services/storageService';
import { MousePointer, EyeOff, Download, Upload, Monitor, Shield } from 'lucide-react';
import { windowControls } from '../../services/tauriBridge';

interface StealthConsoleViewProps {
  stealthConfig: StealthConfig;
  onUpdateStealth: (config: StealthConfig) => void;
  onReloadAllData: () => void;
}

export const StealthConsoleView: React.FC<StealthConsoleViewProps> = ({
  stealthConfig,
  onUpdateStealth,
  onReloadAllData
}) => {
  const handleToggleClickThrough = async (val: boolean) => {
    const updated = { ...stealthConfig, clickThrough: val };
    onUpdateStealth(updated);
    await windowControls.setClickThrough(val);
  };

  const handleToggleSkipTaskbar = async (val: boolean) => {
    const updated = { ...stealthConfig, skipTaskbar: val };
    onUpdateStealth(updated);
    await windowControls.setSkipTaskbar(val);
  };

  const handleExportBackup = () => {
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liquid_reader_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const text = await file.text();
        const success = StorageService.importAllData(text);
        if (success) {
          alert('数据恢复成功！');
          onReloadAllData();
        } else {
          alert('数据恢复失败：文件格式不匹配');
        }
      }
    };
    input.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
      {/* Boss Key Config */}
      <div className="frosted-panel" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <EyeOff size={14} />
          <span>极速老板键 (0ms 瞬时抹除)</span>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>全局快捷键</div>
          <select
            value={stealthConfig.bossKeyShortcut}
            onChange={(e) => onUpdateStealth({ ...stealthConfig, bossKeyShortcut: e.target.value })}
            className="frosted-input"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <option value="Alt+`" style={{ background: '#222', color: '#fff' }}>Alt + ` (波浪键，默认推荐)</option>
            <option value="Ctrl+Q" style={{ background: '#222', color: '#fff' }}>Ctrl + Q</option>
            <option value="F1" style={{ background: '#222', color: '#fff' }}>F1</option>
            <option value="Alt+X" style={{ background: '#222', color: '#fff' }}>Alt + X</option>
          </select>
        </div>
      </div>

      {/* Mouse Proximity Auto-Fade */}
      <div className="frosted-panel" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MousePointer size={14} />
            <span>鼠标离开自动淡化隐身</span>
          </div>
          <input
            type="checkbox"
            checked={stealthConfig.mouseAutoFade}
            onChange={(e) => onUpdateStealth({ ...stealthConfig, mouseAutoFade: e.target.checked })}
            style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }}
          />
        </div>

        {stealthConfig.mouseAutoFade && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>离开后最低透明度</span>
              <span>{Math.round(stealthConfig.mouseLeaveOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={stealthConfig.mouseLeaveOpacity}
              onChange={(e) => onUpdateStealth({ ...stealthConfig, mouseLeaveOpacity: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-color)' }}
            />
          </div>
        )}
      </div>

      {/* Advanced Stealth Toggles */}
      <div className="frosted-panel" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} />
          <span>高级反侦察选项</span>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <span>隐藏 Windows 任务栏图标 (无痕运行)</span>
          <input
            type="checkbox"
            checked={stealthConfig.skipTaskbar}
            onChange={(e) => handleToggleSkipTaskbar(e.target.checked)}
            style={{ accentColor: 'var(--accent-color)', width: '15px', height: '15px' }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <span>鼠标穿透窗口 (可直接点击下层软件)</span>
          <input
            type="checkbox"
            checked={stealthConfig.clickThrough}
            onChange={(e) => handleToggleClickThrough(e.target.checked)}
            style={{ accentColor: 'var(--accent-color)', width: '15px', height: '15px' }}
          />
        </label>
      </div>

      {/* Backup & Cloud Sync */}
      <div className="frosted-panel" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Monitor size={14} />
          <span>数据备份与迁移</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleExportBackup} className="frosted-btn" style={{ flex: 1, padding: '7px 10px', borderRadius: '10px' }}>
            <Download size={13} />
            <span>导出全部数据</span>
          </button>
          <button onClick={handleImportBackup} className="frosted-btn" style={{ flex: 1, padding: '7px 10px', borderRadius: '10px' }}>
            <Upload size={13} />
            <span>恢复数据</span>
          </button>
        </div>
      </div>
    </div>
  );
};
