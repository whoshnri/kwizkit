import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password } = body

    if (!firstName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Generate a unique ID
    let userId = uuidv4()
    let idExists = await prisma.user.findUnique({ where: { id: userId } })

    // Regenerate if ID already exists (super rare)
    while (idExists) {
      userId = uuidv4()
      idExists = await prisma.user.findUnique({ where: { id: userId } })
    }

    const pwds = await bcrypt.hash(password, 10);
    // Save the user
    const user = await prisma.user.create({
      data: {
        "id" : userId ,
        "firstName" : firstName,
        "lastName" : lastName,
        "email" : email,
        "password" : pwds,
      },
    })

    return NextResponse.json(
      {
        message: "User registered",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    )
  }
}
