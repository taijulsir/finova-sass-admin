"use client";

import { Badge } from "@/components/ui/badge";
import { TableActionDropdown } from "@/components/ui-system/table-action-dropdown";
import {
  TbEye,
  TbEdit,
  TbX,
  TbPlayerPlay,
  TbClock,
  TbAlertTriangle,
} from "react-icons/tb";
import { SubscriptionRow, SubscriptionStatus } from "@/types/subscription";
import { cn } from "@/lib/utils";

export type { SubscriptionRow };

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface SubscriptionColumnsProps {
  onView: (sub: SubscriptionRow) => void;
  onChangePlan: (sub: SubscriptionRow) => void;
  onExtendTrial: (sub: SubscriptionRow) => void;
  onCancel: (sub: SubscriptionRow) => void;
  onReactivate: (sub: SubscriptionRow) => void;
  onForceExpire: (sub: SubscriptionRow) => void;
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  TRIAL: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  PAST_DUE: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  CANCELED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  EXPIRED: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400",
};

function renewalUrgency(dateStr?: string): 'critical' | 'warning' | 'normal' | null {
  if (!dateStr) return null;
  const diff = (new Date(dateStr).getTime() - Date.now()) / 86_400_000;
  if (diff < 0) return 'critical';
  if (diff <= 3) return 'critical';
  if (diff <= 7) return 'warning';
  return 'normal';
}

export const getSubscriptionColumns = ({
  onView,
  onChangePlan,
  onExtendTrial,
  onCancel,
  onReactivate,
  onForceExpire,
}: SubscriptionColumnsProps): Column<SubscriptionRow>[] => [
  {
    accessorKey: "org.name",
    header: "Organization",
    cell: (sub) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
          {sub.org?.name?.charAt(0) ?? "?"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground truncate">{sub.org?.name ?? "—"}</span>
          <span className="text-xs text-muted-foreground font-mono truncate">{sub.org?.organizationId ?? "—"}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "plan.name",
    header: "Plan",
    cell: (sub) => (
      <div className="flex flex-col gap-0.5">
        <Badge variant="outline" className="capitalize bg-muted/30 w-fit font-semibold">
          {sub.plan?.name ?? "—"}
        </Badge>
        {sub.plan?.price !== undefined && (
          <span className="text-[10px] text-muted-foreground">
            ${sub.billingCycle === "YEARLY" && sub.plan.yearlyPrice != null
              ? sub.plan.yearlyPrice
              : sub.plan.price}
            /{sub.billingCycle === "YEARLY" ? "yr" : "mo"}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (sub) => (
      <div className="flex flex-col gap-0.5">
        <Badge className={cn("w-fit border", STATUS_STYLES[sub.status] ?? "bg-gray-100 text-gray-600")}>
          {sub.isTrial ? "Trial" : sub.status}
        </Badge>
        {sub.isTrial && sub.trialEndDate && (
          <span className={cn("text-[10px]", renewalUrgency(sub.trialEndDate) === 'critical' ? "text-red-600" : "text-muted-foreground")}>
            ends {new Date(sub.trialEndDate).toLocaleDateString()}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "billingCycle",
    header: "Billing",
    cell: (sub) => (
      <Badge variant="outline" className="capitalize text-xs">
        {sub.billingCycle?.toLowerCase() ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "renewalDate",
    header: "Renewal",
    cell: (sub) => {
      const urgency = renewalUrgency(sub.renewalDate);
      return (
        <div className="flex flex-col gap-0.5">
          <span className={cn(
            "text-sm tabular-nums",
            urgency === 'critical' ? "text-red-600 font-medium" :
            urgency === 'warning' ? "text-amber-600 font-medium" :
            "text-muted-foreground"
          )}>
            {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : "—"}
          </span>
          {urgency === 'critical' && (
            <span className="text-[10px] text-red-500 flex items-center gap-0.5">
              <TbAlertTriangle className="h-2.5 w-2.5" /> Expiring soon
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentProvider",
    header: "Provider",
    cell: (sub) => (
      <span className="text-xs text-muted-foreground capitalize">
        {sub.paymentProvider?.toLowerCase() ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdBy",
    header: "Source",
    cell: (sub) => (
      <Badge variant="outline" className="capitalize text-xs">
        {sub.createdBy?.toLowerCase() ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: (sub) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "—"}
      </span>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (sub) => {
      const isActive = sub.status === "ACTIVE" || sub.status === "TRIAL";
      const isCanceled = sub.status === "CANCELED";
      const isExpired = sub.status === "EXPIRED";
      const canExtendTrial = sub.isTrial && sub.status === "TRIAL";

      const actions = [
        {
          label: "View Details",
          icon: TbEye,
          onClick: () => onView(sub),
        },
        {
          label: "Change Plan",
          icon: TbEdit,
          onClick: () => onChangePlan(sub),
        },
        ...(canExtendTrial
          ? [{ label: "Extend Trial", icon: TbClock, onClick: () => onExtendTrial(sub) }]
          : []),
        ...(isCanceled || isExpired
          ? [{ label: "Reactivate", icon: TbPlayerPlay, onClick: () => onReactivate(sub) }]
          : []),
        ...(isActive
          ? [
              {
                label: "Cancel Subscription",
                icon: TbX,
                onClick: () => onCancel(sub),
                variant: "destructive" as const,
              },
              {
                label: "Force Expire",
                icon: TbAlertTriangle,
                onClick: () => onForceExpire(sub),
                variant: "destructive" as const,
              },
            ]
          : []),
      ];

      return <TableActionDropdown actions={actions} />;
    },
  },
];
