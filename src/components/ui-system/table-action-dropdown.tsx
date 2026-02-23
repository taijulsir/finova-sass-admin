import { MoreHorizontal, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode } from "react";

export interface ActionItem {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: LucideIcon | any;
  variant?: "default" | "destructive";
}

interface TableActionDropdownProps {
  actions: ActionItem[];
  triggerIcon?: LucideIcon | any;
}

export function TableActionDropdown({
  actions,
  triggerIcon: TriggerIcon = MoreHorizontal,
}: TableActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <TriggerIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
