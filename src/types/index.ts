// ── 计时阶段 ──
export type TimerPhase = 'idle' | 'work' | 'shortBreak' | 'longBreak';

// ── 任务 ──
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: string; // ISO 8601
  order: number;
}

// ── 番茄记录 ──
export interface PomodoroRecord {
  id: string;
  taskId: string | null;
  phase: 'work';
  startTime: string;
  endTime: string;
  duration: number; // 实际专注秒数
  completed: boolean;
}

// ── 应用设置 ──
export interface AppSettings {
  workDuration: number; // 秒，默认 1500
  shortBreakDuration: number; // 秒，默认 300
  longBreakDuration: number; // 秒，默认 900
  pomodorosUntilLongBreak: number; // 默认 4
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alwaysOnTop: boolean;
}

// ── 默认设置 ──
export const DEFAULT_SETTINGS: AppSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
  alwaysOnTop: false,
};

// ── 计时器状态（运行时） ──
export interface TimerState {
  phase: TimerPhase;
  isRunning: boolean;
  timeRemaining: number; // 秒
  phaseDuration: number; // 当前阶段总秒数
  currentTaskId: string | null;
  completedPomodorosInCycle: number;
  totalPomodorosToday: number;
}
