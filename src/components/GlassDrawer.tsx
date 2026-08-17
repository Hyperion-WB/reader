import React, { useState } from 'react';
import { Book, Bookmark, BookSource, StealthConfig, ThemeConfig } from '../types/reader';
import { BookshelfView } from './Drawer/BookshelfView';
import { TocView } from './Drawer/TocView';
import { BookmarksView } from './Drawer/BookmarksView';
import { OnlineSearchView } from './Drawer/OnlineSearchView';
import { SourceManagerView } from './Drawer/SourceManagerView';
import { StyleStudioView } from './Drawer/StyleStudioView';
import { StealthConsoleView } from './Drawer/StealthConsoleView';
import { IOSSegmentedControl } from './IOSSegmentedControl';
import {
  Library,
  ListTree,
  Bookmark as BookmarkIcon,
  Search,
  Globe,
  Palette,
  ShieldCheck,
  X
} from 'lucide-react';

export type DrawerTab = 'bookshelf' | 'toc' | 'bookmarks' | 'search' | 'sources' | 'style' | 'stealth';

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
  onReloadAllData
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('bookshelf');

  if (!isOpen) return null;

  const navItems: { id: DrawerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'bookshelf', label: '书架', icon: <Library size={13} /> },
    { id: 'toc', label: '目录', icon: <ListTree size={13} /> },
    { id: 'bookmarks', label: '书签', icon: <BookmarkIcon size={13} /> },
    { id: 'search', label: '搜书', icon: <Search size={13} /> },
    { id: 'sources', label: '书源', icon: <Globe size={13} /> },
    { id: 'style', label: '排版', icon: <Palette size={13} /> },
    { id: 'stealth', label: '摸鱼', icon: <ShieldCheck size={13} /> }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      {/* Drawer Main Container */}
      <div
        className="frosted-panel animate-ios-drawer"
        style={{
          width: '460px',
          maxWidth: '88vw',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '18px 16px',
          boxSizing: 'border-box',
          gap: '12px',
          borderRight: '1px solid var(--glass-border-hover)',
          borderRadius: '0 20px 20px 0',
          boxShadow: '8px 0 32px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header & Segmented Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            控制中心
          </div>
          <button
            onClick={onClose}
            className="frosted-btn"
            style={{ padding: '6px', borderRadius: '50%' }}
            title="关闭侧边栏 (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        {/* Top Segmented Navigation Control with iOS Fluid Sliding Pill */}
        <IOSSegmentedControl<DrawerTab>
          items={navItems}
          activeId={activeTab}
          onChange={setActiveTab}
          height={36}
        />

        {/* Drawer Tab Content with generous padding to prevent clipped shadows */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '4px 2px' }}>
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
              onAddBookToShelf={(newBook) => {
                onAddBookToShelf(newBook);
                onClose();
              }}
            />
          )}

          {activeTab === 'sources' && (
            <SourceManagerView sources={sources} onUpdateSources={onUpdateSources} />
          )}

          {activeTab === 'style' && (
            <StyleStudioView themeConfig={themeConfig} onUpdateTheme={onUpdateTheme} />
          )}

          {activeTab === 'stealth' && (
            <StealthConsoleView
              stealthConfig={stealthConfig}
              onUpdateStealth={onUpdateStealth}
              onReloadAllData={onReloadAllData}
            />
          )}
        </div>
      </div>
    </div>
  );
};
