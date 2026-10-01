# LifeSync Product and Technical Audit

## Decision

Keep one React codebase for the web and Android app through Capacitor. The Android package is a native Android container with a web UI, not a separate Kotlin/Jetpack Compose application. For this personal tracker, one shared codebase is the practical choice: changes ship consistently and maintenance is much lower. Build a separate Compose client only if background services, widgets, health integrations, or fully native offline storage become core requirements.

The current logo is suitable: its rounded, simple mark works at launcher size and fits the purple LifeSync interface. A replacement is not justified until the product name and public launch branding are finalized.

## Critical issues found and corrected

| Area | Finding | Resolution |
| --- | --- | --- |
| Installation | `jspdf@4` conflicted with `jspdf-autotable`, so a clean install failed | Pinned jsPDF to a compatible major and regenerated the lockfile |
| Supabase setup | `.env.example` documented a key name the client did not read | Standardized on `VITE_SUPABASE_PUBLISHABLE_KEY` and added a clear configuration error |
| Authorization | `/admin` was protected only by login at the router level | Added an admin-role route guard; database RLS remains the final authority |
| Vault security | The encryption key was saved in `localStorage` beside the login session | Key is now memory-only and cleared when the app closes or the user changes |
| Transfers | Quick Add could submit a transfer without a valid destination | Added amount and destination validation |
| Android privacy | Android backups were enabled for a finance and password app | Disabled application backup |
| Offline shell | JavaScript and CSS were network-only, undermining offline startup | Added cache-first handling for versioned app assets |
| Tooling | Web ESLint incorrectly linted the Deno Edge Function | Separated the lint scope |

## Product and UX findings

The strongest part is the one-tap transaction sheet and mobile bottom navigation. The main weakness is feature overload: accounts, transactions, budgets, EMI, debt, planner, products, bills, habits, goals, notes, reminders, calendar, vault, and admin compete at the same level.

Recommended daily-use structure:

1. **Today** — balance, today’s spend, next bill/reminder, habits, and one primary Add button.
2. **Money** — transactions, accounts, budgets, bills, EMI/debt, goals, and reports.
3. **Plan** — calendar, reminders, habits, goals, and notes.
4. **More** — products, vault, exports, profile, and settings.

Keep setup-heavy modules hidden until the user enables them. A first-run checklist should ask for currency, one account, monthly income, and optional budget. Empty pages should always offer one clear next action.

## Backend readiness

- Apply every migration in filename order to a new Supabase project, then regenerate `src/integrations/supabase/types.ts` from that exact database.
- Never place the service-role key in a `VITE_*` variable or Android bundle.
- Verify RLS with two ordinary test users for every table and storage bucket.
- Move multi-row financial operations (transfers, EMI payment plus ledger entry, savings adjustments) into database functions so each operation is atomic.
- Add an idempotency key to offline-created transactions to prevent duplicates after reconnect/retry.
- The offline cache currently stores finance snapshots unencrypted in browser storage. Treat offline mode as convenience, not secure storage, until native encrypted storage is added.

## Remaining priority work

### Before real financial use

- Add automated tests for transfers, account balance recalculation, EMI posting, deletion rollback, budget usage, and offline replay.
- Add a migration smoke test in CI and a clean database setup script that does not seed sample data.
- Add pagination/date-range queries; transaction and report pages should not download a user’s complete history.
- Add duplicate detection and import preview for bank CSV/Excel uploads.
- Replace browser notifications with Capacitor local notifications on Android and persist scheduled notification identifiers.
- Add biometric unlock backed by Android Keystore before marketing the Vault as a password manager.

### Daily-use improvements

- Remember the last-used account and payment mode locally.
- Put recent categories directly below the amount field for one-tap selection.
- Add recurring transactions and templates such as rent, salary, fuel, and groceries.
- Add search and filters across transactions, notes, bills, and reminders.
- Add a month-close screen: income, spending, savings, debt movement, unusual items, and carry-forward.
- Add optional receipt attachment with compression and private Supabase Storage policies.

### Release readiness

- Configure Supabase email redirects for web and the Android deep-link scheme.
- Create separate development and production Supabase projects.
- Add Play signing, privacy policy, data deletion instructions, crash reporting consent, and release versioning.
- Remove or configure missing social preview references before public deployment.
- Test small Android phones, large-font accessibility, screen readers, slow networks, airplane mode, and timezone boundaries.

## Verification status

- Clean dependency installation: passed after dependency correction.
- Production web build: should be run with a real or test Supabase URL and publishable key.
- ESLint: no blocking errors; existing warnings remain, mainly legacy `any` types and hook dependency warnings.
- Android source is present and synchronized through Capacitor; a signed APK still requires the owner’s Android signing keystore.
