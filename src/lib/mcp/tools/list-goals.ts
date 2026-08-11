import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { fail, ok, requireAuth } from "../result";

export default defineTool({
  name: "list_goals",
  title: "List goals",
  description: "List the signed-in user's goals with progress and target dates.",
  inputSchema: {
    include_completed: z
      .boolean()
      .optional()
      .describe("When true, also return goals already completed."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ include_completed }, ctx) => {
    const unauthed = requireAuth(ctx);
    if (unauthed) return unauthed;

    let query = supabaseForUser(ctx)
      .from("goals")
      .select("id, title, description, category, target_date, progress, is_completed")
      .order("target_date", { ascending: true });
    if (!include_completed) query = query.eq("is_completed", false);

    const { data, error } = await query;
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, goals: data ?? [] });
  },
});
