import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';

let tray: Tray | null = null;

/** 用像素数据生成 16x16 番茄红圆形托盘图标 */
function createTrayIcon(): Electron.NativeImage {
  const size = 16;
  const raw = Buffer.alloc(size * size * 4); // BGRA
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const r = (size - 2) / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const i = (y * size + x) * 4;

      if (dist <= r) {
        const edge = dist > r - 1;
        raw[i]     = edge ? 0x2a : 0x35; // B
        raw[i + 1] = edge ? 0x2e : 0x39; // G
        raw[i + 2] = edge ? 0xbe : 0xe5; // R
        raw[i + 3] = 0xff;               // A
      }
      // 其余保持全透明
    }
  }

  // 先创建 raw NativeImage，再通过 PNG 编码 → 解码，
  // 确保 Windows 托盘能正确渲染
  const rawImage = nativeImage.createFromBuffer(raw, {
    width: size,
    height: size,
    scaleFactor: 1.0,
  });

  const pngBuffer = rawImage.toPNG();
  return nativeImage.createFromBuffer(pngBuffer, { scaleFactor: 1.0 });
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
