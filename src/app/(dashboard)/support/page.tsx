"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Activity, 
  Filter, 
  RefreshCw,
  CheckCircle,
  XCircle,
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
    { label: "Open", value: tickets.filter(t => t.status === 'open').length, icon: AlertCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "In Progress", value: tickets.filter(t => t.status === 'in_progress').length, icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Resolved", value: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Avg Response", value: "2.4h", icon: Activity, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/30">
      {/* Header Section */}
      <div className="px-6 pt-6 pb-2 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <LifeBuoy className="h-6 w-6 text-indigo-600" />
              Support Tickets
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manage organization support requests and technical escalations.
            </p>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} disabled={loading} className="bg-white">
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
             </Button>
             <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                <Plus className="h-4 w-4 mr-1.5" />
                New Ticket
             </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-slate-200/60 shadow-sm h-18 overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-4 flex items-center justify-between h-full">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-bold text-slate-900 tracking-tight leading-none">{stat.value}</p>
                    </div>
                    <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm">
           <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                   placeholder="Search by ID or subject..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="pl-9 bg-slate-50/50 border-slate-200/60 focus-visible:ring-indigo-500 h-9 text-sm"
                />
              </div>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="flex items-center gap-2">
                 <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[130px] h-9 text-xs bg-slate-50/50 border-slate-200/60">
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
                    <SelectTrigger className="w-[130px] h-9 text-xs bg-slate-50/50 border-slate-200/60">
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
           <Button variant="ghost" size="sm" className="text-slate-500 h-9 px-3 gap-2">
              <Filter className="h-4 w-4" />
              More Filters
           </Button>
        </div>
      </div>

      {/* Content Table */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
         <Card className="h-full border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
            <DataTable 
               columns={columns as any}
               data={tickets}
               loading={loading}
               onRowClick={handleView}
            />
            
            <div className="px-5 py-3 border-t bg-slate-50/30 shrink-0">
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
         </Card>
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

