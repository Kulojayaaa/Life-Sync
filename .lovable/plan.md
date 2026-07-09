Here are the issues I've spotted while reviewing the current state of the app, grouped by priority. Approve any subset and I'll implement.

## High priority — correctness & security

1. **Hardcoded Supabase URL/key in `vite.config.ts`**
   The public backend URL and publishable key are literal strings in the repo. This works but leaks project identifiers into git and makes rotating keys painful. Fix: read only from env (`.env` locally, injected in Lovable Cloud builds) and fail fast if missing — no fallbacks.

2. **Two Supabase clients coexist** (`src/integrations/supabase/client.ts` typed, `src/lib/supabaseClient.ts` untyped `any`)
   Half the codebase imports the typed one, half the loose one. This defeats the regenerated `types.ts`. Fix: delete `src/lib/supabaseClient.ts`, migrate all imports to `@/integrations/supabase/client`, drop the shim + tsconfig path override.

3. **Type shim still active** (`src/integrations/supabase/types.shim.ts` + tsconfig `paths`)
   `types.ts` was regenerated after Cloud provisioning, but the shim override is still in place, so the whole app is effectively untyped against the DB. Removing it will surface real column/table mismatches we should fix.

4. **`throw` at module load in `supabaseClient.ts`**
   Any missing env crashes the entire bundle to a blank page (that's what caused the earlier prod outage). After consolidating to one client, surface a friendly error screen instead.

## Medium priority — UX & architecture

5. **`Planner.tsx` and `Insights.tsx` are one-line wrappers around `Expenses.tsx`**
   The 19-phase plan called for splitting `Expenses.tsx` into modular pages. Right now most routes still render the monolith with a different tab. Proposal: extract `Transactions`, `Budgets`, `Analytics`, `Planner` into standalone pages sharing hooks, and shrink `Expenses.tsx` to a redirect.

6. **Zustand `financeStore` + React Query overlap**
   Some hooks (`useAccounts`, `useTransactions`, `useBills`) fetch independently while `financeStore.refresh()` re-fetches everything on realtime events. This double-fetches and can show stale data. Pick one source of truth per entity (recommend React Query + realtime invalidation, retire the Zustand cache slices).

7. **`useFinanceSync` debounce refreshes everything on any table change**
   A single transaction insert refetches accounts, categories, budgets, EMIs, goals, bills… Fix: invalidate only the affected query keys.

8. **Offline queue has no UI**
   `offlineFinance.ts` queues transactions but there's no indicator of pending items or a manual "retry sync" affordance. Add a small badge in the header.

## Low priority — polish

9. **`sw.js` is a hand-rolled service worker** while `vite-plugin-pwa` is listed as a goal. Migrate for proper precache + update prompts.
10. **`public/manifest.json`** still has generic icons/name mismatch with "LifeSync" branding.
11. **`AppLayout` gates on `useAuth` but every page also re-checks** — centralize once.
12. **No error boundary around routes** beyond the top-level `ErrorBoundary`; a bad page currently blanks the whole app.

## Suggested implementation order

1. Consolidate Supabase clients + remove shim (items 2, 3, 4) — biggest safety win, unblocks real typing.
2. Clean `vite.config.ts` env handling (item 1).
3. Split `Expenses.tsx` per the original plan (item 5).
4. Retire duplicate state (items 6, 7).
5. Polish (8–12).

Tell me which of these to tackle and I'll switch to build mode.
