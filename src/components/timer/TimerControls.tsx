import { useTimerStore } from '../../stores/timerStore';

export function TimerControls() {
  const phase = useTimerStore((s) => s.phase);
  const isRunning = useTimerStore((s) => s.isRunning);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const skip = useTimerStore((s) => s.skip);

  const isIdle = phase === 'idle';

  return (
    <div className="flex items-center gap-4">
      {/* 主按钮：开始 / 暂停 */}
      <button
        onClick={() => (isRunning ? pause() : start())}
        className={`
          flex h-12 w-12 items-center justify-center rounded-full
          text-lg transition-all duration-200
          active:scale-95
          ${isRunning
            ? 'border-2 border-[#555] bg-transparent text-[#f0f0f0] hover:border-[#888]'
            : 'bg-[#e53935] text-white shadow-lg shadow-[#e53935]/30 hover:bg-[#ef5350]'
          }
        `}
        title={isRunning ? '暂停' : isIdle ? '开始专注' : '继续'}
      >
        {isRunning ? '⏸' : '▶'}
      </button>

      {/* 跳过按钮（仅在非 idle 时显示） */}
      {!isIdle && (
        <button
          onClick={skip}
          className="
            rounded-full border border-[#2a2a2a] px-4 py-2
            text-xs tracking-wider text-[#888]
            transition-all duration-200
            hover:border-[#555] hover:text-[#f0f0f0]
            active:scale-95
          "
          title="跳过当前阶段"
        >
          跳过
        </button>
      )}
    </div>
  );
}
