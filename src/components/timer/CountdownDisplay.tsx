import { useTimerStore } from '../../stores/timerStore';
import type { TimerPhase } from '../../types';

/** 阶段 → 文字颜色 */
const PHASE_COLORS: Record<TimerPhase, string> = {
  idle: 'text-[#f0f0f0]',
  work: 'text-[#f0f0f0]',
  shortBreak: 'text-[#43a047]',
  longBreak: 'text-[#43a047]',
};

/** 最后 5 秒警告色 */
const WARNING_COLOR = 'text-[#ff9800]';

function formatTime(seconds: number): { minutes: string; seconds: string } {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return {
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

export function CountdownDisplay() {
  const phase = useTimerStore((s) => s.phase);
  const timeRemaining = useTimerStore((s) => s.timeRemaining);
  const isRunning = useTimerStore((s) => s.isRunning);

  const { minutes, seconds } = formatTime(timeRemaining);
  const isWarning = isRunning && timeRemaining <= 5 && timeRemaining > 0;
  const isBreak = phase === 'shortBreak' || phase === 'longBreak';
  const isIdle = phase === 'idle';

  const colorClass = isWarning
    ? WARNING_COLOR
    : PHASE_COLORS[phase];

  return (
    <div className="relative select-none">
      {/* 背景光晕 — 休息阶段绿色光晕 */}
      {isBreak && (
        <div
          className="absolute inset-0 scale-150 rounded-full opacity-20 blur-3xl transition-colors duration-500"
          style={{ backgroundColor: '#43a047' }}
        />
      )}

      {/* 倒计时数字 */}
      <div
        className={`
          relative font-mono text-8xl font-light tracking-widest tabular-nums
          transition-colors duration-300
          ${colorClass}
          ${isWarning ? 'animate-pulse' : ''}
        `}
      >
        <span>{minutes}</span>
        <span className="mx-1 text-6xl align-[0.15em] opacity-60">:</span>
        <span>{seconds}</span>
      </div>

      {/* Idle 状态提示 */}
      {isIdle && (
        <p className="mt-3 text-center text-xs tracking-wider text-[#666]">
          点击下方按钮开始专注
        </p>
      )}
    </div>
  );
}
