import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarRange } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/CurrencyContext';
import { useFinanceStore } from '@/store/financeStore';
import { FinanceBudget, FinanceCategory, getMonthKey } from '@/lib/finance';

interface MonthSetupSheetProps {
  trigger?: React.ReactNode;
}

type BudgetTarget = 'self' | 'family' | 'food';

function findCategory(categories: FinanceCategory[], target: BudgetTarget) {
  if (target === 'self') {
    return categories.find((category) => category.type === 'expense' && category.name.toLowerCase().includes('personal'))
      || categories.find((category) => category.type === 'expense');
  }
  if (target === 'family') {
    return categories.find((category) => category.type === 'expense' && category.name.toLowerCase().includes('house'))
      || categories.find((category) => category.type === 'expense' && category.name.toLowerCase().includes('family'))
      || categories.find((category) => category.type === 'expense');
  }
  return categories.find((category) => category.type === 'expense' && category.name.toLowerCase() === 'food & dining')
    || categories.find((category) => category.type === 'expense' && category.name.toLowerCase().includes('food'));
}

function findBudget(budgets: FinanceBudget[], category: FinanceCategory | undefined, type: 'self' | 'family') {
  if (!category) return undefined;
  return budgets.find((budget) => budget.category_id === category.id && budget.type === type)
    || budgets.find((budget) => budget.category_name.toLowerCase() === category.name.toLowerCase() && budget.type === type);
}

export function MonthSetupSheet({ trigger }: MonthSetupSheetProps) {
  const { user } = useAuth();
  const { currencySymbol } = useCurrency();
  const { budgets, categories, monthlyPlans, supportsBudgetCategoryIds, refresh, saveMonthlyPlan } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ income: '', self: '', family: '', food: '', debt: '' });
  const monthKey = getMonthKey();

  const categoryTargets = useMemo(() => ({
    self: findCategory(categories, 'self'),
    family: findCategory(categories, 'family'),
    food: findCategory(categories, 'food'),
  }), [categories]);

  useEffect(() => {
    if (!open) return;
    const currentPlan = monthlyPlans.find((plan) => plan.month === monthKey);
    const selfBudget = findBudget(budgets, categoryTargets.self, 'self');
    const familyBudget = findBudget(budgets, categoryTargets.family, 'family');
    const foodBudget = findBudget(budgets, categoryTargets.food, 'self');
    setForm({
      income: currentPlan?.total_income ? String(currentPlan.total_income) : '',
      self: selfBudget?.amount ? String(selfBudget.amount) : currentPlan?.allocated_self ? String(currentPlan.allocated_self) : '',
      family: familyBudget?.amount ? String(familyBudget.amount) : currentPlan?.allocated_family ? String(currentPlan.allocated_family) : '',
      food: foodBudget?.amount ? String(foodBudget.amount) : '',
      debt: currentPlan?.allocated_debt ? String(currentPlan.allocated_debt) : '',
    });
  }, [budgets, categoryTargets, monthKey, monthlyPlans, open]);

  const saveBudget = async (target: BudgetTarget, amount: number) => {
    const type = target === 'family' ? 'family' : 'self';
    const category = categoryTargets[target];
    if (!user?.id || !category || amount <= 0) return;

    const existing = findBudget(budgets, category, type);
    const payload = {
      user_id: user.id,
      category_id: category.id,
      category: category.name,
      type,
      planned_amount: amount,
      amount,
      monthly_limit: amount,
      limit_amount: amount,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      month_key: monthKey,
      carry_forward: false,
      rollover_amount: 0,
      color: category.color || '#8B5CF6',
    };

    if (existing) {
      const { error } = await supabase.from('budgets').update(payload as never).eq('id', existing.id);
      if (error) throw error;
      return;
    }

    const variants = supportsBudgetCategoryIds
      ? [payload, { ...payload, month_key: undefined }]
      : [{ ...payload, category_id: undefined, month_key: undefined }];
    for (const variant of variants) {
      const { error } = await supabase.from('budgets').insert(variant as never);
      if (!error) return;
      if (!/column|schema|month_key|category_id/i.test(error.message)) throw error;
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      const income = Number(form.income) || 0;
      const self = Number(form.self) || 0;
      const family = Number(form.family) || 0;
      const debt = Number(form.debt) || 0;
      await saveMonthlyPlan({ month: monthKey, total_income: income, allocated_self: self, allocated_family: family, allocated_debt: debt });
      await saveBudget('self', self);
      await saveBudget('family', family);
      await saveBudget('food', Number(form.food) || 0);
      await refresh(user.id);
      toast.success('Month setup saved.');
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save month setup';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || <Button variant="outline"><CalendarRange className="mr-2 h-4 w-4" />Set up this month</Button>}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[440px] sm:rounded-none">
        <SheetHeader>
          <SheetTitle>Set up this month</SheetTitle>
          <SheetDescription>Expected income, Self, Family, Food, and debt allocation.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="setup-income">Expected income ({currencySymbol})</Label>
            <Input id="setup-income" autoFocus inputMode="decimal" type="number" step="0.01" value={form.income} onChange={(event) => setForm((current) => ({ ...current, income: event.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="setup-self">Self budget</Label>
              <Input id="setup-self" inputMode="decimal" type="number" step="0.01" value={form.self} onChange={(event) => setForm((current) => ({ ...current, self: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup-family">Family budget</Label>
              <Input id="setup-family" inputMode="decimal" type="number" step="0.01" value={form.family} onChange={(event) => setForm((current) => ({ ...current, family: event.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-food">Food budget</Label>
            <Input id="setup-food" inputMode="decimal" type="number" step="0.01" value={form.food} onChange={(event) => setForm((current) => ({ ...current, food: event.target.value }))} />
            {!categoryTargets.food && <p className="text-xs text-destructive">Create a Food & Dining expense category to save this budget.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-debt">Debt allocation</Label>
            <Input id="setup-debt" inputMode="decimal" type="number" step="0.01" value={form.debt} onChange={(event) => setForm((current) => ({ ...current, debt: event.target.value }))} />
          </div>
          <div className="sticky bottom-0 -mx-6 bg-background/95 px-6 py-4 backdrop-blur">
            <Button type="submit" className="h-12 w-full" disabled={saving}>{saving ? 'Saving...' : 'Save month setup'}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
