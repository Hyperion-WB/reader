import { ColorThemePreset, ThemeConfig } from '../../types/reader';
import { Sun, Moon, BookOpen, Terminal, Ghost, Type, Layers, Eye } from 'lucide-react';
import { FrostedSelect } from '../FrostedSelect';

interface StyleStudioViewProps {
  themeConfig: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
}

export const StyleStudioView: React.FC<StyleStudioViewProps> = ({
  themeConfig,
  onUpdateTheme
}) => {
  const presets: { id: ColorThemePreset; label: string; icon: React.ReactNode }[] = [
    { id: 'day-glass', label: '昼间通透', icon: <Sun size={14} /> },
    { id: 'dark-oled', label: '暗夜深邃', icon: <Moon size={14} /> },
    { id: 'parchment', label: '纸质护眼', icon: <BookOpen size={14} /> },
    { id: 'hacker', label: '黑客矩阵', icon: <Terminal size={14} /> },
    { id: 'stealth-pure', label: '极致隐形', icon: <Ghost size={14} /> }
  ];

  const fonts = [
    { label: '系统默认无衬线', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif' },
    { label: '霞鹜文楷 / 楷体', value: '"LXGW WenKai", "KaiTi", "STKaiti", serif' },
    { label: '思源宋体 / 明朝', value: '"Source Han Serif CN", "Songti SC", "SimSun", serif' },
    { label: '等宽极客代码体', value: '"Consolas", "Courier New", "Fira Code", monospace' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
      {/* Theme Presets */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye size={14} />
          <span>视觉预设风格</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '6px' }}>
          {presets.map((p) => {
            const isSelected = themeConfig.themePreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onUpdateTheme({ ...themeConfig, themePreset: p.id })}
                className="frosted-btn"
                style={{
                  padding: '8px 6px',
                  borderRadius: '12px',
                  background: isSelected ? 'var(--accent-color)' : 'var(--glass-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '12px',
                  flexDirection: 'column',
                  gap: '4px',
                  border: isSelected ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--glass-border)'
                }}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Glass Transparency & Blur */}
      <div className="frosted-panel" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} />
          <span>通透磨砂材质精调</span>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>磨砂模糊度 (Blur)</span>
            <span>{themeConfig.glassBlurRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={themeConfig.glassBlurRadius}
            onChange={(e) => onUpdateTheme({ ...themeConfig, glassBlurRadius: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-color)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>背景通透度 (Opacity)</span>
            <span>{Math.round(themeConfig.customGlassOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={themeConfig.customGlassOpacity}
            onChange={(e) => onUpdateTheme({ ...themeConfig, customGlassOpacity: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-color)' }}
          />
        </div>
      </div>

      {/* Typography Studio */}
      <div className="frosted-panel" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Type size={14} />
          <span>文字排版微调</span>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>字体选择</div>
          <FrostedSelect
            options={fonts}
            value={themeConfig.fontFamily}
            onChange={(val) => onUpdateTheme({ ...themeConfig, fontFamily: val })}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>字号大小</span>
            <span>{themeConfig.fontSize}px</span>
          </div>
          <input
            type="range"
            min="11"
            max="32"
            value={themeConfig.fontSize}
            onChange={(e) => onUpdateTheme({ ...themeConfig, fontSize: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-color)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>黄金行距 (Line Height)</span>
            <span>{themeConfig.lineHeight}</span>
          </div>
          <input
            type="range"
            min="1.2"
            max="2.8"
            step="0.1"
            value={themeConfig.lineHeight}
            onChange={(e) => onUpdateTheme({ ...themeConfig, lineHeight: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-color)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>段落缩进</span>
            <span>{themeConfig.paragraphIndent}em</span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={themeConfig.paragraphIndent}
            onChange={(e) => onUpdateTheme({ ...themeConfig, paragraphIndent: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-color)' }}
          />
        </div>
      </div>
    </div>
  );
};
