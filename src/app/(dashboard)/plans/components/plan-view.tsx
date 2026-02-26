"use client";

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
  TbUsers,
  TbBulb,
  TbDatabase,
  TbCurrencyDollar,
  TbListCheck,
  TbInfoCircle,
  TbCheck,
} from "react-icons/tb";
import { Plan } from "../plan-utils";

interface PlanViewProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (plan: Plan) => void;
  onArchive: (plan: Plan) => void;
}

export function PlanView({
  plan,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}: PlanViewProps) {
  if (!plan) return null;

  const savingsPercent =
    plan.yearlyPrice && plan.price > 0
      ? Math.round((1 - plan.yearlyPrice / (plan.price * 12)) * 100)
      : 0;

  // ── Section 1: Overview ───────────────────────────────────────────────
  const overviewSection: DetailSection = {
    title: "Plan Overview",
    icon: <TbInfoCircle className="h-4 w-4 text-muted-foreground" />,
    content: (
      <div className="grid grid-cols-2 gap-y-3 gap-x-6">
        <DetailRow label="Name">
          <span className="font-semibold text-base">{plan.name}</span>
        </DetailRow>
        <DetailRow label="Status">
          <Badge
            className={
              plan.isActive
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-[#36E59A]/10 dark:text-[#36E59A] dark:border-[#36E59A]/20"
                : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/40"
            }
          >
            {plan.isActive ? "Active" : "Archived"}
          </Badge>
        </DetailRow>
        <DetailRow label="Slug">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
            {plan.slug}
          </code>
        </DetailRow>
        <DetailRow label="Visibility">
          <Badge variant="outline" className={plan.isPublic ? "text-blue-600 border-blue-200" : "text-muted-foreground"}>
            {plan.isPublic ? "Public" : "Private"}
          </Badge>
        </DetailRow>
        <DetailRow label="Sort Order">
          <span className="tabular-nums">{plan.sortOrder}</span>
        </DetailRow>
        <DetailRow label="Trial">
          <span className={plan.trialDays > 0 ? "text-violet-600 font-medium" : "text-muted-foreground"}>
            {plan.trialDays > 0 ? `${plan.trialDays} days` : "None"}
          </span>
        </DetailRow>
        {plan.description && (
          <DetailRow label="Description" colSpan>
            <span className="text-sm text-muted-foreground">{plan.description}</span>
          </DetailRow>
        )}

        {/* Action buttons */}
        <div className="col-span-2 flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onClose(); onEdit(plan); }}
          >
            <TbEdit className="mr-1.5 h-3.5 w-3.5" /> Edit Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onClose(); onArchive(plan); }}
            className={plan.isActive ? "text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/20" : "text-muted-foreground border-border hover:bg-muted"}
          >
            <TbArchive className="mr-1.5 h-3.5 w-3.5" />
            {plan.isActive ? "Archive" : "Restore"}
          </Button>
        </div>
      </div>
    ),
  };

  // ── Section 2: Pricing ────────────────────────────────────────────────
  const pricingSection: DetailSection = {
    title: "Pricing",
    icon: <TbCurrencyDollar className="h-4 w-4 text-muted-foreground" />,
    content: (
      <div className="grid grid-cols-2 gap-4">
        {/* Monthly card */}
        <div className="rounded-lg border bg-muted/20 p-3 space-y-0.5">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Monthly</p>
          <p className="text-2xl font-bold tabular-nums">
            ${plan.price}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </p>
        </div>
        {/* Yearly card */}
        <div className="rounded-lg border bg-muted/20 p-3 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Yearly</p>
            {savingsPercent > 0 && (
              <Badge className="text-[9px] px-1 py-0 bg-green-50 text-green-700 border-green-200 dark:bg-[#36E59A]/10 dark:text-[#36E59A] dark:border-[#36E59A]/20">
                -{savingsPercent}%
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {(plan.yearlyPrice ?? 0) > 0 ? (
              <>
                ${plan.yearlyPrice}
                <span className="text-sm font-normal text-muted-foreground">/yr</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Not set</span>
            )}
          </p>
        </div>
      </div>
    ),
  };

  // ── Section 3: Limits ─────────────────────────────────────────────────
  const limitsSection: DetailSection = {
    title: "Usage Limits",
    icon: <TbDatabase className="h-4 w-4 text-muted-foreground" />,
    content: (
      <div className="space-y-3">
        {[
          {
            icon: TbUsers,
            label: "Max Members",
            value: plan.limits.maxMembers.toLocaleString(),
            bar: Math.min(plan.limits.maxMembers / 500, 1),
          },
          {
            icon: TbBulb,
            label: "Max Leads",
            value: plan.limits.maxLeads.toLocaleString(),
            bar: Math.min(plan.limits.maxLeads / 100000, 1),
          },
          {
            icon: TbDatabase,
            label: "Storage",
            value: plan.limits.maxStorage >= 1024
              ? `${(plan.limits.maxStorage / 1024).toFixed(1)} GB`
              : `${plan.limits.maxStorage} MB`,
            bar: Math.min(plan.limits.maxStorage / 512000, 1),
          },
        ].map(({ icon: Icon, label, value, bar }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
              <span className="text-sm font-semibold tabular-nums">{value}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/50 transition-all"
                style={{ width: `${Math.max(bar * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  };

  // ── Section 4: Features ───────────────────────────────────────────────
  const featuresSection: DetailSection = {
    title: `Features (${plan.features.length})`,
    icon: <TbListCheck className="h-4 w-4 text-muted-foreground" />,
    content:
      plan.features.length > 0 ? (
        <ul className="space-y-1.5">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <TbCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground italic">No features defined.</p>
      ),
  };

  return (
    <DetailView
      isOpen={isOpen}
      onClose={onClose}
      title={plan.name}
      description={plan.description || "Subscription plan details"}
      sections={[overviewSection, pricingSection, limitsSection, featuresSection]}
    />
  );
}
