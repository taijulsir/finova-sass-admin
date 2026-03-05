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
}: GetColumnsProps): any[] => [
  {
    accessorKey: "ticketId",
    header: "ID",
    cell: (ticket: SupportTicket) => (
      <span className="font-mono text-xs font-bold text-slate-500">
        {ticket.ticketId}
      </span>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: (ticket: SupportTicket) => (
      <div className="flex flex-col max-w-[200px]">
        <span className="font-medium truncate text-slate-900">{ticket.subject}</span>
        <span className="text-[10px] text-muted-foreground truncate">
          {ticket.organizationId?.name || "No Organization"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: (ticket: SupportTicket) => {
      const priority = ticket.priority;
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
    cell: (ticket: SupportTicket) => {
      const status = ticket.status;
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
    cell: (ticket: SupportTicket) => {
      const admin = ticket.assignedAdmin;
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
    cell: (ticket: SupportTicket) => (
      <span className="text-[11px] text-slate-400">
        {formatDistanceToNow(new Date(ticket.lastReplyAt), { addSuffix: true })}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    isAction: true,
    cell: (ticket: SupportTicket) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-slate-200 shadow-xl">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400 px-3 py-2">Entry ID: {ticket.ticketId}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem onClick={() => onView(ticket)} className="gap-2 cursor-pointer font-medium">
              <Eye className="h-3.5 w-3.5 text-slate-400" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssign(ticket)} className="gap-2 cursor-pointer font-medium">
              <UserPlus className="h-3.5 w-3.5 text-green-600" /> Assign To Me
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem onClick={() => onStatusChange(ticket, 'resolved')} className="gap-2 cursor-pointer font-medium text-green-600">
              <CheckCircle className="h-3.5 w-3.5" /> Mark Resolved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(ticket, 'closed')} className="gap-2 cursor-pointer font-medium text-red-600">
              <XCircle className="h-3.5 w-3.5" /> Close Ticket
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
