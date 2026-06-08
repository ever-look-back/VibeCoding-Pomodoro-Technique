# 架构设计 — 番茄钟桌面应用

## 目录结构

```
Pomodoro Technique/
├── CLAUDE.md
├── docs/                           # 项目规范文档
│   ├── requirements.md
│   ├── tech-stack.md
│   ├── design-spec.md
│   ├── architecture.md
│   └── execution-steps.md
├── devlog/                         # 开发日志
├── src/                            # 渲染进程（React UI）
│   ├── main.tsx                    # React 入口
│   ├── App.tsx                     # 根组件，路由/布局
│   ├── index.css                   # Tailwind + 全局样式
│   ├── components/
│   │   ├── timer/
│   │   │   ├── CountdownDisplay.tsx # 倒计时数字
│   │   │   ├── TimerControls.tsx   # 开始/暂停/跳过按钮
│   │   │   └── PhaseIndicator.tsx  # 当前阶段 + 番茄计数
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx        # 任务列表容器
│   │   │   ├── TaskItem.tsx        # 单条任务
│   │   │   └── AddTaskForm.tsx     # 添加任务表单
│   │   ├── settings/
│   │   │   └── SettingsPanel.tsx   # 设置面板
│   │   ├── stats/
│   │   │   └── DailyStats.tsx      # 今日统计
│   │   └── layout/
│   │       ├── AppLayout.tsx       # 整体布局壳
│   │       └── BottomNav.tsx       # 底部导航栏
│   ├── stores/
│   │   ├── timerStore.ts           # 计时器状态 + 逻辑
│   │   ├── taskStore.ts            # 任务 CRUD
│   │   └── settingsStore.ts        # 设置读写
│   ├── hooks/
│   │   ├── useTimer.ts             # 计时器 hook（封装 setInterval）
│   │   └── useElectron.ts          # IPC 调用封装
│   └── types/
│       └── index.ts                # 所有 TypeScript 类型定义
├── electron/                       # 主进程
│   ├── main.ts                     # Electron 入口，窗口管理
│   ├── preload.ts                  # 预加载脚本，安全暴露 IPC
│   └── tray.ts                     # 系统托盘逻辑
├── package.json
├── vite.config.ts                  # Vite 配置（含 Electron 插件）
├── electron-builder.yml            # 打包配置
├── tsconfig.json
└── tsconfig.node.json              # 主进程 TS 配置
```

## 数据模型（[types/index.ts](src/types/index.ts)）

```typescript
// 计时阶段
type TimerPhase = 'idle' | 'work' | 'shortBreak' | 'longBreak';

// 任务
interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: string;       // ISO 8601
  order: number;
}

// 番茄记录
interface PomodoroRecord {
  id: string;
  taskId: string | null;
  phase: 'work';
  startTime: string;
  endTime: string;
  duration: number;        // 实际专注秒数
  completed: boolean;      // 是否完整完成（非中途放弃）
}

// 设置
interface AppSettings {
  workDuration: number;           // 秒，默认 1500
  shortBreakDuration: number;     // 秒，默认 300
  longBreakDuration: number;      // 秒，默认 900
  pomodorosUntilLongBreak: number;// 默认 4
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alwaysOnTop: boolean;
}

// 计时器状态（运行时，不持久化）
interface TimerState {
  phase: TimerPhase;
  timeRemaining: number;
  isRunning: boolean;
  currentTaskId: string | null;
  completedPomodorosInCycle: number;
}
```

## IPC 架构

```
渲染进程 (React)                 主进程 (Electron)
─────────────────               ─────────────────
  window.electronAPI              
    .minimizeToTray()    ──→     win.hide() + tray
    .restoreWindow()     ──→     win.show() + focus
    .showNotification()  ──→     new Notification()
    .getAppDataPath()    ──→     app.getPath('userData')
    .onTimerComplete()   ←──     ipcMain → ipcRenderer
    .onRestoreWindow()   ←──     tray click → ipcRenderer
```

**preload.ts 暴露的 API：**
```typescript
interface ElectronAPI {
  minimizeToTray: () => void;
  restoreWindow: () => void;
  showNotification: (title: string, body: string) => void;
  getAppDataPath: () => Promise<string>;
  onTimerComplete: (cb: () => void) => void;
  onRestoreWindow: (cb: () => void) => void;
}
```

## 状态管理

三个 Zustand Store：

| Store | 职责 | 持久化 |
|-------|------|--------|
| `timerStore` | 计时状态、开始/暂停/跳过/重置、阶段切换 | 否（仅内存） |
| `taskStore` | 任务 CRUD、排序、绑定番茄 | 是（electron-store） |
| `settingsStore` | 设置读写、默认值恢复 | 是（electron-store） |

数据流单向：Store → Component。组件通过 store action 修改状态。

## 计时精度保证

- 主进程定时器不可靠（setTimeout 在后台会被节流）
- 采用 **时间戳差值法**：记录开始时间戳，每次渲染时计算 `剩余 = 总时长 - (now - startTime)`
- 使用 `requestAnimationFrame` 驱动 UI 更新（每帧计算差值）
- 即使窗口隐藏，`Date.now()` 仍然准确
