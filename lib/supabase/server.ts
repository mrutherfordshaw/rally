import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const _url = supabaseUrl as string
const _anonKey = supabaseAnonKey as string
const _serviceKey = supabaseServiceKey as string

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    _url,
    _anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Plain service-role client — bypasses RLS, no cookie context needed
export function createServiceClient() {
  return createSupabaseClient(_url, _serviceKey, {
    auth: { persistSession: false },
  })
}
