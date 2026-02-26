"use client";

import { Badge } from "@/components/ui/badge";
import { TableActionDropdown } from "@/components/ui-system/table-action-dropdown";
import { TbEye, TbEdit, TbArchive, TbTrash } from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ── Types ──────────────────────────────────────────────────────────────────

export type Organization = {
  _id: string;
  name: string;
  organizationId?: string; // public ID like org_XXXXX
  status: string;
  logo?: string;
  ownerId: {
    name: string;
    email: string;
  };
  createdAt: string;
  // Subscription enrichment from backend
  subscription?: {
    status: string;
    planName: string;
    billingCycle: string;
    renewalDate?: string;
    isTrial: boolean;
    trialEndDate?: string;
    createdBy: string;
  };
};

export type Plan = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  features: string[];
  limits: {
    maxMembers: number;
    maxLeads: number;
    maxStorage: number;
  };
  trialDays: number;
  isActive: boolean;
  sortOrder: number;
  isPopular: boolean;
};

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface OrganizationColumnsProps {
  onView: (org: Organization) => void;
  onEdit: (org: Organization) => void;
  onArchive: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const subscriptionStatusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
  trial: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  past_due: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
  canceled: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
  expired: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200",
};

// ── Columns ────────────────────────────────────────────────────────────────

export const getOrganizationColumns = ({
  onView,
  onEdit,
  onArchive,
  onDelete,
}: OrganizationColumnsProps): Column<Organization>[] => [
  {
    accessorKey: "name",
    header: "Organization",
    cell: (org) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border border-muted rounded-lg">
          <AvatarImage src={org.logo} alt={org.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs rounded-lg">
            {org.name.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{org.name}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {org.organizationId || org._id}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "ownerId",
    header: "Owner",
    cell: (org) => {
      const owner = org.ownerId;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{owner?.name || "N/A"}</span>
          <span className="text-xs text-muted-foreground">
            {owner?.email || "N/A"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "subscription.planName",
    header: "Plan",
    cell: (org) => {
      const sub = org.subscription;
      return (
        <div className="flex flex-col gap-0.5">
          <Badge variant="outline" className="capitalize bg-muted/30 w-fit">
            {sub?.planName || "No Plan"}
          </Badge>
          {sub?.billingCycle && (
            <span className="text-[10px] text-muted-foreground capitalize">{sub.billingCycle}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "subscription.status",
    header: "Subscription",
    cell: (org) => {
      const sub = org.subscription;
      const status = sub?.status || "none";
      return (
        <div className="flex flex-col gap-0.5">
          <Badge className={subscriptionStatusStyles[status] || "bg-gray-100 text-gray-600"}>
            {sub?.isTrial ? "Trial" : status}
          </Badge>
          {sub?.isTrial && sub.trialEndDate && (
            <span className="text-[10px] text-muted-foreground">
              ends {new Date(sub.trialEndDate).toLocaleDateString()}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (org) => {
      const status = org.status as string;
      const styles: Record<string, string> = {
        active: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
        suspended: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
        archived: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200",
      };
      return (
        <Badge className={styles[status] || "bg-gray-100 text-gray-600"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: (org) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {new Date(org.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (org) => {
      const actions = [
        {
          label: "View Details",
          icon: TbEye,
          onClick: () => onView(org),
        },
        {
          label: "Edit Organization",
          icon: TbEdit,
          onClick: () => onEdit(org),
        },
        {
          label: org.status === "active" ? "Archive Organization" : "Restore Organization",
          icon: TbArchive,
          onClick: () => onArchive(org),
        },
        {
          label: "Delete Permanently",
          icon: TbTrash,
          onClick: () => onDelete(org),
          variant: "destructive" as const,
        },
      ];

      return <TableActionDropdown actions={actions} />;
    },
  },
];
