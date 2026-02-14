"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui-system/layout/PageHeader";
import { SectionCard } from "@/components/ui-system/layout/SectionCard";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { SearchBar } from "@/components/ui-system/search/SearchBar";
import { Badge } from "@/components/ui/badge";
import { SelectInput } from "@/components/ui-system/inputs/SelectInput";
import { Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const logs = [
  { id: 1, org: "Acme Corp", user: "john@acme.com", action: "User Invited", time: "2024-02-14 10:24 AM" },
  { id: 2, org: "Platform", user: "admin@hub.com", action: "Plan Updated", time: "2024-02-14 09:12 AM" },
  { id: 3, org: "Global Tech", user: "sarah@global.io", action: "API Key Created", time: "2024-02-13 04:45 PM" },
  { id: 4, org: "Nexus AI", user: "system", action: "Auto-Renewal Failed", time: "2024-02-12 11:30 PM" },
];

export default function AuditLogsPage() {
  const columns = [
    { 
      header: "Action", 
      accessorKey: "action",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-muted p-2">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{row.action}</span>
        </div>
      )
    },
    { header: "Organization", accessorKey: "org", className: "text-muted-foreground" },
    { header: "User", accessorKey: "user", className: "font-mono text-xs" },
    { 
      header: "Timestamp", 
      accessorKey: "time",
      cell: (row: any) => (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="h-3.5 w-3.5" />
          {row.time}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Audit Logs" 
        description="Track and monitor all administrative actions across the platform."
        breadcrumbs={[{ label: "Audit Logs" }]}
      />

      <SectionCard>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pt-6">
          <SearchBar onSearch={() => {}} placeholder="Filter by user or action..." />
          <div className="flex items-center gap-2">
            <SelectInput 
              options={[
                { label: "All Organizations", value: "all" },
                { label: "Acme Corp", value: "acme" },
                { label: "Global Tech", value: "global" },
              ]}
              className="w-[200px]"
            />
          </div>
        </div>
        <DataTable columns={columns} data={logs} />
      </SectionCard>
    </div>
  );
}
