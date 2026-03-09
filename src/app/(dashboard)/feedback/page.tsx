"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Plus, 
  History,
  TrendingUp,
  Inbox,
  AlertTriangle,
  MailCheck,
  TrendingDown,
  Activity,
  User,
  Ticket,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useFetchData } from "@/hooks/use-fetch-data";
import { AdminService } from "@/services/admin.service";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { Pagination } from "@/components/ui-system/pagination";
import { getContactSubmissionColumns, ContactSubmission } from "./components/feedback-columns";
import { FeedbackDrawer } from "./components/feedback-drawer";

export default function FeedbackPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Conversion Modal State
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [assignedAdmin, setAssignedAdmin] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const fetchParams = useMemo(() => ({
    page,
    limit,
    search,
    type: type === "all" ? undefined : type,
    status: status === "all" ? undefined : status,
  }), [page, limit, search, type, status]);

  const {
    data: submissions,
    loading,
    totalItems,
    totalPages,
    refresh,
  } = useFetchData<ContactSubmission>(AdminService.getContactSubmissions, fetchParams, [refreshKey]);

  const handleView = useCallback((submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsDrawerOpen(true);
  }, []);

  const handleStatusChange = useCallback(async (submission: ContactSubmission, newStatus: string) => {
    try {
      await AdminService.updateContactSubmissionStatus(submission._id, newStatus);
      toast.success(`Submission marked as ${newStatus}`);
      refresh();
      if (selectedSubmission?._id === submission._id) {
          setIsDrawerOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  }, [refresh, selectedSubmission]);

  const handleConvertToTicket = useCallback((submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsTicketModalOpen(true);
  }, []);

  const processConversion = async () => {
    if (!selectedSubmission) return;
    setIsConverting(true);
    try {
      await AdminService.convertFeedbackToTicket(selectedSubmission._id, {
        priority: ticketPriority,
        assignedAdmin: assignedAdmin,
      });
      toast.success("Successfully converted to support ticket");
      setIsTicketModalOpen(false);
      refresh();
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDelete = useCallback(async (submission: ContactSubmission) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await AdminService.deleteContactSubmission(submission._id);
      toast.success("Submission deleted");
      refresh();
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error("Deletion failed");
    }
  }, [refresh]);

  const handleExport = async () => {
     try {
       const response = await fetch('/api/crm/admin/contact-submissions/export');
       const blob = await response.blob();
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `submissions_export_${Date.now()}.csv`;
       document.body.appendChild(a);
       a.click();
       window.URL.revokeObjectURL(url);
     } catch (err) {
       toast.error("Export failed");
     }
  };

  const columns = useMemo(() => getContactSubmissionColumns({
    onView: handleView,
    onStatusChange: handleStatusChange,
    onConvertToTicket: handleConvertToTicket,
    onDelete: handleDelete,
  }), [handleView, handleStatusChange, handleConvertToTicket, handleDelete]);

  const stats = [
    { label: "New Leads", value: submissions.filter(s => s.status === 'new').length, icon: Inbox, color: "text-emerald-500", bg: "bg-emerald-50", trend: "+12%" },
    { label: "Contact Requests", value: submissions.filter(s => s.type === 'contact').length, icon: Activity, color: "text-blue-500", bg: "bg-blue-50", trend: "+5%" },
    { label: "Bug Reports", value: submissions.filter(s => s.type === 'bug_report').length, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", trend: "-2%" },
    { label: "Responded", value: submissions.filter(s => s.status !== 'new').length, icon: MailCheck, color: "text-emerald-500", bg: "bg-emerald-50", trend: "86%" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/30 p-4 gap-4">
      {/* 1. Header Area - Compact */}
      <div className="flex items-center justify-between shrink-0 px-2">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Feedback & Contact Requests
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            Review and manage inbound leads and user reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} disabled={loading} className="h-8 bg-white border-slate-200 shadow-sm text-[10px] font-bold uppercase tracking-wider text-slate-600">
            <RefreshCw className={`h-3 w-3 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button size="sm" onClick={handleExport} className="h-8 bg-green-600 hover:bg-green-700 shadow-sm text-[10px] font-bold uppercase tracking-wider gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* 2. Stats Grid - Compact Single Row */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {stats.map((stat, i) => (
          <Card key={i} className="border-slate-200/60 shadow-sm h-16 transition-all hover:shadow-md group overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between h-full bg-white">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-lg font-bold text-slate-900 leading-none">{stat.value}</p>
                  <span className={`text-[9px] font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-slate-400'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. Combined Toolbar - Search + Filters in One Row */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200/60 shadow-sm shrink-0">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
          <Input 
            placeholder="Search submissions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50/50 border-transparent focus-visible:ring-green-500 h-9 text-sm rounded-lg font-medium w-full"
          />
        </div>
        
        <div className="flex items-center gap-1.5">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-32 h-9 text-[11px] bg-slate-50/50 border-slate-200/60 font-bold text-slate-600 rounded-lg">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200 shadow-xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="feature_request">Features</SelectItem>
              <SelectItem value="bug_report">Bugs</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-32 h-9 text-[11px] bg-slate-50/50 border-slate-200/60 font-bold text-slate-600 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200 shadow-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new" className="text-green-600 font-bold">New</SelectItem>
              <SelectItem value="reviewed" className="text-blue-600">Reviewed</SelectItem>
              <SelectItem value="resolved" className="text-slate-400">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" className="h-9 px-3 text-slate-500 gap-1.5 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" />
            More
          </Button>
        </div>
      </div>

      {/* 4. Main Table Area - Dominant Element */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex-1 overflow-auto relative custom-scrollbar">
          <DataTable 
            columns={columns as any}
            data={submissions}
            loading={loading}
            onRowClick={handleView}
            stickyHeader
          />
        </div>
        
        {/* Fixed Pagination at Bottom of Table Container */}
        <div className="px-4 py-3 border-t bg-slate-50/50 shrink-0">
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(Number(newLimit));
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Side Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md border-l border-slate-200 shadow-2xl">
           <SheetHeader className="sr-only">
              <SheetTitle>Submission Detail</SheetTitle>
              <SheetDescription>Examine user feedback or contact request details</SheetDescription>
           </SheetHeader>
           {selectedSubmission && (
              <FeedbackDrawer 
                 submission={selectedSubmission} 
                 onRefresh={refresh}
                 onClose={() => setIsDrawerOpen(false)}
                 onConvertToTicket={handleConvertToTicket}
                 onStatusChange={handleStatusChange}
                 onDelete={handleDelete}
              />
           )}
        </SheetContent>
      </Sheet>

      {/* Conversion Modal */}
      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent className="sm:max-w-md border-slate-200 rounded-2xl shadow-2xl">
            <DialogHeader className="items-center text-center">
                <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center mb-2">
                    <Ticket className="h-6 w-6 text-green-600" />
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900">Convert to Ticket</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500">
                    Transform this feedback into an active support ticket for tracking.
                </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
                <div className="space-y-2.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assignment Priority</Label>
                    <Select value={ticketPriority} onValueChange={setTicketPriority}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium" className="font-bold">Medium Priority</SelectItem>
                            <SelectItem value="high" className="text-amber-600 font-bold">High Priority</SelectItem>
                            <SelectItem value="urgent" className="text-red-600 font-bold">Urgent Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Internal Note (Optional)</Label>
                    <Input 
                        placeholder="e.g. Needs immediate review by API team"
                        disabled={isConverting}
                        className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-green-500"
                    />
                </div>
            </div>

            <DialogFooter className="sm:justify-between gap-3 mt-2">
                <Button 
                    variant="ghost" 
                    onClick={() => setIsTicketModalOpen(false)} 
                    className="flex-1 h-11 rounded-xl font-bold text-slate-500 uppercase tracking-widest text-xs"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={processConversion} 
                    disabled={isConverting}
                    className="flex-1 h-11 rounded-xl font-bold uppercase tracking-widest text-xs bg-green-600 hover:bg-green-700 shadow-md shadow-green-100"
                >
                    {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Ticket"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Separator({ orientation = "horizontal", className }: { orientation?: "horizontal" | "vertical", className?: string }) {
    if(orientation === "vertical") return <div className={`w-px bg-slate-200 ${className}`} />
    return <div className={`h-px bg-slate-100 ${className}`} />
}

