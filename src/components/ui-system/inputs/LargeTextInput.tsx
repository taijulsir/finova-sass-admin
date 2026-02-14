"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface LargeTextInputProps extends React.ComponentProps<"textarea"> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const LargeTextInput = React.forwardRef<HTMLTextAreaElement, LargeTextInputProps>(
  ({ label, error, required, className, ...props }, ref) => {
    return (
      <div className="grid w-full items-center gap-1.5">
        {label && (
          <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider ml-1">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Textarea
          ref={ref}
          className={cn(
            "rounded-xl border-muted bg-background/50 focus-visible:ring-primary/20",
            error && "border-destructive focus-visible:ring-destructive/20",
            className
          )}
          {...props}
        />
        {error && <span className="text-[10px] font-medium text-destructive ml-1">{error}</span>}
      </div>
    );
  }
);

LargeTextInput.displayName = "LargeTextInput";
