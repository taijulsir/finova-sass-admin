"use client";

import { Badge } from "@/components/ui/badge";
import { TableActionDropdown } from "@/components/ui-system/table-action-dropdown";
import { TbEye, TbEdit, TbArchive } from "react-icons/tb";

// ── Types ──────────────────────────────────────────────────────────────────

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
  sortOrder: number;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  isAction?: boolean;
}

export interface PlanColumnsProps {
  onView: (plan: Plan) => void;
  onEdit: (plan: Plan) => void;
  onArchive: (plan: Plan) => void;
}

// ── Columns ────────────────────────────────────────────────────────────────

export const getPlanColumns = ({
  onView,
  onEdit,
  onArchive,
}: PlanColumnsProps): Column<Plan>[] => [
  {
    accessorKey: "name",
    header: "Plan",
    cell: (plan) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{plan.name}</span>
        <span className="text-xs text-muted-foreground font-mono">{plan.slug}</span>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Pricing",
    cell: (plan) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium tabular-nums">
          ${plan.price}<span className="text-xs text-muted-foreground font-normal">/mo</span>
        </span>
        {(plan.yearlyPrice ?? 0) > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            ${plan.yearlyPrice}/yr
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "limits",
    header: "Limits",
    cell: (plan) => (
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span>{plan.limits.maxMembers} members</span>
        <span>{plan.limits.maxLeads} leads</span>
        <span>{(plan.limits.maxStorage / 1024).toFixed(1)} GB</span>
      </div>
    ),
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: (plan) => (
      <div className="flex flex-wrap gap-1 max-w-50">
        {plan.features.slice(0, 3).map((f, i) => (
          <Badge key={i} variant="outline" className="text-[10px] bg-muted/30">
            {f}
          </Badge>
        ))}
        {plan.features.length > 3 && (
          <Badge variant="outline" className="text-[10px] bg-muted/30">
            +{plan.features.length - 3} more
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "trialDays",
    header: "Trial",
    cell: (plan) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {plan.trialDays > 0 ? `${plan.trialDays} days` : "None"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: (plan) => {
      const active = plan.isActive;
      return (
        <Badge
          className={
            active
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200"
          }
        >
          {active ? "Active" : "Archived"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sortOrder",
    header: "Order",
    cell: (plan) => (
      <span className="text-sm text-muted-foreground tabular-nums">{plan.sortOrder}</span>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    isAction: true,
    cell: (plan) => {
      const actions = [
        {
          label: "View Details",
          icon: TbEye,
          onClick: () => onView(plan),
        },
        {
          label: "Edit Plan",
          icon: TbEdit,
          onClick: () => onEdit(plan),
        },
        {
          label: plan.isActive ? "Archive Plan" : "Restore Plan",
          icon: TbArchive,
          onClick: () => onArchive(plan),
        },
      ];
      return <TableActionDropdown actions={actions} />;
    },
  },
];
