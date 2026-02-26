"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminService } from "@/services/admin.service";
import { SubscriptionRow, SubscriptionHistoryItem, SubscriptionStatus } from "@/types/subscription";
import { cn } from "@/lib/utils";
import {
  TbEdit,
  TbX,
  TbPlayerPlay,
  TbClock,
  TbAlertTriangle,
  TbArrowUpRight,
  TbArrowDownRight,
  TbRefresh,
  TbBan,
  TbHistory,
  TbInfoCircle,
} from "react-icons/tb";

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  ACTIVE:   "bg-green-50 text-green-700 border-green-200 dark:bg-[#36E59A]/10 dark:text-[#36E59A] dark:border-[#36E59A]/20",
  TRIAL:    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/40",
  PAST_DUE: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
  CANCELED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
  EXPIRED:  "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/40",
};

const CHANGE_TYPE_ICON: Record<string, React.ReactNode> = {
  UPGRADE:         <TbArrowUpRight className="h-4 w-4 text-green-600 dark:text-[#36E59A]" />,
  DOWNGRADE:       <TbArrowDownRight className="h-4 w-4 text-amber-500" />,
  CANCEL:          <TbBan className="h-4 w-4 text-red-500" />,
  RENEWAL:         <TbRefresh className="h-4 w-4 text-blue-500" />,
  REACTIVATION:    <TbPlayerPlay className="h-4 w-4 text-green-600 dark:text-[#36E59A]" />,
  TRIAL_START:     <TbClock className="h-4 w-4 text-blue-500" />,
  TRIAL_EXTEND:    <TbClock className="h-4 w-4 text-blue-400" />,
  MANUAL_OVERRIDE: <TbAlertTriangle className="h-4 w-4 text-amber-500" />,
};

interface SubscriptionDrawerProps {
  subscription: SubscriptionRow | null;
  isOpen: boolean;
  onClose: () => void;
  onChangePlan: (sub: SubscriptionRow) => void;
  onExtendTrial: (sub: SubscriptionRow) => void;
  onCancel: (sub: SubscriptionRow) => void;
  onReactivate: (sub: SubscriptionRow) => void;
  onForceExpire: (sub: SubscriptionRow) => void;
}

function InfoRow({ label, value, mono = false }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      {mono ? (
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded break-all text-muted-foreground">{value ?? "—"}</code>
      ) : (
        <p className="text-sm text-foreground">{value ?? "—"}</p>
      )}
    </div>
  );
}

