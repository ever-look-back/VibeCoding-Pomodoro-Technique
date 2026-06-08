import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';

let tray: Tray | null = null;

/** 用像素数据生成 16x16 番茄红圆形图标 */
function createTrayIcon(): Electron.NativeImage {
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4); // BGRA
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const i = (y * size + x) * 4;

      if (dist <= r) {
        // Border
        if (dist > r - 1.5) {
          buffer[i] = 0x55;     // B (darker border)
          buffer[i + 1] = 0x20;
          buffer[i + 2] = 0x8a;
          buffer[i + 3] = 0xff;
        } else {
          buffer[i] = 0x35;     // B
          buffer[i + 1] = 0x39; // G
          buffer[i + 2] = 0xe5; // R
          buffer[i + 3] = 0xff; // A
        }
      }
      // 其余保持透明
    }
  }

  return nativeImage.createFromBuffer(buffer, {
    width: size,
    height: size,
    scaleFactor: 1.0,
  });
}

/** 创建系统托盘 */
export function createTray(win: BrowserWindow): Tray {
  if (tray) return tray;

  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('番茄钟');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        win.show();
        win.focus();
      },
    },
    { type: 'separator' },
    {
      label: '完成当前后退出',
      click: () => {
        // TODO Phase 5: 如果有正在进行的番茄，提示用户
        app.quit();
      },
    },
    {
      label: '立即退出',
      click: () => {
        app.exit(0);
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // 单击托盘图标恢复窗口
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  return tray;
}

/** 销毁托盘 */
export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

export function getTray(): Tray | null {
  return tray;
}
