import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(url, anonKey)

// Server-side client with full permissions (API routes / server components)
export const supabaseAdmin = createClient(url, serviceKey)

export const STORAGE_BUCKET = 'imoveis'
