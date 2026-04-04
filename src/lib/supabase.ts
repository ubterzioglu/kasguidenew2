import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Database client will be null.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''

// Re-exported for backward compatibility — import from '@/lib/categories' in new code.
export { CATEGORIES } from '@/lib/categories'
export type { CategoryDefinition as Category } from '@/lib/categories'
