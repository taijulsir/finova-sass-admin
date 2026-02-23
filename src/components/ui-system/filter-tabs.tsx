'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FilterTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
  options?: { label: string; value: string }[];
}

export function FilterTabs({
  activeTab,
  onTabChange,
  className = "",
  options = [
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
  ],
}: FilterTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className={`w-full max-w-100 ${className}`}
    >
      <TabsList className="grid w-full grid-cols-2">
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
