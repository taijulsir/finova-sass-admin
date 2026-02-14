"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui-system/layout/PageHeader";
import { SectionCard } from "@/components/ui-system/layout/SectionCard";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { SearchBar } from "@/components/ui-system/search/SearchBar";
import { PrimaryButton } from "@/components/ui-system/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/ui-system/buttons/SecondaryButton";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Eye, ShieldAlert, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BaseModal } from "@/components/ui-system/modal/BaseModal";
import { ShortTextInput } from "@/components/ui-system/inputs/ShortTextInput";
import { SelectInput } from "@/components/ui-system/inputs/SelectInput";
import { toast } from "sonner";

const organizations = [
  { id: 1, name: "Acme Corp", owner: "admin@acme.com", plan: "Enterprise", status: "Active", createdAt: "2023-10-01" },
  { id: 2, name: "Global Tech", owner: "owner@global.io", plan: "Pro", status: "Active", createdAt: "2023-11-15" },
  { id: 3, name: "Nexus AI", owner: "hello@nexus.ai", plan: "Starter", status: "Suspended", createdAt: "2024-01-20" },
  { id: 4, name: "Starlight", owner: "contact@starlight.com", plan: "Enterprise", status: "Active", createdAt: "2024-02-05" },
  { id: 5, name: "Cloud Nine", owner: "info@cloud9.com", plan: "Pro", status: "Active", createdAt: "2024-03-12" },
];

export default function OrganizationsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { header: "Organization Name", accessorKey: "name", className: "font-medium" },
    { header: "Owner Email", accessorKey: "owner", className: "text-muted-foreground" },
    { 
      header: "Plan", 
      accessorKey: "plan",
      cell: (row: any) => <Badge variant="secondary" className="rounded-lg">{row.plan}</Badge>
    },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (row: any) => (
        <Badge className={cn(
          "rounded-lg",
          row.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
        )}>
          {row.status}
        </Badge>
      )
    },
    { header: "Created Date", accessorKey: "createdAt", className: "text-muted-foreground" },
    { 
      header: "Actions", 
      accessorKey: "actions",
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SecondaryButton size="icon-sm" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </SecondaryButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border-muted shadow-lg">
            <DropdownMenuItem className="gap-2 shrink-0"><Eye className="h-4 w-4" /> View Details</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 shrink-0"><ShieldAlert className="h-4 w-4" /> Change Plan</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 shrink-0 text-destructive focus:text-destructive"><Archive className="h-4 w-4" /> Suspend</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Organizations" 
        description="Manage and monitor all organizations on your platform."
        breadcrumbs={[{ label: "Organizations" }]}
        actions={
          <PrimaryButton iconLeft={<Plus className="h-4 w-4" />} onClick={() => setIsAddModalOpen(true)}>
            Add Organization
          </PrimaryButton>
        }
      />

      <SectionCard>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pt-6">
          <SearchBar onSearch={setSearchQuery} placeholder="Search organizations or owners..." />
          <div className="flex items-center gap-2">
            <SelectInput 
              options={[
                { label: "All Plans", value: "all" },
                { label: "Enterprise", value: "enterprise" },
                { label: "Pro", value: "pro" },
                { label: "Starter", value: "starter" },
              ]}
              className="w-[160px]"
            />
          </div>
        </div>

        <DataTable columns={columns} data={filteredOrgs} />
      </SectionCard>

      <BaseModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Organization"
        description="Fill in the details to create a new organization."
        onConfirm={() => {
          toast.success("Organization added successfully");
          setIsAddModalOpen(false);
        }}
        onCancel={() => setIsAddModalOpen(false)}
      >
        <div className="space-y-4">
          <ShortTextInput label="Organization Name" placeholder="e.g. Acme Corp" required />
          <ShortTextInput label="Owner Email" placeholder="owner@company.com" required type="email" />
          <SelectInput 
            label="Initial Plan"
            options={[
              { label: "Starter", value: "starter" },
              { label: "Pro", value: "pro" },
              { label: "Enterprise", value: "enterprise" },
            ]}
          />
        </div>
      </BaseModal>
    </div>
  );
}

import { cn } from "@/lib/utils";
