"use client";

import { Badge } from "@/components/ui/badge";
import { TableActionDropdown } from "@/components/ui-system/table-action-dropdown";
import { TbEye, TbEdit, TbArchive, TbCurrencyDollar } from "react-icons/tb";

// This type matches the enriched organization from the backend
export type SubscriptionRow = {
  _id: string;
  name: string;
  organizationId?: string;
  status: string;
  ownerId?: {
    name: string;
    email: string;
  };
  createdAt: string;
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

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface SubscriptionColumnsProps {
  onView: (sub: SubscriptionRow) => void;
  onEdit: (sub: SubscriptionRow) => void;
  onArchive: (sub: SubscriptionRow) => void;
  onManage: (sub: SubscriptionRow) => void;
}

const subscriptionStatusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
  trial: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  past_due: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
  canceled: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
  expired: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200",
};

export const getSubscriptionColumns = ({
  onView,
  onEdit,
  onArchive,
  onManage,
}: SubscriptionColumnsProps): Column<SubscriptionRow>[] => [
  {
    accessorKey: "name",
    header: "Organization",
    cell: (sub) => (
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
          {sub.name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{sub.name}</span>
          <span className="text-xs text-muted-foreground">{sub.ownerId?.email || "N/A"}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "subscription.planName",
    header: "Plan",
    cell: (sub) => {
      const plan = sub.subscription?.planName || "No Plan";
      return (
        <div className="flex flex-col gap-0.5">
          <Badge variant="outline" className="capitalize bg-muted/30 w-fit">
            {plan}
          </Badge>
          {sub.subscription?.billingCycle && (
            <span className="text-[10px] text-muted-foreground capitalize">{sub.subscription.billingCycle}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "subscription.status",
    header: "Status",
    cell: (sub) => {
      const status = sub.subscription?.status || "none";
      return (
        <div className="flex flex-col gap-0.5">
          <Badge className={subscriptionStatusStyles[status] || "bg-gray-100 text-gray-600"}>
            {sub.subscription?.isTrial ? "Trial" : status}
          </Badge>
          {sub.subscription?.isTrial && sub.subscription.trialEndDate && (
            <span className="text-[10px] text-muted-foreground">
              ends {new Date(sub.subscription.trialEndDate).toLocaleDateString()}
            </span>
          )}
        </div>
      );
    },
  },
  {
    header: "Renewal",
    accessorKey: "subscription.renewalDate",
    cell: (sub) => {
      const renewal = sub.subscription?.renewalDate;
      return (
        <span className="text-sm text-muted-foreground tabular-nums">
          {renewal ? new Date(renewal).toLocaleDateString() : "—"}
        </span>
      );
    },
  },
  {
    header: "Source",
    accessorKey: "subscription.createdBy",
    cell: (sub) => (
      <Badge variant="outline" className="capitalize text-xs">
        {sub.subscription?.createdBy || "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (sub) => {
      const subStatus = sub.subscription?.status;
      const actions = [
        {
          label: "View Details",
          icon: TbEye,
          onClick: () => onView(sub),
        },
        {
          label: "Change Plan",
          icon: TbEdit,
          onClick: () => onEdit(sub),
        },
        {
          label: "Manage Subscription",
          icon: TbCurrencyDollar,
          onClick: () => onManage(sub),
        },
        {
          label: subStatus === "canceled" ? "Reactivate" : "Cancel Subscription",
          icon: TbArchive,
          onClick: () => onArchive(sub),
          variant: subStatus !== "canceled" ? ("destructive" as const) : undefined,
        },
      ];

      return <TableActionDropdown actions={actions} />;
    },
  },
];
