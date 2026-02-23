import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 text-sm"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      // Logic for ellipsis
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="icon"
          className="h-8 w-8 text-sm"
          onClick={() => onPageChange(1)}
        >
          1
        </Button>
      );

      if (currentPage > 3) {
        pages.push(
          <span key="ellipsis-start" className="flex items-center justify-center h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i === 1 || i === totalPages) continue;
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 text-sm"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis-end" className="flex items-center justify-center h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
      }

      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="icon"
          className="h-8 w-8 text-sm"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {renderPageNumbers()}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
