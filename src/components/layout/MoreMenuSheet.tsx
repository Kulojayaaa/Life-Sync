import { Download, KeyRound, LogOut, Menu, Package, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface MoreMenuSheetProps {
  trigger: React.ReactNode;
}

export default function MoreMenuSheet({ trigger }: MoreMenuSheetProps) {
  const { isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const items = [
    ['/products', 'Products', Package],
    ['/vault', 'Vault', KeyRound],
    ['/settings', 'Settings', Settings],
    ['/settings#export', 'Export', Download],
    ...(isAdmin ? ([['/admin', 'Admin', Shield]] as const) : []),
  ] as const;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

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
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-3 text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs font-semibold">Sign out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
