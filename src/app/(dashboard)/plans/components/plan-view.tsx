"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TbEdit, TbArchive } from "react-icons/tb";
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

  return (
    <Modal
      title="Plan Details"
      description={`Viewing details for ${plan.name}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-6 py-4">
        {/* ── Plan Info ─────────────────────────────────── */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            General
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{plan.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Slug</p>
              <p className="text-sm font-mono">{plan.slug}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge
                className={
                  plan.isActive
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }
              >
                {plan.isActive ? "Active" : "Archived"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Public</p>
              <Badge variant="outline">{plan.isPublic ? "Yes" : "No"}</Badge>
            </div>
            {plan.description && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm">{plan.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Pricing ───────────────────────────────────── */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Pricing
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="text-sm font-medium tabular-nums">${plan.price}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Yearly</p>
              <p className="text-sm font-medium tabular-nums">
                {(plan.yearlyPrice ?? 0) > 0 ? `$${plan.yearlyPrice}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trial</p>
              <p className="text-sm font-medium">
                {plan.trialDays > 0 ? `${plan.trialDays} days` : "None"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Limits ────────────────────────────────────── */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Limits
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-medium tabular-nums">{plan.limits.maxMembers}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Leads</p>
              <p className="text-sm font-medium tabular-nums">{plan.limits.maxLeads}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Storage</p>
              <p className="text-sm font-medium tabular-nums">
                {(plan.limits.maxStorage / 1024).toFixed(1)} GB
              </p>
            </div>
          </div>
        </div>

        {/* ── Features ──────────────────────────────────── */}
        {plan.features.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Features ({plan.features.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {plan.features.map((f, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-muted/30">
                  {f}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* ── Meta ──────────────────────────────────────── */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Meta
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Sort Order</p>
              <p className="text-sm">{plan.sortOrder}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(plan.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────── */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(plan);
            }}
          >
            <TbEdit className="mr-1.5 h-4 w-4" />
            Edit Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onArchive(plan);
            }}
          >
            <TbArchive className="mr-1.5 h-4 w-4" />
            {plan.isActive ? "Archive" : "Restore"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
