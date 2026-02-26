"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { AdminService } from "@/services/admin.service";
import { toast } from "sonner";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getSubscriptionColumns } from "./subscription-utils";
import { useSubscriptionHandlers } from "./subscription-helpers";
import { SubscriptionView } from "./components/subscription-view";
import { ChangePlanModal } from "./components/change-plan-modal";
import { ExtendTrialModal } from "./components/extend-trial-modal";
import { CancelModal } from "./components/cancel-modal";
import { ReactivateModal } from "./components/reactivate-modal";
import { useFetchData } from "@/hooks/use-fetch-data";
import { SubscriptionKpi, SubscriptionRow } from "@/types/subscription";
import {
  TbCheck,
  TbClock,
  TbX,
  TbAlertTriangle,
  TbCurrencyDollar,
  TbRefresh,
  TbSearch,
  TbFilter,
  TbFilterOff,
} from "react-icons/tb";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
  loading?: boolean;
  sub?: string;
}

function KpiCard({ title, value, icon, accent = "text-primary", loading, sub }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {loading ? <Skeleton className="h-4 w-28" /> : (
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        )}
        <div className={`${accent} opacity-70`}>{icon}</div>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          <><Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-16 mt-1" /></>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [kpis, setKpis] = useState<SubscriptionKpi | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [billingFilter, setBillingFilter] = useState<string>("");
  const [providerFilter, setProviderFilter] = useState<string>("");
  const [trialEndingSoon, setTrialEndingSoon] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  const hasFilters = Boolean(statusFilter || planFilter || billingFilter || providerFilter || trialEndingSoon || search);

  useEffect(() => {
    setKpisLoading(true);
    AdminService.getSubscriptionKpis()
      .then((res) => setKpis(res.data?.kpis ?? res.data ?? null))
      .catch(() => {})
      .finally(() => setKpisLoading(false));
  }, []);

  useEffect(() => {
    AdminService.getPlans({ page: 1, limit: 50 }).then((res) => setPlans(res.data || [])).catch(() => {});
  }, []);

  const fetchParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: statusFilter || undefined,
      planId: planFilter || undefined,
      billingCycle: billingFilter || undefined,
      paymentProvider: providerFilter || undefined,
      trialEndingSoon: trialEndingSoon || undefined,
    }),
    [page, limit, search, statusFilter, planFilter, billingFilter, providerFilter, trialEndingSoon]
  );

  const {
    data: subscriptionsRaw,
    loading,
    totalItems,
    totalPages,
    refresh,
  } = useFetchData<SubscriptionRow>(AdminService.getSubscriptions, fetchParams, []);

  const subscriptions: SubscriptionRow[] = subscriptionsRaw as SubscriptionRow[];

  const {
    viewDrawer, closeViewDrawer,
    changePlanModal, closeChangePlan,
    extendTrialModal, closeExtendTrial,
    cancelModal, closeCancel,
    reactivateModal, closeReactivate,
    handleViewSubscription,
    handleChangePlan,
    handleExtendTrial,
    handleCancel,
    handleReactivate,
    handleForceExpire,
    onActionSuccess,
  } = useSubscriptionHandlers(refresh);

  const handleSuccess = useCallback((msg: string) => {
    onActionSuccess(msg);
  }, [onActionSuccess]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPlanFilter("");
    setBillingFilter("");
    setProviderFilter("");
    setTrialEndingSoon(false);
    setPage(1);
  };

  const columns = useMemo(
    () =>
      getSubscriptionColumns({
        onView: handleViewSubscription,
        onChangePlan: handleChangePlan,
        onExtendTrial: handleExtendTrial,
        onCancel: handleCancel,
        onReactivate: handleReactivate,
        onForceExpire: handleForceExpire,
      }),
    [handleViewSubscription, handleChangePlan, handleExtendTrial, handleCancel, handleReactivate, handleForceExpire]
  );

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Subscriptions"
          description="Manage all organization subscriptions, billing cycles, and plan transitions."
        />
      </div>

      {/* KPI Cards */}
      <div className="px-6 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Active"
            value={kpis?.active ?? 0}
            icon={<TbCheck className="h-5 w-5" />}
            accent="text-emerald-600"
            loading={kpisLoading}
            sub="live subscriptions"
          />
          <KpiCard
            title="Trial"
            value={kpis?.trial ?? 0}
            icon={<TbClock className="h-5 w-5" />}
            accent="text-blue-600"
            loading={kpisLoading}
            sub="in trial period"
          />
          <KpiCard
            title="Past Due"
            value={kpis?.pastDue ?? 0}
            icon={<TbAlertTriangle className="h-5 w-5" />}
            accent="text-amber-600"
            loading={kpisLoading}
            sub="need attention"
          />
          <KpiCard
            title="Expired"
            value={kpis?.expired ?? 0}
            icon={<TbX className="h-5 w-5" />}
            accent="text-gray-500"
            loading={kpisLoading}
            sub="lapsed subscriptions"
          />
          <KpiCard
            title="Cancelled"
            value={kpis?.canceled ?? 0}
            icon={<TbX className="h-5 w-5" />}
            accent="text-red-600"
            loading={kpisLoading}
            sub="churned"
          />
          <KpiCard
            title="MRR"
            value={kpis ? `$${kpis.mrr.toLocaleString()}` : "$0"}
            icon={<TbCurrencyDollar className="h-5 w-5" />}
            accent="text-primary"
            loading={kpisLoading}
            sub="monthly recurring revenue"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-52 max-w-xs">
            <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search organization..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>

          {/* Status */}
          <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="TRIAL">Trial</SelectItem>
              <SelectItem value="PAST_DUE">Past Due</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="CANCELED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Plan */}
          <Select value={planFilter || "all"} onValueChange={(v) => { setPlanFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {plans.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Billing cycle */}
          <Select value={billingFilter || "all"} onValueChange={(v) => { setBillingFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Billing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cycles</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Provider */}
          <Select value={providerFilter || "all"} onValueChange={(v) => { setProviderFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              <SelectItem value="STRIPE">Stripe</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="PAYPAL">PayPal</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Trial ending soon toggle */}
          <Button
            variant={trialEndingSoon ? "default" : "outline"}
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => { setTrialEndingSoon(!trialEndingSoon); setPage(1); }}
          >
            <TbClock className="h-4 w-4" />
            Trial ending soon
          </Button>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <TbFilterOff className="h-4 w-4" /> Clear
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={refresh} className="ml-auto shrink-0" title="Refresh">
            <TbRefresh className="h-4 w-4" />
          </Button>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {statusFilter && <Badge variant="secondary" className="text-xs gap-1">{statusFilter} <button onClick={() => setStatusFilter("")}>×</button></Badge>}
            {planFilter && <Badge variant="secondary" className="text-xs gap-1">Plan filter <button onClick={() => setPlanFilter("")}>×</button></Badge>}
            {billingFilter && <Badge variant="secondary" className="text-xs gap-1">{billingFilter} <button onClick={() => setBillingFilter("")}>×</button></Badge>}
            {providerFilter && <Badge variant="secondary" className="text-xs gap-1">{providerFilter} <button onClick={() => setProviderFilter("")}>×</button></Badge>}
            {trialEndingSoon && <Badge variant="secondary" className="text-xs gap-1">Trial ending soon <button onClick={() => setTrialEndingSoon(false)}>×</button></Badge>}
            {search && <Badge variant="secondary" className="text-xs gap-1">&ldquo;{search}&rdquo; <button onClick={() => setSearch("")}>×</button></Badge>}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden px-6">
        <DataTable
          columns={columns as any}
          data={subscriptions}
          loading={loading}
          onRowClick={handleViewSubscription}
        />
      </div>

      {/* Pagination */}
      <div className="px-6 pb-6 pt-2 border-t mt-auto shrink-0 bg-background/80 backdrop-blur-sm z-20">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
          itemName="subscriptions"
        />
      </div>

      {/* ── Modals & Drawer ─────────────────────────────────────────────────── */}

      <SubscriptionView
        subscription={viewDrawer.target}
        isOpen={viewDrawer.isOpen}
        onClose={closeViewDrawer}
        onChangePlan={handleChangePlan}
        onExtendTrial={handleExtendTrial}
        onCancel={handleCancel}
        onReactivate={handleReactivate}
        onForceExpire={handleForceExpire}
      />

      <ChangePlanModal
        subscription={changePlanModal.target}
        isOpen={changePlanModal.isOpen}
        onClose={closeChangePlan}
        onSuccess={() => handleSuccess("Plan changed successfully")}
      />

      <ExtendTrialModal
        subscription={extendTrialModal.target}
        isOpen={extendTrialModal.isOpen}
        onClose={closeExtendTrial}
        onSuccess={() => handleSuccess("Trial extended successfully")}
      />

      <CancelModal
        subscription={cancelModal.target}
        isOpen={cancelModal.isOpen}
        onClose={closeCancel}
        onSuccess={() => handleSuccess("Subscription cancelled")}
      />

      <ReactivateModal
        subscription={reactivateModal.target}
        isOpen={reactivateModal.isOpen}
        onClose={closeReactivate}
        onSuccess={() => handleSuccess("Subscription reactivated")}
      />
    </div>
  );
}
