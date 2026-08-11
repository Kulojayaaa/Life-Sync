import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";
import { fail, ok, requireAuth } from "../result";

export default defineTool({
  name: "list_accounts",
  title: "List accounts",
  description:
    "List the signed-in user's money accounts (name, type and current balance).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const unauthed = requireAuth(ctx);
    if (unauthed) return unauthed;

    const { data, error } = await supabaseForUser(ctx)
      .from("accounts")
      .select("id, name, type, current_balance, balance, is_active")
      .order("name", { ascending: true });

    if (error) return fail(error.message);
    return ok({
      accounts: (data ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.current_balance ?? a.balance ?? 0,
        is_active: a.is_active,
      })),
    });
  },
});
