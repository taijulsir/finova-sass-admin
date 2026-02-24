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
  maxHeight?: string;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  onRowClick,
  className,
  maxHeight,
  stickyHeader = true,
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

  if (data?.length === 0) {
    return (
      <div className={cn("relative rounded-2xl border border-muted bg-card overflow-hidden h-full flex flex-col", className)}>
        <Table>
          <TableHeader className={cn("bg-muted/80 backdrop-blur-sm", stickyHeader && "sticky top-0 z-10 shadow-sm")}>
            <TableRow className="hover:bg-transparent border-muted">
              {columns.map((column, index) => (
                <TableHead key={index} className={cn("font-bold text-foreground py-4 truncate uppercase tracking-tighter text-[11px]", column.className)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex-1 flex flex-col items-center justify-center">
          <EmptyState className="border-none bg-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-2xl border border-muted bg-card overflow-hidden h-full flex flex-col", className)}>
      <div className={cn("overflow-auto", maxHeight ? `max-h-[${maxHeight}]` : "flex-1")}>
        <Table>
          <TableHeader className={cn("bg-muted/80 backdrop-blur-sm", stickyHeader && "sticky top-0 z-10 shadow-sm")}>
            <TableRow className="hover:bg-transparent border-muted">
              {columns?.map((column, index) => (
                <TableHead key={index} className={cn("font-bold text-foreground py-4 truncate uppercase tracking-tighter text-[11px]", column.className)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.length > 0 &&
              data?.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={cn(
                    "border-muted cursor-default transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/30"
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
    </div>
  );
}
