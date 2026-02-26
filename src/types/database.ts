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
          annual_income: number | null
          employment_type: string | null
          employer_name: string | null
          primary_bank: string | null
          has_fixed_deposit: boolean | null
          fd_amount: number | null
          credit_score: number | null
          credit_score_date: string | null
          existing_card_ids: string[] | null
          preferred_spending_categories: string[] | null
          financial_goals: string[] | null
          is_beginner: boolean | null
          onboarding_completed: boolean | null
          income_range: string | null
          cibil_score: number | null
          existing_cards: Json | null
          fixed_deposits: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          city?: string | null
          annual_income?: number | null
          employment_type?: string | null
          employer_name?: string | null
          primary_bank?: string | null
          has_fixed_deposit?: boolean | null
          fd_amount?: number | null
          credit_score?: number | null
          credit_score_date?: string | null
          existing_card_ids?: string[] | null
          preferred_spending_categories?: string[] | null
          financial_goals?: string[] | null
          is_beginner?: boolean | null
          onboarding_completed?: boolean | null
          income_range?: string | null
          cibil_score?: number | null
          existing_cards?: Json | null
          fixed_deposits?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          city?: string | null
          annual_income?: number | null
          employment_type?: string | null
          employer_name?: string | null
          primary_bank?: string | null
          has_fixed_deposit?: boolean | null
          fd_amount?: number | null
          credit_score?: number | null
          credit_score_date?: string | null
          existing_card_ids?: string[] | null
          preferred_spending_categories?: string[] | null
          financial_goals?: string[] | null
          is_beginner?: boolean | null
          onboarding_completed?: boolean | null
          income_range?: string | null
          cibil_score?: number | null
          existing_cards?: Json | null
          fixed_deposits?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_cards: {
        Row: {
          id: string
          bank_name: string
          card_name: string
          card_network: string
          card_type: string
          card_variant: string | null
          image_url: string | null
          joining_fee: number
          annual_fee: number
          annual_fee_waiver_spend: number | null
          renewal_fee: number | null
          min_income_salaried: number | null
          min_income_self_employed: number | null
          min_income_required: number | null
          min_cibil_score: number | null
          min_credit_score: number | null
          min_age: number | null
          max_age: number | null
          requires_itr: boolean | null
          requires_existing_relationship: boolean | null
          reward_rate_default: number | null
          reward_rate_categories: Json | null
          reward_structure: Json | null
          welcome_benefits: Json | null
          milestone_benefits: Json | null
          lounge_access: string | null
          lounge_access_details: string | null
          lounge_visits_per_quarter: number | null
          fuel_surcharge_waiver: boolean | null
          fuel_surcharge_waiver_cap: number | null
          movie_benefits: string | null
          dining_benefits: string | null
          travel_insurance_cover: number | null
          purchase_protection_cover: number | null
          golf_access: boolean | null
          concierge_service: boolean | null
          forex_markup: number | null
          foreign_markup_fee: number | null
          emi_conversion_available: boolean | null
          description: string | null
          pros: string[] | null
          cons: string[] | null
          best_for: string[] | null
          apply_url: string | null
          application_url: string | null
          bank: string | null
          network: string | null
          first_year_fee: number | null
          fee_waiver_condition: string | null
          min_income: number | null
          eligible_employment_types: string[] | null
          reward_point_value: number | null
          benefits: string[] | null
          card_image_url: string | null
          is_active: boolean
          popularity_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank_name?: string
          card_name: string
          card_network?: string
          card_type: string
          card_variant?: string | null
          image_url?: string | null
          joining_fee?: number
          annual_fee?: number
          annual_fee_waiver_spend?: number | null
          renewal_fee?: number | null
          min_income_salaried?: number | null
          min_income_self_employed?: number | null
          min_income_required?: number | null
          min_cibil_score?: number | null
          min_credit_score?: number | null
          min_age?: number | null
          max_age?: number | null
          requires_itr?: boolean | null
          requires_existing_relationship?: boolean | null
          reward_rate_default?: number | null
          reward_rate_categories?: Json | null
          reward_structure?: Json | null
          welcome_benefits?: Json | null
          milestone_benefits?: Json | null
          lounge_access?: string | null
          lounge_access_details?: string | null
          lounge_visits_per_quarter?: number | null
          fuel_surcharge_waiver?: boolean | null
          fuel_surcharge_waiver_cap?: number | null
          movie_benefits?: string | null
          dining_benefits?: string | null
          travel_insurance_cover?: number | null
          purchase_protection_cover?: number | null
          golf_access?: boolean | null
          concierge_service?: boolean | null
          forex_markup?: number | null
          foreign_markup_fee?: number | null
          emi_conversion_available?: boolean | null
          description?: string | null
          pros?: string[] | null
          cons?: string[] | null
          best_for?: string[] | null
          apply_url?: string | null
          application_url?: string | null
          bank?: string | null
          network?: string | null
          first_year_fee?: number | null
          fee_waiver_condition?: string | null
          min_income?: number | null
          eligible_employment_types?: string[] | null
          reward_point_value?: number | null
          benefits?: string[] | null
          card_image_url?: string | null
          is_active?: boolean
          popularity_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank_name?: string
          card_name?: string
          card_network?: string
          card_type?: string
          card_variant?: string | null
          image_url?: string | null
          joining_fee?: number
          annual_fee?: number
          annual_fee_waiver_spend?: number | null
          renewal_fee?: number | null
          min_income_salaried?: number | null
          min_income_self_employed?: number | null
          min_income_required?: number | null
          min_cibil_score?: number | null
          min_credit_score?: number | null
          min_age?: number | null
          max_age?: number | null
          requires_itr?: boolean | null
          requires_existing_relationship?: boolean | null
          reward_rate_default?: number | null
          reward_rate_categories?: Json | null
          reward_structure?: Json | null
          welcome_benefits?: Json | null
          milestone_benefits?: Json | null
          lounge_access?: string | null
          lounge_access_details?: string | null
          lounge_visits_per_quarter?: number | null
          fuel_surcharge_waiver?: boolean | null
          fuel_surcharge_waiver_cap?: number | null
          movie_benefits?: string | null
          dining_benefits?: string | null
          travel_insurance_cover?: number | null
          purchase_protection_cover?: number | null
          golf_access?: boolean | null
          concierge_service?: boolean | null
          forex_markup?: number | null
          foreign_markup_fee?: number | null
          emi_conversion_available?: boolean | null
          description?: string | null
          pros?: string[] | null
          cons?: string[] | null
          best_for?: string[] | null
          apply_url?: string | null
          application_url?: string | null
          bank?: string | null
          network?: string | null
          first_year_fee?: number | null
          fee_waiver_condition?: string | null
          min_income?: number | null
          eligible_employment_types?: string[] | null
          reward_point_value?: number | null
          benefits?: string[] | null
          card_image_url?: string | null
          is_active?: boolean
          popularity_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          recommendation_type: string | null
          flow_type: string | null
          input_snapshot: Json | null
          input_data: Json | null
          recommended_cards: Json
          ai_analysis_text: string | null
          ai_analysis: string | null
          application_guide: Json | null
          portfolio_strategy: string | null
          spending_analysis: Json | null
          spending_optimization_tips: Json | null
          model_used: string | null
          ai_model_used: string | null
          processing_time_ms: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recommendation_type?: string | null
          flow_type?: string | null
          input_snapshot?: Json | null
          input_data?: Json | null
          recommended_cards?: Json
          ai_analysis_text?: string | null
          ai_analysis?: string | null
          application_guide?: Json | null
          portfolio_strategy?: string | null
          spending_analysis?: Json | null
          spending_optimization_tips?: Json | null
          model_used?: string | null
          ai_model_used?: string | null
          processing_time_ms?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recommendation_type?: string | null
          flow_type?: string | null
          input_snapshot?: Json | null
          input_data?: Json | null
          recommended_cards?: Json
          ai_analysis_text?: string | null
          ai_analysis?: string | null
          application_guide?: Json | null
          portfolio_strategy?: string | null
          spending_analysis?: Json | null
          spending_optimization_tips?: Json | null
          model_used?: string | null
          ai_model_used?: string | null
          processing_time_ms?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      recommendation_logs: {
        Row: {
          id: string
          recommendation_id: string
          user_id: string
          card_id: string
          card_name: string
          rank: number
          rules_evaluated: Json
          rule_scores: Json
          final_decision_reason: string
          explanation: Json
          created_at: string
        }
        Insert: {
          id?: string
          recommendation_id: string
          user_id: string
          card_id: string
          card_name: string
          rank: number
          rules_evaluated?: Json
          rule_scores?: Json
          final_decision_reason: string
          explanation?: Json
          created_at?: string
        }
        Update: {
          id?: string
          recommendation_id?: string
          user_id?: string
          card_id?: string
          card_name?: string
          rank?: number
          rules_evaluated?: Json
          rule_scores?: Json
          final_decision_reason?: string
          explanation?: Json
          created_at?: string
        }
      }
      user_cards: {
        Row: {
          id: string
          user_id: string
          card_name: string
          bank_name: string
          card_type: string
          last_four_digits: string | null
          notes: string | null
          is_active: boolean
          added_at: string
          removed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          card_name: string
          bank_name: string
          card_type?: string
          last_four_digits?: string | null
          notes?: string | null
          is_active?: boolean
          added_at?: string
          removed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          card_name?: string
          bank_name?: string
          card_type?: string
          last_four_digits?: string | null
          notes?: string | null
          is_active?: boolean
          added_at?: string
          removed_at?: string | null
        }
      }
      user_interactions: {
        Row: {
          id: string
          user_id: string
          event_type: string
          page: string | null
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          session_id: string | null
          occurred_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          page?: string | null
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          session_id?: string | null
          occurred_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          page?: string | null
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          session_id?: string | null
          occurred_at?: string
        }
      }
      spending_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          merchant: string | null
          merchant_name: string | null
          card_used: string | null
          credit_card_id: string | null
          transaction_date: string
          source: string
          notes: string | null
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          merchant?: string | null
          merchant_name?: string | null
          card_used?: string | null
          credit_card_id?: string | null
          transaction_date?: string
          source?: string
          notes?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          merchant?: string | null
          merchant_name?: string | null
          card_used?: string | null
          credit_card_id?: string | null
          transaction_date?: string
          source?: string
          notes?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string | null
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
          file_size_bytes: number | null
          mime_type: string | null
          parsed_data: Json | null
          parsing_status: string
          parsing_error: string | null
          parsed_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_size_bytes?: number | null
          mime_type?: string | null
          parsed_data?: Json | null
          parsing_status?: string
          parsing_error?: string | null
          parsed_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_size_bytes?: number | null
          mime_type?: string | null
          parsed_data?: Json | null
          parsing_status?: string
          parsing_error?: string | null
          parsed_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      credit_score_history: {
        Row: {
          id: string
          user_id: string
          credit_score: number | null
          score: number | null
          score_date: string
          score_source: string | null
          source: string | null
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          credit_score?: number | null
          score?: number | null
          score_date?: string
          score_source?: string | null
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          credit_score?: number | null
          score?: number | null
          score_date?: string
          score_source?: string | null
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      education_articles: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          summary: string | null
          content: string
          category: string
          difficulty: string
          read_time_minutes: number | null
          reading_time_minutes: number | null
          featured: boolean | null
          tags: string[] | null
          author: string | null
          is_published: boolean | null
          view_count: number | null
          published_at: string | null
          featured_image_url: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          summary?: string | null
          content: string
          category: string
          difficulty?: string
          read_time_minutes?: number | null
          reading_time_minutes?: number | null
          featured?: boolean | null
          tags?: string[] | null
          author?: string | null
          is_published?: boolean | null
          view_count?: number | null
          published_at?: string | null
          featured_image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          summary?: string | null
          content?: string
          category?: string
          difficulty?: string
          read_time_minutes?: number | null
          reading_time_minutes?: number | null
          featured?: boolean | null
          tags?: string[] | null
          author?: string | null
          is_published?: boolean | null
          view_count?: number | null
          published_at?: string | null
          featured_image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
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
