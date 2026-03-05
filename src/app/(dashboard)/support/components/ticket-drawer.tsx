"use client";

import { useEffect, useState, useRef } from "react";
import { AdminService } from "@/services/admin.service";
import { formatDistanceToNow } from "date-fns";
import { 
  Send, 
  Paperclip, 
  MessageSquare, 
  User, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  MoreVertical,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface TicketMessage {
  _id: string;
  senderType: 'admin' | 'organization';
  senderId: {
     _id: string;
     name: string;
     email: string;
     avatar?: string;
  };
  message: string;
  createdAt: string;
}

interface TicketDrawerProps {
  ticket: any;
  onRefresh: () => void;
  onClose: () => void;
}

export function TicketDrawer({ ticket, onRefresh, onClose }: TicketDrawerProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticket?._id) {
       fetchMessages();
    }
  }, [ticket?._id]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getSupportTicketMessages(ticket._id);
      setMessages(res.data);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      await AdminService.replyToSupportTicket(ticket._id, replyText);
      setReplyText("");
      await fetchMessages();
      onRefresh();
    } catch (err) {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await AdminService.updateSupportTicketStatus(ticket._id, newStatus);
      toast.success(`Ticket marked as ${newStatus}`);
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const priorityColors = {
    low: "bg-slate-100 text-slate-600 border-slate-200",
    medium: "bg-blue-50 text-blue-600 border-blue-200",
    high: "bg-amber-50 text-amber-600 border-amber-200",
    urgent: "bg-red-50 text-red-600 border-red-200",
  };

  const statusIcons = {
    open: AlertCircle,
    in_progress: Clock,
    resolved: CheckCircle,
    closed: XCircle,
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b shrink-0 bg-slate-50/50">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {ticket.ticketId}
              </span>
              <Badge variant="outline" className={`text-[10px] ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
                {ticket.priority?.toUpperCase()}
              </Badge>
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              {ticket.subject}
            </h2>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange('resolved')} className="text-emerald-600">
                    Mark Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                    Close Ticket
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                    Move to In Progress
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building className="h-3.5 w-3.5" />
            <span className="font-medium truncate max-w-[120px]">{ticket.organizationId?.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 border-l pl-4">
            <User className="h-3.5 w-3.5" />
            <span className="font-medium truncate max-w-[100px]">{ticket.assignedAdmin?.name || "Unassigned"}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-slate-50/20">
        <div ref={scrollRef} className="p-4 h-full flex flex-col gap-4">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Original Ticket</p>
            <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
          </div>

          <Separator className="my-2 opacity-50" />

          {loading ? (
             <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                <p className="text-xs font-medium text-slate-400">Loading conversation...</p>
             </div>
          ) : messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-10 opacity-50">
               <MessageSquare className="h-8 w-8 text-slate-300 mb-2" />
               <p className="text-xs text-slate-500 font-medium italic">No replies yet</p>
             </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.senderType === 'admin';
              return (
                <div key={msg._id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-7 w-7 border-2 border-white shadow-sm shrink-0">
                      <AvatarImage src={msg.senderId?.avatar} />
                      <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">
                        {msg.senderId?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <div className={`p-3 rounded-2xl shadow-sm border ${
                        isAdmin 
                          ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' 
                          : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'
                      }`}>
                        <p className="text-xs leading-relaxed antialiased">{msg.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium px-1">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="p-4 border-t bg-white shrink-0">
        <div className="relative">
          <Input 
            placeholder="Type your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            className="pr-20 py-6 bg-slate-50/50 border-slate-200/60 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
                size="icon" 
                className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center font-medium italic">
          Press Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
