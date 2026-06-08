import { execSync, spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Step 1: 编译 Electron TypeScript 文件
console.log('[dev] Compiling electron TypeScript...');
execSync('npx tsc -p tsconfig.node.json', { cwd: root, stdio: 'inherit' });

// Step 2: 启动 Vite 开发服务器
console.log('[dev] Starting Vite dev server...');
const vite: ChildProcess = spawn('npx', ['vite', '--host'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

// Step 3: 等待 Vite 就绪后启动 Electron
const electron: ChildProcess = spawn(
  'npx',
  ['electron', '--inspect=9229', '.'],
  {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' },
  },
);

function cleanup(): void {
  vite.kill();
  electron.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

electron.on('close', () => {
  cleanup();
});
