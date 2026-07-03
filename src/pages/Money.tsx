import { BarChart3, CalendarRange, CreditCard, Landmark, Receipt, Target, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { openQuickAdd } from '@/components/finance/QuickAddTransactionSheet';
import { useCurrency } from '@/hooks/CurrencyContext';
import { useFinanceStore } from '@/store/financeStore';

export default function Money() {
  const { formatCurrency } = useCurrency();
  const store = useFinanceStore();
  const balance = store.accounts.filter((a) => a.is_active !== false).reduce((sum, a) => sum + Number(a.computed_balance ?? a.current_balance ?? 0), 0);
  const cards = [
    ['/expenses', 'Transactions', `${store.transactions.length} recorded`, Receipt], ['/accounts', 'Accounts', formatCurrency(balance), WalletCards],
    ['/budgets', 'Budgets', `${store.budgets.length} active`, Target], ['/bills', 'Bills', 'View upcoming bills', Receipt],
    ['/emis', 'EMI', `${store.emiPayments.filter((p) => !p.is_paid).length} unpaid`, CreditCard], ['/debt', 'Debt', 'Monthly debt tracker', Landmark],
    ['/planner', 'Planner', 'Plan your cash flow', CalendarRange], ['/insights', 'Insights', 'Trends and exports', BarChart3],
  ] as const;
  return <AppLayout><PageHeader title="Money" subtitle="Your financial command centre" icon={WalletCards} primaryAction={<Button onClick={() => openQuickAdd()}>Add transaction</Button>} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([path, title, status, Icon]) => <Link key={path} to={path} className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"><Icon className="mb-8 h-6 w-6 text-primary" /><h2 className="font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{status}</p></Link>)}</div></AppLayout>;
}
