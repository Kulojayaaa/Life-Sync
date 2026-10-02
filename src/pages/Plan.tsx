import { BarChart3, Bell, CalendarDays, FileText, Flag, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const planItems = [
  { value: 'calendar', label: 'Calendar', path: '/calendar', icon: CalendarDays, description: 'Events and dates' },
  { value: 'reminders', label: 'Reminders', path: '/reminders', icon: Bell, description: 'Things to follow up' },
  { value: 'habits', label: 'Habits', path: '/habits', icon: Target, description: 'Daily routines' },
  { value: 'goals', label: 'Goals', path: '/goals', icon: Flag, description: 'Longer-term targets' },
  { value: 'notes', label: 'Notes', path: '/notes', icon: FileText, description: 'Quick thoughts and records' },
] as const;

export default function Plan() {
  return (
    <AppLayout>
      <PageHeader title="Plan" subtitle="Calendar, reminders, habits, goals, and notes in one place" icon={BarChart3} />
      <div className="sticky top-0 z-10 -mx-4 border-y border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Tabs value="calendar">
          <TabsList className="no-scrollbar flex h-11 w-full justify-start overflow-x-auto rounded-xl bg-muted/70 p-1">
            {planItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value} asChild className="h-9 flex-none rounded-lg px-4">
                <Link to={item.path}>{item.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {planItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <item.icon className="mb-8 h-6 w-6 text-primary" />
            <h2 className="font-semibold">{item.label}</h2>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
