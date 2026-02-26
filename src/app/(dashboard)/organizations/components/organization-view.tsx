"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  TbEdit,
  TbArchive,
  TbArrowsExchange,
  TbClockPlus,
  TbBan,
  TbPlayerPlay,
  TbAlertTriangle,
  TbCopy,
  TbUsers,
  TbHistory,
} from "react-icons/tb";
import { toast } from "sonner";
import { AdminService } from "@/services/admin.service";
import {
  Organization,
  SubscriptionHistoryEntry,
  subscriptionStatusStyles,
  orgStatusStyles,
  createdByStyles,
  changeTypeLabels,
  getOrgRisks,
} from "../organization-utils";

interface OrganizationViewProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (org: Organization) => void;
  onArchive: (org: Organization) => void;
  onChangePlan: (org: Organization) => void;
  onExtendTrial: (org: Organization) => void;
  onCancelSubscription: (org: Organization) => void;
  onSuspend: (org: Organization) => void;
  onReactivate: (org: Organization) => void;
}

export function OrganizationView({
  organization,
  isOpen,
  onClose,
  onEdit,
  onArchive,
  onChangePlan,
  onExtendTrial,
  onCancelSubscription,
  onSuspend,
  onReactivate,
}: OrganizationViewProps) {
  const [history, setHistory] = useState<SubscriptionHistoryEntry[]>([]);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch subscription history + member count on open
  useEffect(() => {
    if (!organization || !isOpen) return;

    setLoadingDetails(true);
    setMemberCount(organization.memberCount || 0);

    AdminService.getSubscriptionHistory(organization._id)
      .then((res) => {
        setHistory(res.data?.history || []);
      })
      .catch(() => {
        setHistory([]);
      })
      .finally(() => setLoadingDetails(false));
  }, [organization, isOpen]);

  if (!organization) return null;

  const sub = organization.subscription;
  const risks = getOrgRisks(organization);

  const copyId = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success("Copied to clipboard");
  };

  const maskPaymentRef = (ref?: string) => {
    if (!ref) return "—";
    if (ref.length <= 8) return ref;
    return `${ref.slice(0, 4)}${"•".repeat(ref.length - 8)}${ref.slice(-4)}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-[540px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle className="text-lg">Organization Details</SheetTitle>
          <SheetDescription>
            Manage {organization.name} settings, subscription, and members.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">
            {/* ── Risk Warnings ─────────────────────────────────────── */}
            {risks.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <TbAlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">Warnings</span>
                </div>
                <ul className="text-xs text-amber-700 space-y-0.5 ml-6 list-disc">
                  {risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* SECTION 1 – Organization Overview                     */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Organization Overview
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground uppercase">Name</p>
                  <p className="text-sm font-semibold">{organization.name}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground uppercase">Org Status</p>
                  <Badge className={orgStatusStyles[organization.status] || "bg-gray-100 text-gray-600"}>
                    {organization.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-0.5 col-span-2">
                  <p className="text-[11px] text-muted-foreground uppercase">Organization ID</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
                    onClick={() => copyId(organization.organizationId || organization._id)}
                  >
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                      {organization.organizationId || organization._id}
                    </code>
                    <TbCopy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground uppercase">Owner</p>
                  <p className="text-sm font-medium">{organization.ownerId?.name || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{organization.ownerId?.email || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground uppercase">Created At</p>
                  <p className="text-sm">{new Date(organization.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground uppercase">Members</p>
                  <div className="flex items-center gap-1.5">
                    <TbUsers className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{memberCount}</span>
                  </div>
                </div>
              </div>

              {/* Overview Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => { onClose(); onEdit(organization); }}>
                  <TbEdit className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
                {organization.status === "active" && (
                  <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => { onClose(); onSuspend(organization); }}>
                    <TbBan className="mr-1.5 h-3.5 w-3.5" /> Suspend
                  </Button>
                )}
                {organization.status === "suspended" && (
                  <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => { onClose(); onReactivate(organization); }}>
                    <TbPlayerPlay className="mr-1.5 h-3.5 w-3.5" /> Reactivate
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => { onClose(); onArchive(organization); }}>
                  <TbArchive className="mr-1.5 h-3.5 w-3.5" /> {organization.isActive ? "Archive" : "Restore"}
                </Button>
              </div>
            </section>

            <Separator />

            {/* ═══════════════════════════════════════════════════════ */}
            {/* SECTION 2 – Subscription Details                      */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Subscription Details
              </h3>

              {sub ? (
                <>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-muted-foreground uppercase">Current Plan</p>
                      <Badge variant="outline" className="uppercase bg-muted/30">
                        {sub.planId?.name || "Unknown"}
                      </Badge>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-muted-foreground uppercase">Status</p>
                      <Badge className={subscriptionStatusStyles[sub.status] || "bg-gray-100 text-gray-600"}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-muted-foreground uppercase">Billing Cycle</p>
                      <p className="text-sm uppercase">{sub.billingCycle}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-muted-foreground uppercase">Price</p>
                      <p className="text-sm font-medium tabular-nums">
                        ${sub.planId?.price || 0}/{sub.billingCycle === "YEARLY" ? "yr" : "mo"}
                      </p>
                    </div>
                    {sub.isTrial && sub.trialEndDate && (
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-muted-foreground uppercase">Trial End Date</p>
                        <p className="text-sm">{new Date(sub.trialEndDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {sub.renewalDate && (
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-muted-foreground uppercase">Renewal Date</p>
                        <p className="text-sm">{new Date(sub.renewalDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-muted-foreground uppercase">Payment Provider</p>
                      <p className="text-sm uppercase">{sub.paymentProvider || "NONE"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-muted-foreground uppercase">Payment Ref</p>
                      <p className="text-sm font-mono text-xs">{maskPaymentRef(sub.paymentReferenceId)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-muted-foreground uppercase">Created By</p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${createdByStyles[sub.createdBy] || ""}`}
                      >
                        {sub.createdBy === "SELF_SERVICE" ? "Self-Service" : "Admin"}
                      </Badge>
                    </div>
                    {sub.cancelledAt && (
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-muted-foreground uppercase">Cancelled At</p>
                        <p className="text-sm">{new Date(sub.cancelledAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {sub.cancelReason && (
                      <div className="space-y-0.5 col-span-2">
                        <p className="text-[11px] text-muted-foreground uppercase">Cancel Reason</p>
                        <p className="text-sm italic text-muted-foreground">{sub.cancelReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Subscription Actions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {sub.status !== "CANCELED" && (
                      <Button variant="outline" size="sm" onClick={() => { onClose(); onChangePlan(organization); }}>
                        <TbArrowsExchange className="mr-1.5 h-3.5 w-3.5" />
                        {sub.planId?.price && sub.planId.price > 0 ? "Change Plan" : "Upgrade Plan"}
                      </Button>
                    )}
                    {sub.isTrial && (
                      <Button variant="outline" size="sm" onClick={() => { onClose(); onExtendTrial(organization); }}>
                        <TbClockPlus className="mr-1.5 h-3.5 w-3.5" /> Extend Trial
                      </Button>
                    )}
                    {sub.status !== "CANCELED" && sub.status !== "EXPIRED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { onClose(); onCancelSubscription(organization); }}
                      >
                        <TbBan className="mr-1.5 h-3.5 w-3.5" /> Cancel Subscription
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <p className="text-sm text-muted-foreground">No active subscription</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => { onClose(); onChangePlan(organization); }}
                  >
                    <TbArrowsExchange className="mr-1.5 h-3.5 w-3.5" /> Assign Plan
                  </Button>
                </div>
              )}
            </section>

            <Separator />

            {/* ═══════════════════════════════════════════════════════ */}
            {/* SECTION 3 – Subscription History                      */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TbHistory className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subscription History
                </h3>
              </div>

              {loadingDetails ? (
                <p className="text-xs text-muted-foreground animate-pulse">Loading history…</p>
              ) : history.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-4">
                    {history.map((entry) => (
                      <div key={entry._id} className="relative pl-6">
                        {/* Dot */}
                        <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-background bg-muted flex items-center justify-center">
                          <div className="w-[7px] h-[7px] rounded-full bg-primary/60" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px]">
                              {changeTypeLabels[entry.changeType] || entry.changeType}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {new Date(entry.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {(entry.previousPlanId || entry.newPlanId) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {entry.previousPlanId?.name || "—"} → {entry.newPlanId?.name || "—"}
                              {entry.newPlanId?.price != null && (
                                <span className="ml-1 text-foreground font-medium">
                                  (${entry.newPlanId.price}/mo)
                                </span>
                              )}
                            </p>
                          )}
                          {entry.reason && (
                            <p className="text-[11px] text-muted-foreground italic mt-0.5">
                              &ldquo;{entry.reason}&rdquo;
                            </p>
                          )}
                          {entry.changedBy && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              by {entry.changedBy.name} ({entry.changedBy.email})
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No subscription history yet.</p>
              )}
            </section>

            <Separator />

            {/* ═══════════════════════════════════════════════════════ */}
            {/* SECTION 4 – Members Summary                           */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TbUsers className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Members
                </h3>
              </div>

              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold tabular-nums">{memberCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Members</p>
                {sub?.planId && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    (Plan limit details available on the plan page)
                  </p>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
