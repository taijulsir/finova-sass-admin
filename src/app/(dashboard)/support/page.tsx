"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Activity, 
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useFetchData } from "@/hooks/use-fetch-data";
import { AdminService } from "@/services/admin.service";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { Pagination } from "@/components/ui-system/pagination";
import { getSupportTicketColumns, SupportTicket } from "./components/ticket-columns";
import { TicketDrawer } from "./components/ticket-drawer";

export default function SupportTicketsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchParams = useMemo(() => ({
    page,
    limit,
    search,
    status: status === "all" ? undefined : status,
    priority: priority === "all" ? undefined : priority,
  }), [page, limit, search, status, priority]);

  const {
    data: tickets,
    loading,
    totalItems,
    totalPages,
    refresh,
  } = useFetchData<SupportTicket>(AdminService.getSupportTickets, fetchParams, [refreshKey]);

  const handleView = useCallback((ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDrawerOpen(true);
  }, []);

  const handleStatusChange = useCallback(async (ticket: SupportTicket, newStatus: string) => {
    try {
      await AdminService.updateSupportTicketStatus(ticket._id, newStatus);
      toast.success(`Ticket ${ticket.ticketId} marked as ${newStatus}`);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  }, [refresh]);

  const handleAssign = useCallback((ticket: SupportTicket) => {
    toast.info("Admin assignment modal coming soon");
    // TODO: Implement Admin Selection Modal
  }, []);

  const columns = useMemo(() => getSupportTicketColumns({
    onView: handleView,
    onAssign: handleAssign,
    onStatusChange: handleStatusChange,
  }), [handleView, handleAssign, handleStatusChange]);

  const stats = [
    { label: "Open Tickets", value: tickets.filter(t => t.status === 'open').length, icon: AlertCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "High Priority", value: tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length, icon: Activity, color: "text-red-600", bg: "bg-red-50" },
    { label: "In Progress", value: tickets.filter(t => t.status === 'in_progress').length, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Resolved Tonight", value: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white/50">
      {/* Header Section */}
      <div className="px-6 py-4 border-b bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-600/10 flex items-center justify-center">
              <LifeBuoy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Support Tickets
              </h1>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Manage organization support requests and technical escalations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} disabled={loading} className="h-8 text-xs">
                <RefreshCw className={`h-3 w-3 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
             </Button>
             <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 shadow-sm transition-all active:scale-95">
                <Plus className="h-3.5 w-3.5 mr-1" />
                New Ticket
             </Button>
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 px-1">
                <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate leading-none mb-1">{stat.label}</p>
                    <p className="text-base font-bold text-slate-900 tracking-tight leading-none">{stat.value}</p>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="px-6 py-3 shrink-0 border-b bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
            <Input 
                placeholder="Search by ID or subject..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-[13px] bg-white border-slate-200 focus-visible:ring-green-600 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[120px] h-8 text-xs bg-white border-slate-200 focus:ring-green-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[120px] h-8 text-xs bg-white border-slate-200 focus:ring-green-600">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
            <DataTable 
               columns={columns as any}
               data={tickets}
               loading={loading}
               onRowClick={handleView}
            />
            
            <div className="px-6 py-3 border-t bg-white shrink-0">
               <Pagination 
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={(newLimit) => {
                     setLimit(newLimit);
                     setPage(1);
                  }}
               />
            </div>
        </div>
      </div>

      {/* Ticket Detail Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-[480px] border-l border-slate-200 shadow-2xl">
           <SheetHeader className="sr-only">
              <SheetTitle>Ticket Detail</SheetTitle>
              <SheetDescription>View and manage support ticket conversation</SheetDescription>
           </SheetHeader>
           {selectedTicket && (
              <TicketDrawer 
                 ticket={selectedTicket} 
                 onRefresh={refresh}
                 onClose={() => setIsDrawerOpen(false)}
              />
           )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Separator({ orientation = "horizontal", className }: { orientation?: "horizontal" | "vertical", className?: string }) {
    if(orientation === "vertical") return <div className={`w-[1px] bg-slate-200 ${className}`} />
    return <div className={`h-[1px] bg-slate-200 ${className}`} />
}

