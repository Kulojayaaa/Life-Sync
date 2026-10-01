import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function loadEnvFile() {
  const text = readFileSync('.env', 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=["']?(.*?)["']?$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

loadEnvFile();

const email = process.env.SAMPLE_USER_EMAIL;
const password = process.env.SAMPLE_USER_PASSWORD;
const vaultKey = process.env.SAMPLE_VAULT_KEY || 'LifeSyncDemoVault2026';
const url = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!email || !password || !url || !publishableKey) {
  throw new Error('Missing demo credentials or Supabase public configuration.');
}

const client = createClient(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: auth, error: authError } = await client.auth.signInWithPassword({ email, password });
if (authError || !auth.user) throw authError || new Error('Demo sign-in returned no user.');

const tables = [
  'profiles', 'categories', 'accounts', 'transactions', 'budgets', 'emis',
  'emi_payments', 'savings_goals', 'goal_contributions', 'bills',
  'bill_payment_history', 'product_usage', 'product_purchase_history', 'habits',
  'habit_logs', 'goals', 'goal_updates', 'goal_milestones', 'notes', 'reminders',
  'calendar_events', 'debt_tracker', 'monthly_plan', 'passwords',
];

const checks = [];
for (const table of tables) {
  const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
  checks.push({ table, count: count ?? 0, ok: !error && (count ?? 0) > 0, error: error?.message });
}

const { data: vaultEntries, error: vaultError } = await client.rpc('list_passwords', { vault_key: vaultKey });
const failed = checks.filter((check) => !check.ok);

console.log(JSON.stringify({
  authenticated: true,
  userId: auth.user.id,
  checks,
  vaultRpc: { ok: !vaultError && (vaultEntries?.length ?? 0) > 0, count: vaultEntries?.length ?? 0, error: vaultError?.message },
  passed: failed.length === 0 && !vaultError && (vaultEntries?.length ?? 0) > 0,
}, null, 2));

await client.auth.signOut();
if (failed.length || vaultError || !(vaultEntries?.length ?? 0)) process.exitCode = 1;
