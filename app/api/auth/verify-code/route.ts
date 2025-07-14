import { NextResponse } from 'next/server'
import { verifyResetCode, clearResetCode } from '@/lib/code'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { email, code, password } = await req.json()

  if (!(email && code && password))
    return NextResponse.json({ error: "All fields required" }, { status: 400 })

  const isValid = await verifyResetCode(email, code)

  if (!isValid)
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })

  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })

  await clearResetCode(email)
  return NextResponse.json({ success: true })
}
