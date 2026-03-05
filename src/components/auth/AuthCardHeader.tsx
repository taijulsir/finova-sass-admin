"use client";

import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AuthCardHeader({
  title,
  description,
  badge = "Admin Portal"
}: {
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <CardHeader className="space-y-3 text-left p-0 pb-5">
      <Badge
        variant="secondary"
        className="w-fit px-2.5 py-1 bg-indigo-50/80 text-indigo-600 border border-indigo-100 flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider rounded-lg"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        {badge}
      </Badge>

      <div className="space-y-1.5">
        <CardTitle className="text-[28px] font-extrabold tracking-tight text-gray-900 leading-none">{title}</CardTitle>
        {description && (
          <CardDescription className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-sm">
            {description}
          </CardDescription>
        )}
      </div>
    </CardHeader>
  );
}
