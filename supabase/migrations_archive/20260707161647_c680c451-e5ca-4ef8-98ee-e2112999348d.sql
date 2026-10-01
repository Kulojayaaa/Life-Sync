CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT, avatar_url TEXT, phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TYPE public.habit_category AS ENUM ('health', 'self_care', 'self_love', 'attitude', 'learning', 'fitness', 'mindfulness', 'productivity', 'social', 'other');

CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, description TEXT,
  category habit_category DEFAULT 'other',
  frequency TEXT DEFAULT 'daily',
  target_count INTEGER,
  color TEXT DEFAULT '#8B5CF6', icon TEXT DEFAULT '🎯',
  is_active BOOLEAN DEFAULT true,
  start_date date, end_date date,
  skip_weekends boolean DEFAULT false, skip_holidays boolean DEFAULT false,
  custom_skip_days text[] DEFAULT '{}', goal text,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at DATE DEFAULT CURRENT_DATE NOT NULL,
  count INTEGER DEFAULT 1, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(habit_id, completed_at)
);

CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, type TEXT NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0,
  initial_balance numeric NOT NULL DEFAULT 0 CHECK (initial_balance >= 0),
  opening_balance numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#10B981', icon TEXT DEFAULT '💳',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT '📁', color TEXT DEFAULT '#8B5CF6',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name, type)
);

CREATE TYPE public.transaction_type AS ENUM ('credit', 'debit', 'transfer');

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  transfer_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  description TEXT, payment_mode TEXT,
  source_module TEXT NOT NULL DEFAULT 'manual',
  reference_type TEXT NOT NULL DEFAULT 'manual' CHECK (reference_type IN ('manual','emi','goal','transfer')),
  reference_id UUID,
  spending_type TEXT CHECK (spending_type IS NULL OR spending_type IN ('self','family')),
  transaction_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT transactions_transfer_target_check CHECK ((type = 'transfer' AND to_account_id IS NOT NULL AND to_account_id <> account_id) OR (type <> 'transfer' AND to_account_id IS NULL))
);

CREATE INDEX transactions_user_date_idx ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX transactions_account_idx ON public.transactions(account_id);
CREATE INDEX transactions_category_idx ON public.transactions(category_id);
CREATE INDEX transactions_reference_idx ON public.transactions(reference_type, reference_id);

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  monthly_limit numeric NOT NULL DEFAULT 0,
  limit_amount numeric NOT NULL DEFAULT 0,
  planned_amount numeric NOT NULL DEFAULT 0,
  month INTEGER NOT NULL, year INTEGER NOT NULL,
  month_key TEXT,
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly','yearly')),
  type TEXT NOT NULL DEFAULT 'self' CHECK (type IN ('self','family')),
  carry_forward BOOLEAN NOT NULL DEFAULT false,
  rollover_amount numeric NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#F59E0B',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, category, month, year)
);
CREATE UNIQUE INDEX budgets_user_category_type_period_idx ON public.budgets(user_id, category_id, type, month, year, period);

CREATE TABLE public.emis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id),
  name TEXT NOT NULL,
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  total_months INTEGER NOT NULL,
  tenure INTEGER, tenure_months INTEGER,
  total_amount numeric, interest numeric,
  emi_amount DECIMAL(12,2) NOT NULL,
  monthly_amount numeric,
  start_date DATE NOT NULL,
  due_day INTEGER NOT NULL,
  due_date DATE, next_due_date DATE,
  remaining_balance numeric NOT NULL DEFAULT 0,
  auto_create_transaction BOOLEAN NOT NULL DEFAULT true,
  notes TEXT, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.emi_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emi_id UUID REFERENCES public.emis(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  month_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE, is_paid BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
  principal_component DECIMAL(12,2) NOT NULL,
  interest_component DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(emi_id, month_number)
);

CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id),
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12,2) DEFAULT 0,
  progress_amount numeric NOT NULL DEFAULT 0,
  deadline DATE,
  color TEXT DEFAULT '#EC4899', icon TEXT DEFAULT '🎯',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.savings_goals(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX goal_contributions_goal_idx ON public.goal_contributions(goal_id);

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, content TEXT,
  note_date DATE DEFAULT CURRENT_DATE NOT NULL,
  tags TEXT[], color TEXT DEFAULT '#6366F1',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX notes_user_id_idx ON public.notes(user_id);

CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT,
  reminder_date DATE NOT NULL, reminder_time TIME,
  type TEXT DEFAULT 'general',
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  is_completed BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#F97316',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX reminders_user_id_idx ON public.reminders(user_id);

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT DEFAULT 'general',
  color TEXT DEFAULT '#8B5CF6',
  all_day BOOLEAN DEFAULT true,
  start_time TIME, end_time TIME,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT,
  category TEXT DEFAULT 'personal',
  target_date DATE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#8B5CF6', icon TEXT DEFAULT '🎯',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.goal_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT NOT NULL,
  progress_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.product_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'groceries',
  last_purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity NUMERIC, unit TEXT, cost NUMERIC,
  estimated_days INTEGER, actual_days INTEGER,
  notes TEXT, icon TEXT DEFAULT '📦', color TEXT DEFAULT '#10B981',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_usage(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity NUMERIC, unit TEXT, cost NUMERIC, days_lasted INTEGER, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, provider TEXT,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  is_recurring BOOLEAN DEFAULT true,
  recurring BOOLEAN NOT NULL DEFAULT false,
  reminder_days_before INTEGER DEFAULT 3,
  last_paid_date DATE,
  is_paid BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
  notes TEXT, icon TEXT DEFAULT '📄', color TEXT DEFAULT '#F59E0B',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.bill_payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  paid_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, username TEXT,
  password_value TEXT, password_ciphertext BYTEA,
  url TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE TABLE public.debt_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  borrowed_amount NUMERIC NOT NULL DEFAULT 0,
  closing_balance NUMERIC NOT NULL DEFAULT 0,
  auto_paid NUMERIC NOT NULL DEFAULT 0,
  manual_paid NUMERIC NOT NULL DEFAULT 0,
  auto_borrowed NUMERIC NOT NULL DEFAULT 0,
  manual_borrowed NUMERIC NOT NULL DEFAULT 0,
  opening_balance_mode TEXT NOT NULL DEFAULT 'auto' CHECK (opening_balance_mode IN ('auto','manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);
CREATE INDEX debt_tracker_user_month_desc_idx ON public.debt_tracker(user_id, month DESC);

CREATE TABLE public.monthly_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  total_income NUMERIC NOT NULL DEFAULT 0,
  allocated_self NUMERIC NOT NULL DEFAULT 0,
  allocated_family NUMERIC NOT NULL DEFAULT 0,
  allocated_debt NUMERIC NOT NULL DEFAULT 0,
  remaining_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emi_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_plan ENABLE ROW LEVEL SECURITY;

-- Standard "own row" policies
CREATE POLICY "own_select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "own_all" ON public.habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.habit_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.accounts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.categories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.emis FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.emi_payments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.savings_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.goal_contributions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.calendar_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.goal_updates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.goal_milestones FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.product_usage FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.product_purchase_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.bills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.bill_payment_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.passwords FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.debt_tracker FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_all" ON public.monthly_plan FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "read_own_roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Common trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER upd_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.emis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.product_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.passwords FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.debt_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER upd_at BEFORE UPDATE ON public.monthly_plan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- has_role helper (secure)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "admin_view_profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (id UUID, email TEXT, created_at TIMESTAMPTZ, last_sign_in_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT au.id, au.email, au.created_at, au.last_sign_in_at FROM auth.users au
  WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
$$;

-- Password vault RPCs
CREATE OR REPLACE FUNCTION public.list_passwords(vault_key TEXT)
RETURNS TABLE (id UUID, title TEXT, username TEXT, password_value TEXT, url TEXT, notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE SQL SECURITY INVOKER SET search_path = public AS $$
  SELECT p.id, p.title, p.username,
    CASE WHEN p.password_ciphertext IS NOT NULL THEN extensions.pgp_sym_decrypt(p.password_ciphertext, vault_key) ELSE p.password_value END,
    p.url, p.notes, p.created_at, p.updated_at
  FROM public.passwords p WHERE p.user_id = auth.uid() ORDER BY p.title;
$$;

CREATE OR REPLACE FUNCTION public.save_password(vault_key TEXT, entry_title TEXT, entry_username TEXT, entry_password TEXT, entry_url TEXT, entry_notes TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE new_id UUID;
BEGIN
  INSERT INTO public.passwords (user_id, title, username, password_value, password_ciphertext, url, notes)
  VALUES (auth.uid(), entry_title, NULLIF(entry_username,''), '[encrypted]', extensions.pgp_sym_encrypt(entry_password, vault_key), NULLIF(entry_url,''), NULLIF(entry_notes,''))
  RETURNING id INTO new_id;
  RETURN new_id;
END; $$;

CREATE OR REPLACE FUNCTION public.delete_password(entry_id UUID)
RETURNS VOID LANGUAGE SQL SECURITY INVOKER SET search_path = public AS $$
  DELETE FROM public.passwords WHERE id = entry_id AND user_id = auth.uid();
$$;

-- Account balance recalc
CREATE OR REPLACE FUNCTION public.recalculate_account_current_balance(target_account_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.accounts a
  SET current_balance = COALESCE(a.initial_balance, a.opening_balance, a.balance, 0)
    + COALESCE((SELECT SUM(CASE
        WHEN tx.account_id = a.id AND tx.type = 'credit' THEN tx.amount
        WHEN tx.account_id = a.id AND tx.type = 'debit' THEN -tx.amount
        WHEN tx.account_id = a.id AND tx.type = 'transfer' THEN -tx.amount
        WHEN tx.to_account_id = a.id AND tx.type = 'transfer' THEN tx.amount
        ELSE 0 END)
      FROM public.transactions tx WHERE tx.account_id = a.id OR tx.to_account_id = a.id), 0)
  WHERE a.id = target_account_id;
END; $$;

CREATE OR REPLACE FUNCTION public.refresh_account_current_balance_from_transaction()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    PERFORM public.recalculate_account_current_balance(OLD.account_id);
    IF OLD.to_account_id IS NOT NULL THEN PERFORM public.recalculate_account_current_balance(OLD.to_account_id); END IF;
  END IF;
  IF TG_OP IN ('INSERT','UPDATE') THEN
    PERFORM public.recalculate_account_current_balance(NEW.account_id);
    IF NEW.to_account_id IS NOT NULL THEN PERFORM public.recalculate_account_current_balance(NEW.to_account_id); END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER transactions_refresh_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.refresh_account_current_balance_from_transaction();

-- Blanket GRANTs
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', r.tablename);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', r.tablename);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';