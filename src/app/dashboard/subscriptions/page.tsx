"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui-system/layout/PageHeader";
import { SectionCard } from "@/components/ui-system/layout/SectionCard";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { SearchBar } from "@/components/ui-system/search/SearchBar";
import { SecondaryButton } from "@/components/ui-system/buttons/SecondaryButton";
import { Badge } from "@/components/ui/badge";
import { Calendar, History, ArrowRightLeft, Clock } from "lucide-react";
import { BaseModal } from "@/components/ui-system/modal/BaseModal";
import { SelectInput } from "@/components/ui-system/inputs/SelectInput";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const subscriptions = [
  { id: 1, org: "Acme Corp", plan: "Enterprise", start: "2023-10-01", end: "2024-10-01", status: "Active" },
  { id: 2, org: "Global Tech", plan: "Pro", start: "2023-11-15", end: "2024-11-15", status: "Active" },
  { id: 3, org: "Nexus AI", plan: "Starter", start: "2024-01-20", end: "2024-07-20", status: "Expiring" },
  { id: 4, org: "Starlight", plan: "Enterprise", start: "2024-02-05", end: "2025-02-05", status: "Active" },
];

export default function SubscriptionsPage() {
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);

  const columns = [
    { header: "Organization", accessorKey: "org", className: "font-medium" },
    { 
      header: "Current Plan", 
      accessorKey: "plan",
      cell: (row: any) => <Badge variant="secondary" className="rounded-lg">{row.plan}</Badge>
    },
    { header: "Start Date", accessorKey: "start", className: "text-muted-foreground" },
    { header: "End Date", accessorKey: "end", className: "text-muted-foreground" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (row: any) => (
        <Badge className={cn(
          "rounded-lg",
          row.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
        )}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: "Actions", 
      accessorKey: "actions",
      cell: () => (
        <div className="flex items-center gap-2">
          <SecondaryButton size="sm" onClick={() => setIsPlanModalOpen(true)} className="gap-2">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Change
          </SecondaryButton>
          <SecondaryButton size="icon-sm" variant="ghost" onClick={() => setIsHistoryModalOpen(true)}>
            <History className="h-4 w-4" />
          </SecondaryButton>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Subscriptions" 
        description="Monitor and manage organization plans and lifecycle."
        breadcrumbs={[{ label: "Subscriptions" }]}
      />

      <SectionCard>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pt-6">
          <SearchBar onSearch={() => {}} placeholder="Search organization..." />
        </div>
        <DataTable columns={columns} data={subscriptions} />
      </SectionCard>

      <BaseModal
        open={isPlanModalOpen}
        onOpenChange={setIsPlanModalOpen}
        title="Change Subscription Plan"
        description="Select a new plan for the organization. This will take effect immediately."
        onConfirm={() => {
          toast.success("Subscription plan updated");
          setIsPlanModalOpen(false);
        }}
        onCancel={() => setIsPlanModalOpen(false)}
      >
        <div className="space-y-4">
          <SelectInput 
            label="New Plan"
            options={[
              { label: "Starter", value: "starter" },
              { label: "Pro", value: "pro" },
              { label: "Enterprise", value: "enterprise" },
            ]}
          />
        </div>
      </BaseModal>

      <BaseModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        title="Subscription History"
        description="View all previous plan changes for this organization."
        maxWidth="sm:max-w-md"
        onCancel={() => setIsHistoryModalOpen(false)}
      >
        <div className="space-y-6">
          {[
            { from: "Pro", to: "Enterprise", date: "2024-02-14", by: "Admin (John)" },
            { from: "Starter", to: "Pro", date: "2023-11-20", by: "System" },
          ].map((history, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="mt-1 rounded-full bg-muted p-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">Plan upgraded</p>
                  <span className="text-xs text-muted-foreground">{history.date}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Plan changed from <span className="font-medium text-foreground">{history.from}</span> to <span className="font-medium text-foreground">{history.to}</span>
                </p>
                <p className="text-[10px] text-muted-foreground/60 italic">Changed by {history.by}</p>
              </div>
            </div>
          ))}
        </div>
      </BaseModal>
    </div>
  );
}
