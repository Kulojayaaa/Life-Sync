import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listAccountsTool from "./tools/list-accounts";
import listTransactionsTool from "./tools/list-transactions";
import createTransactionTool from "./tools/create-transaction";
import spendingSummaryTool from "./tools/spending-summary";
import listBillsTool from "./tools/list-bills";
import listGoalsTool from "./tools/list-goals";

// The OAuth issuer must be the direct Supabase host, built from the project ref
// (inlined by Vite at build time) — never from SUPABASE_URL, which may be a proxy.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "budget-buddy",
  title: "Budget Buddy",
  version: "0.1.0",
  instructions:
    "Tools for the LifeSync personal finance app. Use list_accounts to find account IDs, list_transactions and spending_summary to review money movement, create_transaction to record income or expenses, and list_bills / list_goals for upcoming bills and goal progress. All data is scoped to the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listAccountsTool,
    listTransactionsTool,
    createTransactionTool,
    spendingSummaryTool,
    listBillsTool,
    listGoalsTool,
  ],
});
