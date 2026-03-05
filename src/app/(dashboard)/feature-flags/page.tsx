"use client";

import { useState, useMemo, useCallback } from "react";
import { AdminService } from "@/services/admin.service";
import { Plus, ToggleLeft, Search, Filter, AlertCircle, Globe, Building2, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useFetchData } from "@/hooks/use-fetch-data";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { getFeatureFlagColumns, FeatureFlag } from "./flag-utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateFlagForm } from "./components/create-flag-form";

export default function FeatureFlagsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  const fetchParams = useMemo(
    () => ({
      page,
      limit,
      search,
    }),
    [page, limit, search]
  );

  const {
    data: flags,
    loading,
    totalItems,
    totalPages,
    refresh,
  } = useFetchData<FeatureFlag>(AdminService.getFeatureFlags, fetchParams, []);

  const handleEdit = useCallback((flag: FeatureFlag) => {
    setEditingFlag(flag);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (flag: FeatureFlag) => {
    if (!confirm(`Are you sure you want to delete ${flag.name}?`)) return;
    try {
      await AdminService.deleteFeatureFlag(flag._id);
      toast.success("Feature flag deleted");
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete flag");
    }
  }, [refresh]);

  const handleToggleGlobal = useCallback(async (flag: FeatureFlag) => {
    try {
      await AdminService.toggleGlobalFlag(flag._id, !flag.enabledGlobal);
      toast.success(`Global access ${!flag.enabledGlobal ? "enabled" : "disabled"}`);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle global status");
    }
  }, [refresh]);

  const handleManageOrgs = useCallback((flag: FeatureFlag) => {
    toast.info(`Manage organizations for: ${flag.name}`);
  }, []);

  const columns = useMemo(() => getFeatureFlagColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onToggleGlobal: handleToggleGlobal,
    onManageOrgs: handleManageOrgs,
  }), [handleEdit, handleDelete, handleToggleGlobal, handleManageOrgs]);

  const stats = [
    { label: "Active Flags", value: flags.length, icon: ToggleLeft, bg: "bg-indigo-50", color: "text-indigo-600" },
    { label: "Global", value: flags.filter(f => f.enabledGlobal).length, icon: Globe, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Per-Org", value: flags.filter(f => f.perOrganizationEnabled).length, icon: Building2, bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Total Orgs", value: "All Active", icon: ShieldCheck, bg: "bg-purple-50", color: "text-purple-600" },
  ];


  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden bg-slate-50/30">
        <div className="px-6 pt-6 shrink-0">
            <PageHeader
                title="Feature Flags"
                description="Manage global and organization-specific feature toggles for precise control."
                action={{
                    label: "Create Flag",
                    icon: Plus,
                    onClick: () => setIsModalOpen(true),
                }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-slate-200/60 shadow-sm h-20 transition-all hover:shadow-md">
                        <CardContent className="p-4 flex items-center justify-between h-full">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <p className="text-xl font-bold text-slate-900 tracking-tight leading-none pt-1">{stat.value}</p>
                            </div>
                            <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        <div className="px-6 shrink-0 mt-2">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 pl-2">
                    <Activity className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">All Toggles</span>
                </div>
                <div className="relative w-full sm:w-75">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search flags by key or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-50/50 border-slate-200/60 focus-visible:ring-emerald-500 focus:border-emerald-500 h-9"
                    />
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-hidden px-6 pb-4">
            <Card className="h-full border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
                <DataTable
                    columns={columns as any}
                    data={flags}
                    loading={loading}
                    onRowClick={() => {}}
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

        <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingFlag(null); // Reset when closing
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogTitle className="sr-only">
                    {editingFlag ? "Edit Feature Flag" : "Create New Flag"}
                </DialogTitle>
                <DialogHeader>
                    <DialogTitle>{editingFlag ? "Edit Feature Flag" : "Create New Flag"}</DialogTitle>
                    <DialogDescription>
                        {editingFlag 
                            ? "Update the configuration for this feature flag." 
                            : "Define a new feature flag to control system capabilities globally or per organization."}
                    </DialogDescription>
                </DialogHeader>
                <CreateFlagForm 
                    initialData={editingFlag}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setEditingFlag(null);
                        refresh();
                    }}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingFlag(null);
                    }}
                />
            </DialogContent>
        </Dialog>
    </div>
  );
}
