// app/api/tables/route.ts - GET and POST tables
import { NextRequest, NextResponse } from 'next/server';
import { getTablesByManager, createTable, addManagerToTable } from '@/lib/prisma-service';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerAccountId = searchParams.get('managerAccountId');

    if (!managerAccountId) {
      console.error('Manager Account ID is required');
      return NextResponse.json({ error: 'Manager Account ID is required' }, { status: 400 });
    }

    const user = await prisma.account.findUnique({ where: { accountId: managerAccountId } });
    if (!user) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }

    const managerId = user.userId;

    if (!managerId) {
      return NextResponse.json({ error: 'Manager ID is required' }, { status: 400 });
    }

    const result = await getTablesByManager(managerId);
    const tables = result || [];

    // Transform to include full table data
    const tablesWithData = await Promise.all(
      tables.map(async (table) => {
        const { getTableData } = await import('@/lib/prisma-service');
        return await getTableData(table.id);
      })
    );

    return NextResponse.json(tablesWithData.filter(Boolean));
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, columns, managerAccountId } = body;

    if (!managerAccountId) {
      console.error('Manager Account ID is required');
      return NextResponse.json({ error: 'Manager Account ID is required' }, { status: 400 });
    }

    const user = await prisma.account.findUnique({ where: { accountId: managerAccountId } });
    if (!user) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }

    const managerId = user.userId;

    // Create the table
    const table = await createTable(name, managerId, columns);

    // Add manager to the table
    await addManagerToTable(table.id, managerId);

    // Get complete table data to return
    const { getTableData } = await import('@/lib/prisma-service');
    const tableData = await getTableData(table.id);

    return NextResponse.json(tableData);
  } catch (error) {
    console.error('Failed to create table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
