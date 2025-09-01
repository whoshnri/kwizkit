
// app/api/tables/[tableId]/route.ts - UPDATE and DELETE specific table
import { NextRequest, NextResponse } from 'next/server';
import { updateTable, deleteTableSchema, getTableData } from '@/lib/prisma-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const body = await request.json();
    const { name, columns, studentsData} = body;
    const { tableId } = await params;

    console.log(name, tableId, studentsData)

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (columns) updateData.columns = columns;

    if (studentsData) {
      updateData.addStudents = studentsData;
      
      // Get current students to remove them
      const currentTable = await getTableData(tableId);
      if (currentTable?.rows) {
        updateData.removeStudentIds = currentTable.rows.map(r => r.student.id);
      }
    }
    const updatedTable = await updateTable(tableId, updateData);
    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Failed to update table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const { tableId } = params;
    
    const result = await deleteTableSchema(tableId);
    return NextResponse.json({ 
      message: 'Table deleted successfully',
      deletedStudents: result.deletedStudents 
    });
  } catch (error) {
    console.error('Failed to delete table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
