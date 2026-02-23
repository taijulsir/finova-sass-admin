"use client";

import { Badge } from "@/components/ui/badge";
import { TableActionDropdown } from "@/components/ui-system/table-action-dropdown";
import { TbEye, TbEdit, TbArchive, TbTrash } from "react-icons/tb";

export type Organization = {
  _id: string;
  name: string;
  plan: string;
  status: string;
  ownerId: {
    name: string;
    email: string;
  };
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
  onArchive: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

export const getOrganizationColumns = ({
  onView,
  onEdit,
  onArchive,
  onDelete,
}: OrganizationColumnsProps): Column<Organization>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: (org) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{org.name}</span>
        <span className="text-xs text-muted-foreground font-mono">{org._id}</span>
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
    accessorKey: "plan",
    header: "Plan",
    cell: (org) => (
      <Badge variant="outline" className="capitalize bg-muted/30">
        {org.plan}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (org) => {
      const status = org.status as string;
      return (
        <Badge
          className={
            status === "active"
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"
              : "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: (org) => {
      return (
        <span className="text-sm text-muted-foreground tabular-nums">
          {new Date(org.createdAt).toLocaleDateString()}
        </span>
      );
    },
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
          label: "Archive Organization",
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
