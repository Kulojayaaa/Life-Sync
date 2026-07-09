import { useEffect, useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { loadPendingTransactions, flushPendingTransactions } from '@/services/offlineFinance';
import { addTransaction } from '@/services/financeService';

/**
 * Small floating pill that surfaces offline state and the count of
 * transactions queued locally. Tapping while online retries the sync.
 */
export function OfflineBadge() {
  const { user } = useAuth();
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const refresh = () => setPending(loadPendingTransactions(user.id).length);
    refresh();
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    const interval = window.setInterval(refresh, 5000);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      window.clearInterval(interval);
    };
  }, [user]);

  if (!user || (online && pending === 0)) return null;

  const retry = async () => {
    if (!online || syncing) return;
    setSyncing(true);
    try {
      const result = await flushPendingTransactions(user.id, addTransaction);
      setPending(loadPendingTransactions(user.id).length);
      if (result.synced) toast.success(`${result.synced} queued transaction${result.synced === 1 ? '' : 's'} synced.`);
      if (result.failed) toast.error(`${result.failed} still queued — will retry.`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={retry}
      disabled={!online || syncing}
      className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium shadow-lg transition hover:bg-accent disabled:opacity-70"
      aria-label={online ? 'Retry sync' : 'Offline'}
    >
      {online ? (
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
      ) : (
        <CloudOff className="h-3.5 w-3.5 text-amber-500" />
      )}
      <span>{online ? `${pending} queued — tap to sync` : `Offline${pending ? ` · ${pending} queued` : ''}`}</span>
    </button>
  );
}
