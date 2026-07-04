## Enable Lovable Cloud to fix the blank page

The published/preview site fails at load with `Missing VITE_SUPABASE_URL and Supabase anon/publishable key` because Lovable Cloud isn't connected — Supabase URL/key are never injected, and `supabaseClient.ts` throws before React mounts.

### Steps

1. **Enable Lovable Cloud** via `supabase--enable`. This provisions Supabase, injects `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, and regenerates `src/integrations/supabase/types.ts` from the real schema.
2. **Verify the preview loads** (root URL renders, no console error).
3. **Remove the type shim workaround** once the generated `types.ts` is current:
   - Delete `src/integrations/supabase/types.shim.ts`
   - Drop the `@/integrations/supabase/types` `paths` override from `tsconfig.json` and `tsconfig.app.json`
   - Restore proper typing in `src/lib/supabaseClient.ts` (`createClient<Database>(...)`) and `src/integrations/supabase/client.ts` (drop `as any`)
   - Remove the per-file `as any` casts in `AddEventDialog.tsx`, `QuickActions.tsx`, `TodayNotifications.tsx`, `UpcomingEvents.tsx`
4. **Run typecheck**; fix any residual type mismatches now that real types are back.
5. **Re-publish**.

### Notes

- No schema changes in this step — Cloud enable + type re-sync only.
- If typecheck surfaces genuine schema drift (columns the code assumes but migrations don't have), I'll flag them for a follow-up migration rather than silently loosening types again.
