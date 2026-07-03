import { CalendarDays, Home, Menu, Plus, WalletCards } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { openQuickAdd } from '@/components/finance/QuickAddTransactionSheet';
import MoreMenuSheet from './MoreMenuSheet';

const items = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Money', path: '/money', icon: WalletCards },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
];

const linkClass = (isActive: boolean, side: 'left' | 'right' | 'none' = 'none') =>
  cn(
    'flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground',
    isActive && 'font-semibold text-primary',
    side === 'left' && 'pr-5',
    side === 'right' && 'pl-5',
  );

export function MobileBottomNav() {
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
        <NavLink to="/" end className={({ isActive }) => linkClass(isActive)} aria-label="Home">
          {({ isActive }) => (
            <>
              <Home className="h-5 w-5" />
              <span>Home</span>
              {isActive && <span className="sr-only">Current page</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/money" className={({ isActive }) => linkClass(isActive, 'left')} aria-label="Money">
          {({ isActive }) => (
            <>
              <WalletCards className="h-5 w-5" />
              <span>Money</span>
              {isActive && <span className="sr-only">Current page</span>}
            </>
          )}
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) => linkClass(isActive, 'right')}
          aria-label="Calendar"
        >
          {({ isActive }) => (
            <>
              <CalendarDays className="h-5 w-5" />
              <span>Calendar</span>
              {isActive && <span className="sr-only">Current page</span>}
            </>
          )}
        </NavLink>
        <MoreMenuSheet
          trigger={
            <button
              type="button"
              className={linkClass(false)}
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
