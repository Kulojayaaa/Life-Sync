import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { MobileBottomNav } from './MobileBottomNav';
import { QuickAddTransactionSheet } from '@/components/finance/QuickAddTransactionSheet';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden md:block"><Sidebar /></div>
      <main className="flex-1 overflow-auto">
        <div className="p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8">
          {children}
        </div>
      </main>
      <MobileBottomNav />
      <QuickAddTransactionSheet />
    </div>
  );
}
