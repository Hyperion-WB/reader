import React from 'react';
import { StealthConfig } from '../../types/reader';
import { StorageService } from '../../services/storageService';
import { MousePointer, EyeOff, Download, Upload, Monitor, Shield } from 'lucide-react';
import { windowControls } from '../../services/tauriBridge';
import { IOSSwitch } from '../IOSSwitch';
import { FrostedSelect } from '../FrostedSelect';

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

  const shortcutOptions = [
    { label: 'Alt + ` (波浪键，极速推荐)', value: 'Alt+`' },
    { label: 'Ctrl + Q', value: 'Ctrl+Q' },
    { label: 'F1', value: 'F1' },
    { label: 'Alt + X', value: 'Alt+X' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
      {/* Boss Key Config with FrostedSelect */}
      <div className="frosted-panel" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <EyeOff size={15} style={{ color: 'var(--accent-color)' }} />
          <span>极速老板键 (0ms 瞬时抹除)</span>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>全局快捷键</div>
          <FrostedSelect
            options={shortcutOptions}
            value={stealthConfig.bossKeyShortcut}
            onChange={(val) => onUpdateStealth({ ...stealthConfig, bossKeyShortcut: val })}
          />
        </div>
      </div>

      {/* Mouse Proximity Auto-Fade with IOSSwitch */}
      <div className="frosted-panel" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MousePointer size={15} style={{ color: 'var(--accent-color)' }} />
            <span>鼠标离开自动淡化隐身</span>
          </div>
          <IOSSwitch
            checked={stealthConfig.mouseAutoFade}
            onChange={(val) => onUpdateStealth({ ...stealthConfig, mouseAutoFade: val })}
          />
        </div>

        {stealthConfig.mouseAutoFade && (
          <div className="animate-ios-spring">
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

      {/* Advanced Stealth Toggles with IOSSwitches */}
      <div className="frosted-panel" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={15} style={{ color: 'var(--accent-color)' }} />
          <span>高级反侦察选项</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>隐藏任务栏图标 (无痕后台)</span>
          <IOSSwitch
            checked={stealthConfig.skipTaskbar}
            onChange={(val) => handleToggleSkipTaskbar(val)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>鼠标穿透 (直接点击下层软件)</span>
          <IOSSwitch
            checked={stealthConfig.clickThrough}
            onChange={(val) => handleToggleClickThrough(val)}
          />
        </div>
      </div>

      {/* Backup & Cloud Sync */}
      <div className="frosted-panel" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Monitor size={15} style={{ color: 'var(--accent-color)' }} />
          <span>数据备份与迁移</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
          <button onClick={handleExportBackup} className="frosted-btn" style={{ flex: 1, padding: '8px 10px', borderRadius: '9999px' }}>
            <Download size={13} />
            <span>导出全部数据</span>
          </button>
          <button onClick={handleImportBackup} className="frosted-btn" style={{ flex: 1, padding: '8px 10px', borderRadius: '9999px' }}>
            <Upload size={13} />
            <span>恢复数据</span>
          </button>
        </div>
      </div>
    </div>
  );
};
