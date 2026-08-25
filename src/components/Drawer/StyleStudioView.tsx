import React, { useRef } from 'react';
import { ColorThemePreset, ReadingBackgroundPreset, ThemeConfig } from '../../types/reader';
import {
  Sun,
  Moon,
  BookOpen,
  Terminal,
  Ghost,
  Type,
  Layers,
  Eye,
  Trees,
  Image,
  Upload,
  Trash2,
  Palette,
  AlignJustify
} from 'lucide-react';
import { FrostedSelect } from '../FrostedSelect';

interface StyleStudioViewProps {
  themeConfig: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
}

export const StyleStudioView: React.FC<StyleStudioViewProps> = ({
  themeConfig,
  onUpdateTheme
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets: { id: ColorThemePreset; label: string; icon: React.ReactNode }[] = [
    { id: 'dark-oled', label: '深空黑曜', icon: <Moon size={14} /> },
    { id: 'day-glass', label: '昼间通透', icon: <Sun size={14} /> },
    { id: 'parchment', label: '暖木羊皮', icon: <BookOpen size={14} /> },
    { id: 'forest', label: '幽夜墨绿', icon: <Trees size={14} /> },
    { id: 'hacker', label: '黑客矩阵', icon: <Terminal size={14} /> },
    { id: 'stealth-pure', label: '极致隐身', icon: <Ghost size={14} /> }
  ];

  const backgroundPresets: {
    id: ReadingBackgroundPreset;
    name: string;
    desc: string;
    bg: string;
    textColor: string;
    border?: string;
  }[] = [
    {
      id: 'default',
      name: '系统磨砂',
      desc: '跟随全局主题毛玻璃质感',
      bg: 'var(--glass-surface)',
      textColor: 'var(--text-primary)',
      border: '1px solid var(--glass-border)'
    },
    {
      id: 'parchment',
      name: '羊皮古纸',
      desc: '古典暖黄做旧纸质感',
      bg: '#f6f1e5',
      textColor: '#382c1e'
    },
    {
      id: 'rice-paper',
      name: '素雅宣纸',
      desc: '温润如玉柔和淡雅米白',
      bg: '#f7f6f2',
      textColor: '#27272a'
    },
    {
      id: 'eyecare-green',
      name: '豆沙护眼绿',
      desc: '舒缓眼疲劳经典豆沙绿',
      bg: '#dceada',
      textColor: '#1f3a24'
    },
    {
      id: 'warm-latte',
      name: '暖阳燕麦',
      desc: '柔和温馨暖调奶茶色',
      bg: '#f4ece1',
      textColor: '#3d352e'
    },
    {
      id: 'slate-gray',
      name: '莫兰迪雅灰',
      desc: '高级低饱和暗夜雅灰',
      bg: '#262b36',
      textColor: '#e2e8f0'
    },
    {
      id: 'kraft-wood',
      name: '复古牛皮纸',
      desc: '沉稳厚重经典牛皮纸质',
      bg: '#e8dbca',
      textColor: '#332617'
    },
    {
      id: 'navy-night',
      name: '幽夜深海蓝',
      desc: '宁静沉浸深邃暗夜蓝',
      bg: '#0b1120',
      textColor: '#cbd5e1'
    },
    {
      id: 'pure-black',
      name: '纯黑 OLED',
      desc: '极致纯黑省电低光模式',
      bg: '#000000',
      textColor: '#a1a1aa'
    }
  ];

  const fonts = [
    { label: '系统默认无衬线 (System Default)', value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Source Han Sans CN", sans-serif' },
    { label: '霞鹜文楷 (古典人文楷体)', value: '"LXGW WenKai Screen", "LXGW WenKai", "Kaiti SC", "STKaiti", "KaiTi", "楷体", "Microsoft YaHei", serif' },
    { label: '思源宋体 (典雅明朝宋体)', value: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", "宋体", serif' },
    { label: '古风行楷 (马善政手书行楷)', value: '"Ma Shan Zheng", "Kaiti SC", "STKaiti", "KaiTi", "楷体", "Microsoft YaHei", cursive, serif' },
    { label: '古风雅宋 (站酷小薇体)', value: '"ZCOOL XiaoWei", "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif' },
    { label: '文学仿宋 (经典方正仿宋)', value: '"FangSong", "STFangsong", "仿宋", "FangSong_GB2312", "Microsoft YaHei", serif' },
    { label: '极客等宽 (Fira Code 代码体)', value: '"Fira Code", "JetBrains Mono", "Consolas", "Courier New", monospace' },
    { label: '苹方黑体 (现代极简黑体)', value: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans CN", sans-serif' }
  ];

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onUpdateTheme({
          ...themeConfig,
          backgroundPreset: 'custom',
          customBgImage: base64,
          bgImageOpacity: themeConfig.bgImageOpacity ?? 0.85,
          bgImageBlur: themeConfig.bgImageBlur ?? 4
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearCustomBg = () => {
    onUpdateTheme({
      ...themeConfig,
      backgroundPreset: 'default',
      customBgImage: undefined,
      customBgColor: undefined
    });
  };

  const handleCustomFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fontName = `CustomUserFont_${Date.now()}`;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        try {
          const fontFace = new FontFace(fontName, `url(${base64})`);
          fontFace.load().then((loaded) => {
            (document.fonts as any).add(loaded);
            onUpdateTheme({
              ...themeConfig,
              fontFamily: `"${fontName}", system-ui, sans-serif`
            });
            alert('自定义字体加载成功！已实时应用到当前阅读器');
          });
        } catch {
          alert('字体加载失败，请使用标准的 TTF/OTF/WOFF2 文件');
        }
      }
    };
    reader.readAsDataURL(file);
  };

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
      
      {/* 0. Reading Mode Switcher */}
      <div className="frosted-card" style={{ padding: '12px 14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={14} style={{ color: 'var(--accent-color)' }} />
            <span>小说阅读模式</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {themeConfig.pageMode === 'paginated' ? '左右翻页模式' : '连续下拉滚动'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => onUpdateTheme({ ...themeConfig, pageMode: 'scroll' })}
            className="frosted-btn"
            style={{
              padding: '8px 10px',
              borderRadius: '12px',
              background: themeConfig.pageMode !== 'paginated' ? 'var(--accent-color)' : 'var(--glass-surface)',
              color: themeConfig.pageMode !== 'paginated' ? '#ffffff' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <AlignJustify size={14} />
            <span>连续滚动</span>
          </button>
          <button
            onClick={() => onUpdateTheme({ ...themeConfig, pageMode: 'paginated' })}
            className="frosted-btn"
            style={{
              padding: '8px 10px',
              borderRadius: '12px',
              background: themeConfig.pageMode === 'paginated' ? 'var(--accent-color)' : 'var(--glass-surface)',
              color: themeConfig.pageMode === 'paginated' ? '#ffffff' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={14} />
            <span>左右翻页</span>
          </button>
        </div>

        {/* Dual-Column Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--glass-border)', marginTop: '2px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>宽屏分栏排版</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['single', 'double', 'auto'] as const).map((col) => (
              <button
                key={col}
                onClick={() => onUpdateTheme({ ...themeConfig, columns: col })}
                className="frosted-btn"
                style={{
                  padding: '2px 8px',
                  fontSize: '10.5px',
                  borderRadius: '6px',
                  background: (themeConfig.columns || 'auto') === col ? 'var(--accent-color)' : 'transparent',
                  color: (themeConfig.columns || 'auto') === col ? '#fff' : 'inherit'
                }}
              >
                {col === 'single' ? '单栏' : col === 'double' ? '双栏' : '自动'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Theme Presets */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye size={14} style={{ color: 'var(--accent-color)' }} />
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

      {/* 2. Curated Reading Backgrounds (内置经典阅读背景库) */}
      <div className="frosted-card" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palette size={14} style={{ color: 'var(--accent-color)' }} />
            <span>阅读背景与纸张质感 (内置 9 大典藏)</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {themeConfig.backgroundPreset === 'custom' ? '自定义壁纸生效中' : '即选即生效'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
          {backgroundPresets.map((bg) => {
            const isSelected = themeConfig.backgroundPreset === bg.id;
            return (
              <div
                key={bg.id}
                onClick={() =>
                  onUpdateTheme({
                    ...themeConfig,
                    backgroundPreset: bg.id
                  })
                }
                style={{
                  background: bg.bg,
                  color: bg.textColor,
                  border: isSelected ? '2px solid var(--accent-color)' : bg.border || '1px solid rgba(0,0,0,0.15)',
                  boxShadow: isSelected ? '0 0 0 2px var(--accent-shadow), 0 4px 12px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.08)',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '52px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s var(--ios-spring-bouncy)',
                  transform: isSelected ? 'scale(1.02)' : 'none'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{bg.name}</span>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>字</span>
                </div>
                <div style={{ fontSize: '10px', opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {bg.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Custom Background Image & Wallpaper Studio (自定义壁纸工坊) */}
      <div className="frosted-card" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Image size={14} style={{ color: 'var(--accent-color)' }} />
            <span>自定义阅读壁纸与纯色</span>
          </div>
          {themeConfig.customBgImage && (
            <button
              onClick={handleClearCustomBg}
              className="frosted-btn"
              style={{ padding: '2px 8px', fontSize: '11px', color: '#ef4444', borderRadius: '9999px' }}
              title="清除自定义壁纸"
            >
              <Trash2 size={11} />
              <span>还原</span>
            </button>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleCustomImageUpload}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="frosted-btn frosted-btn-primary"
            style={{ flex: 1, padding: '7px 12px', fontSize: '12px', borderRadius: '10px' }}
          >
            <Upload size={13} />
            <span>{themeConfig.customBgImage ? '更换自定义背景图片' : '上传自定义背景图片'}</span>
          </button>
        </div>

        {themeConfig.customBgImage && (
          <div className="animate-ios-spring" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>壁纸不透明度 (Opacity)</span>
                <span>{Math.round((themeConfig.bgImageOpacity ?? 0.85) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={themeConfig.bgImageOpacity ?? 0.85}
                onChange={(e) => onUpdateTheme({ ...themeConfig, bgImageOpacity: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-color)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>壁纸高斯模糊度 (Blur)</span>
                <span>{themeConfig.bgImageBlur ?? 4}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={themeConfig.bgImageBlur ?? 4}
                onChange={(e) => onUpdateTheme({ ...themeConfig, bgImageBlur: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-color)' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Glass Transparency & Blur */}
      <div className="frosted-card" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} style={{ color: 'var(--accent-color)' }} />
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

      {/* 5. Typography Studio */}
      <div className="frosted-card" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Type size={14} style={{ color: 'var(--accent-color)' }} />
          <span>文字排版微调</span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>字体选择</div>
            <label
              className="frosted-btn"
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                borderRadius: '9999px',
                cursor: 'pointer',
                color: 'var(--accent-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Upload size={11} />
              <span>上传本地字体 (.ttf/.woff2)</span>
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleCustomFontUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
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
