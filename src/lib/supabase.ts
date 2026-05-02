import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database types
export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          name: string;
          description: string;
          leader_id: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          leader_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          leader_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: 'ADMIN' | 'PASTOR' | 'SECRETARY' | 'TREASURER' | 'DEPT_LEADER' | 'MEMBER';
          avatar_url: string | null;
          phone: string | null;
          department_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: 'ADMIN' | 'PASTOR' | 'SECRETARY' | 'TREASURER' | 'DEPT_LEADER' | 'MEMBER';
          avatar_url?: string | null;
          phone?: string | null;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: 'ADMIN' | 'PASTOR' | 'SECRETARY' | 'TREASURER' | 'DEPT_LEADER' | 'MEMBER';
          avatar_url?: string | null;
          phone?: string | null;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          gender: 'M' | 'F' | 'O' | null;
          photo_url: string | null;
          phone: string;
          email: string;
          address: string;
          baptism_date: string | null;
          membership_date: string | null;
          status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED';
          department_id: string | null;
          is_tither: boolean;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date?: string | null;
          gender?: 'M' | 'F' | 'O' | null;
          photo_url?: string | null;
          phone?: string;
          email?: string;
          address?: string;
          baptism_date?: string | null;
          membership_date?: string | null;
          status?: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED';
          department_id?: string | null;
          is_tither?: boolean;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string | null;
          gender?: 'M' | 'F' | 'O' | null;
          photo_url?: string | null;
          phone?: string;
          email?: string;
          address?: string;
          baptism_date?: string | null;
          membership_date?: string | null;
          status?: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED';
          department_id?: string | null;
          is_tither?: boolean;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_transactions: {
        Row: {
          id: string;
          date: string;
          type: 'INCOME' | 'EXPENSE';
          category: 'TITHE' | 'OFFERING' | 'SPECIAL_OFFERING' | 'DONATION' | 'OPERATIONAL' | 'EVENT' | 'SALARY' | 'EXTRAORDINARY';
          amount: number;
          member_id: string | null;
          payment_method: string;
          description: string;
          receipt_url: string | null;
          status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          type: 'INCOME' | 'EXPENSE';
          category: 'TITHE' | 'OFFERING' | 'SPECIAL_OFFERING' | 'DONATION' | 'OPERATIONAL' | 'EVENT' | 'SALARY' | 'EXTRAORDINARY';
          amount: number;
          member_id?: string | null;
          payment_method?: string;
          description: string;
          receipt_url?: string | null;
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          type?: 'INCOME' | 'EXPENSE';
          category?: 'TITHE' | 'OFFERING' | 'SPECIAL_OFFERING' | 'DONATION' | 'OPERATIONAL' | 'EVENT' | 'SALARY' | 'EXTRAORDINARY';
          amount?: number;
          member_id?: string | null;
          payment_method?: string;
          description?: string;
          receipt_url?: string | null;
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      worship_services: {
        Row: {
          id: string;
          date: string;
          type: string;
          preacher: string;
          theme: string | null;
          bible_text: string | null;
          attendance_members: number;
          attendance_visitors: number;
          decisions: number;
          offerings: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          type: string;
          preacher: string;
          theme?: string | null;
          bible_text?: string | null;
          attendance_members?: number;
          attendance_visitors?: number;
          decisions?: number;
          offerings?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          type?: string;
          preacher?: string;
          theme?: string | null;
          bible_text?: string | null;
          attendance_members?: number;
          attendance_visitors?: number;
          decisions?: number;
          offerings?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      upcoming_birthdays: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          birth_month: number | null;
          birth_day: number | null;
          photo_url: string | null;
        };
      };
    };
  };
}
