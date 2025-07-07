import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`)
}

// Add some debugging (remove in production)
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)
console.log('Supabase Anon Key length:', supabaseAnonKey?.length)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public'
  }
})

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('quizzes').select('count').limit(1)
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    console.log('Supabase connection test successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

export type Database = {
  public: {
    Tables: {
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          duration_minutes: number | null
          total_questions: number | null
          created_by: string | null
          created_at: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          duration_minutes?: number | null
          total_questions?: number | null
          created_by?: string | null
          created_at?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          duration_minutes?: number | null
          total_questions?: number | null
          created_by?: string | null
          created_at?: string | null
          is_active?: boolean | null
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string | null
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: string
          question_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          quiz_id?: string | null
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: string
          question_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          quiz_id?: string | null
          question_text?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_answer?: string
          question_order?: number | null
          created_at?: string | null
        }
      }
      user_quiz_attempts: {
        Row: {
          id: string
          user_id: string | null
          quiz_id: string | null
          score: number | null
          total_questions: number | null
          time_taken_seconds: number | null
          answers: any | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          quiz_id?: string | null
          score?: number | null
          total_questions?: number | null
          time_taken_seconds?: number | null
          answers?: any | null
          completed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          quiz_id?: string | null
          score?: number | null
          total_questions?: number | null
          time_taken_seconds?: number | null
          answers?: any | null
          completed_at?: string | null
          created_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string | null
        }
      }
    }
  }
}