"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AdminService } from "@/services/admin.service";
import { Organization } from "./organization-utils";

export const useOrganizationHandlers = (refreshData: () => void) => {
  // ── Modal states ─────────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isExtendTrialModalOpen, setIsExtendTrialModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // ── Open modal helpers ───────────────────────────────────────────────────
  const handleOpenAddModal = useCallback(() => {
    setSelectedOrganization(null);
    setIsAddModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((org: Organization) => {
    setSelectedOrganization(org);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  }, []);

  const handleViewOrganization = useCallback((org: Organization) => {
    setSelectedOrganization(org);
    setIsViewModalOpen(true);
  }, []);

  const handleOpenChangePlanModal = useCallback((org: Organization) => {
    setSelectedOrganization(org);
    setIsChangePlanModalOpen(true);
    setIsViewModalOpen(false);
  }, []);

  const handleOpenExtendTrialModal = useCallback((org: Organization) => {
    setSelectedOrganization(org);
    setIsExtendTrialModalOpen(true);
    setIsViewModalOpen(false);
  }, []);

  // ── Organization status actions ──────────────────────────────────────────
  const handleSuspendOrganization = useCallback(
    async (org: Organization) => {
      const reason = prompt("Reason for suspension (optional):");
      try {
        await AdminService.suspendOrganization(org._id, reason || undefined);
        toast.success("Organization suspended successfully");
        refreshData();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to suspend organization");
      }
    },
    [refreshData]
  );

  const handleReactivateOrganization = useCallback(
    async (org: Organization) => {
      try {
        await AdminService.reactivateOrganization(org._id);
        toast.success("Organization reactivated successfully");
        refreshData();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to reactivate organization");
      }
    },
    [refreshData]
  );

  const handleArchiveOrganization = useCallback(
    async (org: Organization) => {
      const action = org.isActive ? "archive" : "restore";
      try {
        if (org.isActive) {
          await AdminService.archiveOrganization(org._id);
        } else {
          await AdminService.changeOrgStatus(org._id, "active");
        }
        toast.success(`Organization ${action}d successfully`);
        refreshData();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || `Failed to ${action} organization`);
      }
    },
    [refreshData]
  );

  const handleDeleteOrganization = useCallback(
    async (org: Organization) => {
      // Warn if there's an active paid subscription
      if (
        org.subscription &&
        org.subscription.status === "ACTIVE" &&
        !org.subscription.isTrial
      ) {
        const proceed = confirm(
          "⚠️ This organization has an active paid subscription. Deleting it may cause billing issues. Continue?"
        );
        if (!proceed) return;
      }

      if (!confirm("Are you sure you want to delete this organization permanently? This action cannot be undone.")) return;

      try {
        await AdminService.archiveOrganization(org._id);
        toast.success("Organization deleted successfully");
        refreshData();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to delete organization");
      }
    },
    [refreshData]
  );

  // ── Subscription actions ─────────────────────────────────────────────────
  const handleCancelSubscription = useCallback(
    async (org: Organization) => {
      const reason = prompt("Reason for cancellation (required):");
      if (!reason) return toast.error("A reason is required to cancel a subscription.");

      try {
        await AdminService.cancelSubscription(org._id, reason);
        toast.success("Subscription cancelled successfully");
        refreshData();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to cancel subscription");
      }
    },
    [refreshData]
  );

  return {
    // Modal state
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    isChangePlanModalOpen,
    setIsChangePlanModalOpen,
    isExtendTrialModalOpen,
    setIsExtendTrialModalOpen,
    selectedOrganization,
    // Modal openers
    handleOpenAddModal,
    handleOpenEditModal,
    handleViewOrganization,
    handleOpenChangePlanModal,
    handleOpenExtendTrialModal,
    // Direct actions
    handleSuspendOrganization,
    handleReactivateOrganization,
    handleArchiveOrganization,
    handleDeleteOrganization,
    handleCancelSubscription,
  };
};
