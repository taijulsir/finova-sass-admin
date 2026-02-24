'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FilterTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
  options?: { label: string; value: string }[];
}

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

export function FilterTabs({
  activeTab,
  onTabChange,
  className = "",
  options = [
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
  ],
}: FilterTabsProps) {
  const colClass = GRID_COLS[options.length] ?? "grid-cols-4";

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className={`w-full max-w-sm ${className}`}
    >
      <TabsList className={`grid w-full ${colClass}`}>
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
