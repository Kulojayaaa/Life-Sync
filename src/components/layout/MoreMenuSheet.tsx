import { Bell, FileText, Flag, KeyRound, Menu, Package, Receipt, Settings, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { PageHeader } from './PageHeader';

const items = [
  ['/goals', 'Goals', Flag], ['/habits', 'Habits', Target], ['/bills', 'Bills', Receipt], ['/notes', 'Notes', FileText],
  ['/reminders', 'Reminders', Bell], ['/products', 'Products', Package], ['/vault', 'Vault', KeyRound], ['/settings', 'Settings', Settings],
] as const;

export default function MoreMenuSheet() {
  return <AppLayout><PageHeader title="More" subtitle="Everything else in LifeSync" icon={Menu} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{items.map(([path, label, Icon]) => <Link key={path} to={path} className="flex min-h-28 flex-col justify-between rounded-2xl border bg-card p-4 transition-colors hover:bg-muted"><Icon className="h-6 w-6 text-primary" /><span className="font-semibold">{label}</span></Link>)}</div></AppLayout>;
}
