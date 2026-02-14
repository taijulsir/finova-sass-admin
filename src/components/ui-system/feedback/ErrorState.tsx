"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecondaryButton } from "../buttons/SecondaryButton";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading the data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5", className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
      {onRetry && (
        <SecondaryButton onClick={onRetry} className="mt-6">
          Try Again
        </SecondaryButton>
      )}
    </div>
  );
}
