"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DetailView,
  DetailRow,
  DetailSection,
} from "@/components/ui-system/detail-view";
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

  // ── Section 1: Overview ───────────────────────────────────────────────
  const overviewSection: DetailSection = {
    title: "Organization Overview",
    content: (
      <>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
          <DetailRow label="Name">
            <span className="font-semibold">{organization.name}</span>
          </DetailRow>
          <DetailRow label="Org Status">
            <Badge className={orgStatusStyles[organization.status] || "bg-gray-100 text-gray-600"}>
              {organization.status}
            </Badge>
          </DetailRow>
          <DetailRow label="Organization ID" colSpan>
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
          </DetailRow>
          <DetailRow label="Owner">
            <p className="font-medium">{organization.ownerId?.name || "N/A"}</p>
            <p className="text-xs text-muted-foreground">{organization.ownerId?.email || "N/A"}</p>
          </DetailRow>
          <DetailRow label="Created At">
            {new Date(organization.createdAt).toLocaleDateString()}
          </DetailRow>
          <DetailRow label="Members">
            <div className="flex items-center gap-1.5">
              <TbUsers className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{memberCount}</span>
            </div>
          </DetailRow>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => { onClose(); onEdit(organization); }}>
            <TbEdit className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
          {organization.status === "ACTIVE" && (
            <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => { onClose(); onSuspend(organization); }}>
              <TbBan className="mr-1.5 h-3.5 w-3.5" /> Suspend
            </Button>
          )}
          {organization.status === "SUSPENDED" && (
            <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => { onClose(); onReactivate(organization); }}>
              <TbPlayerPlay className="mr-1.5 h-3.5 w-3.5" /> Reactivate
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => { onClose(); onArchive(organization); }}>
            <TbArchive className="mr-1.5 h-3.5 w-3.5" /> {organization.isActive ? "Archive" : "Restore"}
          </Button>
        </div>
      </>
    ),
  };

  // ── Section 2: Subscription Details ───────────────────────────────────
  const subscriptionSection: DetailSection = {
    title: "Subscription Details",
    content: sub ? (
      <>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
          <DetailRow label="Current Plan">
            <Badge variant="outline" className="uppercase bg-muted/30">
              {sub.planId?.name || "Unknown"}
            </Badge>
          </DetailRow>
          <DetailRow label="Status">
            <Badge className={subscriptionStatusStyles[sub.status] || "bg-gray-100 text-gray-600"}>
              {sub.status}
            </Badge>
          </DetailRow>
          <DetailRow label="Billing Cycle">
            <span className="uppercase">{sub.billingCycle}</span>
          </DetailRow>
          <DetailRow label="Price">
            <span className="font-medium tabular-nums">
              ${sub.planId?.price || 0}/{sub.billingCycle === "YEARLY" ? "yr" : "mo"}
            </span>
          </DetailRow>
          {sub.isTrial && sub.trialEndDate && (
            <DetailRow label="Trial End Date">
              {new Date(sub.trialEndDate).toLocaleDateString()}
            </DetailRow>
          )}
          {sub.renewalDate && (
            <DetailRow label="Renewal Date">
              {new Date(sub.renewalDate).toLocaleDateString()}
            </DetailRow>
          )}
          <DetailRow label="Payment Provider">
            <span className="uppercase">{sub.paymentProvider || "NONE"}</span>
          </DetailRow>
          <DetailRow label="Payment Ref">
            <span className="font-mono text-xs">{maskPaymentRef(sub.paymentReferenceId)}</span>
          </DetailRow>
          <DetailRow label="Created By">
            <Badge variant="outline" className={`text-[10px] ${createdByStyles[sub.createdBy] || ""}`}>
              {sub.createdBy === "SELF_SERVICE" ? "Self-Service" : "Admin"}
            </Badge>
          </DetailRow>
          {sub.cancelledAt && (
            <DetailRow label="Cancelled At">
              {new Date(sub.cancelledAt).toLocaleDateString()}
            </DetailRow>
          )}
          {sub.cancelReason && (
            <DetailRow label="Cancel Reason" colSpan>
              <span className="italic text-muted-foreground">{sub.cancelReason}</span>
            </DetailRow>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {sub.status !== "CANCELED" && (
            <Button variant="outline" size="sm" onClick={() => { onClose(); onChangePlan(organization); }}>
              <TbArrowsExchange className="mr-1.5 h-3.5 w-3.5" /> Change Plan
            </Button>
          )}
          {sub.isTrial && (
            <Button variant="outline" size="sm" onClick={() => { onClose(); onExtendTrial(organization); }}>
              <TbClockPlus className="mr-1.5 h-3.5 w-3.5" /> Extend Trial
            </Button>
          )}
          {sub.status !== "CANCELED" && sub.status !== "EXPIRED" && (
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { onClose(); onCancelSubscription(organization); }}>
              <TbBan className="mr-1.5 h-3.5 w-3.5" /> Cancel Subscription
            </Button>
          )}
        </div>
      </>
    ) : (
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">No active subscription</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => { onClose(); onChangePlan(organization); }}>
          <TbArrowsExchange className="mr-1.5 h-3.5 w-3.5" /> Assign Plan
        </Button>
      </div>
    ),
  };

  // ── Section 3: Subscription History ───────────────────────────────────
  const historySection: DetailSection = {
    title: "Subscription History",
    icon: <TbHistory className="h-4 w-4 text-muted-foreground" />,
    content: loadingDetails ? (
      <p className="text-xs text-muted-foreground animate-pulse">Loading history…</p>
    ) : history.length > 0 ? (
      <div className="relative">
        <div className="absolute left-1.75 top-2 bottom-2 w-px bg-border" />
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry._id} className="relative pl-6">
              <div className="absolute left-0 top-1.5 w-3.75 h-3.75 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                <div className="w-1.75 h-1.75 rounded-full bg-primary/60" />
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
    ),
  };

  // ── Section 4: Members Summary ────────────────────────────────────────
  const membersSection: DetailSection = {
    title: "Members",
    icon: <TbUsers className="h-4 w-4 text-muted-foreground" />,
    content: (
      <div className="rounded-lg border p-4 text-center">
        <p className="text-2xl font-bold tabular-nums">{memberCount}</p>
        <p className="text-xs text-muted-foreground mt-1">Total Members</p>
        {sub?.planId && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            (Plan limit details available on the plan page)
          </p>
        )}
      </div>
    ),
  };

  return (
    <DetailView
      isOpen={isOpen}
      onClose={onClose}
      title="Organization Details"
      description={`Manage ${organization.name} settings, subscription, and members.`}
      warnings={risks}
      warningIcon={<TbAlertTriangle className="h-4 w-4 text-amber-600" />}
      sections={[overviewSection, subscriptionSection, historySection, membersSection]}
    />
  );
}
