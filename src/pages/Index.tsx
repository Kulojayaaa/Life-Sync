import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDays, format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, ArrowRightLeft, Bell, CalendarCheck2, Check, ChevronDown, CreditCard, FileText, Landmark, LayoutDashboard, NotebookPen, TrendingUp, Utensils, Wallet } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/CurrencyContext';
import { useFinanceStore } from '@/store/financeStore';
import { useBills } from '@/hooks/useBills';
import { getTodayDate, getMonthStartDate } from '@/lib/date';
import { computeBudgetUsage, getMonthKey, MealType } from '@/lib/finance';
import { openQuickAdd } from '@/components/finance/QuickAddTransactionSheet';
import { addTransaction, deleteTransaction } from '@/services/financeService';
import { MonthSetupSheet } from '@/components/finance/MonthSetupSheet';
import { cn } from '@/lib/utils';

interface DashboardStats {
  activeHabits: number;
  todayCompletions: number;
  todaySpending: number;
  monthExpenses: number;
  monthIncome: number;
  upcomingReminders: number;
  pendingBills: number;
  totalAccountBalance: number;
  totalEmiLiability: number;
  savingsCurrentTotal: number;
  savingsTargetTotal: number;
  selfSpending: number;
  familySpending: number;
  surplus: number;
  debtBalance: number;
  overBudgetCategories: string[];
  dailyLimitExceeded: boolean;
  debtIncreased: boolean;
  dailyLimit: number;
  savingsProgress: number;
}

type SpendingType = 'self' | 'family';
type MealEntry = Record<MealType, number>;
const EMPTY_MEALS: MealEntry = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };

type TodayBill = {
  id: string;
  name: string;
  amount: number | string | null;
  due_date: string;
  is_paid: boolean | null;
};

const EMPTY_STATS: DashboardStats = {
  activeHabits: 0,
  todayCompletions: 0,
  todaySpending: 0,
  monthExpenses: 0,
  monthIncome: 0,
  upcomingReminders: 0,
  pendingBills: 0,
  totalAccountBalance: 0,
  totalEmiLiability: 0,
  savingsCurrentTotal: 0,
  savingsTargetTotal: 0,
  selfSpending: 0,
  familySpending: 0,
  surplus: 0,
  debtBalance: 0,
  overBudgetCategories: [],
  dailyLimitExceeded: false,
  debtIncreased: false,
  dailyLimit: 0,
  savingsProgress: 0,
};

