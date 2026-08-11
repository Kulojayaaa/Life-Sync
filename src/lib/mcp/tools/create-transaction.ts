import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { fail, ok, requireAuth } from "../result";

export default defineTool({
  name: "create_transaction",
  title: "Record a transaction",
  description:
    "Record an income or expense transaction for the signed-in user. Use list_accounts first to pick an account.",
  inputSchema: {
    account_id: z.string().describe("Account UUID from list_accounts."),
    type: z.enum(["income", "expense"]).describe("Whether money came in or went out."),
    amount: z.number().positive().describe("Positive amount in the user's currency."),
    category: z.string().describe("Category name, e.g. Groceries or Salary."),
    description: z.string().optional().describe("Short note about the transaction."),
    transaction_date: z
      .string()
      .optional()
      .describe("Date as YYYY-MM-DD. Defaults to today."),
    payment_mode: z.string().optional().describe("How it was paid, e.g. UPI, Cash, Card."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const unauthed = requireAuth(ctx);
    if (unauthed) return unauthed;

    const userId = ctx.getUserId();
    if (!userId) return fail("Could not resolve the signed-in user.");

    const { data, error } = await supabaseForUser(ctx)
      .from("transactions")
      .insert({
        user_id: userId,
        account_id: input.account_id,
        type: input.type,
        amount: input.amount,
        category: input.category,
        description: input.description ?? null,
        payment_mode: input.payment_mode ?? null,
        transaction_date: input.transaction_date ?? new Date().toISOString().slice(0, 10),
        source_module: "mcp",
      })
      .select("id, transaction_date, type, amount, category, description")
      .single();

    if (error) return fail(error.message);
    return ok({ transaction: data });
  },
});
