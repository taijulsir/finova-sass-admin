import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Eye, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export interface BillingEvent {
  _id: string;
  eventId: string;
  provider: 'stripe' | 'paypal' | 'manual' | 'system';
  eventType: string;
  organizationId?: {
    _id: string;
    name: string;
  };
  referenceId?: string;
  status: 'received' | 'processing' | 'processed' | 'failed';
  payload: any;
  receivedAt: string;
  processedAt?: string;
}

interface GetColumnsProps {
  onView: (event: BillingEvent) => void;
}

export const getBillingEventColumns = ({
  onView,
}: GetColumnsProps): any[] => [
  {
    accessorKey: "eventId",
    header: "Event ID",
    cell: (event: BillingEvent) => (
      <div className="flex items-center gap-2">
        <div className={cn(
          "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border",
          event.provider === 'stripe' ? "bg-blue-50 border-blue-100 text-blue-600" : 
          event.provider === 'paypal' ? "bg-indigo-50 border-indigo-100 text-indigo-600" : 
          "bg-slate-50 border-slate-100 text-slate-600"
        )}>
          <Zap className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-[11px] font-bold text-slate-700 truncate">
            {event.eventId}
          </span>
          <span className="text-[10px] text-slate-400 capitalize">
            {event.provider}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "eventType",
    header: "Event Type",
    cell: (event: BillingEvent) => (
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-900 leading-none mb-1">
          {event.eventType}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          Ref: {event.referenceId || "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "organizationId",
    header: "Organization",
    cell: (event: BillingEvent) => (
      <span className="text-xs font-medium text-slate-600">
        {event.organizationId?.name || "System / Global"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (event: BillingEvent) => {
      const status = event.status;
      const config = {
        received: { label: "Received", icon: Clock, className: "bg-slate-100 text-slate-600 border-slate-200" },
        processing: { label: "Processing", icon: Activity, className: "bg-blue-50 text-blue-600 border-blue-200" },
        processed: { label: "Processed", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
        failed: { label: "Failed", icon: XCircle, className: "bg-red-50 text-red-600 border-red-200" },
      }[status] || { label: status, icon: Clock, className: "" };

      const Icon = config.icon;
      return (
        <Badge variant="outline" className={cn("gap-1 text-[10px] px-1.5 h-5 font-bold uppercase tracking-wider", config.className)}>
          <Icon className="h-2.5 w-2.5" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "receivedAt",
    header: "Logged At",
    cell: (event: BillingEvent) => (
      <div className="flex flex-col">
        <span className="text-[11px] text-slate-700 font-medium">
          {formatDistanceToNow(new Date(event.receivedAt), { addSuffix: true })}
        </span>
        <span className="text-[10px] text-slate-400">
          {new Date(event.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    isAction: true,
    cell: (event: BillingEvent) => (
      <div className="flex justify-end pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg group">
              <MoreHorizontal className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-slate-200">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400 px-3 py-2">
              Event Control
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem onClick={() => onView(event)} className="gap-2 cursor-pointer font-medium text-slate-700 focus:bg-slate-50">
              <Eye className="h-3.5 w-3.5 text-slate-400" /> Inspect Payload
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer font-medium text-slate-700 focus:bg-slate-50">
              <Activity className="h-3.5 w-3.5 text-slate-400" /> Reprocess Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
