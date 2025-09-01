// Created by Gemini for Henry
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Table as TableIcon,
  GitCommit,
  Loader2,
} from "lucide-react";
import { IoExitOutline } from "react-icons/io5";
import { VscTrash } from "react-icons/vsc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { Table, TableRow } from "@/types/table";
import { useSession } from "@/app/SessionContext";

interface DynamicTableProps {
  table: Table;
  onUpdateTable: (table: Table) => void;
  onDeleteTable: (tableId: string) => void;
}

export const DynamicTable = ({
  table,
  onUpdateTable,
  onDeleteTable,
}: DynamicTableProps) => {
  const [open, setOpen] = useState(false);
  const [isEditingTable, setIsEditingTable] = useState<boolean>(false);

  return (
    <>
      <Card className="border theme-transparent p-0 theme-border hover:shadow-2xs hover:scale-95 hover:shadow-blue-900 transition-all">
        <div className="flex items-center justify-between px-2 py-2 theme-text">
          <div>
            <h1 className="font-black">{table.name || "Untitled Table"}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="h-7 px-2 text-sm theme-border "
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Manage Table
            </Button>
          </div>
        </div>
        <div className="px-2 pb-2 text-sm theme-text opacity-70">
          {table.rows.length} row{table.rows.length !== 1 ? "s" : ""} ×{" "}
          {table.columns.length} column{table.columns.length !== 1 ? "s" : ""}
        </div>
      </Card>

      <div
        className={`${
          open ? "block" : "hidden"
        } fixed inset-0 z-50 flex items-center bg-black/30`}
      >
        <div className=" w-[90%] max-w-5xl mx-auto h-[80%]">
          {/* We only render the modal when it's open to ensure its state is fresh */}
          {open && (
            <MainTableModal
              table={table}
              onUpdateTable={onUpdateTable}
              onDeleteTable={onDeleteTable}
              onClose={() => setOpen(false)}
              isEditingTable={isEditingTable}
              setIsEditingTable={setIsEditingTable}
            />
          )}
        </div>
      </div>
    </>
  );
};

interface MainTableModalProps extends DynamicTableProps {
  onClose: () => void;
  isEditingTable: boolean;
  setIsEditingTable: (isEditing: boolean) => void;
}

