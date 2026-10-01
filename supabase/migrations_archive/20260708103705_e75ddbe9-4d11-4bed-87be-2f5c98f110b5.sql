
-- Revoke default PUBLIC execute on all SECURITY DEFINER functions, then grant narrowly.

REVOKE ALL ON FUNCTION public.refresh_account_current_balance_from_transaction() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_account_current_balance(uuid) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.list_passwords(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_password(text, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_password(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_all_users() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.list_passwords(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_password(text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_password(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
