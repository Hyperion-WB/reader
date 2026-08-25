import React, { useState, useEffect } from 'react';
import { Book, Bookmark, BookSource, ChameleonModeType, StealthConfig, ThemeConfig } from '../types/reader';
import { BookshelfView } from './Drawer/BookshelfView';
import { TocView } from './Drawer/TocView';
import { BookmarksView } from './Drawer/BookmarksView';
import { OnlineSearchView } from './Drawer/OnlineSearchView';
import { SourceManagerView } from './Drawer/SourceManagerView';
import { StyleStudioView } from './Drawer/StyleStudioView';
import { StealthConsoleView } from './Drawer/StealthConsoleView';
import { ReadingHeatmapView } from './Drawer/ReadingHeatmapView';
import { IOSSegmentedControl } from './IOSSegmentedControl';
import {
  Library,
  ListTree,
  Bookmark as BookmarkIcon,
  Search,
  Globe,
  Palette,
  ShieldCheck,
  Flame,
  HelpCircle,
  Keyboard,
  X
} from 'lucide-react';

export type DrawerTab = 'bookshelf' | 'toc' | 'bookmarks' | 'search' | 'sources' | 'style' | 'stealth' | 'stats';

interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  activeBook: Book | null;
  activeBookId: string | null;
  bookmarks: Bookmark[];
  sources: BookSource[];
  themeConfig: ThemeConfig;
  stealthConfig: StealthConfig;
  onSelectBook: (id: string) => void;
  onDeleteBook: (id: string) => void;
  onImportLocal: () => void;
  onSelectChapter: (index: number) => void;
  onSelectBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onAddBookToShelf: (book: Book) => void;
  onUpdateSources: (sources: BookSource[]) => void;
  onUpdateTheme: (theme: ThemeConfig) => void;
  onUpdateStealth: (config: StealthConfig) => void;
  onReloadAllData: () => void;
  onUpdateBookCover?: (bookId: string, cover: string) => void;
  onChangeChameleonMode?: (mode: ChameleonModeType) => void;
  onOpenGuide?: () => void;
  onOpenShortcuts?: () => void;
  todayReadingMinutes?: number;
}

