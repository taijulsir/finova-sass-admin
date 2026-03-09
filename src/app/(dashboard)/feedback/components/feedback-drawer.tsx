"use client";

import { 
  Building, 
  User, 
  Mail, 
  Tag, 
  Clock, 
  Globe, 
  MessageSquare,
  Ticket,
  CheckCircle,
  MoreVertical,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface SubmissionDrawerProps {
  submission: any;
  onRefresh: () => void;
  onClose: () => void;
  onConvertToTicket: (submission: any) => void;
  onStatusChange: (submission: any, status: string) => void;
  onDelete: (submission: any) => void;
}

export function FeedbackDrawer({ 
    submission, 
    onRefresh, 
    onClose, 
    onConvertToTicket, 
    onStatusChange,
    onDelete 
}: SubmissionDrawerProps) {
  
  const typeConfig = {
    contact: { label: "Contact", color: "bg-blue-50 text-blue-600 border-blue-200" },
    feedback: { label: "Feedback", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    feature_request: { label: "Feature Request", color: "bg-purple-50 text-purple-600 border-purple-200" },
    bug_report: { label: "Bug Report", color: "bg-red-50 text-red-600 border-red-200" },
  }[submission.type as string] || { label: submission.type, color: "" };

  const sourceConfig = {
    landing_page: { label: "Landing Page", color: "text-emerald-600" },
    dashboard: { label: "Dashboard", color: "text-blue-600" },
  }[submission.source as string] || { label: submission.source, color: "" };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Area */}
      <div className="p-5 border-b shrink-0 bg-slate-50/50">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] px-2 h-5 font-bold ${typeConfig.color}`}>
                {typeConfig.label.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-2 h-5 font-bold bg-white text-slate-500 border-slate-200 uppercase tracking-widest">
                {submission.status.toUpperCase()}
              </Badge>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
              {submission.subject}
            </h2>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem onClick={() => onStatusChange(submission, 'reviewed')} className="gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-green-500" /> Mark Reviewed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConvertToTicket(submission)} className="gap-2 font-medium text-green-600">
                    <Ticket className="h-4 w-4" /> Convert to Ticket
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem onClick={() => onDelete(submission)} className="gap-2 font-medium text-red-600 focus:text-red-600 focus:bg-red-50">
                    <Trash2 className="h-4 w-4" /> Delete Submission
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <span className={sourceConfig.color}>{sourceConfig.label}</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Submittor Info Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
               <div className="h-1 bg-emerald-500 w-4 rounded-full" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submittor Details</p>
             </div>
             
             <div className="grid gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
                      <User className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 leading-none">{submission.name}</span>
                        <span className="text-[11px] text-slate-500 mt-1">{submission.email}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Email Address</p>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                         <Mail className="h-3 w-3" />
                         {submission.email}
                      </div>
                   </div>
                   {submission.company && (
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Company</p>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <Building className="h-3 w-3" />
                            {submission.company}
                        </div>
                    </div>
                   )}
                </div>
             </div>
          </section>

          {/* Submission Message Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
               <div className="h-1 bg-green-500 w-4 rounded-full" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message Content</p>
             </div>

             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageSquare className="h-4 w-4 text-slate-200" />
                 </div>
                 <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {submission.message}
                 </p>
             </div>
          </section>

          {/* Metadata/Advanced Info */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
               <div className="h-1 bg-slate-300 w-4 rounded-full" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadata</p>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/30">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Internal ID</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate font-semibold">{submission._id}</p>
                 </div>
                 <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/30">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">IP Address</p>
                    <p className="text-[10px] font-mono text-slate-500 font-semibold">{submission.ipAddress || "Unknown"}</p>
                 </div>
             </div>
          </section>
        </div>
      </ScrollArea>

      {/* Footer Actions Area */}
      <div className="p-4 border-t bg-white shrink-0">
        <div className="grid grid-cols-2 gap-3">
           <Button 
                variant="outline" 
                className="gap-2 h-10 font-bold text-xs uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                onClick={() => onStatusChange(submission, 'resolved')}
                disabled={submission.status === 'resolved'}
            >
              <CheckCircle className="h-4 w-4 text-green-600" /> Mark Resolved
           </Button>
           <Button 
                className="gap-2 h-10 font-bold text-xs uppercase tracking-widest bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 active:scale-95 transition-all text-white"
                onClick={() => onConvertToTicket(submission)}
            >
              <Ticket className="h-4 w-4" /> Convert To Ticket
           </Button>
        </div>
      </div>
    </div>
  );
}
