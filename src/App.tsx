import { useTimer } from './hooks/useTimer';
import { AppLayout } from './components/layout/AppLayout';
import { PhaseIndicator } from './components/timer/PhaseIndicator';
import { CountdownDisplay } from './components/timer/CountdownDisplay';
import { TimerControls } from './components/timer/TimerControls';

function App() {
  useTimer();

  return (
    <AppLayout>
      <PhaseIndicator />
      <CountdownDisplay />
      <TimerControls />
    </AppLayout>
  );
}

export default App;
