'use client';

import { Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlansPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage subscription plans available on the platform.
          </p>
        </div>
      </div>

      {/* Placeholder */}
      <Card className="border-dashed">
        <CardHeader className="items-center text-center pt-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-3">
            <Layers className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-lg">Plans Management</CardTitle>
          <CardDescription className="max-w-sm">
            Create and manage subscription tiers. Assign plans to organizations
            and control feature access across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10" />
      </Card>
    </div>
  );
}
