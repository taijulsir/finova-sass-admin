"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  Ticket,
  Trash2,
  ExternalLink
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

export type ContactSubmission = {
  _id: string;
  type: 'contact' | 'feedback' | 'feature_request' | 'bug_report';
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  source: 'landing_page' | 'dashboard';
  createdAt: string;
};

interface GetColumnsProps {
  onView: (submission: ContactSubmission) => void;
  onStatusChange: (submission: ContactSubmission, status: string) => void;
  onConvertToTicket: (submission: ContactSubmission) => void;
  onDelete: (submission: ContactSubmission) => void;
}

export const getContactSubmissionColumns = ({
  onView,
  onStatusChange,
  onConvertToTicket,
  onDelete,
}: GetColumnsProps): any[] => [
  {
    accessorKey: "name",
    header: "Sumbittor",
    cell: (submission: ContactSubmission) => (
      <div className="flex flex-col">
        <span className="font-medium text-slate-900">{submission.name}</span>
        <span className="text-[10px] text-slate-500 font-mono italic">{submission.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: (submission: ContactSubmission) => {
      const type = submission.type;
      const config = {
        contact: { label: "Contact", className: "bg-blue-50 text-blue-600 border-blue-200" },
        feedback: { label: "Feedback", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
        feature_request: { label: "Feature", className: "bg-purple-50 text-purple-600 border-purple-200" },
        bug_report: { label: "Bug", className: "bg-red-50 text-red-600 border-red-200" },
      }[type] || { label: type, className: "" };

      return (
        <Badge variant="outline" className={`capitalize text-[10px] px-1.5 h-5 font-bold ${config.className}`}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: (submission: ContactSubmission) => (
      <span className="font-medium text-slate-700 truncate max-w-[180px] block">
        {submission.subject}
      </span>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: (submission: ContactSubmission) => {
      const source = submission.source;
      return (
        <Badge variant="secondary" className="text-[9px] px-1.5 h-4 font-medium uppercase tracking-wider bg-slate-100 text-slate-500 border-none">
          {source.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (submission: ContactSubmission) => {
      const status = submission.status;
      const config = {
        new: { label: "New", className: "bg-emerald-50 text-green-600 border-emerald-100 dark:bg-emerald-500/10" },
        reviewed: { label: "Reviewed", className: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10" },
        resolved: { label: "Resolved", className: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10" },
      }[status] || { label: status, className: "" };

      return (
        <Badge variant="outline" className={`capitalize text-[10px] px-1.5 h-5 font-bold ${config.className}`}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Received",
    cell: (submission: ContactSubmission) => (
      <div className="flex flex-col">
        <span className="text-xs text-slate-600 font-semibold">{formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}</span>
        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
          {new Date(submission.createdAt).toLocaleDateString()}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    isAction: true,
    cell: (submission: ContactSubmission) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-45 rounded-xl border-slate-200">
          <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Entry ID: {submission._id.slice(-6)}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100" />
          <DropdownMenuItem onClick={() => onView(submission)} className="gap-2 font-medium cursor-pointer">
            <Eye className="h-4 w-4 text-slate-400" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange(submission, 'reviewed')} className="gap-2 font-medium cursor-pointer">
            <CheckCircle className="h-4 w-4 text-green-500" /> Mark Reviewed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onConvertToTicket(submission)} className="gap-2 font-medium cursor-pointer text-green-600">
            <Ticket className="h-4 w-4" /> Convert to Ticket
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-100" />
          <DropdownMenuItem onClick={() => onDelete(submission)} className="gap-2 font-medium text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
            <Trash2 className="h-4 w-4" /> Delete Submission
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
