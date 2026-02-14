"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SelectInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  options: { label: string; value: string }[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function SelectInput({
  label,
  error,
  required,
  options,
  placeholder,
  value,
  onValueChange,
  className,
  disabled,
}: SelectInputProps) {
  return (
    <div className="grid w-full items-center gap-1.5">
      {label && (
        <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider ml-1">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "rounded-xl border-muted bg-background/50 focus:ring-primary/20",
            error && "border-destructive focus:ring-destructive/20",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-muted shadow-lg">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <span className="text-[10px] font-medium text-destructive ml-1">{error}</span>}
    </div>
  );
}
