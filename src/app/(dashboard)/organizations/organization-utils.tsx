"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { TableActionDropdown } from "@/components/ui-system/table-action-dropdown";
import {
  TbEye,
  TbEdit,
  TbArchive,
  TbTrash,
  TbArrowsExchange,
  TbClockPlus,
  TbBan,
  TbPlayerPlay,
  TbAlertTriangle,
  TbCopy,
} from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Types ──────────────────────────────────────────────────────────────────

/** Populated Plan (from Subscription.planId.populate) */
export type PopulatedPlan = {
  _id: string;
  name: string;
  price: number;
  billingCycle: string;
};

/** Full active subscription as enriched by the backend */
export type SubscriptionEnrichment = {
  _id: string;
  organizationId: string;
  planId: PopulatedPlan;
  status: string; // TRIAL | ACTIVE | PAST_DUE | CANCELED | EXPIRED
  billingCycle: string; // MONTHLY | YEARLY
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  trialEndDate?: string;
  isTrial: boolean;
  paymentProvider: string;
  paymentReferenceId?: string;
  createdBy: string; // ADMIN | SELF_SERVICE
  cancelledAt?: string;
  cancelReason?: string;
  isActive: boolean;
  createdAt: string;
};

/** Organization as returned by backend enriched listing */
export type Organization = {
  _id: string;
  name: string;
  organizationId?: string; // public ID like org_XXXXX
  slug?: string;
  status: string; // active | suspended | archived
  logo?: string;
  isActive: boolean;
  ownerId: {
    _id?: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
  subscription: SubscriptionEnrichment | null;
  memberCount: number;
};

/** Plan type (for select dropdowns) */
export type Plan = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  yearlyPrice?: number;
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
  isPopular?: boolean;
  isPublic?: boolean;
};

/** Subscription history entry */
export type SubscriptionHistoryEntry = {
  _id: string;
  changeType: string;
  previousPlanId?: { _id: string; name: string; price: number };
  newPlanId?: { _id: string; name: string; price: number };
  changedBy?: { _id: string; name: string; email: string };
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
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
  onChangePlan: (org: Organization) => void;
  onExtendTrial: (org: Organization) => void;
  onCancelSubscription: (org: Organization) => void;
  onSuspend: (org: Organization) => void;
  onReactivate: (org: Organization) => void;
  onArchive: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

// ── Status Style Maps ──────────────────────────────────────────────────────

export const subscriptionStatusStyles: Record<string, string> = {
  TRIAL: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  ACTIVE: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
  PAST_DUE: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
  EXPIRED: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
  CANCELED: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200",
};

export const orgStatusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
  SUSPENDED: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
  ARCHIVED: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200",
  PENDING: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
};

export const createdByStyles: Record<string, string> = {
  ADMIN: "bg-violet-100 text-violet-800 border-violet-200",
  SELF_SERVICE: "bg-sky-100 text-sky-800 border-sky-200",
};

export const changeTypeLabels: Record<string, string> = {
  UPGRADE: "Plan Upgrade",
  DOWNGRADE: "Plan Downgrade",
  CANCEL: "Cancellation",
  RENEWAL: "Renewal",
  TRIAL_START: "Trial Started",
  TRIAL_EXTEND: "Trial Extended",
  REACTIVATION: "Reactivation",
  MANUAL_OVERRIDE: "Manual Override",
};

// ── Risk Helpers ───────────────────────────────────────────────────────────

