
REVOKE EXECUTE ON FUNCTION public.recalculate_account_current_balance(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_account_current_balance_from_transaction() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- get_all_users: restrict to service_role; admin UI should call via a secured path.
REVOKE EXECUTE ON FUNCTION public.get_all_users() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO service_role;

-- has_role remains executable by authenticated because it is referenced by RLS policies.