async function fetchDashboardExtras(userId: string) {
  const today = getTodayDate();
  const [habitsRes, completionsRes, remindersRes, billsRes] = await Promise.all([
    supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
    supabase.from('habit_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('completed_at', today),
    supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_completed', false).gte('reminder_date', today),
    supabase.from('bills').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_paid', false),
  ]);

  if (habitsRes.error) throw habitsRes.error;
  if (completionsRes.error) throw completionsRes.error;
  if (remindersRes.error) throw remindersRes.error;
  if (billsRes.error) throw billsRes.error;

  return {
    activeHabits: habitsRes.count ?? 0,
    todayCompletions: completionsRes.count ?? 0,
    upcomingReminders: remindersRes.count ?? 0,
    pendingBills: billsRes.count ?? 0,
  };
}

const Index = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertsDismissed, setAlertsDismissed] = useState(false);
  const [spendingType, setSpendingType] = useState<SpendingType>(() => (localStorage.getItem('lifesync:last-spending-type') as SpendingType | null) || 'self');
  const [quickNote, setQuickNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [todayMeals, setTodayMeals] = useState<MealEntry>(EMPTY_MEALS);

  const {
    accounts,
    categories,
    budgets,
    debtTracker,
    emiPayments,
    loading,
    monthlyPlans,
    refresh,
    savingsGoals,
    transactions,
  } = useFinanceStore();
  const { data: bills = [], refetch: refetchBills } = useBills();
  const typedBills = bills as TodayBill[];

  useEffect(() => {
    if (user?.id) {
      void refresh(user.id);
    }
  }, [refresh, user?.id]);

  useEffect(() => {
    localStorage.setItem('lifesync:last-spending-type', spendingType);
  }, [spendingType]);

  const { data: dashboardExtras } = useQuery({
    queryKey: ['dashboard-extras', user?.id],
    queryFn: () => fetchDashboardExtras(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  const currentMonth = format(new Date(), 'MMMM yyyy');
  const monthStart = getMonthStartDate();
  const today = getTodayDate();
  const weekAhead = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.transaction_date >= monthStart),
    [monthStart, transactions],
  );

  const stats = useMemo<DashboardStats>(() => {
    const todaySpending = monthTransactions
      .filter((transaction) => transaction.type === 'debit' && transaction.transaction_date === today)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const monthExpenses = monthTransactions
      .filter((transaction) => transaction.type === 'debit')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const monthIncome = monthTransactions
      .filter((transaction) => transaction.type === 'credit')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const savingsTargetTotal = savingsGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
    const savingsCurrentTotal = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
    const budgetUsage = budgets.map((budget) => ({ budget, usage: computeBudgetUsage(budget, monthTransactions) }));
    const overBudgetCategories = budgetUsage
      .filter(({ usage, budget }) => usage.usagePercent >= (budget.alertThreshold || 80))
      .map(({ budget }) => `${budget.category_name} (${budget.type})`);
    const daysRemaining = Math.max(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1, 1);
    const plan = monthlyPlans.find((entry) => entry.month === getMonthKey());
    const dailyLimit = Number(plan?.remaining_balance || 0) > 0
      ? Number(plan?.remaining_balance || 0) / daysRemaining
      : budgetUsage.reduce((sum, entry) => sum + Math.max(entry.usage.remaining, 0), 0) / daysRemaining;
    const latestDebt = debtTracker[0];

    return {
      ...EMPTY_STATS,
      activeHabits: dashboardExtras?.activeHabits ?? 0,
      todayCompletions: dashboardExtras?.todayCompletions ?? 0,
      upcomingReminders: dashboardExtras?.upcomingReminders ?? 0,
      pendingBills: dashboardExtras?.pendingBills ?? 0,
      todaySpending,
      monthExpenses,
      monthIncome,
      totalAccountBalance: accounts.reduce((sum, account) => sum + account.computed_balance, 0),
      totalEmiLiability: emiPayments
        .filter((payment) => !payment.is_paid)
        .reduce((sum, payment) => sum + payment.principal_component + payment.interest_component, 0),
      savingsCurrentTotal,
      savingsTargetTotal,
      savingsProgress: savingsTargetTotal > 0 ? Math.round((savingsCurrentTotal / savingsTargetTotal) * 100) : 0,
      surplus: monthIncome - monthExpenses,
      debtBalance: Number(latestDebt?.closing_balance || 0),
      debtIncreased: Number(latestDebt?.closing_balance || 0) > Number(latestDebt?.opening_balance || 0),
      overBudgetCategories,
      dailyLimit,
      dailyLimitExceeded: dailyLimit > 0 && todaySpending > dailyLimit,
      selfSpending: monthTransactions
        .filter((transaction) => transaction.type === 'debit' && transaction.spending_type === 'self')
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      familySpending: monthTransactions
        .filter((transaction) => transaction.type === 'debit' && transaction.spending_type === 'family')
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    };
  }, [accounts, budgets, dashboardExtras, debtTracker, emiPayments, monthTransactions, monthlyPlans, savingsGoals, today]);


  useEffect(() => {
    const nextMeals = { ...EMPTY_MEALS };
    transactions.forEach((transaction) => {
      if (transaction.type === 'debit' && transaction.transaction_date === today && transaction.meal_type) {
        nextMeals[transaction.meal_type] = transaction.amount;
      }
    });
    setTodayMeals(nextMeals);
  }, [today, transactions]);
  const alerts = useMemo(() => {
    const items: Array<{ id: string; title: string; body: string }> = [];
    if (stats.overBudgetCategories.length > 0) items.push({ id: 'budget', title: 'Budget alert', body: `Over budget in ${stats.overBudgetCategories.join(', ')}.` });
    if (stats.dailyLimitExceeded) items.push({ id: 'daily', title: 'Daily limit exceeded', body: `Today's spending crossed ${formatCurrency(stats.dailyLimit)}.` });
    if (stats.debtIncreased) items.push({ id: 'debt', title: 'Debt increased', body: `Current debt balance is ${formatCurrency(stats.debtBalance)}.` });
    return items;
  }, [formatCurrency, stats.dailyLimit, stats.dailyLimitExceeded, stats.debtBalance, stats.debtIncreased, stats.overBudgetCategories]);

  const selfBudget = useMemo(() => {
    const entries = budgets.filter((budget) => budget.type === 'self');
    const limit = entries.reduce((sum, budget) => sum + budget.amount, 0);
    const spent = entries.reduce((sum, budget) => sum + computeBudgetUsage(budget, monthTransactions).spent, 0);
    return { limit, spent, percent: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0 };
  }, [budgets, monthTransactions]);

  const familyBudget = useMemo(() => {
    const entries = budgets.filter((budget) => budget.type === 'family');
    const limit = entries.reduce((sum, budget) => sum + budget.amount, 0);
    const spent = entries.reduce((sum, budget) => sum + computeBudgetUsage(budget, monthTransactions).spent, 0);
    return { limit, spent, percent: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0 };
  }, [budgets, monthTransactions]);

  const dueBills = useMemo(
    () => typedBills
      .filter((bill) => !bill.is_paid && bill.due_date >= today && bill.due_date <= weekAhead)
      .slice(0, 4),
    [typedBills, today, weekAhead],
  );

  const dueEmis = useMemo(
    () => emiPayments
      .filter((payment) => !payment.is_paid && payment.due_date >= today && payment.due_date <= weekAhead)
      .slice(0, 4),
    [emiPayments, today, weekAhead],
  );

  const safeToSpend = Math.max(stats.dailyLimit - stats.todaySpending, 0);
  const dailyPercent = stats.dailyLimit > 0 ? Math.min((stats.todaySpending / stats.dailyLimit) * 100, 100) : 0;
  const habitScore = stats.activeHabits > 0 ? Math.round((stats.todayCompletions / stats.activeHabits) * 100) : 0;

  const markBillPaid = async (billId: string) => {
    try {
      const { error } = await supabase.from('bills').update({ is_paid: true, last_paid_date: today }).eq('id', billId);
      if (error) throw error;
      toast.success('Bill marked paid.');
      await refetchBills();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update bill';
      toast.error(message);
    }
  };

  const saveTodayMeal = async (meal: MealType) => {
    if (!user?.id) return;
    const amount = Number(todayMeals[meal] || 0);
    const existing = transactions.find((transaction) => transaction.transaction_date === today && transaction.meal_type === meal);
    try {
      if (amount <= 0) {
        if (existing) await deleteTransaction(existing.id);
        await refresh(user.id);
        toast.success('Meal expense cleared.');
        return;
      }

      const accountId = localStorage.getItem('lifesync:last-account-id') || accounts[0]?.id;
      if (!accountId) throw new Error('Please create an account first');
      const foodCategory = categories.find((category) => category.type === 'expense' && category.name.toLowerCase() === 'food & dining')
        || categories.find((category) => category.type === 'expense' && category.name.toLowerCase().includes('food'));

      if (existing) {
        const { error } = await supabase
          .from('transactions')
          .update({
            amount,
            account_id: accountId,
            category_id: foodCategory?.id || null,
            category: foodCategory?.name || 'Food & Dining',
            description: `${meal[0].toUpperCase()}${meal.slice(1)} meal expense`,
            payment_mode: 'Meal',
            spending_type: spendingType,
            meal_type: meal,
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        await addTransaction({
          userId: user.id,
          accountId,
          categoryId: foodCategory?.id || null,
          categoryName: foodCategory?.name || 'Food & Dining',
          type: 'debit',
          amount,
          date: today,
          notes: `${meal[0].toUpperCase()}${meal.slice(1)} meal expense`,
          paymentMode: 'Meal',
          spendingType,
          mealType: meal,
        });
      }
      await refresh(user.id);
      toast.success('Meal expense saved.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save meal expense';
      toast.error(message);
    }
  };
  const saveQuickNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id || !quickNote.trim()) return;
    setSavingNote(true);
    try {
      const title = quickNote.trim().split('\n')[0].slice(0, 60) || 'Quick note';
      const { error } = await supabase.from('notes').insert({
        user_id: user.id,
        title,
        content: quickNote.trim(),
        color: '#6366F1',
      });
      if (error) throw error;
      setQuickNote('');
      toast.success('Note saved.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save note';
      toast.error(message);
    } finally {
      setSavingNote(false);
    }
  };

  const addMoney = (type: 'debit' | 'credit' | 'transfer', categoryName?: string) => {
    openQuickAdd(type, { spendingType, categoryName });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title="Today" subtitle={`Daily check-in for ${currentMonth}`} icon={LayoutDashboard} primaryAction={<Button onClick={() => addMoney('debit')}>Add expense</Button>} />

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SkeletonCard count={1} />
            <SkeletonCard count={1} />
          </div>
        ) : (
          <>
            {alerts.length > 0 && !alertsDismissed && (
              <Collapsible open={alertsOpen} onOpenChange={setAlertsOpen}>
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <button type="button" onClick={() => setAlertsOpen((value) => !value)} className="flex flex-1 items-center gap-2 text-left font-semibold text-destructive">
                        {alerts.length} alert{alerts.length === 1 ? '' : 's'} need attention
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAlertsDismissed(true)}>Dismiss</Button>
                    </div>
                    <CollapsibleContent className="mt-3 space-y-2 pl-8">
                      {alerts.map((alert) => (
                        <div key={alert.id}>
                          <p className="text-sm font-medium text-foreground">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.body}</p>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            )}

            <Card className="border-primary/15 bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Safe to spend today</p>
                    <p className="mt-1 text-4xl font-bold tabular-nums text-primary sm:text-5xl">{formatCurrency(safeToSpend)}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Spent {formatCurrency(stats.todaySpending)} of {formatCurrency(stats.dailyLimit)}</p>
                  </div>
                  <div className="min-w-56 rounded-xl border bg-background p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Daily limit</span>
                      <span className="font-semibold tabular-nums">{Math.round(dailyPercent)}%</span>
                    </div>
                    <Progress value={dailyPercent} className="mt-3 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="grid grid-cols-3 gap-2">
                  <Button className="h-14" onClick={() => addMoney('debit')}><Wallet className="mr-2 h-4 w-4" />Expense</Button>
                  <Button className="h-14" variant="outline" onClick={() => addMoney('credit')}><TrendingUp className="mr-2 h-4 w-4" />Income</Button>
                  <Button className="h-14" variant="outline" onClick={() => addMoney('transfer')}><ArrowRightLeft className="mr-2 h-4 w-4" />Transfer</Button>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                  {(['self', 'family'] as const).map((value) => (
                    <Button key={value} type="button" size="sm" variant={spendingType === value ? 'default' : 'ghost'} onClick={() => setSpendingType(value)} className="capitalize">
                      {value}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Utensils className="h-5 w-5 text-primary" />Meals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-4">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((meal) => (
                    <div key={meal} className="rounded-xl border p-3">
                      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{meal}</p>
                      <div className="flex items-center gap-1">
                        <Input type="number" min="0" step="0.01" inputMode="decimal" value={todayMeals[meal] || ''} onChange={(event) => setTodayMeals((current) => ({ ...current, [meal]: Number(event.target.value) }))} onBlur={() => void saveTodayMeal(meal)} placeholder="0" aria-label={`${meal} amount`} />
                        <Button type="button" size="icon" variant="ghost" onClick={() => void saveTodayMeal(meal)} aria-label={`Save ${meal}`}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end"><MonthSetupSheet /></div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Self', selfBudget],
                ['Family', familyBudget],
              ].map(([label, budget]) => {
                const item = budget as typeof selfBudget;
                return (
                  <Link key={label as string} to="/budgets" className="rounded-2xl border bg-card p-4 transition hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{label as string} budget</p>
                      <Badge variant="outline">{Math.round(item.percent)}%</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(item.spent)} / {formatCurrency(item.limit)}</p>
                    <Progress value={item.percent} className="mt-3 h-2" />
                  </Link>
                );
              })}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><CalendarCheck2 className="h-5 w-5 text-primary" />Due soon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dueBills.length === 0 && dueEmis.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing due in the next 7 days.</p>
                ) : (
                  <>
                    {dueBills.map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                        <div>
                          <p className="font-medium">{bill.name}</p>
                          <p className="text-sm text-muted-foreground">Bill due {format(parseISO(bill.due_date), 'dd MMM')} - {formatCurrency(Number(bill.amount || 0))}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => void markBillPaid(bill.id)}>Mark paid</Button>
                      </div>
                    ))}
                    {dueEmis.map((payment) => (
                      <Link key={payment.id} to="/emis" className="flex items-center justify-between gap-3 rounded-xl border p-3 transition hover:bg-muted/50">
                        <div>
                          <p className="font-medium">EMI installment</p>
                          <p className="text-sm text-muted-foreground">Due {format(parseISO(payment.due_date), 'dd MMM')} - {formatCurrency(payment.principal_component + payment.interest_component)}</p>
                        </div>
                        <CreditCard className="h-5 w-5 text-primary" />
                      </Link>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            <Collapsible>
              <Card>
                <CollapsibleTrigger asChild>
                  <button type="button" className="flex w-full items-center justify-between p-5 text-left">
                    <span className="font-semibold">This month</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ['Income', formatCurrency(stats.monthIncome), 'text-success'],
                      ['Expenses', formatCurrency(stats.monthExpenses), 'text-destructive'],
                      ['Surplus', formatCurrency(stats.surplus), stats.surplus >= 0 ? 'text-success' : 'text-destructive'],
                      ['Live balance', formatCurrency(stats.totalAccountBalance), 'text-foreground'],
                      ['Debt balance', formatCurrency(stats.debtBalance), 'text-destructive'],
                      ['EMI outstanding', formatCurrency(stats.totalEmiLiability), 'text-warning'],
                      ['Savings', `${stats.savingsProgress}%`, 'text-primary'],
                      ['Habits today', `${stats.todayCompletions}/${stats.activeHabits}`, 'text-foreground'],
                    ].map(([label, value, color]) => (
                      <div key={label} className="rounded-xl border bg-background p-3">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className={cn('mt-1 text-xl font-bold tabular-nums', color)}>{value}</p>
                        {label === 'Habits today' && <Progress value={habitScore} className="mt-2 h-1.5" />}
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><NotebookPen className="h-5 w-5 text-primary" />Quick note</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveQuickNote} className="space-y-3">
                  <Textarea value={quickNote} onChange={(event) => setQuickNote(event.target.value)} placeholder="Write a note..." rows={3} />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={savingNote || !quickNote.trim()}><FileText className="mr-2 h-4 w-4" />Save note</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;








