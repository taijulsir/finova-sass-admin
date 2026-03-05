import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Eye, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export type SupportTicket = {
  _id: string;
  ticketId: string;
  subject: string;
  organizationId: {
    _id: string;
    name: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedAdmin?: {
    _id: string;
    name: string;
  };
  lastReplyAt: string;
  createdAt: string;
};

interface GetColumnsProps {
  onView: (ticket: SupportTicket) => void;
  onAssign: (ticket: SupportTicket) => void;
  onStatusChange: (ticket: SupportTicket, status: SupportTicket['status']) => void;
}

export const getSupportTicketColumns = ({
  onView,
  onAssign,
  onStatusChange,
}: GetColumnsProps): ColumnDef<SupportTicket>[] => [
  {
    accessorKey: "ticketId",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold text-slate-500">
        {row.getValue("ticketId")}
      </span>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <div className="flex flex-col max-w-[200px]">
        <span className="font-medium truncate">{row.getValue("subject")}</span>
        <span className="text-[10px] text-muted-foreground truncate">
          {row.original.organizationId?.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const config = {
        low: { label: "Low", className: "bg-slate-100 text-slate-600 border-slate-200" },
        medium: { label: "Medium", className: "bg-blue-50 text-blue-600 border-blue-200" },
        high: { label: "High", className: "bg-amber-50 text-amber-600 border-amber-200" },
        urgent: { label: "Urgent", className: "bg-red-50 text-red-600 border-red-200" },
      }[priority] || { label: priority, className: "" };

      return (
        <Badge variant="outline" className={`capitalize text-[10px] px-1.5 h-5 font-bold ${config.className}`}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = {
        open: { label: "Open", icon: AlertCircle, className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
        in_progress: { label: "In Progress", icon: Clock, className: "bg-blue-50 text-blue-600 border-blue-200" },
        resolved: { label: "Resolved", icon: CheckCircle, className: "bg-purple-50 text-purple-600 border-purple-200" },
        closed: { label: "Closed", icon: XCircle, className: "bg-slate-100 text-slate-500 border-slate-200" },
      }[status] || { label: status, icon: AlertCircle, className: "" };

      const Icon = config.icon;

      return (
        <Badge variant="outline" className={`gap-1 capitalize text-[10px] px-1.5 h-5 font-bold ${config.className}`}>
          <Icon className="h-3 w-3" />
          {config.label.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignedAdmin",
    header: "Assigned To",
    cell: ({ row }) => {
      const admin = row.original.assignedAdmin;
      return (
        <span className="text-xs text-slate-600">
          {admin ? admin.name : "Unassigned"}
        </span>
      );
    },
  },
  {
    accessorKey: "lastReplyAt",
    header: "Last Activity",
    cell: ({ row }) => (
      <span className="text-[11px] text-slate-400">
        {formatDistanceToNow(new Date(row.getValue("lastReplyAt")), { addSuffix: true })}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ticket = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400">Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(ticket)} className="gap-2 cursor-pointer">
              <Eye className="h-3.5 w-3.5" /> View Drawer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssign(ticket)} className="gap-2 cursor-pointer">
              <UserPlus className="h-3.5 w-3.5" /> Assign Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {ticket.status !== 'resolved' && (
              <DropdownMenuItem 
                onClick={() => onStatusChange(ticket, 'resolved')}
                className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Mark Resolved
              </DropdownMenuItem>
            )}
            {ticket.status !== 'closed' && (
              <DropdownMenuItem 
                onClick={() => onStatusChange(ticket, 'closed')}
                className="gap-2 cursor-pointer text-slate-600 focus:text-slate-600"
              >
                <XCircle className="h-3.5 w-3.5" /> Close Ticket
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