export function SubscriptionView({
  subscription,
  isOpen,
  onClose,
  onChangePlan,
  onExtendTrial,
  onCancel,
  onReactivate,
  onForceExpire,
}: SubscriptionDrawerProps) {
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && subscription) {
      setLoadingHistory(true);
      AdminService.getAdminSubscriptionHistory(subscription._id)
        .then((res) => setHistory(res.data?.history ?? []))
        .catch(() => setHistory([]))
        .finally(() => setLoadingHistory(false));
    }
  }, [isOpen, subscription]);

  if (!subscription) return null;

  const isActive = subscription.status === "ACTIVE" || subscription.status === "TRIAL";
  const isCanceled = subscription.status === "CANCELED";
  const isExpired = subscription.status === "EXPIRED";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col" side="right">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
              {subscription.org?.name?.charAt(0) ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg font-bold truncate">{subscription.org?.name ?? "—"}</SheetTitle>
              <SheetDescription className="text-xs font-mono text-muted-foreground">
                {subscription.org?.organizationId ?? subscription.organizationId}
              </SheetDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("border text-xs", STATUS_STYLES[subscription.status] ?? "bg-gray-100 text-gray-600")}>
                  {subscription.isTrial ? "Trial" : subscription.status}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">{subscription.plan?.name ?? "—"}</Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-5 space-y-8">
            {/* ── Section 1: Overview ───────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TbInfoCircle className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Overview</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoRow label="Plan" value={
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold">{subscription.plan?.name ?? "—"}</span>
                    {subscription.plan?.price !== undefined && (
                      <span className="text-muted-foreground text-xs">
                        ${subscription.billingCycle === "YEARLY" && subscription.plan.yearlyPrice != null
                          ? subscription.plan.yearlyPrice
                          : subscription.plan.price}
                        /{subscription.billingCycle === "YEARLY" ? "yr" : "mo"}
                      </span>
                    )}
                  </span>
                } />
                <InfoRow label="Billing Cycle" value={subscription.billingCycle?.toLowerCase()} />
                <InfoRow label="Status" value={
                  <Badge className={cn("border text-xs w-fit", STATUS_STYLES[subscription.status])}>
                    {subscription.isTrial ? "Trial" : subscription.status}
                  </Badge>
                } />
                <InfoRow label="Active" value={subscription.isActive ? "Yes" : "No"} />
                <InfoRow label="Renewal Date" value={subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : "—"} />
                {subscription.isTrial && subscription.trialEndDate && (
                  <InfoRow label="Trial Ends" value={new Date(subscription.trialEndDate).toLocaleDateString()} />
                )}
                <InfoRow label="Start Date" value={subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : "—"} />
                <InfoRow label="Created At" value={subscription.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : "—"} />
                <InfoRow label="Created By" value={<span className="capitalize">{subscription.createdBy?.toLowerCase() ?? "—"}</span>} />
                <InfoRow label="Payment Provider" value={<span className="capitalize">{subscription.paymentProvider?.toLowerCase() ?? "—"}</span>} />
                {subscription.cancelledAt && (
                  <InfoRow label="Cancelled At" value={new Date(subscription.cancelledAt).toLocaleDateString()} />
                )}
                {subscription.cancelReason && (
                  <div className="col-span-2">
                    <InfoRow label="Cancel Reason" value={subscription.cancelReason} />
                  </div>
                )}
                {subscription.paymentReferenceId && (
                  <div className="col-span-2">
                    <InfoRow label="Payment Reference" value={subscription.paymentReferenceId} mono />
                  </div>
                )}
                <div className="col-span-2">
                  <InfoRow label="Subscription ID" value={subscription._id} mono />
                </div>
              </div>
            </section>

            <Separator />

            {/* ── Section 2: Plan History ───────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TbHistory className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Plan History</h3>
              </div>

              {loadingHistory ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No history available.</p>
              ) : (
                <div className="relative space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border" />
                  {history.map((item, idx) => (
                    <div key={item._id ?? idx} className="relative flex gap-4 pb-4 last:pb-0">
                      <div className="h-7 w-7 rounded-full bg-background border-2 border-border flex items-center justify-center shrink-0 z-10">
                        {CHANGE_TYPE_ICON[item.changeType] ?? <TbHistory className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 pt-0.5 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold capitalize">{item.changeType?.replace(/_/g, " ")}</span>
                            {item.previousPlanId && item.newPlanId && (
                              <span className="text-xs text-muted-foreground ml-1">
                                · {item.previousPlanId.name} → {item.newPlanId.name}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {item.changedBy && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            by {item.changedBy.name ?? item.changedBy.email}
                          </p>
                        )}
                        {item.reason && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">&ldquo;{item.reason}&rdquo;</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* ── Section 3: Admin Actions ──────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TbAlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Admin Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => onChangePlan(subscription)}
                >
                  <TbEdit className="h-4 w-4" /> Change Plan
                </Button>

                {subscription.isTrial && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => onExtendTrial(subscription)}
                  >
                    <TbClock className="h-4 w-4" /> Extend Trial
                  </Button>
                )}

                {(isCanceled || isExpired) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 text-green-700 border-green-200 hover:bg-green-50 dark:text-[#36E59A] dark:border-[#36E59A]/20 dark:hover:bg-[#36E59A]/10"
                    onClick={() => onReactivate(subscription)}
                  >
                    <TbPlayerPlay className="h-4 w-4" /> Reactivate
                  </Button>
                )}

                {isActive && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => onCancel(subscription)}
                    >
                      <TbX className="h-4 w-4" /> Cancel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      onClick={() => onForceExpire(subscription)}
                    >
                      <TbAlertTriangle className="h-4 w-4" /> Force Expire
                    </Button>
                  </>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
