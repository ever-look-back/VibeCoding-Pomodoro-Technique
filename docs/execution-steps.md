# 执行步骤 — 番茄钟桌面应用

## 总览

共 9 个阶段，按依赖顺序排列。每阶段完成后：
1. 运行 `npm run dev` 验证
2. 更新 `devlog/` 当天日志
3. 停止，等待用户确认后再进入下一阶段

---

## Phase 1：项目脚手架

**目标**：Electron + React + Vite + TypeScript + Tailwind 跑起来，窗口可显示

**产出**：
- `package.json` 含所有依赖
- `vite.config.ts` 含 Electron 插件配置
- `electron/main.ts` 创建窗口
- `electron/preload.ts` 空壳
- `src/main.tsx` + `src/App.tsx` 显示 "Hello Pomodoro"
- `tailwind.config.js` 基础配置
- `tsconfig.json` + `tsconfig.node.json`
- `index.html`

**验证**：`npm run dev` 弹出窗口，显示暗色背景 + "Hello Pomodoro" 文字

---

## Phase 2：核心计时逻辑

**目标**：实现计时器状态机（Zustand store），支持倒计时

**产出**：
- `src/types/index.ts` 所有类型定义
- `src/stores/timerStore.ts` 计时器状态 + 动作
- `src/hooks/useTimer.ts` 基于 rAF 的计时 hook

**验证**：通过 console.log 验证倒计时状态转换正确（idle → work → shortBreak → work → ... → longBreak）

---

## Phase 3：计时器 UI

**目标**：将计时器状态渲染为可视界面

**产出**：
- `src/components/timer/CountdownDisplay.tsx` 大号倒计时数字
- `src/components/timer/TimerControls.tsx` 开始/暂停/跳过按钮
- `src/components/timer/PhaseIndicator.tsx` 阶段标签 + 番茄计数
- `src/components/layout/AppLayout.tsx` 整体布局框架
- `src/App.tsx` 整合计时器组件

**验证**：窗口显示倒计时、按钮可操作、阶段切换时有颜色变化

---

## Phase 4：系统托盘

**目标**：关闭窗口时最小化到托盘，托盘图标可操作

**产出**：
- `electron/tray.ts` 系统托盘（图标、菜单、点击恢复）
- `electron/main.ts` 集成托盘，close 事件改为 hide
- `src/hooks/useElectron.ts` 封装 IPC 调用

**验证**：关闭窗口 → 进入托盘 → 托盘菜单可恢复窗口

---

## Phase 5：通知系统

**目标**：计时结束时弹出系统通知 + 窗口闪烁

**产出**：
- `electron/main.ts` 通知触发逻辑
- `electron/preload.ts` 暴露通知 API
- 计时结束时触发通知

**验证**：计时结束 → 系统通知弹出 + 窗口任务栏闪烁

---

## Phase 6：任务管理

**目标**：待办清单 CRUD，番茄可绑定任务

**产出**：
- `src/stores/taskStore.ts` 任务数据 + 操作
- `src/components/tasks/AddTaskForm.tsx`
- `src/components/tasks/TaskItem.tsx`
- `src/components/tasks/TaskList.tsx`
- 计时器绑定当前任务

**验证**：可添加/删除/完成任务，开始番茄时可选择绑定任务

---

## Phase 7：设置面板

**目标**：自定义时长、自动开始等配置

**产出**：
- `src/stores/settingsStore.ts` 设置数据 + 操作
- `src/components/settings/SettingsPanel.tsx`
- `src/components/layout/BottomNav.tsx` 底部导航切换

**验证**：设置面板可修改参数，修改后计时器使用新参数

---

## Phase 8：统计与历史

**目标**：今日完成番茄数、总专注时间

**产出**：
- `src/stores/` 中添加历史记录 store
- `src/components/stats/DailyStats.tsx`
- 每次完成工作番茄时记录

**验证**：完成一个番茄后，统计面板数据更新

---

## Phase 9：打包与发布

**目标**：生成 Windows 安装包和便携版

**产出**：
- `electron-builder.yml` 打包配置
- 应用图标
- `npm run build` 可生成 `.exe` 安装包

**验证**：安装包可在 Windows 上正常安装运行
