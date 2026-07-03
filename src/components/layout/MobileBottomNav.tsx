import { CalendarDays, Home, Menu, Plus, WalletCards } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { openQuickAdd } from '@/components/finance/QuickAddTransactionSheet';

const items = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Money', path: '/money', icon: WalletCards },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'More', path: '/more', icon: Menu },
];

export function MobileBottomNav() {
  return <nav aria-label="Primary mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
    <button type="button" aria-label="Quick add transaction" onClick={() => openQuickAdd()} className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background"><Plus className="h-7 w-7" /></button>
    <div className="grid h-16 grid-cols-4">{items.map((item, index) => <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => cn('flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground', isActive && 'font-semibold text-primary', index === 1 && 'pr-5', index === 2 && 'pl-5')} aria-label={item.label}>{({ isActive }) => <><item.icon className="h-5 w-5" /><span>{item.label}</span>{isActive && <span className="sr-only">Current page</span>}</>}</NavLink>)}</div>
  </nav>;
}
