// The generated Database types (src/integrations/supabase/types.ts) are
// out of sync with the actual schema — several tables and columns are missing
// until Lovable Cloud is connected and types can be regenerated. To keep the
// app compiling in the meantime, we re-export the client with a loose type.
// Once types are regenerated, remove the `as any` cast to restore full typing.
import { supabase as typedSupabase } from '@/lib/supabaseClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = typedSupabase;
