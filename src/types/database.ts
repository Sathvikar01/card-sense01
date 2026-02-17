// TypeScript types for Supabase database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          city: string | null
          income_range: string | null
          employment_type: string | null
          primary_bank: string | null
          cibil_score: number | null
          existing_cards: Json
          fixed_deposits: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          city?: string | null
          income_range?: string | null
          employment_type?: string | null
          primary_bank?: string | null
          cibil_score?: number | null
          existing_cards?: Json
          fixed_deposits?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          city?: string | null
          income_range?: string | null
          employment_type?: string | null
          primary_bank?: string | null
          cibil_score?: number | null
          existing_cards?: Json
          fixed_deposits?: Json
          created_at?: string
          updated_at?: string
        }
      }
      credit_cards: {
        Row: {
          id: string
          bank: string
          card_name: string
          card_type: string
          network: string | null
          joining_fee: number
          annual_fee: number
          annual_fee_waiver_conditions: string | null
          min_income_required: number | null
          min_cibil_score: number
          age_requirement: string
          eligibility_criteria: string | null
          reward_structure: Json
          welcome_benefits: Json
          key_features: string[] | null
          pros: string[] | null
          cons: string[] | null
          best_for: string[] | null
          milestone_benefits: Json
          lounge_access: string | null
          fuel_surcharge_waiver: boolean
          foreign_markup_fee: number | null
          image_url: string | null
          apply_url: string | null
          terms_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank: string
          card_name: string
          card_type: string
          network?: string | null
          joining_fee?: number
          annual_fee?: number
          annual_fee_waiver_conditions?: string | null
          min_income_required?: number | null
          min_cibil_score?: number
          age_requirement?: string
          eligibility_criteria?: string | null
          reward_structure: Json
          welcome_benefits?: Json
          key_features?: string[] | null
          pros?: string[] | null
          cons?: string[] | null
          best_for?: string[] | null
          milestone_benefits?: Json
          lounge_access?: string | null
          fuel_surcharge_waiver?: boolean
          foreign_markup_fee?: number | null
          image_url?: string | null
          apply_url?: string | null
          terms_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank?: string
          card_name?: string
          card_type?: string
          network?: string | null
          joining_fee?: number
          annual_fee?: number
          annual_fee_waiver_conditions?: string | null
          min_income_required?: number | null
          min_cibil_score?: number
          age_requirement?: string
          eligibility_criteria?: string | null
          reward_structure?: Json
          welcome_benefits?: Json
          key_features?: string[] | null
          pros?: string[] | null
          cons?: string[] | null
          best_for?: string[] | null
          milestone_benefits?: Json
          lounge_access?: string | null
          fuel_surcharge_waiver?: boolean
          foreign_markup_fee?: number | null
          image_url?: string | null
          apply_url?: string | null
          terms_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          recommendation_type: string
          input_snapshot: Json
          recommended_cards: Json
          ai_analysis: string | null
          spending_analysis: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recommendation_type: string
          input_snapshot: Json
          recommended_cards: Json
          ai_analysis?: string | null
          spending_analysis?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recommendation_type?: string
          input_snapshot?: Json
          recommended_cards?: Json
          ai_analysis?: string | null
          spending_analysis?: Json | null
          created_at?: string
        }
      }
      spending_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          merchant: string | null
          card_used: string | null
          transaction_date: string
          source: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          merchant?: string | null
          card_used?: string | null
          transaction_date?: string
          source?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          merchant?: string | null
          card_used?: string | null
          transaction_date?: string
          source?: string
          notes?: string | null
          created_at?: string
        }
      }
      uploaded_documents: {
        Row: {
          id: string
          user_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          parsed_data: Json | null
          parsing_status: string
          parsing_error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          parsed_data?: Json | null
          parsing_status?: string
          parsing_error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          parsed_data?: Json | null
          parsing_status?: string
          parsing_error?: string | null
          created_at?: string
        }
      }
      credit_score_history: {
        Row: {
          id: string
          user_id: string
          score: number
          score_date: string
          source: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          score_date?: string
          source?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          score_date?: string
          source?: string
          notes?: string | null
          created_at?: string
        }
      }
      education_articles: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          content: string
          category: string
          difficulty: string
          read_time_minutes: number | null
          featured: boolean
          tags: string[] | null
          author: string
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          content: string
          category: string
          difficulty?: string
          read_time_minutes?: number | null
          featured?: boolean
          tags?: string[] | null
          author?: string
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          content?: string
          category?: string
          difficulty?: string
          read_time_minutes?: number | null
          featured?: boolean
          tags?: string[] | null
          author?: string
          published_at?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}
