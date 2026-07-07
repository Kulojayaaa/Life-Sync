export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number | null
          color: string | null
          created_at: string
          current_balance: number
          icon: string | null
          id: string
          initial_balance: number
          is_active: boolean | null
          name: string
          opening_balance: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          color?: string | null
          created_at?: string
          current_balance?: number
          icon?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean | null
          name: string
          opening_balance?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          color?: string | null
          created_at?: string
          current_balance?: number
          icon?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean | null
          name?: string
          opening_balance?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bill_payment_history: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          id: string
          notes: string | null
          paid_date: string
          user_id: string
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_date?: string
          user_id: string
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_payment_history_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          billing_cycle: string
          color: string | null
          created_at: string
          due_date: string
          icon: string | null
          id: string
          is_paid: boolean | null
          is_recurring: boolean | null
          last_paid_date: string | null
          name: string
          notes: string | null
          provider: string | null
          recurring: boolean
          reminder_days_before: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string
          color?: string | null
          created_at?: string
          due_date: string
          icon?: string | null
          id?: string
          is_paid?: boolean | null
          is_recurring?: boolean | null
          last_paid_date?: string | null
          name: string
          notes?: string | null
          provider?: string | null
          recurring?: boolean
          reminder_days_before?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          color?: string | null
          created_at?: string
          due_date?: string
          icon?: string | null
          id?: string
          is_paid?: boolean | null
          is_recurring?: boolean | null
          last_paid_date?: string | null
          name?: string
          notes?: string | null
          provider?: string | null
          recurring?: boolean
          reminder_days_before?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          carry_forward: boolean
          category: string
          category_id: string | null
          color: string | null
          created_at: string
          id: string
          limit_amount: number
          month: number
          month_key: string | null
          monthly_limit: number
          period: string
          planned_amount: number
          rollover_amount: number
          type: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          carry_forward?: boolean
          category: string
          category_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          limit_amount?: number
          month: number
          month_key?: string | null
          monthly_limit?: number
          period?: string
          planned_amount?: number
          rollover_amount?: number
          type?: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          amount?: number
          carry_forward?: boolean
          category?: string
          category_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          limit_amount?: number
          month?: number
          month_key?: string | null
          monthly_limit?: number
          period?: string
          planned_amount?: number
          rollover_amount?: number
          type?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string | null
          id: string
          start_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          type: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          type: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      debt_tracker: {
        Row: {
          auto_borrowed: number
          auto_paid: number
          borrowed_amount: number
          closing_balance: number
          created_at: string
          id: string
          manual_borrowed: number
          manual_paid: number
          month: string
          opening_balance: number
          opening_balance_mode: string
          paid_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_borrowed?: number
          auto_paid?: number
          borrowed_amount?: number
          closing_balance?: number
          created_at?: string
          id?: string
          manual_borrowed?: number
          manual_paid?: number
          month: string
          opening_balance?: number
          opening_balance_mode?: string
          paid_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_borrowed?: number
          auto_paid?: number
          borrowed_amount?: number
          closing_balance?: number
          created_at?: string
          id?: string
          manual_borrowed?: number
          manual_paid?: number
          month?: string
          opening_balance?: number
          opening_balance_mode?: string
          paid_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emi_payments: {
        Row: {
          created_at: string
          due_date: string
          emi_id: string
          id: string
          interest_component: number
          is_paid: boolean | null
          month_number: number
          paid_date: string | null
          principal_component: number
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date: string
          emi_id: string
          id?: string
          interest_component: number
          is_paid?: boolean | null
          month_number: number
          paid_date?: string | null
          principal_component: number
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string
          emi_id?: string
          id?: string
          interest_component?: number
          is_paid?: boolean | null
          month_number?: number
          paid_date?: string | null
          principal_component?: number
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emi_payments_emi_id_fkey"
            columns: ["emi_id"]
            isOneToOne: false
            referencedRelation: "emis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emi_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      emis: {
        Row: {
          account_id: string | null
          auto_create_transaction: boolean
          created_at: string
          due_date: string | null
          due_day: number
          emi_amount: number
          id: string
          interest: number | null
          interest_rate: number
          is_active: boolean | null
          monthly_amount: number | null
          name: string
          next_due_date: string | null
          notes: string | null
          principal_amount: number
          remaining_balance: number
          start_date: string
          tenure: number | null
          tenure_months: number | null
          total_amount: number | null
          total_months: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          auto_create_transaction?: boolean
          created_at?: string
          due_date?: string | null
          due_day: number
          emi_amount: number
          id?: string
          interest?: number | null
          interest_rate: number
          is_active?: boolean | null
          monthly_amount?: number | null
          name: string
          next_due_date?: string | null
          notes?: string | null
          principal_amount: number
          remaining_balance?: number
          start_date: string
          tenure?: number | null
          tenure_months?: number | null
          total_amount?: number | null
          total_months: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          auto_create_transaction?: boolean
          created_at?: string
          due_date?: string | null
          due_day?: number
          emi_amount?: number
          id?: string
          interest?: number | null
          interest_rate?: number
          is_active?: boolean | null
          monthly_amount?: number | null
          name?: string
          next_due_date?: string | null
          notes?: string | null
          principal_amount?: number
          remaining_balance?: number
          start_date?: string
          tenure?: number | null
          tenure_months?: number | null
          total_amount?: number | null
          total_months?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emis_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_contributions: {
        Row: {
          amount: number
          created_at: string
          goal_id: string
          id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          goal_id: string
          id?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          goal_id?: string
          id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          created_at: string | null
          goal_id: string
          id: string
          is_completed: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal_id: string
          id?: string
          is_completed?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal_id?: string
          id?: string
          is_completed?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_updates: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          note: string
          progress_value: number | null
          update_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          note: string
          progress_value?: number | null
          update_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          note?: string
          progress_value?: number | null
          update_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_updates_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_completed: boolean | null
          progress: number | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed_at: string
          count: number | null
          created_at: string
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          count?: number | null
          created_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          count?: number | null
          created_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category: Database["public"]["Enums"]["habit_category"] | null
          color: string | null
          created_at: string
          custom_skip_days: string[] | null
          description: string | null
          end_date: string | null
          frequency: string | null
          goal: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          skip_holidays: boolean | null
          skip_weekends: boolean | null
          start_date: string | null
          target_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["habit_category"] | null
          color?: string | null
          created_at?: string
          custom_skip_days?: string[] | null
          description?: string | null
          end_date?: string | null
          frequency?: string | null
          goal?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          skip_holidays?: boolean | null
          skip_weekends?: boolean | null
          start_date?: string | null
          target_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["habit_category"] | null
          color?: string | null
          created_at?: string
          custom_skip_days?: string[] | null
          description?: string | null
          end_date?: string | null
          frequency?: string | null
          goal?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          skip_holidays?: boolean | null
          skip_weekends?: boolean | null
          start_date?: string | null
          target_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_plan: {
        Row: {
          allocated_debt: number
          allocated_family: number
          allocated_self: number
          created_at: string
          id: string
          month: string
          remaining_balance: number
          total_income: number
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_debt?: number
          allocated_family?: number
          allocated_self?: number
          created_at?: string
          id?: string
          month: string
          remaining_balance?: number
          total_income?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_debt?: number
          allocated_family?: number
          allocated_self?: number
          created_at?: string
          id?: string
          month?: string
          remaining_balance?: number
          total_income?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          color: string | null
          content: string | null
          created_at: string
          id: string
          is_pinned: boolean | null
          note_date: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          note_date?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          note_date?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      passwords: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          password_ciphertext: string | null
          password_value: string | null
          title: string
          updated_at: string | null
          url: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          password_ciphertext?: string | null
          password_value?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          password_ciphertext?: string | null
          password_value?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      product_purchase_history: {
        Row: {
          cost: number | null
          created_at: string
          days_lasted: number | null
          id: string
          notes: string | null
          product_id: string
          purchase_date: string
          quantity: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          days_lasted?: number | null
          id?: string
          notes?: string | null
          product_id: string
          purchase_date?: string
          quantity?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          days_lasted?: number | null
          id?: string
          notes?: string | null
          product_id?: string
          purchase_date?: string
          quantity?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_purchase_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_usage"
            referencedColumns: ["id"]
          },
        ]
      }
      product_usage: {
        Row: {
          actual_days: number | null
          category: string
          color: string | null
          cost: number | null
          created_at: string
          estimated_days: number | null
          icon: string | null
          id: string
          last_purchase_date: string
          name: string
          notes: string | null
          quantity: number | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_days?: number | null
          category?: string
          color?: string | null
          cost?: number | null
          created_at?: string
          estimated_days?: number | null
          icon?: string | null
          id?: string
          last_purchase_date?: string
          name: string
          notes?: string | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_days?: number | null
          category?: string
          color?: string | null
          cost?: number | null
          created_at?: string
          estimated_days?: number | null
          icon?: string | null
          id?: string
          last_purchase_date?: string
          name?: string
          notes?: string | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean | null
          is_recurring: boolean | null
          recurring_frequency: string | null
          reminder_date: string
          reminder_time: string | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          is_recurring?: boolean | null
          recurring_frequency?: string | null
          reminder_date: string
          reminder_time?: string | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          is_recurring?: boolean | null
          recurring_frequency?: string | null
          reminder_date?: string
          reminder_time?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          account_id: string | null
          color: string | null
          created_at: string
          current_amount: number | null
          deadline: string | null
          icon: string | null
          id: string
          is_completed: boolean | null
          name: string
          progress_amount: number
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          color?: string | null
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          icon?: string | null
          id?: string
          is_completed?: boolean | null
          name: string
          progress_amount?: number
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          color?: string | null
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          icon?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string
          progress_amount?: number
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          payment_mode: string | null
          reference_id: string | null
          reference_type: string
          source_module: string
          spending_type: string | null
          to_account_id: string | null
          transaction_date: string
          transfer_account_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          payment_mode?: string | null
          reference_id?: string | null
          reference_type?: string
          source_module?: string
          spending_type?: string | null
          to_account_id?: string | null
          transaction_date?: string
          transfer_account_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          payment_mode?: string | null
          reference_id?: string | null
          reference_type?: string
          source_module?: string
          spending_type?: string | null
          to_account_id?: string | null
          transaction_date?: string
          transfer_account_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_transfer_account_id_fkey"
            columns: ["transfer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_password: { Args: { entry_id: string }; Returns: undefined }
      get_all_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_passwords: {
        Args: { vault_key: string }
        Returns: {
          created_at: string
          id: string
          notes: string
          password_value: string
          title: string
          updated_at: string
          url: string
          username: string
        }[]
      }
      recalculate_account_current_balance: {
        Args: { target_account_id: string }
        Returns: undefined
      }
      save_password: {
        Args: {
          entry_notes: string
          entry_password: string
          entry_title: string
          entry_url: string
          entry_username: string
          vault_key: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      habit_category:
        | "health"
        | "self_care"
        | "self_love"
        | "attitude"
        | "learning"
        | "fitness"
        | "mindfulness"
        | "productivity"
        | "social"
        | "other"
      transaction_type: "credit" | "debit" | "transfer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      habit_category: [
        "health",
        "self_care",
        "self_love",
        "attitude",
        "learning",
        "fitness",
        "mindfulness",
        "productivity",
        "social",
        "other",
      ],
      transaction_type: ["credit", "debit", "transfer"],
    },
  },
} as const
