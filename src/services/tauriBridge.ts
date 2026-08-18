import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, readFile } from '@tauri-apps/plugin-fs';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

export const isTauri = () => {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
};

// Robust Window Controls for Frameless Tauri App
export const windowControls = {
  minimize: async () => {
    if (isTauri()) {
      try {
        await invoke('app_minimize');
      } catch {
        const win = getCurrentWindow();
        await win.minimize();
      }
    }
  },
  toggleMaximize: async () => {
    if (isTauri()) {
      try {
        await invoke('app_toggle_maximize');
      } catch {
        const win = getCurrentWindow();
        await win.toggleMaximize();
      }
    }
  },
  close: async () => {
    if (isTauri()) {
      try {
        await invoke('app_close');
      } catch {
        const win = getCurrentWindow();
        await win.close();
      }
    }
  },
  hide: async () => {
    if (isTauri()) {
      try {
        const win = getCurrentWindow();
        await win.hide();
      } catch (err) {
        console.warn('Failed to hide window:', err);
      }
    }
  },
  show: async () => {
    if (isTauri()) {
      try {
        const win = getCurrentWindow();
        await win.show();
        await win.setFocus();
      } catch (err) {
        console.warn('Failed to show window:', err);
      }
    }
  },
  startDragging: async () => {
    if (isTauri()) {
      try {
        const win = getCurrentWindow();
        await win.startDragging();
      } catch {
        try {
          await invoke('app_start_drag');
        } catch (err) {
          console.warn('Failed to start dragging window:', err);
        }
      }
    }
  },
  startResize: async (direction: any) => {
    if (isTauri()) {
      try {
        const win = getCurrentWindow();
        await win.startResizeDragging(direction);
      } catch (err) {
        console.warn('Failed to start resize dragging:', err);
      }
    }
  },
  setAlwaysOnTop: async (alwaysOnTop: boolean) => {
    if (isTauri()) {
      try {
        await invoke('set_always_on_top', { onTop: alwaysOnTop });
      } catch {
        const win = getCurrentWindow();
        await win.setAlwaysOnTop(alwaysOnTop);
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
      filters: filters
    });
    return selected as string | null;
  }
  return null;
};

export const readLocalTextFile = async (path: string) => {
  if (isTauri()) {
    return await readTextFile(path);
  }
  throw new Error('Local file read is only available in Desktop App mode');
};

export const readLocalBinaryFile = async (path: string): Promise<ArrayBuffer> => {
  if (isTauri()) {
    const uint8Array = await readFile(path);
    return uint8Array.buffer as ArrayBuffer;
  }
  throw new Error('Local binary file read is only available in Desktop App mode');
};

// Cross-Platform Fetch Bridge (Bypasses Web CORS via Rust plugin-http in Desktop mode)
export const universalFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  if (isTauri()) {
    try {
      const tauriRes = await tauriFetch(url, {
        method: options.method as any || 'GET',
        headers: options.headers as any,
        body: options.body as any
      });
      return tauriRes as unknown as Response;
    } catch (err) {
      console.warn('Tauri native fetch failed, falling back to browser fetch:', err);
    }
  }
  return await fetch(url, options);
};
