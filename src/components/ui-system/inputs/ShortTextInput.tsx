"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface InputSystemProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const ShortTextInput = React.forwardRef<HTMLInputElement, InputSystemProps>(
  ({ label, error, required, className, ...props }, ref) => {
    return (
      <div className="grid w-full items-center gap-1.5">
        {label && (
          <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider ml-1">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Input
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

ShortTextInput.displayName = "ShortTextInput";
