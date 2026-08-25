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
  const reqHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,application/json,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
  };

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((val, key) => {
        reqHeaders[key] = val;
      });
    } else if (typeof options.headers === 'object') {
      Object.assign(reqHeaders, options.headers);
    }
  }

  if (isTauri()) {
    try {
      const tauriRes = await tauriFetch(url, {
        method: (options.method as any) || 'GET',
        headers: reqHeaders as any,
        body: options.body as any,
        signal: options.signal as any
      });
      return tauriRes as unknown as Response;
    } catch (err) {
      console.warn('Tauri native fetch failed, falling back to browser fetch:', err);
    }
  }
  return await fetch(url, { ...options, headers: reqHeaders });
};

// Smart Decoder that handles GBK/GB2312/UTF-8 for Legacy Chinese Novel Sites
export const decodeResponseText = async (response: Response): Promise<string> => {
  try {
    const buffer = await response.arrayBuffer();
    const contentType = response.headers?.get?.('content-type') || '';
    
    // Check Content-Type header
    if (contentType.toLowerCase().includes('gbk') || contentType.toLowerCase().includes('gb2312') || contentType.toLowerCase().includes('gb18030')) {
      try {
        return new TextDecoder('gbk').decode(buffer);
      } catch {}
    }

    // Try UTF-8 first
    const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
    const text = utf8Decoder.decode(buffer);

    // If meta tag says GBK/GB2312, decode with GBK
    const metaCharsetMatch = text.slice(0, 1500).match(/charset\s*=\s*["']?\s*(gbk|gb2312|gb18030)/i);
    if (metaCharsetMatch) {
      try {
        return new TextDecoder('gbk').decode(buffer);
      } catch {}
    }

    return text;
  } catch {
    return await response.text();
  }
};
