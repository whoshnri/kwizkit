
// app/api/students/login/route.ts - Student login endpoint
import { NextRequest, NextResponse } from 'next/server';
import { loginStudent } from '@/lib/prisma-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, tableId } = body;

    if (!email || !password || !tableId) {
      return NextResponse.json({ 
        error: 'Email, password, and table ID are required' 
      }, { status: 400 });
    }

    const result = await loginStudent(email, password, tableId);
    
    return NextResponse.json({
      message: 'Login successful',
      student: result.student,
      tableData: result.tableData,
      tests: result.tests
    });
  } catch (error) {
    console.error('Student login failed:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Login failed' 
    }, { status: 401 });
  }
}