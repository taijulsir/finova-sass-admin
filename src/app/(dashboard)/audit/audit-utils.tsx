import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TbEye } from "react-icons/tb";

export const getAuditColumns = (onView: (log: any) => void) => [
  {
    header: "Action",
    cell: (log: any) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] font-bold tracking-wider">
        {log.action?.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    header: "User",
    cell: (log: any) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{log.userId?.name || 'System'}</span>
        <span className="text-xs text-muted-foreground">{log.userId?.email || 'automated'}</span>
      </div>
    ),
  },
  {
    header: "Resource",
    cell: (log: any) => (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono text-[10px]">
          {log.resource}
        </Badge>
      </div>
    ),
  },
  {
    header: "Details",
    className: "max-w-[400px]",
    cell: (log: any) => (
      <div className="max-h-15 overflow-y-auto scrollbar-none">
        <span className="text-[10px] font-mono text-muted-foreground leading-tight block whitespace-pre-wrap">
          {JSON.stringify(log.metadata, null, 1)}
        </span>
      </div>
    ),
  },
  {
    header: "Timestamp",
    cell: (log: any) => (
      <div className="flex flex-col text-xs">
        <span className="text-foreground">{new Date(log.createdAt).toLocaleDateString()}</span>
        <span className="text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</span>
      </div>
    ),
  },
  {
    header: "Actions",
    className: "text-right w-[80px]",
    cell: (log: any) => (
      <div className="flex items-center justify-end space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
          onClick={(e) => { e.stopPropagation(); onView(log); }}
        >
          <TbEye className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(log)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(log, null, 2));
              }}
            >
              Copy JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export const auditActionOptions = [
  { label: "All Actions", value: "all" },
  { label: "Auth", value: "USER_LOGIN,USER_LOGOUT,USER_REGISTERED" },
  { label: "Organization", value: "ORG_CREATED,ORG_UPDATED,ORG_SUSPENDED,ORG_ACTIVATED" },
  { label: "User Management", value: "USER_INVITED,MEMBER_REMOVED,ROLE_CHANGED" },
  { label: "Lead Management", value: "LEAD_CREATED,LEAD_UPDATED,LEAD_DELETED" },
];
