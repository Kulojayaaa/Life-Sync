import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { fail, ok, requireAuth } from "../result";

export default defineTool({
  name: "list_transactions",
  title: "List transactions",
  description:
    "List the signed-in user's recent transactions, optionally filtered by date range, type or category.",
  inputSchema: {
    from: z.string().optional().describe("Earliest transaction date, YYYY-MM-DD."),
    to: z.string().optional().describe("Latest transaction date, YYYY-MM-DD."),
    type: z
      .enum(["income", "expense", "transfer"])
      .optional()
      .describe("Only return transactions of this type."),
    category: z.string().optional().describe("Exact category name to filter by."),
    limit: z.number().int().optional().describe("Max rows to return (default 50, max 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, type, category, limit }, ctx) => {
    const unauthed = requireAuth(ctx);
    if (unauthed) return unauthed;

    const rows = Math.min(Math.max(limit ?? 50, 1), 200);
    let query = supabaseForUser(ctx)
      .from("transactions")
      .select(
        "id, transaction_date, type, amount, category, description, payment_mode, account_id",
      )
      .order("transaction_date", { ascending: false })
      .limit(rows);

    if (from) query = query.gte("transaction_date", from);
    if (to) query = query.lte("transaction_date", to);
    if (type) query = query.eq("type", type);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, transactions: data ?? [] });
  },
});
