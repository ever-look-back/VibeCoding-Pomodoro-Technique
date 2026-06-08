export interface ElectronAPI {
  platform: string;
  minimizeToTray: () => void;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
