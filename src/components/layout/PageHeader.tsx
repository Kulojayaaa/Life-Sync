import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, primaryAction, secondaryAction, breadcrumb }: PageHeaderProps) {
  return <header className="mb-6 space-y-2">
    {breadcrumb}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>}
        <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>{subtitle && <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>}</div>
      </div>
      {(primaryAction || secondaryAction) && <div className="flex flex-wrap gap-2">{secondaryAction}{primaryAction}</div>}
    </div>
  </header>;
}
