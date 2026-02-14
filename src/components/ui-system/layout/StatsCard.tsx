"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="w-full"
    >
      <Card className={cn("rounded-3xl border-muted bg-card shadow-sm hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-1">
            <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
            {trend && (
              <div className={cn(
                "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                trend.isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
              )}>
                {trend.isUp ? "+" : "-"}{Math.abs(trend.value)}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
