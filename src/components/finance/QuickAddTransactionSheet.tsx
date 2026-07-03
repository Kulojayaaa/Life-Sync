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
import { addTransaction, type TransactionInput } from '@/services/financeService';
import { isOffline, queuePendingTransaction } from '@/services/offlineFinance';
import { ChevronDown } from 'lucide-react';

type TransactionType = 'debit' | 'credit' | 'transfer';

export function openQuickAdd(type: TransactionType = 'debit') {
  window.dispatchEvent(new CustomEvent('lifesync:quick-add', { detail: { type } }));
}

export function QuickAddTransactionSheet() {
  const { user } = useAuth();
  const { accounts, categories, supportsTransactionCategoryIds, refresh } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<TransactionType>('debit');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transferAccountId, setTransferAccountId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMode, setPaymentMode] = useState('');
  const [spendingType, setSpendingType] = useState<'self' | 'family'>('self');
  const [notes, setNotes] = useState('');

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === (type === 'credit' ? 'income' : 'expense')),
    [categories, type],
  );

  useEffect(() => {
    const listener = (event: Event) => {
      const nextType = (event as CustomEvent<{ type?: TransactionType }>).detail?.type;
      setType(nextType || 'debit');
      setOpen(true);
    };
    window.addEventListener('lifesync:quick-add', listener);
    return () => window.removeEventListener('lifesync:quick-add', listener);
  }, []);

  useEffect(() => {
    if (!accountId && accounts[0]) setAccountId(accounts[0].id);
  }, [accountId, accounts]);

  useEffect(() => setCategoryId(''), [type]);

  const reset = () => {
    setAmount(''); setCategoryId(''); setTransferAccountId(''); setNotes(''); setPaymentMode('');
    setDate(format(new Date(), 'yyyy-MM-dd')); setSpendingType('self');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !accountId || !Number(amount) || (type !== 'transfer' && !categoryId)) {
      toast.error('Enter an amount, account, and category.');
      return;
    }
    const category = categories.find((item) => item.id === categoryId);
    const input: TransactionInput = {
      userId: user.id, accountId, categoryId: type === 'transfer' ? null : categoryId,
      categoryName: type === 'transfer' ? 'Transfer' : category?.name || 'Other', type,
      amount: Number(amount), date, notes: notes || null, paymentMode: paymentMode || null,
      transferAccountId: type === 'transfer' ? transferAccountId : null,
      spendingType: type === 'debit' ? spendingType : null, supportsCategoryIds: supportsTransactionCategoryIds,
    };
    setSaving(true);
    try {
      if (isOffline()) {
        queuePendingTransaction(input);
        toast.info('Saved offline — this transaction will sync when you are back online.');
      } else {
        await addTransaction(input);
        await refresh(user.id);
        toast.success('Transaction added.');
      }
      reset(); setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save transaction';
      if (/network|fetch|offline/i.test(message)) {
        queuePendingTransaction(input);
        toast.info('Network unavailable — queued for sync.');
        reset(); setOpen(false);
      } else toast.error(message);
    } finally { setSaving(false); }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[440px] sm:rounded-none">
        <SheetHeader><SheetTitle>Quick add</SheetTitle><SheetDescription>Add money movement without leaving this screen.</SheetDescription></SheetHeader>
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Transaction type">
            {([['debit', 'Expense'], ['credit', 'Income'], ['transfer', 'Transfer']] as const).map(([value, label]) =>
              <Button key={value} type="button" variant={type === value ? 'default' : 'outline'} onClick={() => setType(value)}>{label}</Button>)}
          </div>
          <div><Label htmlFor="quick-amount">Amount</Label><Input id="quick-amount" autoFocus inputMode="decimal" type="number" min="0.01" step="0.01" className="h-14 text-2xl" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><Label>Account</Label><Select value={accountId} onValueChange={setAccountId}><SelectTrigger className="h-12"><SelectValue placeholder="Choose account" /></SelectTrigger><SelectContent>{accounts.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
          {type === 'transfer' ? <div><Label>Destination account</Label><Select value={transferAccountId} onValueChange={setTransferAccountId}><SelectTrigger className="h-12"><SelectValue placeholder="Choose destination" /></SelectTrigger><SelectContent>{accounts.filter((item) => item.id !== accountId).map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
            : <div><Label>Category</Label><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger className="h-12"><SelectValue placeholder="Choose category" /></SelectTrigger><SelectContent>{availableCategories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>}
          <Collapsible><CollapsibleTrigger asChild><Button type="button" variant="ghost" className="w-full justify-between">Add details <ChevronDown className="h-4 w-4" /></Button></CollapsibleTrigger><CollapsibleContent className="space-y-4 pt-3">
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label>Payment mode</Label><Input value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} placeholder="Card, cash, UPI…" /></div>
            {type === 'debit' && <div><Label>Spending type</Label><Select value={spendingType} onValueChange={(value) => setSpendingType(value as 'self' | 'family')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="self">Self</SelectItem><SelectItem value="family">Family</SelectItem></SelectContent></Select></div>}
            <div><Label>Note</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </CollapsibleContent></Collapsible>
          <Button type="submit" size="lg" className="h-12 w-full" disabled={saving}>{saving ? 'Saving…' : 'Save transaction'}</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
