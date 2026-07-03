import type {
  DebtTrackerEntry,
  FinanceAccount,
  FinanceBudget,
  FinanceCategory,
  FinanceEmiPayment,
  FinanceSavingsGoal,
  FinanceTransaction,
  MonthlyPlanEntry,
} from '@/lib/finance';
import type { Tables } from '@/integrations/supabase/types';
import type { TransactionInput } from '@/services/financeService';

const CACHE_VERSION = 1;
const CACHE_PREFIX = 'fintrack.finance.snapshot';
const QUEUE_PREFIX = 'fintrack.finance.pending-transactions';

export interface FinanceSnapshotCache {
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
  budgets: FinanceBudget[];
  emis: Tables<'emis'>[];
  emiPayments: FinanceEmiPayment[];
  savingsGoals: FinanceSavingsGoal[];
  debtTracker: DebtTrackerEntry[];
  monthlyPlans: MonthlyPlanEntry[];
  supportsTransactionCategoryIds: boolean;
  supportsBudgetCategoryIds: boolean;
}

interface StoredFinanceSnapshot {
  version: number;
  savedAt: string;
  data: FinanceSnapshotCache;
}

const cacheKey = (userId: string) => `${CACHE_PREFIX}.${userId}`;

export function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

export function saveFinanceSnapshot(userId: string, data: FinanceSnapshotCache) {
  if (typeof localStorage === 'undefined') return;

  const payload: StoredFinanceSnapshot = {
    version: CACHE_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };

  localStorage.setItem(cacheKey(userId), JSON.stringify(payload));
}

export function loadFinanceSnapshot(userId: string): FinanceSnapshotCache | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredFinanceSnapshot;
    if (parsed.version !== CACHE_VERSION) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

export interface PendingTransaction extends TransactionInput {
  queueId: string;
  queuedAt: string;
}

const queueKey = (userId: string) => `${QUEUE_PREFIX}.${userId}`;

export function loadPendingTransactions(userId: string): PendingTransaction[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(queueKey(userId)) || '[]') as PendingTransaction[];
  } catch {
    return [];
  }
}

export function queuePendingTransaction(input: TransactionInput) {
  const pending: PendingTransaction = { ...input, queueId: crypto.randomUUID(), queuedAt: new Date().toISOString() };
  localStorage.setItem(queueKey(input.userId), JSON.stringify([...loadPendingTransactions(input.userId), pending]));
  return pending;
}

export async function flushPendingTransactions(userId: string, save: (input: TransactionInput) => Promise<unknown>) {
  const pending = loadPendingTransactions(userId);
  const failed: PendingTransaction[] = [];
  for (const item of pending) {
    try {
      const { queueId: _queueId, queuedAt: _queuedAt, ...input } = item;
      await save(input);
    } catch {
      failed.push(item);
    }
  }
  localStorage.setItem(queueKey(userId), JSON.stringify(failed));
  return { synced: pending.length - failed.length, failed: failed.length };
}
