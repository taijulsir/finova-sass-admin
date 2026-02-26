"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { AdminService } from "@/services/admin.service";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
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
import { Separator } from "@/components/ui/separator";
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
  TbFilterOff,
  TbTable,
  TbChartBar,
} from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ── Compact stat pill ────────────────────────────────────────────────────────

interface StatPillProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  dotColor: string;
  active?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

function StatPill({ label, value, icon, accent, dotColor, active, loading, onClick }: StatPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md border text-left transition-all shrink-0",
        "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        active
          ? "bg-muted border-border shadow-none"
          : "bg-background border-border/60"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      <span className="text-xs text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className="h-4 w-8" />
      ) : (
        <span className={cn("text-sm font-semibold tabular-nums", accent)}>{value}</span>
      )}
    </button>
  );
}

// ── Analytics view metric card ───────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  loading?: boolean;
}

function MetricCard({ title, value, sub, icon, accent, loading }: MetricCardProps) {
  return (
    <Card className="flex-1 min-w-36">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4">
        {loading ? <Skeleton className="h-3.5 w-20" /> : (
          <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        )}
        <div className={cn("opacity-60", accent)}>{icon}</div>
      </CardHeader>
      <CardContent className="pb-3 px-4 space-y-0.5">
        {loading ? (
          <><Skeleton className="h-7 w-16" /><Skeleton className="h-3 w-12 mt-1" /></>
        ) : (
          <>
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground">{sub}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [limit, setLimit]             = useState(10);
  const [kpis, setKpis]               = useState<SubscriptionKpi | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [viewMode, setViewMode]       = useState<"compact" | "analytics">("compact");

  // Filters
  const [statusFilter,    setStatusFilter]    = useState<string>("");
  const [planFilter,      setPlanFilter]      = useState<string>("");
  const [billingFilter,   setBillingFilter]   = useState<string>("");
  const [providerFilter,  setProviderFilter]  = useState<string>("");
  const [trialEndingSoon, setTrialEndingSoon] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  const hasFilters = Boolean(
    statusFilter || planFilter || billingFilter || providerFilter || trialEndingSoon || search
  );

  useEffect(() => {
    setKpisLoading(true);
    AdminService.getSubscriptionKpis()
      .then((res) => setKpis(res.data?.kpis ?? res.data ?? null))
      .catch(() => {})
      .finally(() => setKpisLoading(false));
  }, []);

  useEffect(() => {
    AdminService.getPlans({ page: 1, limit: 50 })
      .then((res) => setPlans(res.data || []))
      .catch(() => {});
  }, []);

  const fetchParams = useMemo(
    () => ({
      page,
      limit,
      search:          search || undefined,
      status:          statusFilter || undefined,
      planId:          planFilter || undefined,
      billingCycle:    billingFilter || undefined,
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
    viewDrawer,       closeViewDrawer,
    changePlanModal,  closeChangePlan,
    extendTrialModal, closeExtendTrial,
    cancelModal,      closeCancel,
    reactivateModal,  closeReactivate,
    handleViewSubscription,
    handleChangePlan,
    handleExtendTrial,
    handleCancel,
    handleReactivate,
    handleForceExpire,
    onActionSuccess,
  } = useSubscriptionHandlers(refresh);

  const handleSuccess = useCallback(
    (msg: string) => onActionSuccess(msg),
    [onActionSuccess]
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPlanFilter("");
    setBillingFilter("");
    setProviderFilter("");
    setTrialEndingSoon(false);
    setPage(1);
  };

  // Clicking a stat pill applies the matching status filter (toggle)
  const handleStatClick = (status: string) => {
    setStatusFilter((prev) => (prev === status ? "" : status));
    setPage(1);
  };

  const columns = useMemo(
    () =>
      getSubscriptionColumns({
        onView:        handleViewSubscription,
        onChangePlan:  handleChangePlan,
        onExtendTrial: handleExtendTrial,
        onCancel:      handleCancel,
        onReactivate:  handleReactivate,
        onForceExpire: handleForceExpire,
      }),
    [handleViewSubscription, handleChangePlan, handleExtendTrial, handleCancel, handleReactivate, handleForceExpire]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Compact Header ──────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

          {/* Title */}
          <div className="shrink-0">
            <h1 className="text-lg font-semibold tracking-tight leading-none">Subscriptions</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage billing cycles, plan transitions and lifecycle.
            </p>
          </div>

          {/* Stat pills row */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <StatPill
              label="Active"
              value={kpis?.active ?? 0}
              icon={<TbCheck className="h-3.5 w-3.5" />}
              accent="text-emerald-600 dark:text-emerald-400"
              dotColor="bg-emerald-500"
              active={statusFilter === "ACTIVE"}
              loading={kpisLoading}
              onClick={() => handleStatClick("ACTIVE")}
            />
            <StatPill
              label="Trial"
              value={kpis?.trial ?? 0}
              icon={<TbClock className="h-3.5 w-3.5" />}
              accent="text-blue-600 dark:text-blue-400"
              dotColor="bg-blue-500"
              active={statusFilter === "TRIAL"}
              loading={kpisLoading}
              onClick={() => handleStatClick("TRIAL")}
            />
            <StatPill
              label="Past Due"
              value={kpis?.pastDue ?? 0}
              icon={<TbAlertTriangle className="h-3.5 w-3.5" />}
              accent="text-amber-600 dark:text-amber-400"
              dotColor="bg-amber-500"
              active={statusFilter === "PAST_DUE"}
              loading={kpisLoading}
              onClick={() => handleStatClick("PAST_DUE")}
            />
            <StatPill
              label="Expired"
              value={kpis?.expired ?? 0}
              icon={<TbX className="h-3.5 w-3.5" />}
              accent="text-muted-foreground"
              dotColor="bg-gray-400"
              active={statusFilter === "EXPIRED"}
              loading={kpisLoading}
              onClick={() => handleStatClick("EXPIRED")}
            />
            <StatPill
              label="Cancelled"
              value={kpis?.canceled ?? 0}
              icon={<TbX className="h-3.5 w-3.5" />}
              accent="text-red-600 dark:text-red-400"
              dotColor="bg-red-500"
              active={statusFilter === "CANCELED"}
              loading={kpisLoading}
              onClick={() => handleStatClick("CANCELED")}
            />

            {/* Divider */}
            <span className="hidden sm:block h-5 w-px bg-border mx-0.5" />

            <StatPill
              label="MRR"
              value={kpis ? `$${kpis.mrr.toLocaleString()}` : "$0"}
              icon={<TbCurrencyDollar className="h-3.5 w-3.5" />}
              accent="text-primary"
              dotColor="bg-primary"
              loading={kpisLoading}
            />

            {/* View toggle */}
            <span className="hidden sm:block h-5 w-px bg-border mx-0.5" />
            <div className="flex items-center rounded-md border bg-background overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors",
                  viewMode === "compact"
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TbTable className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Compact</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("analytics")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-xs border-l transition-colors",
                  viewMode === "analytics"
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TbChartBar className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Analytics metric cards (only in analytics mode) ─────────────────── */}
      {viewMode === "analytics" && (
        <div className="px-6 pb-3 shrink-0">
          <div className="flex flex-wrap gap-3">
            <MetricCard title="Active" value={kpis?.active ?? 0} sub="live subscriptions" icon={<TbCheck className="h-4 w-4" />} accent="text-emerald-600" loading={kpisLoading} />
            <MetricCard title="Trial" value={kpis?.trial ?? 0} sub="in trial period" icon={<TbClock className="h-4 w-4" />} accent="text-blue-600" loading={kpisLoading} />
            <MetricCard title="Past Due" value={kpis?.pastDue ?? 0} sub="need attention" icon={<TbAlertTriangle className="h-4 w-4" />} accent="text-amber-600" loading={kpisLoading} />
            <MetricCard title="Expired" value={kpis?.expired ?? 0} sub="lapsed" icon={<TbX className="h-4 w-4" />} accent="text-muted-foreground" loading={kpisLoading} />
            <MetricCard title="Cancelled" value={kpis?.canceled ?? 0} sub="churned" icon={<TbX className="h-4 w-4" />} accent="text-red-600" loading={kpisLoading} />
            <MetricCard title="MRR" value={kpis ? `$${kpis.mrr.toLocaleString()}` : "$0"} sub="monthly recurring" icon={<TbCurrencyDollar className="h-4 w-4" />} accent="text-primary" loading={kpisLoading} />
          </div>
        </div>
      )}

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="px-6 pb-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2">

          {/* Search */}
          <div className="relative min-w-44 flex-1 max-w-xs">
            <TbSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search org..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 h-8 text-sm"
            />
          </div>

          {/* Status */}
          <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-32 h-8 text-sm">
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
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {plans.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Billing */}
          <Select value={billingFilter || "all"} onValueChange={(v) => { setBillingFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-28 h-8 text-sm">
              <SelectValue placeholder="Billing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cycles</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {/* Provider */}
          <Select value={providerFilter || "all"} onValueChange={(v) => { setProviderFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-28 h-8 text-sm">
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

          {/* Trial ending soon */}
          <Button
            variant={trialEndingSoon ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1.5 text-xs px-2.5 shrink-0"
            onClick={() => { setTrialEndingSoon(!trialEndingSoon); setPage(1); }}
          >
            <TbClock className="h-3.5 w-3.5" />
            Trial soon
          </Button>

          {/* Clear */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-xs text-muted-foreground px-2">
              <TbFilterOff className="h-3.5 w-3.5" /> Clear
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={refresh} className="h-8 w-8 ml-auto shrink-0" title="Refresh">
            <TbRefresh className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Active filter badges */}
        {hasFilters && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {statusFilter && (
              <Badge variant="secondary" className="h-5 text-[10px] gap-1 px-1.5">
                {statusFilter}
                <button className="opacity-60 hover:opacity-100" onClick={() => setStatusFilter("")}>×</button>
              </Badge>
            )}
            {planFilter && (
              <Badge variant="secondary" className="h-5 text-[10px] gap-1 px-1.5">
                Plan
                <button className="opacity-60 hover:opacity-100" onClick={() => setPlanFilter("")}>×</button>
              </Badge>
            )}
            {billingFilter && (
              <Badge variant="secondary" className="h-5 text-[10px] gap-1 px-1.5">
                {billingFilter}
                <button className="opacity-60 hover:opacity-100" onClick={() => setBillingFilter("")}>×</button>
              </Badge>
            )}
            {providerFilter && (
              <Badge variant="secondary" className="h-5 text-[10px] gap-1 px-1.5">
                {providerFilter}
                <button className="opacity-60 hover:opacity-100" onClick={() => setProviderFilter("")}>×</button>
              </Badge>
            )}
            {trialEndingSoon && (
              <Badge variant="secondary" className="h-5 text-[10px] gap-1 px-1.5">
                Trial ending soon
                <button className="opacity-60 hover:opacity-100" onClick={() => setTrialEndingSoon(false)}>×</button>
              </Badge>
            )}
            {search && (
              <Badge variant="secondary" className="h-5 text-[10px] gap-1 px-1.5">
                &ldquo;{search}&rdquo;
                <button className="opacity-60 hover:opacity-100" onClick={() => setSearch("")}>×</button>
              </Badge>
            )}
          </div>
        )}
      </div>

      <Separator className="shrink-0" />

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden px-6 pt-2">
        <DataTable
          columns={columns as any}
          data={subscriptions}
          loading={loading}
          onRowClick={handleViewSubscription}
        />
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-2 border-t shrink-0 bg-background/80 backdrop-blur-sm z-20">
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
