import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, readFile } from '@tauri-apps/plugin-fs';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

export const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Window Controls
export const windowControls = {
  minimize: async () => {
    if (isTauri()) {
      const win = getCurrentWindow();
      await win.minimize();
    }
  },
  toggleMaximize: async () => {
    if (isTauri()) {
      const win = getCurrentWindow();
      await win.toggleMaximize();
    }
  },
  close: async () => {
    if (isTauri()) {
      const win = getCurrentWindow();
      await win.close();
    }
  },
  hide: async () => {
    if (isTauri()) {
      const win = getCurrentWindow();
      await win.hide();
    }
  },
  show: async () => {
    if (isTauri()) {
      const win = getCurrentWindow();
      await win.show();
      await win.setFocus();
    }
  },
  startDragging: async () => {
    if (isTauri()) {
      const win = getCurrentWindow();
      await win.startDragging();
    }
  },
  setAlwaysOnTop: async (alwaysOnTop: boolean) => {
    if (isTauri()) {
      try {
        const win = getCurrentWindow();
        await win.setAlwaysOnTop(alwaysOnTop);
      } catch (err) {
        console.warn('Failed to set always on top:', err);
      }
    }
  },
  setClickThrough: async (enable: boolean) => {
    if (isTauri()) {
      try {
        await invoke('set_click_through', { ignore: enable });
      } catch (err) {
        console.warn('Failed to set click-through:', err);
      }
    }
  },
  setSkipTaskbar: async (skip: boolean) => {
    if (isTauri()) {
      try {
        await invoke('set_skip_taskbar', { skip });
      } catch (err) {
        console.warn('Failed to set skip taskbar:', err);
      }
    }
  }
};

// Cross-Platform Global Shortcut Registration
export const registerBossKeyShortcut = async (shortcut: string, onTrigger: () => void) => {
  if (!isTauri()) return;
  try {
    await unregisterAll();
    await register(shortcut, (event) => {
      if (event.state === 'Pressed') {
        onTrigger();
      }
    });
  } catch (err) {
    console.warn(`Could not register shortcut ${shortcut}:`, err);
  }
};

// Cross-Platform File Dialog & Reader
export const openLocalFileDialog = async (filters: { name: string; extensions: string[] }[]) => {
  if (isTauri()) {
    const selected = await open({
      multiple: false,
      filters
    });
    if (typeof selected === 'string') {
      const filename = selected.split(/[\\/]/).pop() || '未命名书籍';
      // If extension is epub, read binary
      if (selected.toLowerCase().endsWith('.epub')) {
        const bytes = await readFile(selected);
        return { name: filename, path: selected, buffer: bytes.buffer };
      } else {
        const text = await readTextFile(selected);
        return { name: filename, path: selected, text };
      }
    }
    return null;
  }
  return null;
};

// Universal Cross-Origin HTTP Request (uses Tauri plugin-http to bypass browser CORS)
export const universalFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  if (isTauri()) {
    try {
      return await tauriFetch(url, {
        method: options.method || 'GET',
        headers: (options.headers as Record<string, string>) || {},
        body: options.body as any,
        connectTimeout: 10000
      });
    } catch (err) {
      console.warn('Tauri HTTP request fallback to native fetch:', err);
    }
  }
  return await fetch(url, options);
};
