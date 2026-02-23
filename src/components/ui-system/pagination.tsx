import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  className?: string;
  itemName?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  className = "",
  itemName = "items",
}: PaginationProps) {
  const safeTotalItems = totalItems || 0;
  const safeTotalPages = Math.max(1, totalPages || 0);
  const safeCurrentPage = Math.max(1, Math.min(currentPage || 1, safeTotalPages));

  // If no items, show simplified info
  const from = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const to = Math.min(safeCurrentPage * limit, safeTotalItems);

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = safeTotalPages > 5;

    if (!showEllipsis) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={safeCurrentPage === i ? "default" : "outline"}
            size="sm"
            className={`h-8 w-8 text-sm ${safeCurrentPage === i ? "pointer-events-none" : ""}`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      // First Page
      pages.push(
        <Button
          key={1}
          variant={safeCurrentPage === 1 ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 text-sm ${safeCurrentPage === 1 ? "pointer-events-none" : ""}`}
          onClick={() => onPageChange(1)}
        >
          1
        </Button>
      );

      // Start Ellipsis
      if (safeCurrentPage > 3) {
        pages.push(
          <span key="ellipsis-start" className="flex items-center justify-center h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
      }

      // Middle Pages
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i === 1 || i === safeTotalPages) continue;
        pages.push(
          <Button
            key={i}
            variant={safeCurrentPage === i ? "default" : "outline"}
            size="sm"
            className={`h-8 w-8 text-sm ${safeCurrentPage === i ? "pointer-events-none" : ""}`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }

      // End Ellipsis
      if (safeCurrentPage < safeTotalPages - 2) {
        pages.push(
          <span key="ellipsis-end" className="flex items-center justify-center h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
      }

      // Last Page
      pages.push(
        <Button
          key={safeTotalPages}
          variant={safeCurrentPage === safeTotalPages ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 text-sm ${safeCurrentPage === safeTotalPages ? "pointer-events-none" : ""}`}
          onClick={() => onPageChange(safeTotalPages)}
        >
          {safeTotalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full border-t mt-4 bg-background px-2 ${className}`}>
      {/* Left side: Message & Limit */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground order-2 sm:order-1">
        <div className="text-center sm:text-left">
          Showing <span className="font-semibold text-foreground">{from}</span> to{" "}
          <span className="font-semibold text-foreground">{to}</span> of{" "}
          <span className="font-semibold text-foreground">{safeTotalItems}</span>{" "}
          {itemName}
        </div>
        
        {onLimitChange && (
          <div className="flex items-center gap-2 border-l pl-4 border-muted ml-0 sm:ml-2">
            <span className="whitespace-nowrap hidden lg:inline">Rows per page</span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => onLimitChange(parseInt(val))}
            >
              <SelectTrigger className="h-8 w-20 border-muted">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-popover">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right side: Navigation */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hidden md:flex"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage <= 1}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <div className="flex sm:hidden items-center justify-center px-4 text-xs font-semibold text-foreground bg-muted h-8 rounded-md">
          {safeCurrentPage} / {safeTotalPages}
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= safeTotalPages}
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hidden md:flex"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={safeCurrentPage >= safeTotalPages}
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
