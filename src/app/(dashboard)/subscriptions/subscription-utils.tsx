"use client";

import { Badge } from "@/components/ui/badge";
import { TableActionDropdown } from "@/components/ui-system/table-action-dropdown";
import { TbEye, TbEdit, TbArchive, TbCurrencyDollar } from "react-icons/tb";

export type Subscription = {
  _id: string;
  name: string;
  plan: string;
  status: string;
  ownerId?: {
    email: string;
  };
};

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface SubscriptionColumnsProps {
  onView: (sub: Subscription) => void;
  onEdit: (sub: Subscription) => void;
  onArchive: (sub: Subscription) => void;
  onManage: (sub: Subscription) => void;
}

export const getSubscriptionColumns = ({
  onView,
  onEdit,
  onArchive,
  onManage,
}: SubscriptionColumnsProps): Column<Subscription>[] => [
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
    accessorKey: "plan",
    header: "Plan",
    cell: (sub) => {
      const plans: Record<string, string> = {
        free: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
        pro: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
        enterprise: "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
      };
      
      return (
        <Badge variant="outline" className={`capitalize ${plans[sub.plan] || "bg-muted text-muted-foreground"}`}>
          {sub.plan} Plan
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (sub) => {
      const status = sub.status as string;
      return (
        <Badge
          className={
            status === "active"
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"
              : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    header: "Renews On",
    accessorKey: "renewalDate",
    cell: () => (
      <span className="text-sm text-muted-foreground italic flex items-center">
        Mock Date <span className="text-[10px] ml-1 bg-muted px-1 rounded">N/A</span>
      </span>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (sub) => {
      const actions = [
        {
          label: "View Billing Details",
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
          label: "Cancel Subscription",
          icon: TbArchive,
          onClick: () => onArchive(sub),
          variant: "destructive" as const,
        },
      ];

      return <TableActionDropdown actions={actions} />;
    },
  },
];
