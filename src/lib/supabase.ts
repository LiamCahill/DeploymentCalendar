import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Post = {
  id: string
  date: string // ISO date string e.g. "2026-03-24"
  author_id: string
  author_name: string
  author_color: string
  content: string
  photo_paths: string[]
  created_at: string
  updated_at: string
}
