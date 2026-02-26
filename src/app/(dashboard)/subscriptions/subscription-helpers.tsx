"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AdminService } from "@/services/admin.service";
import { SubscriptionRow } from "@/types/subscription";

interface ModalState {
  isOpen: boolean;
  target: SubscriptionRow | null;
}

const closed: ModalState = { isOpen: false, target: null };

export const useSubscriptionHandlers = (refreshData: () => void) => {
  const [viewDrawer, setViewDrawer]       = useState<ModalState>(closed);
  const [changePlanModal, setChangePlanModal] = useState<ModalState>(closed);
  const [extendTrialModal, setExtendTrialModal] = useState<ModalState>(closed);
  const [cancelModal, setCancelModal]     = useState<ModalState>(closed);
  const [reactivateModal, setReactivateModal] = useState<ModalState>(closed);
  const [forceExpireTarget, setForceExpireTarget] = useState<SubscriptionRow | null>(null);

  // ── Openers ───────────────────────────────────────────────────────────────

  const handleViewSubscription = useCallback((sub: SubscriptionRow) => {
    setViewDrawer({ isOpen: true, target: sub });
  }, []);

  const handleChangePlan = useCallback((sub: SubscriptionRow) => {
    setViewDrawer(closed);
    setChangePlanModal({ isOpen: true, target: sub });
  }, []);

  const handleExtendTrial = useCallback((sub: SubscriptionRow) => {
    setViewDrawer(closed);
    setExtendTrialModal({ isOpen: true, target: sub });
  }, []);

  const handleCancel = useCallback((sub: SubscriptionRow) => {
    setViewDrawer(closed);
    setCancelModal({ isOpen: true, target: sub });
  }, []);

  const handleReactivate = useCallback((sub: SubscriptionRow) => {
    setViewDrawer(closed);
    setReactivateModal({ isOpen: true, target: sub });
  }, []);

  const handleForceExpire = useCallback(async (sub: SubscriptionRow) => {
    setViewDrawer(closed);
    const reason = window.prompt(`Force-expire subscription for "${sub.org?.name}"?\n\nEnter reason:`);
    if (reason === null) return; // cancelled
    try {
      await AdminService.adminForceExpire(sub._id, reason || "Admin override");
      toast.success("Subscription force-expired");
      refreshData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to force-expire");
    }
  }, [refreshData]);

  // ── Success handlers (close modal + refresh) ──────────────────────────────

  const onActionSuccess = useCallback((message: string) => {
    toast.success(message);
    refreshData();
  }, [refreshData]);

  return {
    // State
    viewDrawer,
    changePlanModal,
    extendTrialModal,
    cancelModal,
    reactivateModal,

    // Closers
    closeViewDrawer: () => setViewDrawer(closed),
    closeChangePlan: () => setChangePlanModal(closed),
    closeExtendTrial: () => setExtendTrialModal(closed),
    closeCancel: () => setCancelModal(closed),
    closeReactivate: () => setReactivateModal(closed),

    // Openers / handlers
    handleViewSubscription,
    handleChangePlan,
    handleExtendTrial,
    handleCancel,
    handleReactivate,
    handleForceExpire,

    // Success
    onActionSuccess,
  };
};
