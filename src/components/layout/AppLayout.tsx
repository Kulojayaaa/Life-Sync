import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { OfflineBadge } from './OfflineBadge';
import { QuickAddTransactionSheet } from '@/components/finance/QuickAddTransactionSheet';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface AppLayoutProps {
  children: ReactNode;
}

// Auth gating is handled once by <ProtectedRoute> in App.tsx; this layout
// only renders the visual shell so it doesn't re-check the session per page.
export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden md:block"><Sidebar /></div>
      <main className="flex-1 overflow-auto">
        <div className="p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8">
          <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>
        </div>
      </main>
      <MobileBottomNav />
      <QuickAddTransactionSheet />
      <OfflineBadge />
    </div>
  );
}
