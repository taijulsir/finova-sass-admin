"use client";

import { 
  Zap, 
  X, 
  Copy, 
  Check, 
  Calendar, 
  Hash, 
  Tag, 
  Globe, 
  Code2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Activity,
  User 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { BillingEvent } from "./event-columns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EventDrawerProps {
  event: BillingEvent;
  onClose: () => void;
}

export const EventDrawer = ({ event, onClose }: EventDrawerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event.payload, null, 2));
    setCopied(true);
    toast.success("Payload copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    received: { icon: Clock, className: "bg-slate-100 text-slate-600 border-slate-200" },
    processing: { icon: Activity, className: "bg-blue-50 text-blue-600 border-blue-200" },
    processed: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    failed: { icon: XCircle, className: "bg-red-50 text-red-600 border-red-200" },
  }[event.status] || { icon: Clock, className: "" };

  const StatusIcon = statusConfig.icon;

  const metadata = [
    { label: "Event ID", value: event.eventId, icon: Hash },
    { label: "Provider", value: event.provider, icon: Globe, className: "capitalize" },
    { label: "Event Type", value: event.eventType, icon: Tag },
    { label: "Organization", value: event.organizationId?.name || "Global / System", icon: User },
    { label: "Reference ID", value: event.referenceId || "None", icon: Activity },
    { label: "Received At", value: format(new Date(event.receivedAt), 'PPP p'), icon: Calendar },
    { label: "Processed At", value: event.processedAt ? format(new Date(event.processedAt), 'PPP p') : "Not processed", icon: Clock },
  ];

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b shrink-0 bg-slate-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center p-2.5 shadow-sm border",
                event.provider === "stripe" ? "bg-blue-600 border-blue-700" : "bg-indigo-600 border-indigo-700"
            )}>
              <Zap className="h-full w-full text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight tracking-tight pr-10">Webhook Data</h2>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">{event.eventId}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 rounded-full absolute right-4 top-4 hover:bg-slate-200/50">
            <X className="h-4.5 w-4.5 text-slate-400" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
           <Badge variant="outline" className={cn("gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase", statusConfig.className)}>
             <StatusIcon className="h-3 w-3" />
             {event.status}
           </Badge>
           <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium border-slate-200 text-slate-500 bg-white">
             {formatDistanceToNow(new Date(event.receivedAt), { addSuffix: true })}
           </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-4">
          {metadata.map((item, i) => (
             <div key={i} className="flex justify-between items-start group">
                <div className="flex items-center gap-2.5 min-w-0">
                   <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-slate-400" />
                   </div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className={cn("text-[13px] font-semibold text-slate-700 text-right truncate pl-4", item.className)}>
                   {item.value}
                </span>
             </div>
          ))}
        </div>

        {/* Payload Viewer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-slate-400" />
                <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Raw Request Body</h3>
             </div>
             <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[10px] font-bold uppercase text-slate-500 hover:text-green-600 hover:bg-green-50"
                onClick={handleCopy}
             >
                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? "Copied" : "Copy Payload"}
             </Button>
          </div>
          
          <div className="relative rounded-2xl bg-slate-900 overflow-hidden group shadow-inner">
             <div className="absolute top-3 left-4 flex gap-1.5 opacity-40">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
             </div>
             <pre className="p-6 pt-10 text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto max-h-[60vh]">
               <code>{JSON.stringify(event.payload, null, 2)}</code>
             </pre>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-slate-50/50 shrink-0">
         <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full h-10 text-xs font-bold uppercase rounded-xl border-slate-200">
               Audit History
            </Button>
            <Button className="w-full h-10 text-xs font-bold uppercase rounded-xl bg-slate-900 hover:bg-slate-800 shadow-md">
               Retry Processing
            </Button>
         </div>
      </div>
    </div>
  );
};
