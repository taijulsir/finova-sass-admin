"use client";

import { Badge } from "@/components/ui/badge";
import { TableActionDropdown } from "@/components/ui-system/table-action-dropdown";
import { TbEye, TbEdit, TbArchive, TbTrash } from "react-icons/tb";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  organizationId?: {
    name: string;
  };
};

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface UserColumnsProps {
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onArchive: (user: User) => void;
  onDelete: (user: User) => void;
}

export const getUserColumns = ({
  onView,
  onEdit,
  onArchive,
  onDelete,
}: UserColumnsProps): Column<User>[] => [
  {
    accessorKey: "name",
    header: "User",
    cell: (user) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{user.name}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: (user) => (
      <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
        {user.role}
      </Badge>
    ),
  },
  {
    accessorKey: "organizationId",
    header: "Organization",
    cell: (user) => (
      <span className="text-sm text-foreground">{user.organizationId?.name || 'Self-Managed'}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (user) => {
      const status = user.status as string;
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
    header: "Joined At",
    cell: (user) => {
      return (
        <span className="text-sm text-muted-foreground tabular-nums">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (user) => {
      const actions = [
        {
          label: "View Details",
          icon: TbEye,
          onClick: () => onView(user),
        },
        {
          label: "Edit User",
          icon: TbEdit,
          onClick: () => onEdit(user),
        },
        {
          label: "Change Password",
          icon: TbEdit, // Could be another icon
          onClick: () => onEdit(user), // For now just reuse edit
        },
        {
          label: user.status === 'active' ? 'Archive User' : 'Activate User',
          icon: TbArchive,
          onClick: () => onArchive(user),
        },
        {
          label: "Delete Permanently",
          icon: TbTrash,
          onClick: () => onDelete(user),
          variant: "destructive" as const,
        },
      ];

      return <TableActionDropdown actions={actions} />;
    },
  },
];
