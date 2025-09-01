export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'date';
}

export interface TableRow {
  id: string;
  data: Record<string, string | number>;
}

export interface Table {
  id: string;
  name: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export type TableData = Table[];