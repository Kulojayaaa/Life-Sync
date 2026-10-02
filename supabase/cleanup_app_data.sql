-- LifeSync app data cleanup
-- Run this in the Supabase SQL editor or with an admin database connection.
-- This preserves auth.users, profiles, user_roles, and storage buckets so existing login access remains intact.

DO $$
DECLARE
  table_name text;
  tables_to_clear text[] := ARRAY[
    'bill_payment_history',
    'bills',
    'product_purchase_history',
    'product_usage',
    'goal_milestones',
    'goal_updates',
    'goals',
    'calendar_events',
    'reminders',
    'notes',
    'goal_contributions',
    'savings_goals',
    'emi_payments',
    'emis',
    'budgets',
    'transactions',
    'categories',
    'accounts',
    'habit_logs',
    'habits',
    'passwords',
    'debt_tracker',
    'monthly_plan'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_clear LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', table_name);
    END IF;
  END LOOP;
END $$;
