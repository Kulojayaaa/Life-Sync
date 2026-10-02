alter table public.transactions
  add column if not exists meal_type text check (meal_type in ('breakfast','lunch','dinner','snacks'));

create index if not exists transactions_user_date_meal_type_idx
  on public.transactions (user_id, transaction_date, meal_type)
  where meal_type is not null;

alter table public.emis
  add column if not exists affects_balance boolean not null default true;
