import { useTimerStore } from '../../stores/timerStore';
import type { TimerPhase } from '../../types';
import { DEFAULT_SETTINGS } from '../../types';

const PHASE_LABELS: Record<TimerPhase, string> = {
  idle: '准备开始',
  work: '专注中',
  shortBreak: '短休息',
  longBreak: '长休息',
};

export function PhaseIndicator() {
  const phase = useTimerStore((s) => s.phase);
  const completedInCycle = useTimerStore((s) => s.completedPomodorosInCycle);
  const totalToday = useTimerStore((s) => s.totalPomodorosToday);

  const maxDots = DEFAULT_SETTINGS.pomodorosUntilLongBreak;
  const isWork = phase === 'work';
  const isBreak = phase === 'shortBreak' || phase === 'longBreak';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 阶段标签 */}
      <div
        className={`
          rounded-full px-4 py-1 text-xs font-medium tracking-widest uppercase
          transition-colors duration-300
          ${isWork ? 'bg-[#e53935]/20 text-[#e53935]' : ''}
          ${isBreak ? 'bg-[#43a047]/20 text-[#43a047]' : ''}
          ${phase === 'idle' ? 'bg-[#2a2a2a] text-[#888]' : ''}
        `}
      >
        {PHASE_LABELS[phase]}
      </div>

      {/* 番茄点阵 + 今日计数 */}
      {phase !== 'idle' && (
        <div className="flex items-center gap-2">
          {/* 点阵 */}
          <div className="flex gap-1.5">
            {Array.from({ length: maxDots }, (_, i) => (
              <div
                key={i}
                className={`
                  h-2 w-2 rounded-full transition-all duration-300
                  ${i < completedInCycle
                    ? 'bg-[#e53935] shadow-[0_0_6px_#e53935]'
                    : 'bg-[#2a2a2a]'
                  }
                `}
              />
            ))}
          </div>

          {/* 今日总数 */}
          <span className="ml-2 text-xs text-[#666]">
            🍅 {totalToday}
          </span>
        </div>
      )}
    </div>
  );
}
