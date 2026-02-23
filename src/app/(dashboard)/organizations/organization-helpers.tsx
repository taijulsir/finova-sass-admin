"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";

export const useOrganizationHandlers = (refreshData: () => void) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);

  const handleOpenAddModal = useCallback(() => {
    setSelectedOrganization(null);
    setIsAddModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((org: any) => {
    setSelectedOrganization(org);
    setIsEditModalOpen(true);
    // Close view modal if it was open
    setIsViewModalOpen(false);
  }, []);

  const handleViewOrganization = useCallback((org: any) => {
    setSelectedOrganization(org);
    setIsViewModalOpen(true);
  }, []);

  const handleArchiveOrganization = useCallback(async (org: any) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/admin/organizations/${org._id}`, {
        status: org.status === 'active' ? 'archived' : 'active'
      }, { withCredentials: true });
      
      toast.success(`Organization ${org.status === 'active' ? 'archived' : 'activated'} successfully`);
      refreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update organization status");
    }
  }, [refreshData]);

  const handleDeleteOrganization = useCallback(async (org: any) => {
    if (!confirm("Are you sure you want to delete this organization? This action cannot be undone.")) return;
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/organizations/${org._id}`, {
        withCredentials: true
      });
      
      toast.success("Organization deleted successfully");
      refreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete organization");
    }
  }, [refreshData]);

  return {
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    selectedOrganization,
    handleOpenAddModal,
    handleOpenEditModal,
    handleViewOrganization,
    handleArchiveOrganization,
    handleDeleteOrganization
  };
};
