import { useEffect, useState } from 'react';
import { supabase as _sb } from '@/integrations/supabase/client';
// Cast: generated Database types are missing some tables until types are regenerated.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _sb as any;
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import {
  Bell,
  Calendar,
  CreditCard,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useCurrency } from '@/hooks/CurrencyContext';

interface TodayItem {
  id: string;
  title: string;
  type: 'reminder' | 'event' | 'bill' | 'emi';
  time?: string;
  amount?: number;
  isOverdue?: boolean;
}

export const useTodayNotifications = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (user && !hasShown) {
      fetchAndShowNotifications();
      setHasShown(true);
    }
  }, [user, hasShown]);

  const fetchAndShowNotifications = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayStart = startOfDay(new Date());

      // Fetch today's reminders
      const { data: reminders } = await supabase
        .from('reminders')
        .select('id, title, reminder_time')
        .eq('reminder_date', today)
        .eq('is_completed', false);

      // Fetch today's calendar events
      const { data: events } = await supabase
        .from('calendar_events')
        .select('id, title, start_time')
        .eq('event_date', today);

      // Fetch bills due today or overdue
      const { data: bills } = await supabase
        .from('bills')
        .select('id, name, amount, due_date')
        .eq('is_paid', false)
        .lte('due_date', today);

      // Fetch EMI payments due today or overdue
      const { data: emis } = await supabase
        .from('emi_payments')
        .select('id, emi_id, due_date, principal_component, interest_component')
        .eq('is_paid', false)
        .lte('due_date', today);

      const emiIds = [...new Set((emis || []).map((entry) => entry.emi_id))];
      const { data: emiRecords } = emiIds.length > 0
        ? await supabase.from('emis').select('id, name').in('id', emiIds)
        : { data: [] as Array<{ id: string; name: string }> };
      const emiNameMap = new Map((emiRecords || []).map((entry) => [entry.id, entry.name]));

      const items: TodayItem[] = [];

      // Add reminders
      reminders?.forEach(r => {
        items.push({
          id: r.id,
          title: r.title,
          type: 'reminder',
          time: r.reminder_time || undefined,
        });
      });

      // Add events
      events?.forEach(e => {
        items.push({
          id: e.id,
          title: e.title,
          type: 'event',
          time: e.start_time || undefined,
        });
      });

      // Add bills
      bills?.forEach(b => {
        const isOverdue = isBefore(new Date(b.due_date), todayStart);
        items.push({
          id: b.id,
          title: b.name,
          type: 'bill',
          amount: b.amount,
          isOverdue,
        });
      });

      // Add EMIs
      emis?.forEach(e => {
        const isOverdue = isBefore(new Date(e.due_date), todayStart);
        const emiName = emiNameMap.get(e.emi_id) || 'EMI Payment';
        items.push({
          id: e.id,
          title: emiName,
          type: 'emi',
          amount: e.principal_component + e.interest_component,
          isOverdue,
        });
      });

      // Show notifications
      if (items.length > 0) {
        showNotifications(items);
      }
    } catch (error) {
      console.error('Error fetching today notifications:', error);
    }
  };

  const showNotifications = (items: TodayItem[]) => {
    const overdue = items.filter((i) => i.isOverdue);
    const reminders = items.filter((i) => i.type === 'reminder');
    const events = items.filter((i) => i.type === 'event');
    const bills = items.filter((i) => i.type === 'bill' && !i.isOverdue);
    const emis = items.filter((i) => i.type === 'emi' && !i.isOverdue);

    // High-priority overdue alert stays as its own toast.
    if (overdue.length > 0) {
      toast.error(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            <span>Overdue Items</span>
          </div>
          <div className="text-sm opacity-90">
            {overdue.length} overdue payment{overdue.length > 1 ? 's' : ''} need attention
          </div>
        </div>,
        { duration: 8000 },
      );
    }

    // Everything else is collapsed into a single "Today" summary toast.
    const others = reminders.length + events.length + bills.length + emis.length;
    if (others === 0) return;

    const totalDue =
      bills.reduce((s, b) => s + (b.amount || 0), 0) +
      emis.reduce((s, e) => s + (e.amount || 0), 0);

    setTimeout(() => {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Bell className="h-4 w-4" />
            <span>Today</span>
          </div>
          <div className="text-sm space-y-0.5 mt-1">
            {reminders.length > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{reminders.length} reminder{reminders.length > 1 ? 's' : ''}</span>
              </div>
            )}
            {events.length > 0 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{events.length} event{events.length > 1 ? 's' : ''}</span>
              </div>
            )}
            {bills.length > 0 && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                <span>{bills.length} bill{bills.length > 1 ? 's' : ''} due</span>
              </div>
            )}
            {emis.length > 0 && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                <span>{emis.length} EMI{emis.length > 1 ? 's' : ''} due</span>
              </div>
            )}
            {totalDue > 0 && (
              <div className="pt-1 border-t text-xs font-semibold">
                Total due today: {formatCurrency(totalDue)}
              </div>
            )}
          </div>
        </div>,
        { duration: 6000 },
      );
    }, 500);
  };
};
