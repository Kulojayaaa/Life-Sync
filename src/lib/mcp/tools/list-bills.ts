import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { fail, ok, requireAuth } from "../result";

export default defineTool({
  name: "list_bills",
  title: "List bills",
  description:
    "List the signed-in user's bills and subscriptions with amounts, due dates and paid status.",
  inputSchema: {
    unpaid_only: z
      .boolean()
      .optional()
      .describe("When true, return only bills that are not marked paid."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ unpaid_only }, ctx) => {
    const unauthed = requireAuth(ctx);
    if (unauthed) return unauthed;

    let query = supabaseForUser(ctx)
      .from("bills")
      .select("id, name, provider, amount, due_date, billing_cycle, is_paid, status")
      .order("due_date", { ascending: true });
    if (unpaid_only) query = query.eq("is_paid", false);

    const { data, error } = await query;
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, bills: data ?? [] });
  },
});
