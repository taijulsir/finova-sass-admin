"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface DateInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  value?: Date;
  onValueChange?: (date?: Date) => void;
  className?: string;
}

export function DateInput({
  label,
  error,
  required,
  value,
  onValueChange,
  className,
}: DateInputProps) {
  return (
    <div className="grid w-full items-center gap-1.5">
      {label && (
        <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider ml-1">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal rounded-xl border-muted bg-background/50",
              !value && "text-muted-foreground",
              error && "border-destructive focus:ring-destructive/20",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl shadow-lg border-muted" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onValueChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <span className="text-[10px] font-medium text-destructive ml-1">{error}</span>}
    </div>
  );
}
