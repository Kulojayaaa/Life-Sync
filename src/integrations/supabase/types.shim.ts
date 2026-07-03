/* Permissive shim for the auto-generated Supabase types.
 * The generated `Database` type is stale (missing tables/columns) until
 * Lovable Cloud is connected and types are regenerated. A tsconfig path
 * override redirects `@/integrations/supabase/types` to this file so the
 * whole app compiles. Remove the path override once types are current.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json = any;

type AnyRow = Record<string, any>;
type AnyTable = { Row: AnyRow; Insert: AnyRow; Update: AnyRow; Relationships: [] };
type TableMap = { [key: string]: AnyTable };

export type Database = {
  __InternalSupabase: { PostgrestVersion: string };
  public: {
    Tables: TableMap;
    Views: TableMap;
    Functions: { [key: string]: { Args: AnyRow; Returns: any } };
    Enums: { [key: string]: string };
    CompositeTypes: { [key: string]: AnyRow };
  };
};

export const Constants = {
  public: {
    Enums: {
      account_type: ['cash', 'bank', 'wallet', 'credit'],
      bill_frequency: ['daily', 'weekly', 'monthly', 'yearly'],
      emi_status: ['active', 'completed', 'defaulted'],
      spender_type: ['self', 'family'],
      transaction_type: ['income', 'expense', 'transfer'],
    },
  },
} as const;
