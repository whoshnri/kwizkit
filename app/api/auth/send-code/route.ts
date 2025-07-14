import { NextResponse } from 'next/server'
import { sendEmailWithCode } from '@/lib/email'
import { generateResetCode, storeResetCode } from '@/lib/code'

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const code = generateResetCode()
  await storeResetCode(email, code)

  try {
    await sendEmailWithCode(email, code)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