export function getOrgRisks(org: Organization): string[] {
  const risks: string[] = [];
  const sub = org.subscription;

  if (!sub) {
    risks.push("No active subscription");
    return risks;
  }

  if (sub.status === "EXPIRED") risks.push("Subscription expired");
  if (sub.status === "CANCELED") risks.push("Subscription canceled");

  if (sub.isTrial && sub.trialEndDate) {
    const daysLeft = Math.ceil(
      (new Date(sub.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft <= 3 && daysLeft > 0) risks.push(`Trial ending in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`);
    if (daysLeft <= 0) risks.push("Trial expired");
  }

  if (org.status === "ACTIVE" && (sub.status === "EXPIRED" || sub.status === "CANCELED")) {
    risks.push("Org active but subscription inactive");
  }

  return risks;
}

// ── Copyable ID Cell ───────────────────────────────────────────────────────

function CopyableId({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard");
      }}
    >
      <span className="truncate max-w-30">{value}</span>
      <TbCopy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

// ── Risk Indicator ─────────────────────────────────────────────────────────

function RiskIndicator({ org }: { org: Organization }) {
  const risks = getOrgRisks(org);
  if (risks.length === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <TbAlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-55">
          <ul className="text-xs space-y-0.5">
            {risks.map((r, i) => (
              <li key={i}>⚠ {r}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Columns ────────────────────────────────────────────────────────────────

export const getOrganizationColumns = ({
  onView,
  onEdit,
  onChangePlan,
  onExtendTrial,
  onCancelSubscription,
  onSuspend,
  onReactivate,
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
            {org.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">{org.name}</span>
            <RiskIndicator org={org} />
          </div>
          <CopyableId value={org.organizationId || org._id} />
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
          <span className="text-xs text-muted-foreground">{owner?.email || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "subscription.planId.name",
    header: "Plan",
    cell: (org) => {
      const sub = org.subscription;
      if (!sub) {
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 text-[10px]">
            NO ACTIVE SUBSCRIPTION
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="bg-muted/30 w-fit uppercase">
          {sub.planId?.name || "Unknown"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subscription.billingCycle",
    header: "Billing",
    cell: (org) => {
      const sub = org.subscription;
      if (!sub) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <Badge variant="outline" className="text-[10px] bg-muted/20 uppercase">
          {sub.billingCycle}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subscription.status",
    header: "Subscription",
    cell: (org) => {
      const sub = org.subscription;
      if (!sub) return <span className="text-xs text-muted-foreground">—</span>;
      const status = sub.status;
      return (
        <div className="flex flex-col gap-0.5">
          <Badge className={subscriptionStatusStyles[status] || "bg-gray-100 text-gray-600"}>
            {status}
          </Badge>
          {sub.isTrial && sub.trialEndDate && (
            <span className="text-[10px] text-muted-foreground">
              ends {new Date(sub.trialEndDate).toLocaleDateString()}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "subscription.createdBy",
    header: "Created By",
    cell: (org) => {
      const source = org.subscription?.createdBy;
      if (!source) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <Badge variant="outline" className={`text-[10px] ${createdByStyles[source] || ""}`}>
          {source === "SELF_SERVICE" ? "Self-Service" : "Admin"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Org Status",
    cell: (org) => (
      <Badge className={orgStatusStyles[org.status] || "bg-gray-100 text-gray-600"}>
        {org.status}
      </Badge>
    ),
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
      const sub = org.subscription;
      const actions = [
        { label: "View Details", icon: TbEye, onClick: () => onView(org) },
        { label: "Edit Organization", icon: TbEdit, onClick: () => onEdit(org) },
      ];

      // Subscription actions (only if subscription exists)
      if (sub && sub.status !== "CANCELED") {
        actions.push({
          label: "Change Plan",
          icon: TbArrowsExchange,
          onClick: () => onChangePlan(org),
        });
      }
      if (sub?.isTrial) {
        actions.push({
          label: "Extend Trial",
          icon: TbClockPlus,
          onClick: () => onExtendTrial(org),
        });
      }
      if (sub && sub.status !== "CANCELED" && sub.status !== "EXPIRED") {
        actions.push({
          label: "Cancel Subscription",
          icon: TbBan,
          onClick: () => onCancelSubscription(org),
        });
      }

      // Organization status actions
      if (org.status === "ACTIVE") {
        actions.push({
          label: "Suspend Organization",
          icon: TbBan,
          onClick: () => onSuspend(org),
        });
      }
      if (org.status === "SUSPENDED") {
        actions.push({
          label: "Reactivate Organization",
          icon: TbPlayerPlay,
          onClick: () => onReactivate(org),
        });
      }

      actions.push({
        label: org.isActive ? "Archive Organization" : "Restore Organization",
        icon: TbArchive,
        onClick: () => onArchive(org),
      });

      actions.push({
        label: "Delete Permanently",
        icon: TbTrash,
        onClick: () => onDelete(org),
        variant: "destructive" as const,
      } as any);

      return <TableActionDropdown actions={actions} />;
    },
  },
];
