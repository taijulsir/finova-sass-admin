"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  children,
  actions,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("rounded-3xl border-muted bg-card shadow-sm overflow-hidden", className)}>
      {(title || description || actions) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            {title && <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>}
            {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
          </div>
          {actions && <div>{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
