"use client";

import { useState, useEffect } from "react";
import { BsDatabaseFillAdd, BsDatabase } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { DynamicTable } from "./TableManager";
import { toast } from "sonner"; // or your toast library
import type { Table, TableData } from "@/types/table";
import { useSession } from "@/app/SessionContext";

// Updated types to match Prisma schema
interface PrismaStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface PrismaTableData {
  id: string;
  name: string;
  columns: any[];
  managers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  students: Array<PrismaStudent & Record<string, any>>;
}

// Convert Prisma data to your frontend format
function convertPrismaToFrontend(prismaTable: PrismaTableData): Table {
  return {
    id: prismaTable.id,
    name: prismaTable.name,
    columns: prismaTable.columns.map((col, index) => ({
      id: `col-${index}`,
      name: col.name,
      type: col.type || 'text'
    })),
    rows: prismaTable.students.map((row) => {
      const { id, firstName, lastName, email } = row;
      return {
        id: row.id,
        data: {
          'col-0': firstName,
          'col-1': lastName,
          'col-2': email,
          ...Object.keys(row.data || {}).reduce((acc, key, index) => {
            acc[`col-${index + 3}`] = (row.data as any)[key];
            return acc;
          }, {} as Record<string, string>)
        }
      };
    })
  };
}

// Convert frontend data back to Prisma format
function convertFrontendToPrisma(table: Table) {
  const studentsData = table.rows.map(row => {
    const firstName = row.data['col-0'] || '';
    const lastName = row.data['col-1'] || '';
    const email = row.data['col-2'] || '';
    
    // Additional data from other columns
    const additionalData = Object.keys(row.data)
      .filter(key => !['col-0', 'col-1', 'col-2'].includes(key))
      .reduce((acc, key) => {
        const columnIndex = parseInt(key.split('-')[1]);
        const columnName = table.columns[columnIndex]?.name;
        if (columnName) {
          acc[columnName] = row.data[key];
        }
        return acc;
      }, {} as Record<string, any>);

    return {
      firstName,
      lastName,
      email,
      password: 'temp123',
      additionalData
    };
  });

  return {
    name: table.name,
    columns: table.columns.map(col => ({
      name: col.name,
      type: col.type,
      required: false
    })),
    studentsData
  };
}

export default function TableManager() {
  const [data, setData] = useState<TableData>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();

  // Fetch tables on component mount
  useEffect(() => {
    session?.sub && fetchTables(session);
  }, [session]);

  const fetchTables = async (session: any) => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch(`/api/tables?managerAccountId=${session.sub}`);
      const prismaData: PrismaTableData[] = await response.json();
      
      const frontendData = prismaData.map(convertPrismaToFrontend);
      setData(frontendData);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const createNewTable = async () => {
    try {
      const newTableData = {
        name: `Table ${data.length + 1}`,
        columns: [
          { name: "First Name", type: "text", required: true },
          { name: "Last Name", type: "text", required: true },
          { name: "Email", type: "text", required: true },
          { name: "Password", type: "text", required: true }
        ]
      };

      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTableData,
          managerAccountId: session?.sub
        }),
      });

      if (!response.ok) throw new Error('Failed to create table');

      const prismaTable: PrismaTableData = await response.json();
      const frontendTable = convertPrismaToFrontend(prismaTable);
      
      setData([...data, frontendTable]);
      toast.success('Table created successfully');
    } catch (error) {
      console.error('Failed to create table:', error);
      toast.error('Failed to create table');
    }
  };

  const updateTable = async (updatedTable: Table) => {
    try {
      const prismaData = convertFrontendToPrisma(updatedTable);
      
      const response = await fetch(`/api/tables/${updatedTable.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...prismaData,
          managerAccountId: session?.sub
        }),
      });

      if (!response.ok) throw new Error('Failed to update table');

      // Update local state optimistically
      setData(
        data.map((table) => (table.id === updatedTable.id ? updatedTable : table))
      );
      toast.success('Table updated successfully');
    } catch (error) {
      console.error('Failed to update table:', error);
      toast.error('Failed to update table');
      // Optionally revert the change or refetch data
      fetchTables(session);
    }
  };

  const deleteTable = async (tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete table');

      setData(data.filter((table) => table.id !== tableId));
      toast.success('Table deleted successfully');
    } catch (error) {
      console.error('Failed to delete table:', error);
      toast.error('Failed to delete table');
    }
  };

  if (loading) {
    return (
      <div className="h-full theme-bg rounded p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full theme-bg rounded p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">My Student Databases</h2>
          <Button
            onClick={createNewTable}
            className="gap-2 px-6 py-3 text-white text-base font-semibold theme-text transition-all group uppercase bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <BsDatabaseFillAdd className="h-5 w-5 transition-all text-white" />
            New Table
          </Button>
        </div>

        {/* Tables Grid */}
        {data.length > 0 ? (
          <div className="h-fit grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {data.map((table) => (
              <DynamicTable
                key={table.id}
                table={table}
                onUpdateTable={updateTable}
                onDeleteTable={deleteTable}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4 w-fit mx-auto">
            <div className="w-24 h-24 mx-auto theme-bg-subtle rounded-full flex items-center justify-center">
              <BsDatabase className="h-12 w-12 text-muted-foreground " />
            </div>
            <h3 className="text-2xl font-semibold text-foreground">
              Nothing here yet!
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-base">
              Databases are where you can store and manage your student data
            </p>
            <div className="flex justify-center">
              <Button
                onClick={createNewTable}
                variant="default"
                className="gap-2 px-6 py-3 text-base font-semibold text-white transition-all hover:shadow-lg group uppercase bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              > 
                <BsDatabaseFillAdd className="h-5 w-5 transition-all text-white" />
                New Table
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}