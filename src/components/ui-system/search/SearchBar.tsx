"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search...",
  className,
}: SearchBarProps) {
  const debounced = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 300);

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="rounded-2xl border-muted bg-background/50 pl-10 focus-visible:ring-primary/20"
        onChange={(e) => debounced(e.target.value)}
      />
    </div>
  );
}
