"use client";

import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  title = "No data found",
  description = "There are no records to display at the moment.",
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-muted bg-card/30", className)}>
      <div className="rounded-full bg-muted/20 p-4 mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
    </div>
  );
}
