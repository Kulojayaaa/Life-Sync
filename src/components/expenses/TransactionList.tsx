import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/CurrencyContext';
import { FinanceAccount, FinanceTransaction } from '@/lib/finance';

interface TransactionListProps {
  transactions: FinanceTransaction[];
  accountsById: Record<string, FinanceAccount>;
  onDelete: (id: string) => void;
  onEdit: (transaction: FinanceTransaction) => void;
}

export function TransactionList({ transactions, accountsById, onDelete, onEdit }: TransactionListProps) {
  const { formatCurrency } = useCurrency();

  if (transactions.length === 0) {
    return <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-14 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><ArrowLeftRight className="h-5 w-5 text-primary" /></div><p className="font-semibold text-foreground">No transactions found</p><p className="mt-1 text-sm text-muted-foreground">Try changing the filters or add a new transaction.</p></div>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const fromAccount = accountsById[transaction.account_id];
        const toAccount = transaction.to_account_id ? accountsById[transaction.to_account_id] : undefined;
        const amountLabel =
          transaction.type === 'credit'
            ? `+${formatCurrency(transaction.amount)}`
            : transaction.type === 'debit'
              ? `-${formatCurrency(transaction.amount)}`
              : formatCurrency(transaction.amount);

        return (
          <div
            key={transaction.id}
            className={cn(
              'group relative grid gap-3 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[minmax(0,1fr)_auto]',
              transaction.type === 'credit' && 'border-l-4 border-l-emerald-500',
              transaction.type === 'debit' && 'border-l-4 border-l-rose-500',
              transaction.type === 'transfer' && 'border-l-4 border-l-sky-500',
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0',
                  transaction.type === 'credit' && 'bg-green-500/10 text-green-500',
                  transaction.type === 'debit' && 'bg-red-500/10 text-red-500',
                  transaction.type === 'transfer' && 'bg-slate-500/10 text-slate-600',
                )}
              >
                {transaction.type === 'credit' && <ArrowDownLeft className="w-5 h-5" />}
                {transaction.type === 'debit' && <ArrowUpRight className="w-5 h-5" />}
                {transaction.type === 'transfer' && <ArrowLeftRight className="w-5 h-5" />}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground truncate">
                    {transaction.type === 'transfer' ? 'Transfer' : transaction.category_name}
                  </p>
                  {transaction.spending_type && transaction.type === 'debit' && (
                    <Badge variant="secondary" className="uppercase text-[10px] tracking-wide">
                      {transaction.spending_type}
                    </Badge>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {transaction.type === 'transfer'
                    ? `${fromAccount?.name || 'Account'} to ${toAccount?.name || 'Account'}`
                    : transaction.description || fromAccount?.name || 'No description'}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5">{fromAccount?.name || 'Unknown account'}</span>
                  {transaction.to_account_id && <span>To: {toAccount?.name || 'Unknown'}</span>}
                  {transaction.payment_mode && <span className="rounded-full bg-muted px-2 py-0.5">{transaction.payment_mode}</span>}
                  {transaction.reference_id && <span>Ref: {transaction.reference_id.slice(0, 8)}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="text-right">
                <p
                  className={cn(
                  'text-base font-bold',
                    transaction.type === 'credit' && 'text-green-500',
                    transaction.type === 'debit' && 'text-red-500',
                    transaction.type === 'transfer' && 'text-slate-600',
                  )}
                >
                  {amountLabel}
                </p>
                <p className="text-xs text-muted-foreground">{format(new Date(transaction.transaction_date), 'dd MMM yyyy')}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Edit transaction" onClick={() => onEdit(transaction)} className="text-muted-foreground opacity-70 hover:text-primary group-hover:opacity-100">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete transaction" onClick={() => onDelete(transaction.id)} className="text-muted-foreground opacity-70 hover:text-destructive group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
