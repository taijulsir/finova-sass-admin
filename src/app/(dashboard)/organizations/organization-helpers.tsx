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
      const isCurrentlyActive = org.isActive;
      const action = isCurrentlyActive ? "archive" : "restore";
      try {
        if (isCurrentlyActive) {
          await AdminService.archiveOrganization(org._id);
        } else {
          // Restore: change status back to ACTIVE
          await AdminService.changeOrgStatus(org._id, "ACTIVE");
        }
        toast.success(`Organization ${action}d successfully`);
        refreshData();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || `Failed to ${action} organization`);
      }
    },
    [refreshData]
  );

  // ── Modal state ─────────────────────────────────────────────────────────
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelSubModalOpen, setIsCancelSubModalOpen] = useState(false);

  const handleOpenDeleteModal = useCallback((org: Organization) => {
    setSelectedOrganization(org);
    setIsDeleteModalOpen(true);
    setIsViewModalOpen(false);
  }, []);

  const handleOpenCancelSubModal = useCallback((org: Organization) => {
    setSelectedOrganization(org);
    setIsCancelSubModalOpen(true);
    setIsViewModalOpen(false);
  }, []);

  const handleDeleteOrganization = useCallback(
    async () => {
      if (!selectedOrganization) return;
      try {
        await AdminService.archiveOrganization(selectedOrganization._id);
        toast.success("Organization deleted successfully");
        refreshData();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to delete organization");
      }
    },
    [selectedOrganization, refreshData]
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
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isCancelSubModalOpen,
    setIsCancelSubModalOpen,
    selectedOrganization,
    // Modal openers
    handleOpenAddModal,
    handleOpenEditModal,
    handleViewOrganization,
    handleOpenChangePlanModal,
    handleOpenExtendTrialModal,
    handleOpenDeleteModal,
    handleOpenCancelSubModal,
    // Direct actions
    handleSuspendOrganization,
    handleReactivateOrganization,
    handleArchiveOrganization,
    handleDeleteOrganization,
  };
};
