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
      ai_usage: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      cv_snapshots: {
        Row: {
          content: Json
          created_at: string
          cv_id: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          cv_id: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          content?: Json
          created_at?: string
          cv_id?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      cvs: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_base: boolean
          match_score: number | null
          match_summary: string | null
          name: string
          pdf_generated_at: string | null
          pdf_key: string | null
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_base?: boolean
          match_score?: number | null
          match_summary?: string | null
          name: string
          pdf_generated_at?: string | null
          pdf_key?: string | null
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_base?: boolean
          match_score?: number | null
          match_summary?: string | null
          name?: string
          pdf_generated_at?: string | null
          pdf_key?: string | null
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
