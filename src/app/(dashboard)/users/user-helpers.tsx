"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AdminService } from "@/services/admin.service";

export const useUserHandlers = (refreshData: () => void) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleOpenAddModal = useCallback(() => {
    setSelectedUser(null);
    setIsAddModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  }, []);

  const handleViewUser = useCallback((user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  }, []);

  const handleOpenSuspendModal = useCallback((user: any) => {
    setSelectedUser(user);
    setIsSuspendModalOpen(true);
    setIsViewModalOpen(false);
  }, []);

  const handleConfirmSuspend = useCallback(async (note: string) => {
    if (!selectedUser) return;
    try {
      await AdminService.suspenseUser(selectedUser._id, note);
      toast.success("User suspended successfully");
      setIsSuspendModalOpen(false);
      setSelectedUser(null);
      refreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to suspend user");
    }
  }, [selectedUser, refreshData]);

  const handleDeleteUser = useCallback(async (user: any) => {
    const isInvitation = user._type === 'invitation';
    const action = isInvitation ? "cancel the invitation" : "archive this user";
    
    if (!confirm(`Are you sure you want to ${action}?`)) return;
    
    try {
      if (isInvitation) {
        await AdminService.deleteUser(user._id);
      } else {
        await AdminService.archiveUser(user._id);
      }
      
      toast.success(`${isInvitation ? 'Invitation cancelled' : 'User archived'} successfully`);
      refreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isInvitation ? 'cancel invitation' : 'archive user'}`);
    }
  }, [refreshData]);

  const handleCancelInvite = useCallback(async (user: any) => {
    try {
      await AdminService.cancelInvitation(user._id);
      toast.success('Invitation cancelled successfully');
      refreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel invitation');
    }
  }, [refreshData]);

  return {
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    isSuspendModalOpen,
    setIsSuspendModalOpen,
    selectedUser,
    handleOpenAddModal,
    handleOpenEditModal,
    handleViewUser,
    handleOpenSuspendModal,
    handleConfirmSuspend,
    handleDeleteUser,
    handleCancelInvite,
  };
};
