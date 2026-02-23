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
    setIsViewModalOpen(false); // Close view if it was open
  }, []);

  const handleArchiveSubscription = useCallback(async (sub: any) => {
    if (!confirm(`Are you sure you want to ${sub.status === 'active' ? 'cancel' : 'reactivate'} the subscription for ${sub.name}?`)) return;
    
    try {
      await AdminService.archiveOrganization(sub._id);
      toast.success(`Subscription ${sub.status === 'active' ? 'cancelled' : 'reactivated'} successfully`);
      refreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update subscription");
    }
  }, [refreshData]);

  const handleManageSubscription = useCallback((sub: any) => {
    toast.info("Opening stripe billing portal (Mock)");
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