export const GlassDrawer: React.FC<GlassDrawerProps> = ({
  isOpen,
  onClose,
  books,
  activeBook,
  activeBookId,
  bookmarks,
  sources,
  themeConfig,
  stealthConfig,
  onSelectBook,
  onDeleteBook,
  onImportLocal,
  onSelectChapter,
  onSelectBookmark,
  onDeleteBookmark,
  onAddBookToShelf,
  onUpdateSources,
  onUpdateTheme,
  onUpdateStealth,
  onReloadAllData,
  onUpdateBookCover,
  onChangeChameleonMode,
  onOpenGuide,
  onOpenShortcuts,
  todayReadingMinutes
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('bookshelf');

  const navItems: { id: DrawerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'bookshelf', label: '书架', icon: <Library size={13} /> },
    { id: 'toc', label: '目录', icon: <ListTree size={13} /> },
    { id: 'bookmarks', label: '书签', icon: <BookmarkIcon size={13} /> },
    { id: 'search', label: '搜书', icon: <Search size={13} /> },
    { id: 'sources', label: '书源', icon: <Globe size={13} /> },
    { id: 'style', label: '排版', icon: <Palette size={13} /> },
    { id: 'stealth', label: '摸鱼', icon: <ShieldCheck size={13} /> },
    { id: 'stats', label: '打卡', icon: <Flame size={13} /> }
  ];

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isNarrowDrawer = windowWidth < 500;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: isOpen ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: isOpen ? 'blur(8px)' : 'none',
        transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={onClose}
    >
      {/* Floating Island Drawer Card - Positioned Elegantly Below Top Navigation Bar */}
      <div
        className="frosted-panel"
        style={{
          marginTop: '68px',
          marginLeft: '14px',
          marginBottom: '14px',
          width: '520px',
          maxWidth: 'calc(100vw - 28px)',
          height: 'calc(100% - 82px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 14px',
          boxSizing: 'border-box',
          gap: '10px',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          transform: isOpen ? 'translateX(0) scale(1)' : 'translateX(-40px) scale(0.96)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.34, 1.36, 0.64, 1), opacity 0.28s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header & Segmented Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>控制中心</span>
              <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>
                ({activeTab === 'bookshelf' ? '我的书架' : activeTab === 'toc' ? '书籍目录' : activeTab === 'bookmarks' ? '精彩书签' : activeTab === 'search' ? '聚合搜书' : activeTab === 'sources' ? '书源管理' : activeTab === 'style' ? '排版样式' : activeTab === 'stealth' ? '摸鱼隐身' : '打卡热力图'})
              </span>
            </div>
            {todayReadingMinutes !== undefined && todayReadingMinutes > 0 && (
              <span
                onClick={() => setActiveTab('stats')}
                style={{ fontSize: '10.5px', color: 'var(--accent-color)', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '9999px', fontWeight: 500, cursor: 'pointer' }}
                data-tooltip="点击查看 365 天阅读打卡热力图"
                data-tooltip-pos="bottom"
              >
                今日已读 {todayReadingMinutes} 分钟
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="frosted-btn"
                style={{ padding: '5px', borderRadius: '50%' }}
                data-tooltip="全局快捷键速查 (F1 / ?)"
                data-tooltip-pos="bottom"
              >
                <Keyboard size={14} />
              </button>
            )}
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="frosted-btn"
                style={{ padding: '5px', borderRadius: '50%' }}
                data-tooltip="应用介绍与新手指南"
                data-tooltip-pos="bottom"
              >
                <HelpCircle size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="frosted-btn"
              style={{ padding: '5px', borderRadius: '50%' }}
              data-tooltip="关闭侧边栏 (Esc)"
              data-tooltip-pos="bottom"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Responsive Segmented Navigation Control */}
        {isNarrowDrawer ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: 'rgba(0, 0, 0, 0.16)', padding: '4px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
            {navItems.map((item) => {
              const isActive = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="frosted-btn"
                  style={{
                    padding: '6px 4px',
                    borderRadius: '10px',
                    background: isActive ? 'var(--accent-color)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '11px',
                    justifyContent: 'center',
                    gap: '4px',
                    border: 'none',
                    boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <IOSSegmentedControl<DrawerTab>
            items={navItems}
            activeId={activeTab}
            onChange={setActiveTab}
            height={34}
          />
        )}

        {/* Drawer Tab Content */}
        <div className="tauri-no-drag" style={{ flex: 1, height: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', padding: '4px 2px 2px 2px', borderRadius: '16px' }}>
          {activeTab === 'bookshelf' && (
            <BookshelfView
              books={books}
              activeBookId={activeBookId}
              onSelectBook={(id) => {
                onSelectBook(id);
                onClose();
              }}
              onDeleteBook={onDeleteBook}
              onImportLocal={onImportLocal}
              onOpenSearch={() => setActiveTab('search')}
              onUpdateBookCover={onUpdateBookCover}
            />
          )}

          {activeTab === 'toc' && (
            <TocView
              chapters={activeBook?.chapters || []}
              currentChapterIndex={activeBook?.currentChapterIndex || 0}
              onSelectChapter={(idx) => {
                onSelectChapter(idx);
                onClose();
              }}
            />
          )}

          {activeTab === 'bookmarks' && (
            <BookmarksView
              bookmarks={bookmarks}
              activeBookId={activeBookId}
              onSelectBookmark={(bm) => {
                onSelectBookmark(bm);
                onClose();
              }}
              onDeleteBookmark={onDeleteBookmark}
            />
          )}

          {activeTab === 'search' && (
            <OnlineSearchView
              sources={sources}
              onAddBookToShelf={(book) => {
                onAddBookToShelf(book);
                onClose();
              }}
            />
          )}

          {activeTab === 'sources' && (
            <SourceManagerView
              sources={sources}
              onUpdateSources={onUpdateSources}
            />
          )}

          {activeTab === 'style' && (
            <StyleStudioView
              themeConfig={themeConfig}
              onUpdateTheme={onUpdateTheme}
            />
          )}

          {activeTab === 'stealth' && (
            <StealthConsoleView
              stealthConfig={stealthConfig}
              onUpdateStealth={onUpdateStealth}
              onReloadAllData={onReloadAllData}
              onChangeChameleonMode={(mode) => {
                onChangeChameleonMode?.(mode);
                onClose();
              }}
            />
          )}

          {activeTab === 'stats' && (
            <ReadingHeatmapView
              todayReadingMinutes={todayReadingMinutes || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};
