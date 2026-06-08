import { create } from 'zustand';
import type { TimerPhase, TimerState } from '../types';
import { DEFAULT_SETTINGS } from '../types';

// ── 内部状态（不触发 React 重渲染） ──
let phaseStartTime = 0; // 当前阶段开始的时刻（ms 时间戳）
let rafId: number | null = null;
let onPhaseComplete: ((phase: TimerPhase) => void) | null = null;

// ── 辅助函数 ──
function getPhaseDuration(phase: TimerPhase): number {
  switch (phase) {
    case 'work':
      return DEFAULT_SETTINGS.workDuration;
    case 'shortBreak':
      return DEFAULT_SETTINGS.shortBreakDuration;
    case 'longBreak':
      return DEFAULT_SETTINGS.longBreakDuration;
    default:
      return 0;
  }
}

// 纯路由：给定当前阶段和完成后的番茄数，返回下个阶段
function getNextPhase(
  currentPhase: TimerPhase,
  completedAfterTransition: number,
): TimerPhase {
  if (currentPhase === 'work') {
    if (completedAfterTransition >= DEFAULT_SETTINGS.pomodorosUntilLongBreak) {
      return 'longBreak';
    }
    return 'shortBreak';
  }
  // shortBreak / longBreak 之后总是回到 work
  return 'work';
}

// ── Store ──
interface TimerStore extends TimerState {
  start: (taskId?: string | null) => void;
  pause: () => void;
  skip: () => void;
  tick: () => void;
  setOnPhaseComplete: (cb: (phase: TimerPhase) => void) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  phase: 'idle',
  isRunning: false,
  timeRemaining: DEFAULT_SETTINGS.workDuration,
  phaseDuration: DEFAULT_SETTINGS.workDuration,
  currentTaskId: null,
  completedPomodorosInCycle: 0,
  totalPomodorosToday: 0,

  // ── 开始 / 恢复 ──
  start: (taskId = null) => {
    const { phase, isRunning, timeRemaining } = get();

    if (isRunning) return; // 已在运行

    // 如果处于 idle，从 work 阶段开始
    const currentPhase: TimerPhase =
      phase === 'idle' ? 'work' : phase;
    const duration =
      phase === 'idle'
        ? DEFAULT_SETTINGS.workDuration
        : getPhaseDuration(currentPhase);
    const remaining = phase === 'idle' ? duration : timeRemaining;

    // 反向推算开始时间：若剩余 1500s，则 startTime = now - (1500 - 1500)*1000 = now
    // 若暂停后剩余 1200s，则 startTime = now - (1500 - 1200)*1000 = now - 300s
    phaseStartTime = Date.now() - (duration - remaining) * 1000;

    set({
      phase: currentPhase,
      isRunning: true,
      timeRemaining: remaining,
      phaseDuration: duration,
      currentTaskId: taskId,
    });
  },

  // ── 暂停 ──
  pause: () => {
    const { isRunning } = get();
    if (!isRunning) return;

    set({ isRunning: false });
  },

  // ── 跳过当前阶段 ──
  skip: () => {
    const { phase, completedPomodorosInCycle, totalPomodorosToday } = get();

    // skip 不计数：completedPomodorosInCycle 保持不变（除非从长休跳回）
    const newCount =
      phase === 'longBreak' ? 0 : completedPomodorosInCycle;
    const nextPhase = getNextPhase(phase, newCount);
    const nextDuration = getPhaseDuration(nextPhase);

    phaseStartTime = Date.now();

    set({
      phase: nextPhase,
      isRunning: false,
      timeRemaining: nextDuration,
      phaseDuration: nextDuration,
      completedPomodorosInCycle: newCount,
      totalPomodorosToday,
    });
  },

  // ── 每帧调用，更新时间 ──
  tick: () => {
    const { isRunning, phaseDuration, phase } = get();
    if (!isRunning) return;

    const elapsed = (Date.now() - phaseStartTime) / 1000;
    const remaining = Math.max(0, phaseDuration - Math.floor(elapsed));

    set({ timeRemaining: remaining });

    // 时间到，切换阶段
    if (remaining <= 0) {
      const {
        completedPomodorosInCycle,
        totalPomodorosToday,
        currentTaskId,
      } = get();

      const wasWork = phase === 'work';

      // 计算完成后的番茄计数
      const newCompletedInCycle = wasWork
        ? completedPomodorosInCycle + 1   // 完成工作 → +1
        : phase === 'longBreak'
          ? 0                              // 长休结束 → 重置周期
          : completedPomodorosInCycle;     // 短休结束 → 不变

      const nextPhase = getNextPhase(phase, newCompletedInCycle);
      const nextDuration = getPhaseDuration(nextPhase);

      const newTotalToday = wasWork
        ? totalPomodorosToday + 1
        : totalPomodorosToday;

      phaseStartTime = Date.now();

      set({
        phase: nextPhase,
        timeRemaining: nextDuration,
        phaseDuration: nextDuration,
        completedPomodorosInCycle: newCompletedInCycle,
        totalPomodorosToday: newTotalToday,
        currentTaskId: wasWork ? null : currentTaskId, // 工作完成后解除任务绑定
      });

      // 通知外部（用于触发托盘通知等）
      if (onPhaseComplete) {
        onPhaseComplete(phase);
      }
    }
  },

  // ── 注册阶段完成回调 ──
  setOnPhaseComplete: (cb: (phase: TimerPhase) => void) => {
    onPhaseComplete = cb;
  },
}));

// ── 暴露 rafId 管理给 useTimer hook ──
export function getRafId(): number | null {
  return rafId;
}

export function setRafId(id: number | null): void {
  rafId = id;
}
