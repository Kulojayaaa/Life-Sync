import { BarChart3, CalendarRange, CreditCard, FileText, IndianRupee, Landmark, PiggyBank, Receipt, Target, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { openQuickAdd } from '@/components/finance/QuickAddTransactionSheet';
import { MonthSetupSheet } from '@/components/finance/MonthSetupSheet';
import { useCurrency } from '@/hooks/CurrencyContext';
import { useFinanceStore } from '@/store/financeStore';
import { computeBudgetUsage } from '@/lib/finance';
import { getMonthStartDate } from '@/lib/date';
import { useMemo } from 'react';

const moneySections = [
  ['/expenses', 'Transactions', Receipt],
  ['/accounts', 'Accounts', WalletCards],
  ['/budgets', 'Budgets', PiggyBank],
  ['/savings', 'Savings', Target],
  ['/bills', 'Bills', IndianRupee],
  ['/emis', 'EMI', CreditCard],
  ['/debt', 'Debt', Landmark],
  ['/planner', 'Planner', CalendarRange],
  ['/insights', 'Insights', BarChart3],
  ['/reports', 'Reports', FileText],
] as const;

export default function Money() {
  const { formatCurrency } = useCurrency();
  const store = useFinanceStore();
  const monthStart = getMonthStartDate();

  const monthTransactions = useMemo(
    () => store.transactions.filter((transaction) => transaction.transaction_date >= monthStart),
    [monthStart, store.transactions],
  );

  const liveBalance = store.accounts
    .filter((account) => account.is_active !== false)
    .reduce((sum, account) => sum + Number(account.computed_balance ?? account.initial_balance ?? 0), 0);
  const monthSpent = monthTransactions
    .filter((transaction) => transaction.type === 'debit')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthIncome = monthTransactions
    .filter((transaction) => transaction.type === 'credit')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const budgetLimit = store.budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const budgetUsed = store.budgets.reduce((sum, budget) => sum + computeBudgetUsage(budget, monthTransactions).spent, 0);
  const budgetPercent = budgetLimit > 0 ? Math.min((budgetUsed / budgetLimit) * 100, 100) : 0;
  const unpaidEmi = store.emiPayments.filter((payment) => !payment.is_paid).length;

  const statusByPath: Record<string, string> = {
    '/expenses': `${store.transactions.length} total entries`,
    '/accounts': formatCurrency(liveBalance),
    '/budgets': budgetLimit > 0 ? `${formatCurrency(budgetUsed)} of ${formatCurrency(budgetLimit)}` : 'Set monthly budgets',
    '/savings': 'Track savings goals',
    '/bills': 'View upcoming bills',
    '/emis': `${unpaidEmi} unpaid installments`,
    '/debt': 'Monthly debt tracker',
    '/planner': 'Plan cash flow and meals',
    '/insights': 'Spending trends',
    '/reports': 'Export-ready reports',
  };

  return (
    <AppLayout>
      <PageHeader
        title="Money"
        subtitle="Balances, budgets, bills, EMI, debt, and reports"
        icon={WalletCards}
        secondaryAction={<MonthSetupSheet />}
        primaryAction={<Button onClick={() => openQuickAdd()}>Add transaction</Button>}
      />

      <div className="space-y-6">
        <Card className="border-primary/10 bg-card shadow-sm">
          <CardContent className="grid gap-5 p-5 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="text-sm text-muted-foreground">Live balance</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">{formatCurrency(liveBalance)}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-muted-foreground">Income this month</p>
                  <p className="mt-1 font-semibold tabular-nums text-success">{formatCurrency(monthIncome)}</p>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-muted-foreground">Spent this month</p>
                  <p className="mt-1 font-semibold tabular-nums text-destructive">{formatCurrency(monthSpent)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Month budget</p>
                  <p className="text-sm text-muted-foreground">{budgetLimit > 0 ? `${formatCurrency(budgetUsed)} spent` : 'No monthly budget yet'}</p>
                </div>
                <span className="text-2xl font-bold tabular-nums text-primary">{Math.round(budgetPercent)}%</span>
              </div>
              <Progress value={budgetPercent} className="mt-4 h-2" />
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(0)}</span>
                <span>{formatCurrency(budgetLimit)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sticky top-0 z-10 -mx-4 border-y border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <Tabs value="money">
            <TabsList className="no-scrollbar flex h-11 w-full justify-start overflow-x-auto rounded-xl bg-muted/70 p-1">
              {moneySections.map(([path, title, Icon]) => (
                <TabsTrigger key={path} value={path} asChild className="h-9 flex-none rounded-lg px-4">
                  <Link to={path} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {title}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {moneySections.map(([path, title, Icon]) => (
            <Link
              key={path}
              to={path}
              className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Icon className="mb-8 h-6 w-6 text-primary" />
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{statusByPath[path]}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}




