"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { AdminService } from "@/services/admin.service";

export const useUserHandlers = (refreshData: () => void) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleOpenAddModal = useCallback(() => {
    setSelectedUser(null);
    setIsAddModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    // Close view modal if it was open
    setIsViewModalOpen(false);
  }, []);

  const handleViewUser = useCallback((user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  }, []);

  const handleArchiveUser = useCallback(async (user: any) => {
    try {
      await AdminService.archiveUser(user._id);
      toast.success(`User ${user.status === 'active' ? 'archived' : 'activated'} successfully`);
      refreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user status");
    }
  }, [refreshData]);

  const handleDeleteUser = useCallback(async (user: any) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${user._id}`, {
        withCredentials: true
      });
      
      toast.success("User deleted successfully");
      refreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  }, [refreshData]);

  return {
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    selectedUser,
    handleOpenAddModal,
    handleOpenEditModal,
    handleViewUser,
    handleArchiveUser,
    handleDeleteUser
  };
};
