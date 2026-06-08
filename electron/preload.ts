import { contextBridge } from 'electron';

// Phase 4-5 将在此暴露 system tray / notification 相关 API
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
