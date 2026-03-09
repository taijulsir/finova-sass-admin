"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  Zap, 
  Search, 
  RefreshCw, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Filter,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { useFetchData } from "@/hooks/use-fetch-data";
import { AdminService } from "@/services/admin.service";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { Pagination } from "@/components/ui-system/pagination";
import { getBillingEventColumns, BillingEvent } from "./components/event-columns";
import { EventDrawer } from "./components/event-drawer";
import { cn } from "@/lib/utils";

export default function BillingEventsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<BillingEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchParams = useMemo(() => ({
    page,
    limit,
    search,
    provider: provider === "all" ? undefined : provider,
    status: status === "all" ? undefined : status,
  }), [page, limit, search, provider, status]);

  const {
    data: events,
    loading,
    totalItems,
    totalPages,
    refresh,
  } = useFetchData<BillingEvent>(AdminService.getBillingEvents, fetchParams, [refreshKey]);

  const handleView = useCallback((event: BillingEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  }, []);

  const columns = useMemo(() => getBillingEventColumns({
    onView: handleView,
  }), [handleView]);

  console.log("Fetched events:", events);

  const stats = [
    { label: "Total Processing", value: totalItems, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Failed Webhooks", value: events.filter(e => e.status === 'failed').length, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Avg Execution", value: "840ms", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Success Rate", value: "98.2%", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white/50">
      {/* Header Section */}
      <div className="px-6 py-4 border-b bg-white shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-center p-2 shadow-sm">
              <Zap className="h-full w-full text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none font-display">
                Billing Events
              </h1>
              <p className="text-[11px] text-slate-500 mt-1 font-medium italic">
                Real-time monitor for webhooks, payments, and billing triggers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} disabled={loading} className="h-8 text-xs rounded-xl shadow-sm">
                <RefreshCw className={cn("h-3 w-3 mr-1.5", loading && "animate-spin")} />
                Refresh Logs
             </Button>
             <Button size="sm" className="h-8 text-xs bg-slate-900 border-none hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-95 group">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5 group-hover:rotate-12 transition-transform" />
                Live Feed
             </Button>
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 px-1 border-r border-slate-100 last:border-none">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate leading-none mb-1">{stat.label}</p>
                    <p className="text-base font-bold text-slate-900 tracking-tight leading-none font-display">{stat.value}</p>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="px-6 py-3 shrink-0 border-b bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
                placeholder="Search by Event ID or Reference..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-[13px] bg-white border-slate-200 focus-visible:ring-blue-600 transition-all shadow-sm rounded-xl"
            />
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-32 h-8 text-[11px] bg-white border-slate-200 focus:ring-blue-600 rounded-xl shadow-sm">
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="stripe" className="text-xs">Stripe</SelectItem>
                <SelectItem value="paypal" className="text-xs">PayPal</SelectItem>
                <SelectItem value="manual" className="text-xs">Manual Entry</SelectItem>
                <SelectItem value="system" className="text-xs">System Task</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32 h-8 text-[11px] bg-white border-slate-200 focus:ring-blue-600 rounded-xl shadow-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received" className="text-xs text-slate-500">Received</SelectItem>
                <SelectItem value="processing" className="text-xs text-blue-500 font-medium">Processing</SelectItem>
                <SelectItem value="processed" className="text-xs text-green-600 font-medium">Processed</SelectItem>
                <SelectItem value="failed" className="text-xs text-red-500 font-medium">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-xl">
               <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full flex flex-col">
            {events.length === 0 && !loading ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center space-y-4 max-w-sm">
                  <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto shadow-sm">
                    <Zap className="h-8 w-8 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 font-display">No billing events yet</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Webhook events from Stripe, PayPal and other providers will appear here as they are received.
                    </p>
                  </div>
                  <Button variant="outline" className="h-9 px-6 text-xs font-bold rounded-xl" onClick={() => setRefreshKey(k => k + 1)}>
                    Refresh Monitor
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <DataTable 
                   columns={columns as any}
                   data={events}
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
              </>
            )}
        </div>
      </div>

      {/* Event Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-[520px] border-l border-slate-100 shadow-2xl">
           <SheetHeader className="sr-only">
              <SheetTitle>Event Details</SheetTitle>
              <SheetDescription>Inspect full webhook payload and processing logs</SheetDescription>
           </SheetHeader>
           {selectedEvent && (
              <EventDrawer 
                 event={selectedEvent} 
                 onClose={() => setIsDrawerOpen(false)}
              />
           )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
