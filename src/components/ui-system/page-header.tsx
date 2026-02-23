import { Plus, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionConfig {
  label: string;
  onClick: () => void;
  icon?: LucideIcon | any;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ActionConfig; // By default it will be the "Create" action
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const Icon = action?.icon || Plus;
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      
      {action && (
        <Button 
          variant={action.variant || "default"} 
          className={`shadow-sm sm:w-auto w-full ${action.className || ""}`}
          onClick={action.onClick}
        >
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
