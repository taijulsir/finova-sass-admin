"use client";

import { useState, useMemo, useEffect } from "react";
import { AdminService } from "@/services/admin.service";
import { Plus, Tag, TrendingUp, Users, DollarSign, Activity, Search, AlertCircle } from "lucide-react";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useFetchData } from "@/hooks/use-fetch-data";
import { ICoupon, CouponAnalytics } from "@/types/subscription";
import { getCouponColumns } from "./coupon-utils";
import { useCouponHandlers } from "./coupon-helpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateCouponForm } from "./components/create-coupon-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [summary, setSummary] = useState<CouponAnalytics | null>(null);

  const fetchParams = useMemo(
    () => ({
      page,
      limit,
      search,
      ...(activeTab === "active" ? { active: true } : activeTab === "archived" ? { active: false } : {}),
    }),
    [page, limit, search, activeTab]
  );

  const {
    data: coupons,
    loading,
    totalItems,
    totalPages,
    refresh,
  } = useFetchData<ICoupon>(AdminService.getCoupons, fetchParams, [activeTab]);

  const {
    handleViewCoupon,
    handleEditCoupon,
    handleDeleteCoupon,
    handleToggleCoupon,
    isCreateModalOpen,
    setIsCreateModalOpen,
  } = useCouponHandlers(refresh);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await AdminService.getCouponSummary();
        // AdminService methods return axios.data (which often contains { success, data, meta })
        // Normalize to accept either the direct payload or { data: payload }
        setSummary(res?.data ?? res ?? null);
      } catch (error) {
        console.error("Failed to fetch coupon summary", error);
      }
    };
    fetchSummary();
  }, [coupons]);

  const columns = useMemo(
    () =>
      getCouponColumns({
        onView: handleViewCoupon,
        onEdit: handleEditCoupon,
        onDelete: handleDeleteCoupon,
        onToggle: handleToggleCoupon,
      }),
    [handleViewCoupon, handleEditCoupon, handleDeleteCoupon, handleToggleCoupon]
  );

  const stats = [
    { label: "Active", value: summary?.activeCoupons ?? 0, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Use Count", value: summary?.totalRedemptions ?? 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Savings", value: `$${summary?.totalDiscountGiven ?? 0}`, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Impact", value: "High", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden bg-slate-50/30">
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Coupons & Promotions"
          description="Create and manage discount codes for marketing campaigns."
          action={{
            label: "Create Coupon",
            icon: Plus,
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-slate-200/60 shadow-sm transition-all hover:shadow-md h-20">
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

      <div className="px-6 shrink-0 mt-2 mb-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-slate-100/50 border-none p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">All</TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Active</TabsTrigger>
              <TabsTrigger value="archived" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Paused</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-75">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by coupon code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-slate-50/50 border-slate-200/60 focus-visible:ring-emerald-500 focus:border-emerald-500 h-9"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <Card className="h-full border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {totalItems === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <Tag className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No coupons created yet</h3>
                <p className="text-slate-500 max-w-xs mt-1 mb-6">Create your first coupon to start offering discounts to your customers.</p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Create Coupon
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns as any}
                data={coupons}
                loading={loading}
                onRowClick={handleViewCoupon}
              />
            )}
          </div>
          
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

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>
              Set up a discount code to promote your subscription plans.
            </DialogDescription>
          </DialogHeader>
          <CreateCouponForm 
            onSuccess={() => {
              setIsCreateModalOpen(false);
              refresh();
            }} 
            onCancel={() => setIsCreateModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
