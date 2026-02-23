import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterTabs } from "./filter-tabs";

interface FilterSectionProps {
  // Search Props
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Tab Props
  activeTab?: string;
  onTabChange?: (value: string) => void;
  tabs?: { label: string; value: string }[];

  // Custom children/actions
  children?: React.ReactNode;
  className?: string;
}

export function FilterSection({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  activeTab,
  onTabChange,
  tabs = [],
  children,
  className = "",
}: FilterSectionProps) {
  return (
    <div
      className={`flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 ${className}`}
    >
      {tabs.length > 0 && activeTab && onTabChange && (
        <FilterTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          options={tabs}
        />
      )}

      <div className="flex items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-9 bg-background focus-visible:ring-1 focus-within:shadow-sm"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
