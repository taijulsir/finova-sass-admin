"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AdminService } from "@/services/admin.service";

export const useSubscriptionHandlers = (refreshData: () => void) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const handleViewSubscription = useCallback((sub: any) => {
    setSelectedSub(sub);
    setIsViewModalOpen(true);
  }, []);

  const handleEditSubscription = useCallback((sub: any) => {
    setSelectedSub(sub);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  }, []);

  const handleArchiveSubscription = useCallback(async (sub: any) => {
    const isCanceled = sub.subscription?.status === 'canceled';
    const action = isCanceled ? 'reactivate' : 'cancel';
    
    if (!confirm(`Are you sure you want to ${action} the subscription for ${sub.name}?`)) return;
    
    try {
      if (isCanceled) {
        // Reactivate needs a planId — use current plan or prompt
        toast.info("Use the 'Change Plan' action to reactivate with a specific plan.");
        return;
      }

      await AdminService.cancelSubscription(sub._id);
      toast.success("Subscription cancelled successfully");
      refreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update subscription");
    }
  }, [refreshData]);

  const handleManageSubscription = useCallback((sub: any) => {
    toast.info("Subscription management — payment portal integration coming soon.");
    console.log("Manage billing for:", sub._id);
  }, []);

  return {
    isViewModalOpen,
    setIsViewModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedSub,
    handleViewSubscription,
    handleEditSubscription,
    handleArchiveSubscription,
    handleManageSubscription
  };
};
