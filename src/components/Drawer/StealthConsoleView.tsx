import React from 'react';
import { ChameleonModeType, StealthConfig } from '../../types/reader';
import { StorageService } from '../../services/storageService';
import {
  MousePointer,
  EyeOff,
  Download,
  Upload,
  Monitor,
  Shield,
  FileSpreadsheet,
  FileText,
  Code2,
  FileBadge,
  Mail,
  MessageSquare,
  Presentation,
  StickyNote,
  Activity,
  Sparkles,
  Power
} from 'lucide-react';
import { windowControls } from '../../services/tauriBridge';
import { IOSSwitch } from '../IOSSwitch';
import { FrostedSelect } from '../FrostedSelect';

interface StealthConsoleViewProps {
  stealthConfig: StealthConfig;
  onUpdateStealth: (config: StealthConfig) => void;
  onReloadAllData: () => void;
  onChangeChameleonMode?: (mode: ChameleonModeType) => void;
}

export const StealthConsoleView: React.FC<StealthConsoleViewProps> = ({
  stealthConfig,
  onUpdateStealth,
  onReloadAllData,
  onChangeChameleonMode
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

  const chameleonCards: {
    id: ChameleonModeType;
    name: string;
    desc: string;
    shortcut?: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'excel',
      name: 'Excel 365 电子表格',
      desc: '微软简体中文商业分析报表',
      shortcut: 'Alt+E',
      icon: <FileSpreadsheet size={16} />,
      color: '#107c41'
    },
    {
      id: 'word',
      name: 'Word / WPS 公文纲要',
      desc: '标准 A4 战略规划公文汇报',
      shortcut: 'Alt+W',
      icon: <FileText size={16} />,
      color: '#2b579a'
    },
    {
      id: 'email',
      name: 'Outlook 365 企业邮箱',
      desc: '周报邮件与部门公文收件箱',
      shortcut: 'Alt+O',
      icon: <Mail size={16} />,
      color: '#0078d4'
    },
    {
      id: 'chat',
      name: '企微/钉钉 工作群聊',
      desc: '项目技术方案讨论群消息流',
      shortcut: 'Enter 发送',
      icon: <MessageSquare size={16} />,
      color: '#07c160'
    },
    {
      id: 'ppt',
      name: 'PowerPoint 演示文稿',
      desc: '16:9 商务演示大纲卡片放映',
      icon: <Presentation size={16} />,
      color: '#d24726'
    },
    {
      id: 'vscode',
      name: 'VS Code 代码编辑器',
      desc: 'TypeScript / React 编程环境',
      shortcut: 'Alt+C',
      icon: <Code2 size={16} />,
      color: '#007acc'
    },
    {
      id: 'idea',
      name: 'IntelliJ IDEA 终端',
      desc: 'Java / Spring 架构控制台',
      shortcut: 'Alt+I',
      icon: <span style={{ fontWeight: 800, fontSize: '13px' }}>IJ</span>,
      color: '#ff318c'
    },
    {
      id: 'pdf',
      name: 'PDF 学术论文文献',
      desc: 'IEEE / SCI 双栏学术文献',
      icon: <FileBadge size={16} />,
      color: '#ff4d4f'
    },
    {
      id: 'stickynote',
      name: '便签备忘录',
      desc: '桌面极简黄色便签记事本',
      icon: <StickyNote size={16} />,
      color: '#eab308'
    },
    {
      id: 'ticker',
      name: '24px 极窄状态条',
      desc: '极低占用迷你单行跑马灯',
      shortcut: 'Alt+1',
      icon: <Activity size={16} />,
      color: '#10b981'
    }
  ];

  return (
    <div
      className="smooth-scroll tauri-no-drag"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        gap: '14px',
        padding: '2px 4px 48px 2px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. All 10 Camouflage Modes Matrix Grid */}
      <div className="frosted-card" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={15} style={{ color: 'var(--accent-color)' }} />
            <span>全场景摸鱼伪装矩阵 (10 大专属模式)</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>点击卡片即刻变身</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            gap: '8px'
          }}
        >
          {chameleonCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onChangeChameleonMode?.(card.id)}
              className="frosted-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'var(--glass-surface)',
                border: '1px solid var(--glass-border)',
                justifyContent: 'flex-start',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.22s var(--ios-spring-bouncy)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.borderColor = card.color;
                e.currentTarget.style.boxShadow = `0 6px 16px ${card.color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${card.color}22`,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {card.icon}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {card.name}
                  </span>
                  {card.shortcut && (
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', background: 'var(--glass-surface)', padding: '1px 4px', borderRadius: '4px' }}>
                      {card.shortcut}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Boss Key Config with FrostedSelect */}
      <div className="frosted-card" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

      {/* 3. Mouse Proximity Auto-Fade with IOSSwitch */}
      <div className="frosted-card" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

      {/* 4. Advanced Stealth Toggles with IOSSwitches */}
      <div className="frosted-card" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

      {/* 5. Window Close Action Preference */}
      <div className="frosted-card" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Power size={15} style={{ color: 'var(--accent-color)' }} />
          <span>点击关闭 (X) 时的行为</span>
        </div>

        <FrostedSelect
          options={[
            { label: '每次点击关闭时询问', value: 'ask' },
            { label: '最小化到系统托盘 (保持后台运行)', value: 'tray' },
            { label: '彻底退出程序', value: 'exit' }
          ]}
          value={localStorage.getItem('liquid_reader_close_action') || 'ask'}
          onChange={(val) => {
            localStorage.setItem('liquid_reader_close_action', val);
            // trigger custom storage event for sync
            window.dispatchEvent(new Event('storage'));
          }}
        />
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          选择“最小化到系统托盘”可保持后台运行，随时使用快捷键 <kbd style={{ padding: '1px 4px', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', fontSize: '10px' }}>Alt + `</kbd> 唤醒。
        </div>
      </div>

      {/* 6. Backup & Cloud Sync */}
      <div className="frosted-card" style={{ padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Monitor size={15} style={{ color: 'var(--accent-color)' }} />
          <span>数据备份与迁移</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExportBackup}
            className="frosted-btn"
            style={{ flex: 1, padding: '8px', borderRadius: '10px' }}
          >
            <Download size={13} />
            <span>导出全量配置与书架</span>
          </button>
          <button
            onClick={handleImportBackup}
            className="frosted-btn"
            style={{ flex: 1, padding: '8px', borderRadius: '10px' }}
          >
            <Upload size={13} />
            <span>恢复备份数据</span>
          </button>
        </div>
      </div>
    </div>
  );
};
