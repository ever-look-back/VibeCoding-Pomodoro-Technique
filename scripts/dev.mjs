import { execSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Step 1: 编译 Electron TypeScript 文件
console.log('[dev] Compiling electron TypeScript...');
execSync('npx tsc -p tsconfig.node.json', { cwd: root, stdio: 'inherit' });

// Step 2: 启动 Vite 开发服务器
console.log('[dev] Starting Vite dev server...');
const vite = spawn('npx', ['vite', '--host'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

// Step 3: 等待 Vite 就绪（轮询 localhost:5173），然后启动 Electron
console.log('[dev] Waiting for Vite to be ready...');
const maxRetries = 30;
let retries = 0;

async function waitForVite() {
  while (retries < maxRetries) {
    try {
      const res = await fetch('http://localhost:5173');
      if (res.ok || res.status === 304) {
        console.log('[dev] Vite ready, launching Electron...');
        return true;
      }
    } catch {
      // Vite not ready yet
    }
    retries++;
    await new Promise((r) => setTimeout(r, 500));
  }
  console.error('[dev] Vite failed to start within timeout');
  return false;
}

waitForVite().then((ready) => {
  if (!ready) {
    cleanup();
    return;
  }

  const electron = spawn(
    'npx',
    ['electron', '--inspect=9229', '.'],
    {
      cwd: root,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' },
    },
  );

  electron.on('close', () => {
    cleanup();
  });
});

function cleanup() {
  vite.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
