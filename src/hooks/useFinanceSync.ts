import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFinanceStore } from '@/store/financeStore';
import { addTransaction } from '@/services/financeService';
import { flushPendingTransactions } from '@/services/offlineFinance';

const FINANCE_REALTIME_TABLES = [
  'accounts',
  'categories',
  'transactions',
  'budgets',
  'emis',
  'emi_payments',
  'savings_goals',
  'goal_contributions',
  'bills',
  'bill_payment_history',
] as const;

export function useFinanceSync(userId: string | null | undefined) {
  const refresh = useFinanceStore((state) => state.refresh);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    const refreshSoon = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        void refresh(userId).catch((error) => {
          toast.error(error?.message || 'Failed to sync finance data');
        });
      }, 350);
    };

    const channel = supabase.channel(`finance-sync:${userId}`);

    FINANCE_REALTIME_TABLES.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        refreshSoon,
      );
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        void refresh(userId).catch(() => {
          // refresh() loads the local cache when the device is offline.
        });
      }
    });

    const handleOnline = async () => {
      toast.success('Back online. Syncing finance data...');
      const result = await flushPendingTransactions(userId, addTransaction);
      if (result.synced) toast.success(`${result.synced} queued transaction${result.synced === 1 ? '' : 's'} synced.`);
      refreshSoon();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.removeEventListener('online', handleOnline);
      void supabase.removeChannel(channel);
    };
  }, [refresh, userId]);
}
