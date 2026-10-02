import { CalendarRange, ListTodo, Menu, Plus, WalletCards } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { openQuickAdd } from '@/components/finance/QuickAddTransactionSheet';
import MoreMenuSheet from './MoreMenuSheet';

const moneyPaths = ['/money', '/expenses', '/accounts', '/budgets', '/savings', '/bills', '/emis', '/debt', '/planner', '/insights', '/reports'];
const planPaths = ['/plan', '/calendar', '/reminders', '/habits', '/goals', '/notes'];
const morePaths = ['/products', '/vault', '/settings', '/admin'];

const linkClass = (isActive: boolean, side: 'left' | 'right' | 'none' = 'none') =>
  cn(
    'flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground',
    isActive && 'font-semibold text-primary',
    side === 'left' && 'pr-5',
    side === 'right' && 'pl-5',
  );

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const isMoneyActive = moneyPaths.includes(pathname);
  const isPlanActive = planPaths.includes(pathname);
  const isMoreActive = morePaths.includes(pathname);

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <button
        type="button"
        aria-label="Quick add transaction"
        onClick={() => openQuickAdd()}
        className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background"
      >
        <Plus className="h-7 w-7" />
      </button>
      <div className="grid h-16 grid-cols-4">
        <NavLink to="/" end className={({ isActive }) => linkClass(isActive)} aria-label="Today">
          {({ isActive }) => (
            <>
              <CalendarRange className="h-5 w-5" />
              <span>Today</span>
              {isActive && <span className="sr-only">Current page</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/money" className={() => linkClass(isMoneyActive, 'left')} aria-label="Money">
          {({ isActive }) => (
            <>
              <WalletCards className="h-5 w-5" />
              <span>Money</span>
              {isActive && <span className="sr-only">Current page</span>}
            </>
          )}
        </NavLink>
        <NavLink
          to="/plan"
          className={() => linkClass(isPlanActive, 'right')}
          aria-label="Plan"
        >
          {({ isActive }) => (
            <>
              <ListTodo className="h-5 w-5" />
              <span>Plan</span>
              {isActive && <span className="sr-only">Current page</span>}
            </>
          )}
        </NavLink>
        <MoreMenuSheet
          trigger={
            <button
              type="button"
              className={linkClass(isMoreActive)}
              aria-label="More"
            >
              <Menu className="h-5 w-5" />
              <span>More</span>
            </button>
          }
        />
      </div>
    </nav>
  );
}


