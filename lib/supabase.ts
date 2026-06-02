import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserPage = {
  id: string
  user_id: string
  username: string
  title: string
  subtitle: string
  notion_page_id: string
  created_at: string
  updated_at: string
}
