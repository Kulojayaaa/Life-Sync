import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useFinanceSync } from './useFinanceSync';

/**
 * Mounts the finance realtime sync once at the app root so that route
 * changes do not tear down / re-subscribe the Supabase channels.
 */
export function FinanceSyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  useFinanceSync(user?.id);
  return <>{children}</>;
}
