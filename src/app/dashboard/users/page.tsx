"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui-system/layout/PageHeader";
import { SectionCard } from "@/components/ui-system/layout/SectionCard";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { SearchBar } from "@/components/ui-system/search/SearchBar";
import { SecondaryButton } from "@/components/ui-system/buttons/SecondaryButton";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Lock, UserX } from "lucide-react";
import { ConfirmModal } from "@/components/ui-system/modal/ConfirmModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Super Admin", status: "Active", created: "2023-01-01" },
  { id: 2, name: "Sarah Smith", email: "sarah@acme.com", role: "Org Admin", status: "Active", created: "2023-05-12" },
  { id: 3, name: "Mike Johnson", email: "mike@tech.io", role: "Support", status: "Suspended", created: "2023-08-22" },
  { id: 4, name: "Emily Brown", email: "emily@global.com", role: "Viewer", status: "Active", created: "2023-11-05" },
];

export default function UsersPage() {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

  const columns = [
    { header: "Name", accessorKey: "name", className: "font-medium" },
    { header: "Email", accessorKey: "email", className: "text-muted-foreground" },
    { 
      header: "Global Role", 
      accessorKey: "role",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-medium">{row.role}</span>
        </div>
      )
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
    { header: "Created At", accessorKey: "created", className: "text-muted-foreground" },
    { 
      header: "Actions", 
      accessorKey: "actions",
      cell: () => (
        <div className="flex items-center gap-2">
          <SecondaryButton size="icon-sm" onClick={() => toast.info("Password reset email sent")}>
            <Key className="h-4 w-4" />
          </SecondaryButton>
          <SecondaryButton size="icon-sm" variant="ghost" onClick={() => setIsConfirmOpen(true)} className="text-destructive hover:bg-destructive/10">
            <UserX className="h-4 w-4" />
          </SecondaryButton>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Platform Users" 
        description="Manage global administrative users and their access levels."
        breadcrumbs={[{ label: "Users" }]}
      />

      <SectionCard>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pt-6">
          <SearchBar onSearch={() => {}} placeholder="Search users by name or email..." />
        </div>
        <DataTable columns={columns} data={users} />
      </SectionCard>

      <ConfirmModal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Suspend User"
        description="Are you sure you want to suspend this user? They will no longer be able to log in to the platform."
        onConfirm={() => {
          toast.error("User suspended");
          setIsConfirmOpen(false);
        }}
      />
    </div>
  );
}
