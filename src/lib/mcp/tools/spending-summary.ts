import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { fail, ok, requireAuth } from "../result";

export default defineTool({
  name: "spending_summary",
  title: "Spending summary",
  description:
    "Summarise the signed-in user's income, expenses and per-category spending for a month (YYYY-MM).",
  inputSchema: {
    month: z
      .string()
      .optional()
      .describe("Month as YYYY-MM. Defaults to the current month."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ month }, ctx) => {
    const unauthed = requireAuth(ctx);
    if (unauthed) return unauthed;

    const target = /^\d{4}-\d{2}$/.test(month ?? "")
      ? (month as string)
      : new Date().toISOString().slice(0, 7);
    const [year, mon] = target.split("-").map(Number);
    const start = `${target}-01`;
    const end = new Date(Date.UTC(year, mon, 0)).toISOString().slice(0, 10);

    const { data, error } = await supabaseForUser(ctx)
      .from("transactions")
      .select("type, amount, category")
      .gte("transaction_date", start)
      .lte("transaction_date", end);

    if (error) return fail(error.message);

    let income = 0;
    let expense = 0;
    const byCategory: Record<string, number> = {};
    for (const row of data ?? []) {
      const amount = Number(row.amount) || 0;
      if (row.type === "income") income += amount;
      else if (row.type === "expense") {
        expense += amount;
        byCategory[row.category] = (byCategory[row.category] ?? 0) + amount;
      }
    }

    const categories = Object.entries(byCategory)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    return ok({
      month: target,
      income,
      expense,
      net: income - expense,
      transaction_count: data?.length ?? 0,
      top_categories: categories.slice(0, 10),
    });
  },
});
