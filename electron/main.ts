import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { createTray, destroyTray } from './tray';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 360,
    height: 500,
    minWidth: 320,
    minHeight: 400,
    resizable: true,
    frame: true,
    backgroundColor: '#0f0f0f',
    title: '番茄钟',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  // 关闭窗口 → 隐藏到托盘（不退出）
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}

// ── IPC 处理器 ──
function registerIpcHandlers(): void {
  ipcMain.on('window:minimize-to-tray', () => {
    mainWindow?.hide();
  });

  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });
}

// ── 应用生命周期 ──
isQuitting = false;

app.whenReady().then(() => {
  registerIpcHandlers();
  mainWindow = createWindow();
  createTray(mainWindow);
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
    if (mainWindow) {
      createTray(mainWindow);
    }
  } else if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('will-quit', () => {
  destroyTray();
});
