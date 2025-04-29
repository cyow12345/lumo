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
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          age: number
          gender: string
          relationship_start_date: string | null
          evening_alone: string | null
          separation_anxiety: number | null
          attachment_style: string | null
          addressing_issues: string | null
          emotional_expression: number | null
          hurt_response: string | null
          previous_conflict: string | null
          emotional_conflicts: number | null
          criticism_response: string | null
          openness: number | null
          extraversion: number | null
          conscientiousness: number | null
          agreeableness: number | null
          neuroticism: number | null
          relationship_values: string[]
          fidelity_meaning: string | null
          values_priority: Json
          parental_influence: string | null
          trust_experience: string | null
          parental_patterns: string | null
          whatsapp_import: boolean
          astrology: boolean
          birth_date: string | null
          birth_time: string | null
          birth_place: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          name: string
          age: number
          gender: string
          relationship_start_date?: string | null
          evening_alone?: string | null
          separation_anxiety?: number | null
          attachment_style?: string | null
          addressing_issues?: string | null
          emotional_expression?: number | null
          hurt_response?: string | null
          previous_conflict?: string | null
          emotional_conflicts?: number | null
          criticism_response?: string | null
          openness?: number | null
          extraversion?: number | null
          conscientiousness?: number | null
          agreeableness?: number | null
          neuroticism?: number | null
          relationship_values?: string[]
          fidelity_meaning?: string | null
          values_priority?: Json
          parental_influence?: string | null
          trust_experience?: string | null
          parental_patterns?: string | null
          whatsapp_import?: boolean
          astrology?: boolean
          birth_date?: string | null
          birth_time?: string | null
          birth_place?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          age?: number
          gender?: string
          relationship_start_date?: string | null
          evening_alone?: string | null
          separation_anxiety?: number | null
          attachment_style?: string | null
          addressing_issues?: string | null
          emotional_expression?: number | null
          hurt_response?: string | null
          previous_conflict?: string | null
          emotional_conflicts?: number | null
          criticism_response?: string | null
          openness?: number | null
          extraversion?: number | null
          conscientiousness?: number | null
          agreeableness?: number | null
          neuroticism?: number | null
          relationship_values?: string[]
          fidelity_meaning?: string | null
          values_priority?: Json
          parental_influence?: string | null
          trust_experience?: string | null
          parental_patterns?: string | null
          whatsapp_import?: boolean
          astrology?: boolean
          birth_date?: string | null
          birth_time?: string | null
          birth_place?: string | null
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