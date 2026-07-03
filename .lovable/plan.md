# Life-Sync Improvement Plan (Items 1–15)

Grouped into 5 phases so each phase is independently shippable and testable. No feature removals — this is hardening and cleanup only.

---

## Phase 1 — Security & Data Access (items 4, 5, 6)

Highest priority: prevents privilege escalation and data leaks.

1. **Audit `GRANT`s on every `public.*` table** (item 4)
   - Sweep `supabase/migrations/` for `CREATE TABLE public.*` without matching `GRANT`.
   - Add a single new migration that grants `SELECT, INSERT, UPDATE, DELETE` to `authenticated` and `ALL` to `service_role` per table. `anon` only where a policy allows it.
2. **Move roles to `user_roles` + `has_role()`** (item 5)
   - New migration: `app_role` enum, `user_roles` table with grants + RLS, `SECURITY DEFINER has_role(uuid, app_role)`.
   - Replace any client-side admin check (localStorage, `profiles.role`, hardcoded email) with an RPC-backed check gating `/admin`.
3. **Harden the Vault** (item 6)
   - Confirm RLS is `user_id = auth.uid()` for all vault tables.
   - Add client-side encryption (WebCrypto AES-GCM, key derived from a user passphrase held only in memory) for secret fields; store ciphertext only.
   - Document that server/admin cannot decrypt.

## Phase 2 — Architecture & State (items 1, 2, 10, 11)

4. **Lift `useFinanceSync` out of `ProtectedRoute`** (item 1)
   - New `<FinanceSyncProvider>` mounted once under `<CurrencyProvider>`; subscribes on login, unsubscribes on logout — no re-mount on route changes.
5. **Consolidate state** (item 2)
   - Keep Zustand `financeStore` for realtime-synced entities (accounts, transactions, budgets, EMIs, bills, goals).
   - Move all one-off/server-derived reads (dashboard widgets, admin) to React Query.
   - Delete or narrow `globalStore` to UI-only state (theme flags, sheets open, etc.).
6. **Shared data hooks for dashboard** (items 10, 11)
   - Introduce `useToday()` and `useUpcoming()` React Query hooks used by both `TodayNotifications` and `UpcomingEvents`.
   - Replace JS-side EMI name join with a Postgres view `v_emi_payments_named` (or embedded resource `emis(name)` in the select) — remove the N+1 `Map` lookups.

## Phase 3 — UX Fixes (items 7, 8, 9)

7. **Collapse today-notification spam** (item 7)
   - Replace the 5 staggered toasts with a single "Today" summary card on the dashboard (counts + expandable list) and one toast only when there are overdue items.
   - Add a bell icon in the header opening a notification sheet with the full breakdown.
8. **Fix `/more` route** (item 8)
   - Convert `MoreMenuSheet` back to an overlay triggered from the bottom nav; remove the `/more` route entry.
   - On desktop, hide the trigger (already covered by sidebar).
9. **Empty & error states** (item 9)
   - Add a shared `<EmptyState>` component and use it on Accounts, Budgets, EMIs, Bills, Goals, Habits, Notes, Reminders, Calendar when the list is empty.
   - Replace ad-hoc "Loading..." text with `SkeletonCard` variants.

## Phase 4 — Ops & Build (items 12, 13, 14, 15)

10. **Runtime config for Supabase env** (item 12)
    - Keep `VITE_SUPABASE_*` for web, but read from `window.__ENV` at boot with a fallback, so a single build artifact can be reused across environments (helps Play Store + preview).
    - Document a `.env.production` template.
11. **PWA service worker** (item 13)
    - Replace hand-written `public/sw.js` with `vite-plugin-pwa` (Workbox) — automatic precache manifest, cache-busting on new deploys, offline fallback.
12. **Align Android package id** (item 14)
    - Pick `com.lifesync.app` (matches `MainActivity.java`) as canonical; update README, `capacitor.config.ts` appId, and any Gradle references.
13. **CI workflow** (item 15)
    - Add `.github/workflows/ci.yml`: `bun install`, `bun run lint`, `tsgo --noEmit`, `bun run build` on push + PR to `main`.

## Phase 5 — Docs (item 16 bonus, small)

14. **README refresh**
    - Add "Bootstrap from scratch" section covering `scripts/reset-and-seed-supabase.mjs`.
    - Note that this project is developed on Lovable and syncs to GitHub; Lovable Cloud is the recommended backend path for new forks.

---

## Technical details

**Migration ordering** (Phase 1) must be: (a) grants sweep, (b) `user_roles` + `has_role`, (c) any policy rewrites that call `has_role`. Each in its own timestamped file so rollbacks are surgical.

**FinanceSyncProvider signature**
```ts
// src/hooks/FinanceSyncProvider.tsx
export function FinanceSyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  useFinanceSync(user?.id);        // existing hook, unchanged
  return <>{children}</>;
}
```
Mount it above `<BrowserRouter>` in `App.tsx`; strip the call from `ProtectedRoute`.

**EMI name join** — prefer PostgREST embedded resource:
```ts
supabase.from('emi_payments')
  .select('id, due_date, principal_component, interest_component, emis(name)')
```
Removes the second round-trip and the `Map`.

**Notification card contract**
```ts
type TodaySummary = {
  overdue: number;
  reminders: Item[];
  events: Item[];
  bills: Item[];
  emis: Item[];
  totalAmount: number;
};
```
Single query returning this shape via a Postgres RPC `get_today_summary(p_user uuid)`.

**Vault encryption** — WebCrypto only, no new deps:
```
key = PBKDF2(passphrase, salt=user.id, 250k iters, SHA-256) → AES-GCM 256
ciphertext = iv(12B) || ct
```
Passphrase never leaves the browser; store `salt` (= user id) and `iv` alongside ciphertext.

**vite-plugin-pwa config** — `registerType: 'autoUpdate'`, `workbox.globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']`, manifest sourced from existing `public/manifest.json`.

---

## Out of scope
- No new features.
- No visual redesign.
- No changes to Capacitor Android signing flow beyond the package-id alignment.

## Rollout order
Phase 1 → 2 → 3 → 4 → 5. Each phase ends with `bun run build` + a manual smoke pass on Dashboard, Accounts, Add Transaction, Admin.
