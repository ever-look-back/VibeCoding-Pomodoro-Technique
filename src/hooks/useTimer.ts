import { useEffect, useRef } from 'react';
import { useTimerStore, setRafId } from '../stores/timerStore';

/**
 * 基于 requestAnimationFrame 的计时驱动 hook。
 * 在组件挂载时启动 rAF 循环，每帧调用 store.tick()。
 */
export function useTimer(): void {
  const isRunning = useTimerStore((s) => s.isRunning);
  const tick = useTimerStore((s) => s.tick);
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    let running = true;

    function frame(): void {
      if (!running) return;
      tickRef.current();
      const id = requestAnimationFrame(frame);
      setRafId(id);
    }

    const id = requestAnimationFrame(frame);
    setRafId(id);

    return () => {
      running = false;
      const currentId = id;
      if (currentId !== null) {
        cancelAnimationFrame(currentId);
      }
      setRafId(null);
    };
  }, []); // 挂载一次，不依赖 isRunning 变化

  // 日志：isRunning 变化时输出（用于开发调试）
  useEffect(() => {
    console.log(
      `[useTimer] isRunning: ${isRunning}`,
    );
  }, [isRunning]);
}
