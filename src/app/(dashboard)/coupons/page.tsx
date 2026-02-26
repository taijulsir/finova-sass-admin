"use client";

import { Tag, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function CouponsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-none flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Coupons &amp; Promotions
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Create and manage discount codes for marketing campaigns.
            </p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Coupon
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search coupons..." className="pl-8 h-8 text-sm" />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5" /> Filters
          </Button>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
            <Tag className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No coupons created</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create percentage or fixed discount coupons for promotions.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
        </div>
      </div>
    </div>
  );
}
