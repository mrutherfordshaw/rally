import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email, fullName } = await request.json()

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const supabase = createServiceClient()

  // Generate a magic link using the admin API — bypasses Supabase's mailer entirely
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rally-wheat.vercel.app'}/api/auth/callback`,
      ...(fullName ? { data: { full_name: fullName } } : {}),
    },
  })

  if (error || !data?.properties?.action_link) {
    return NextResponse.json({ error: error?.message ?? 'Failed to generate link' }, { status: 500 })
  }

  const magicLink = data.properties.action_link

  // Send via Resend REST API — no SMTP, no rate limits
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Rally <onboarding@resend.dev>',
      to: [email],
      subject: 'Sign in to Rally',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="color: #ae2f34; font-size: 28px; margin-bottom: 8px;">Rally</h1>
          <p style="color: #584140; margin-bottom: 24px;">Make healthy competition the default.</p>
          <p style="color: #0b1c30; margin-bottom: 24px;">Click the button below to sign in to Rally. This link expires in 24 hours.</p>
          <a href="${magicLink}"
             style="display: inline-block; background: #ae2f34; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Sign in to Rally
          </a>
          <p style="color: #584140; margin-top: 24px; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.json()
    return NextResponse.json({ error: body.message ?? 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