export const MainTableModal = ({
  table,
  onUpdateTable,
  onDeleteTable,
  onClose,
  isEditingTable,
  setIsEditingTable,
}: MainTableModalProps) => {
  const [editingTableName, setEditingTableName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- State Management for Pending Changes ---

  // `originalTable` stores a snapshot of the table when the modal was opened.
  // It's used to check for changes and to revert if the user closes without committing.
  const [originalTable, setOriginalTable] = useState<Table>(table);

  // `localTable` is the "staging area". All edits (add, update, delete) happen here first.
  // This state is local to the modal and does not affect the parent component until committed.
  const [localTable, setLocalTable] = useState<Table>(table);

  const { session } = useSession();

  // --- Change Detection ---

  // This effect compares the current `localTable` with the `originalTable`.
  // If they are different, it means there are uncommitted changes.
  useEffect(() => {
    const hasChanges =
      JSON.stringify(localTable) !== JSON.stringify(originalTable);
    setHasUnsavedChanges(hasChanges);
  }, [localTable, originalTable]);

  // --- Local Handlers: These functions update the `localTable` state only ---

  const handleAddRow = () => {
    const newRow: TableRow = {
      id: `row-${Date.now()}`,
      data: localTable.columns.reduce((acc, col) => {
        acc[col.id] = "";
        return acc;
      }, {} as Record<string, string>),
    };
    // Update the local state, not the parent component's state.
    const updatedTable = {
      ...localTable,
      rows: [...localTable.rows, newRow],
    };
    setLocalTable(updatedTable);
  };

  const handleUpdateCellValue = (
    rowId: string,
    columnId: string,
    value: string
  ) => {
    const updatedRows = localTable.rows.map((row) =>
      row.id === rowId
        ? { ...row, data: { ...row.data, [columnId]: value } }
        : row
    );
    // Update the local state.
    setLocalTable({ ...localTable, rows: updatedRows });
  };

  const handleUpdateColumnName = (columnId: string, newName: string) => {
    const updatedColumns = localTable.columns.map((col) =>
      col.id === columnId ? { ...col, name: newName } : col
    );
    // Update the local state.
    setLocalTable({ ...localTable, columns: updatedColumns });
  };

  const handleDeleteRow = (rowId: string) => {
    if (!isEditingTable) return;
    const updatedRows = localTable.rows.filter((row) => row.id !== rowId);
    // Update the local state.
    setLocalTable({ ...localTable, rows: updatedRows });
  };

  const handleUpdateTableName = (newName: string) => {
    // Update the local state.
    setLocalTable({ ...localTable, name: newName });
  };

  // --- Data Conversion and API Calls ---

  const convertTableToPrismaFormat = (tableToConvert: Table) => {
    const studentsData = tableToConvert.rows.map((row) => {
      const firstName = row.data["col-0"] || "";
      const lastName = row.data["col-1"] || "";
      const email = row.data["col-2"] || "";

      const additionalData = Object.keys(row.data)
        .filter((key) => !["col-0", "col-1", "col-2"].includes(key))
        .reduce((acc, key) => {
          const columnIndex = parseInt(key.split("-")[1]);
          const columnName = tableToConvert.columns[columnIndex]?.name;
          if (columnName) {
            acc[columnName] = row.data[key];
          }
          return acc;
        }, {} as Record<string, any>);

      return {
        id: row.id.startsWith("row-") ? undefined : row.id,
        firstName,
        lastName,
        email,
        password: "temp123",
        additionalData,
      };
    });

    return {
      name: tableToConvert.name,
      columns: tableToConvert.columns.map((col) => ({
        name: col.name,
        type: col.type,
        required: false,
      })),
      studentsData,
    };
  };

  /**
   * This is the "Commit" function.
   * It sends the staged `localTable` data to the backend.
   * On success, it updates the parent component's state via `onUpdateTable`.
   */
  const handleSaveChanges = async (): Promise<void> => {
    if (!hasUnsavedChanges || isSaving) return;

    try {
      setIsSaving(true);
      // Use the staged `localTable` for the API call.
      const prismaData = convertTableToPrismaFormat(localTable);

      const response = await fetch(`/api/tables/${table.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...prismaData,
          managerId: session?.sub,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save changes");
      }

      // --- This is the crucial part ---
      // 1. After a successful save, call `onUpdateTable` to update the parent component.
      onUpdateTable(localTable);

      // 2. Update the `originalTable` reference to our newly saved state.
      // This resets the `hasUnsavedChanges` flag to false.
      setOriginalTable(localTable);

      toast.success("Changes committed successfully!");
    } catch (error) {
      console.error("Failed to commit changes:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to commit changes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTable = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this table? This action cannot be undone."
      )
    ) {
      try {
        await onDeleteTable(table.id);
        onClose();
        toast.success("Table deleted successfully");
      } catch (error) {
        console.error("Failed to delete table:", error);
        toast.error("Failed to delete table");
      }
    }
  };

  // Handles closing the modal, checking for unsaved changes first.
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have changes you have not committed. Are you sure you want to close? All uncommitted changes will be lost."
        )
      ) {
        // No state updates are needed, just close the modal.
        // The local state will be discarded automatically when the component unmounts.
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    // The JSX now reads all its data from `localTable`
    <Card className="theme-border theme-bg shadow-sm p-1 h-full gap-0 z-50 flex flex-col">
      <div className="col-span-1 h-fit px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 p-2">
            {editingTableName ? (
              <Input
                value={localTable.name}
                onChange={(e) => handleUpdateTableName(e.target.value)}
                onBlur={() => setEditingTableName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTableName(false)}
                className="h-7 px-1 text-base font-medium border-gray-300 focus:ring-none focus:outline-none"
                autoFocus
              />
            ) : (
              <h3
                className="text-base font-medium cursor-text px-2 py-1 border border-transparent rounded"
                onClick={() => setEditingTableName(true)}
              >
                {localTable.name || "Untitled Table"}
              </h3>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingTableName(true)}
              className="h-7 w-7 "
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            {hasUnsavedChanges && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                Uncommitted changes
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 col-span-1 flex justify-between items-center">
        {localTable.columns.length > 0 && (
          <div className="text-sm opacity-80">
            {localTable.rows.length} row
            {localTable.rows.length !== 1 ? "s" : ""} ×{" "}
            {localTable.columns.length} column
            {localTable.columns.length !== 1 ? "s" : ""}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant={isEditingTable ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditingTable(!isEditingTable)}
            className={`h-7 px-2 text-sm theme-bg-subtle theme-text theme-border`}
          >
            {isEditingTable ? "Disable Editing" : "Enable Editing"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="h-7 px-2 cursor-pointer theme-border hover:text-red-600 hover:bg-red-50"
          >
            <IoExitOutline className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-grow col-span-1 overflow-auto px-3">
        <table className="w-full">
          <thead className="sticky backdrop-blur-3xl top-0 z-10">
            <tr>
              <th className="px-2 py-2 w-8"></th>
              {localTable.columns.map((column, idx) => (
                <th
                  key={column.id}
                  className={`px-2 py-2 text-left group min-w-[150px] ${
                    idx % 2 === 0 ? "theme-bg-subtle" : "theme-bg"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Input
                      value={column.name}
                      onChange={(e) =>
                        handleUpdateColumnName(column.id, e.target.value)
                      }
                      className="flex-1 bg-transparent border-none px-0 text-sm font-medium theme-text focus:ring-0 shadow-none"
                      placeholder="Column name"
                      disabled={!isEditingTable}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localTable.rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={`group border-b theme-border ${
                  rowIndex % 2 === 0 ? "theme-bg-subtle" : "theme-bg"
                }`}
              >
                <td className="px-3 py-1 w-8">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRow(row.id)}
                    className={`h-6 w-6 p-0 ${
                      isEditingTable
                        ? "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!isEditingTable}
                    tabIndex={isEditingTable ? 0 : -1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
                {localTable.columns.map((column, idx) => (
                  <td
                    key={column.id}
                    className={`px-2 py-1 min-w-[150px] text-left group ${
                      idx % 2 === 1 ? "theme-bg" : "theme-bg-subtle"
                    }`}
                  >
                    <Input
                      value={row.data[column.id] || ""}
                      onChange={(e) =>
                        handleUpdateCellValue(row.id, column.id, e.target.value)
                      }
                      className="border-transparent bg-transparent hover:border-gray-300 focus:border-gray-500 focus:ring-0 text-sm w-full"
                      placeholder={`Enter value`}
                      disabled={!isEditingTable}
                      tabIndex={isEditingTable ? 0 : -1}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t theme-border mt-auto px-4 py-2 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleAddRow}
          className={`h-7 px-2 text-sm theme-border hover:bg-blue-600  ${
            !isEditingTable && "opacity-50 cursor-not-allowed"
          }`}
          disabled={!isEditingTable}
          tabIndex={isEditingTable ? 0 : -1}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Row
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDeleteTable}
            className={`h-7 px-2 text-sm theme-border hover:bg-red-600 hover:text-white ${
              !isEditingTable && "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isEditingTable}
            tabIndex={isEditingTable ? 0 : -1}
          >
            <VscTrash className="h-4 w-4 mr-1" />
            Delete
          </Button>

          <Button
            variant="outline"
            onClick={handleSaveChanges}
            className={`h-7 px-2 text-sm theme-border hover:bg-green-600 hover:text-white ${
              (!isEditingTable || !hasUnsavedChanges || isSaving) &&
              "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isEditingTable || !hasUnsavedChanges || isSaving}
            tabIndex={isEditingTable ? 0 : -1}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <GitCommit className="h-4 w-4 mr-1" />
            )}
            {isSaving ? "Pending..." : "Commit"}
          </Button>
        </div>
      </div>
    </Card>
  );
};