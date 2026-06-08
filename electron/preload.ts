import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  platform: string;
  minimizeToTray: () => void;
  getAppVersion: () => Promise<string>;
}

const electronAPI: ElectronAPI = {
  platform: process.platform,

  minimizeToTray: () => {
    ipcRenderer.send('window:minimize-to-tray');
  },

  getAppVersion: () => {
    return ipcRenderer.invoke('app:get-version');
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
