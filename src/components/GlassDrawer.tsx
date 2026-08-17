import React, { useState } from 'react';
import { Book, BookSource, StealthConfig, ThemeConfig } from '../types/reader';
import { BookshelfView } from './Drawer/BookshelfView';
import { TocView } from './Drawer/TocView';
import { OnlineSearchView } from './Drawer/OnlineSearchView';
import { SourceManagerView } from './Drawer/SourceManagerView';
import { StyleStudioView } from './Drawer/StyleStudioView';
import { StealthConsoleView } from './Drawer/StealthConsoleView';
import {
  Library,
  ListTree,
  Search,
  Globe,
  Palette,
  ShieldCheck,
  X
} from 'lucide-react';

export type DrawerTab = 'bookshelf' | 'toc' | 'search' | 'sources' | 'style' | 'stealth';

interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  activeBook: Book | null;
  activeBookId: string | null;
  sources: BookSource[];
  themeConfig: ThemeConfig;
  stealthConfig: StealthConfig;
  onSelectBook: (id: string) => void;
  onDeleteBook: (id: string) => void;
  onImportLocal: () => void;
  onSelectChapter: (index: number) => void;
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
  sources,
  themeConfig,
  stealthConfig,
  onSelectBook,
  onDeleteBook,
  onImportLocal,
  onSelectChapter,
  onAddBookToShelf,
  onUpdateSources,
  onUpdateTheme,
  onUpdateStealth,
  onReloadAllData
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('bookshelf');

  if (!isOpen) return null;

  const navItems: { id: DrawerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'bookshelf', label: '书架', icon: <Library size={15} /> },
    { id: 'toc', label: '目录', icon: <ListTree size={15} /> },
    { id: 'search', label: '搜书', icon: <Search size={15} /> },
    { id: 'sources', label: '书源', icon: <Globe size={15} /> },
    { id: 'style', label: '排版', icon: <Palette size={15} /> },
    { id: 'stealth', label: '摸鱼', icon: <ShieldCheck size={15} /> }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      {/* Drawer Main Container */}
      <div
        className="liquid-glass-panel animate-drawer-slide"
        style={{
          width: '420px',
          maxWidth: '85vw',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          boxSizing: 'border-box',
          gap: '14px',
          borderRight: '1px solid var(--glass-border-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header & Segmented Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            控制中心
          </div>
          <button
            onClick={onClose}
            className="liquid-glass-btn"
            style={{ padding: '6px', borderRadius: '50%' }}
            title="关闭侧边栏 (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Top Segmented Navigation Pills */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '3px',
            borderRadius: '12px',
            gap: '2px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '6px 0',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'var(--accent-color)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s var(--spring-smooth)'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Tab Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
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
