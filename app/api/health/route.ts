import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('organisations').select('id').limit(1)
    if (error) throw error
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ status: 'degraded', timestamp: new Date().toISOString() }, { status: 503 })
  }
}
