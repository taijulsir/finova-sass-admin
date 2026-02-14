"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "../feedback/EmptyState";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-muted bg-card overflow-hidden">
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={cn("rounded-2xl border border-muted bg-card overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-muted">
            {columns.map((column, index) => (
              <TableHead key={index} className={cn("font-semibold text-muted-foreground py-4", column.className)}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={cn(
                "border-muted cursor-default",
                onRowClick && "cursor-pointer hover:bg-muted/20"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={cn("py-4", column.className)}>
                  {column.cell
                    ? column.cell(item)
                    : (item[column.accessorKey as keyof T] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
