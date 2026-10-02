import { FormEvent, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceStore } from '@/store/financeStore';
import { addTransaction, deleteTransaction, type TransactionInput } from '@/services/financeService';
import { isOffline, queuePendingTransaction } from '@/services/offlineFinance';
import { ChevronDown } from 'lucide-react';

const STORAGE_KEYS = {
  account: 'lifesync:last-account-id',
  paymentMode: 'lifesync:last-payment-mode',
  spendingType: 'lifesync:last-spending-type',
};

const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Netbanking', 'EMI', 'Other'] as const;
type TransactionType = 'debit' | 'credit' | 'transfer';
type SpendingType = 'self' | 'family';

type QuickAddOptions = {
  categoryName?: string;
  spendingType?: SpendingType;
};

export function openQuickAdd(type: TransactionType = 'debit', options: QuickAddOptions = {}) {
  window.dispatchEvent(new CustomEvent('lifesync:quick-add', { detail: { type, ...options } }));
}

export function QuickAddTransactionSheet() {
  const { user } = useAuth();
  const { accounts, categories, transactions, supportsTransactionCategoryIds, refresh } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<TransactionType>('debit');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transferAccountId, setTransferAccountId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMode, setPaymentMode] = useState('');
  const [customPaymentMode, setCustomPaymentMode] = useState('');
  const [spendingType, setSpendingType] = useState<SpendingType>('self');
  const [notes, setNotes] = useState('');

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === (type === 'credit' ? 'income' : 'expense')),
    [categories, type],
  );

  const recentCategoryNames = useMemo(() => {
    const names: string[] = [];
    for (const transaction of transactions) {
      if (type === 'transfer' || transaction.type !== type || !transaction.category_name) continue;
      if (!names.includes(transaction.category_name)) names.push(transaction.category_name);
      if (names.length === 6) break;
    }
    return names;
  }, [transactions, type]);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: TransactionType; categoryName?: string; spendingType?: SpendingType }>).detail || {};
      const nextType = detail.type || 'debit';
      const storedAccount = localStorage.getItem(STORAGE_KEYS.account);
      const storedPaymentMode = localStorage.getItem(STORAGE_KEYS.paymentMode) || '';
      const storedSpendingType = (localStorage.getItem(STORAGE_KEYS.spendingType) as SpendingType | null) || 'self';
      setType(nextType);
      setSpendingType(detail.spendingType || storedSpendingType);
      setAccountId(storedAccount || accounts[0]?.id || '');
      setPaymentMode(storedPaymentMode);
      setCustomPaymentMode(PAYMENT_MODES.includes(storedPaymentMode as typeof PAYMENT_MODES[number]) ? '' : storedPaymentMode);
      setOpen(true);
      if (detail.categoryName) {
        const match = categories.find((category) => category.name.toLowerCase() === detail.categoryName?.toLowerCase());
        setCategoryId(match?.id || '');
      }
    };
    window.addEventListener('lifesync:quick-add', listener);
    return () => window.removeEventListener('lifesync:quick-add', listener);
  }, [accounts, categories]);

  useEffect(() => {
    if (!accountId && accounts[0]) {
      const storedAccount = localStorage.getItem(STORAGE_KEYS.account);
      setAccountId(storedAccount && accounts.some((account) => account.id === storedAccount) ? storedAccount : accounts[0].id);
    }
  }, [accountId, accounts]);

  useEffect(() => setCategoryId(''), [type]);

  const reset = () => {
    setAmount('');
    setCategoryId('');
    setTransferAccountId('');
    setNotes('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const chooseCategoryByName = (name: string) => {
    const match = availableCategories.find((category) => category.name === name);
    if (match) setCategoryId(match.id);
  };

  const persistDefaults = (finalPaymentMode: string | null) => {
    if (accountId) localStorage.setItem(STORAGE_KEYS.account, accountId);
    localStorage.setItem(STORAGE_KEYS.spendingType, spendingType);
    if (finalPaymentMode) localStorage.setItem(STORAGE_KEYS.paymentMode, finalPaymentMode);
  };

  const submit = async (event: FormEvent, addAnother = false) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!user || !accountId || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || (type !== 'transfer' && !categoryId)) {
      toast.error('Enter an amount, account, and category.');
      return;
    }
    if (type === 'transfer' && (!transferAccountId || transferAccountId === accountId)) {
      toast.error('Choose a different destination account.');
      return;
    }
    const category = categories.find((item) => item.id === categoryId);
    const finalPaymentMode = paymentMode === 'Other' ? customPaymentMode.trim() : paymentMode.trim();
    const input: TransactionInput = {
      userId: user.id,
      accountId,
      categoryId: type === 'transfer' ? null : categoryId,
      categoryName: type === 'transfer' ? 'Transfer' : category?.name || 'Other',
      type,
      amount: parsedAmount,
      date,
      notes: notes.trim() || null,
      paymentMode: finalPaymentMode || null,
      transferAccountId: type === 'transfer' ? transferAccountId : null,
      spendingType: type === 'debit' ? spendingType : null,
      supportsCategoryIds: supportsTransactionCategoryIds,
    };
    setSaving(true);
    try {
      persistDefaults(finalPaymentMode || null);
      if (isOffline()) {
        queuePendingTransaction(input);
        toast.info('Saved offline. This transaction will sync when you are back online.');
      } else {
        const result = await addTransaction(input);
        await refresh(user.id);
        const createdId = typeof result === 'string' ? result : null;
        toast.success('Transaction added.', createdId ? {
          action: {
            label: 'Undo',
            onClick: async () => {
              await deleteTransaction(createdId);
              await refresh(user.id);
              toast.success('Transaction removed.');
            },
          },
        } : undefined);
      }
      reset();
      if (!addAnother) setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save transaction';
      if (/network|fetch|offline/i.test(message)) {
        queuePendingTransaction(input);
        toast.info('Network unavailable. Queued for sync.');
        reset();
        if (!addAnother) setOpen(false);
      } else toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[440px] sm:rounded-none">
        <SheetHeader>
          <SheetTitle>Quick add</SheetTitle>
          <SheetDescription>Add money movement without leaving this screen.</SheetDescription>
        </SheetHeader>
        <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-5">
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Transaction type">
            {([['debit', 'Expense'], ['credit', 'Income'], ['transfer', 'Transfer']] as const).map(([value, label]) =>
              <Button key={value} type="button" variant={type === value ? 'default' : 'outline'} onClick={() => { setType(value); setCategoryId(''); }}>{label}</Button>)}
          </div>

          <div>
            <Label htmlFor="quick-amount">Amount</Label>
            <Input id="quick-amount" autoFocus inputMode="decimal" type="number" min="0.01" step="0.01" className="h-14 text-2xl" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          {type === 'debit' && (
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Spending type">
              {(['self', 'family'] as const).map((value) => (
                <Button key={value} type="button" variant={spendingType === value ? 'default' : 'outline'} onClick={() => setSpendingType(value)} className="capitalize">
                  {value}
                </Button>
              ))}
            </div>
          )}

          {recentCategoryNames.length > 0 && type !== 'transfer' && (
            <div className="space-y-2">
              <Label>Recent categories</Label>
              <div className="flex flex-wrap gap-2">
                {recentCategoryNames.map((name) => (
                  <Button key={name} type="button" variant="outline" size="sm" onClick={() => chooseCategoryByName(name)}>
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {type === 'transfer' ? (
            <div className="space-y-4">
              <div>
                <Label>From account</Label>
                <Select value={accountId} onValueChange={setAccountId}><SelectTrigger className="h-12"><SelectValue placeholder="Choose account" /></SelectTrigger><SelectContent>{accounts.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div>
                <Label>Destination account</Label>
                <Select value={transferAccountId} onValueChange={setTransferAccountId}><SelectTrigger className="h-12"><SelectValue placeholder="Choose destination" /></SelectTrigger><SelectContent>{accounts.filter((item) => item.id !== accountId).map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
          ) : (
            <>
              <div><Label>Category</Label><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger className="h-12"><SelectValue placeholder="Choose category" /></SelectTrigger><SelectContent>{availableCategories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Account</Label><Select value={accountId} onValueChange={setAccountId}><SelectTrigger className="h-12"><SelectValue placeholder="Choose account" /></SelectTrigger><SelectContent>{accounts.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
            </>
          )}

          <Collapsible>
            <CollapsibleTrigger asChild><Button type="button" variant="ghost" className="w-full justify-between">More details <ChevronDown className="h-4 w-4" /></Button></CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-3">
              <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Payment mode</Label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_MODES.map((mode) => (
                    <Button key={mode} type="button" size="sm" variant={paymentMode === mode ? 'default' : 'outline'} onClick={() => setPaymentMode(mode)}>
                      {mode}
                    </Button>
                  ))}
                </div>
                {paymentMode === 'Other' && <Input value={customPaymentMode} onChange={(e) => setCustomPaymentMode(e.target.value)} placeholder="Payment mode" />}
              </div>
              <div><Label>Note</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </CollapsibleContent>
          </Collapsible>

          <div className="grid grid-cols-2 gap-2">
            <Button type="submit" size="lg" className="h-12" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button type="button" size="lg" variant="outline" className="h-12" disabled={saving} onClick={(event) => void submit(event as unknown as FormEvent, true)}>Save & add</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

