import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-[#0f0f0f]">
      {/* 主内容区：垂直居中 */}
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6">
        {children}
      </main>

      {/* 底部：留白给后续导航栏（Phase 7） */}
      <footer className="h-2" />
    </div>
  );
}
