# LifeSync

Production-ready personal finance + life-tracker app built with Vite, React, TypeScript, Zustand, Supabase, PWA support, and Capacitor Android. Developed on [Lovable](https://lovable.dev) with two-way GitHub sync — Lovable Cloud is the recommended backend for new forks.

## Features

- Supabase Auth with email/password and email magic-link login
- Protected routes and persisted sessions
- Accounts, categories, transactions, budgets, EMIs, bills, and savings goals
- Two-row transfer ledger entries, account balance recalculation, EMI schedules, budget usage, and savings goal contributions
- Supabase realtime sync for finance tables
- PWA manifest and service worker
- Capacitor Android project with internet permission, app icon, and splash assets

## Web Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

3. Start the app:

   ```sh
   npm run dev
   ```

4. Build for production:

   ```sh
   npm run build
   ```

## Supabase Setup

Apply the clean baseline migration in `supabase/migrations/`. Historical migrations are retained in `supabase/migrations_legacy/` for reference and must not be applied to a fresh project. With the Supabase CLI:

```sh
supabase link --project-ref <your-project-ref>
supabase db push
```

Then reload the PostgREST schema cache:

```sql
SELECT pg_notify('pgrst', 'reload schema');
```

The finance schema includes RLS policies scoped by `user_id = auth.uid()`, realtime coverage for ledger tables, balance recalculation triggers, EMI schedule support, and compatibility columns requested for production finance tracking.

## Vercel Deployment

The included `vercel.json` configures the Vite build, SPA route fallback, service-worker cache behavior, and production security headers.

1. Import the Git repository into Vercel.
2. Add these environment variables for Production, Preview, and Development:

   ```env
   VITE_SUPABASE_PROJECT_ID=your-project-ref
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   VITE_APP_URL=https://your-project.vercel.app
   ```

3. Deploy using the detected Vite settings, or run `vercel --prod` locally.
4. Add the final Vercel URL to Supabase Authentication URL Configuration as the Site URL.
5. Add both callback patterns to the allowed redirect URLs:

   ```text
   http://127.0.0.1:8080/auth/callback
   https://your-project.vercel.app/auth/callback
   ```

Email confirmations and magic links now open `/auth/callback`, which displays an explicit success or failure message before continuing into LifeSync.

## Android Setup

Capacitor is already initialized with:

- App ID: `com.lifesync.app`
- App name: `LifeSync`
- Web directory: `dist`

Useful commands:

```sh
npm run build
npx cap sync android
npx cap open android
```

This repo also includes npm shortcuts:

```sh
npm run android:sync
npm run android:open
```

If Gradle cannot find the Android SDK, create `android/local.properties`:

```properties
sdk.dir=C\:\\Users\\<you>\\AppData\\Local\\Android\\Sdk
```

## Release APK

Release build:

```sh
cd android
.\gradlew.bat assembleRelease
```

When signing is configured, the signed APK is written to:

```text
android/app/build/outputs/apk/release/app-release.apk
```

For a signed APK, create a keystore in Android Studio or with `keytool`, then copy `android/keystore.properties.example` to `android/keystore.properties` and fill in the keystore path/passwords. After that:

```sh
cd android
.\gradlew.bat assembleRelease
```

Android Studio path: **Build -> Generate Signed Bundle / APK**.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production web build |
| `npm run typecheck` | TypeScript validation |
| `npm run verify` | Type check, lint, and production build |
| `npm run lint` | ESLint checks |
| `npm run android:sync` | Build web and sync Android assets |
| `npm run android:release` | Sync and assemble the signed Android release |
| `npm run android:open` | Open Android Studio project |
