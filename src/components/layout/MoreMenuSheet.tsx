import { Bell, FileText, Flag, KeyRound, Menu, Package, Receipt, Settings, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const items = [
  ['/goals', 'Goals', Flag],
  ['/habits', 'Habits', Target],
  ['/bills', 'Bills', Receipt],
  ['/notes', 'Notes', FileText],
  ['/reminders', 'Reminders', Bell],
  ['/products', 'Products', Package],
  ['/vault', 'Vault', KeyRound],
  ['/settings', 'Settings', Settings],
] as const;

interface MoreMenuSheetProps {
  trigger: React.ReactNode;
}

/**
 * More-menu overlay used by the mobile bottom nav. Renders as a sheet
 * rather than a routed page so it feels like a native drawer.
 */
export default function MoreMenuSheet({ trigger }: MoreMenuSheetProps) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-left">
            <Menu className="h-5 w-5 text-primary" /> More
          </SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-3 pb-4 sm:grid-cols-4">
          {items.map(([path, label, Icon]) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-3 transition-colors hover:bg-muted"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
