"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AdminService } from "@/services/admin.service";
import { resolveAvatar } from "@/components/ui/image-uploader/image-uploader";
import type { User } from "../user-types";
import type { UserFormValues } from "../components/user-form";

// ─── Modal state shape ───────────────────────────────────────────────────────

interface ModalState<T = User | null> {
  isOpen: boolean;
  target: T;
  isLoading: boolean;
}

const closedModal = <T,>(fallback: T): ModalState<T> => ({
  isOpen: false,
  target: fallback,
  isLoading: false,
});

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useUserActions(refresh: () => void) {
  // ── Core selection ────────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewDrawer, setViewDrawer] = useState(false);

  const [suspendModal, setSuspendModal] = useState<ModalState>(closedModal(null));
  const [archiveModal, setArchiveModal] = useState<ModalState>(closedModal(null));
  const [unarchiveModal, setUnarchiveModal] = useState<ModalState>(closedModal(null));
  const [unsuspendModal, setUnsuspendModal] = useState<ModalState>(closedModal(null));
  const [resendModal, setResendModal] = useState<ModalState>(closedModal(null));
  const [cancelInviteModal, setCancelInviteModal] = useState<ModalState>(closedModal(null));
  const [forceLogoutModal, setForceLogoutModal] = useState<ModalState>(closedModal(null));
  const [assignRolesModal, setAssignRolesModal] = useState<ModalState>(closedModal(null));

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const open = (setter: typeof setSuspendModal, user: User) =>
    setter({ isOpen: true, target: user, isLoading: false });

  const close = (setter: typeof setSuspendModal) =>
    setter(closedModal(null));

  const withLoading = (setter: typeof setSuspendModal) => ({
    start: () => setter((p) => ({ ...p, isLoading: true })),
    stop: () => setter((p) => ({ ...p, isLoading: false })),
  });

  // ── Open handlers ─────────────────────────────────────────────────────────
  const handleOpenAdd = useCallback(() => {
    setSelectedUser(null);
    setAddModal(true);
  }, []);

  const handleOpenEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setEditModal(true);
    setViewDrawer(false);
  }, []);

  const handleOpenView = useCallback((user: User) => {
    setSelectedUser(user);
    setViewDrawer(true);
  }, []);

  const handleOpenSuspend = useCallback((user: User) => {
    setSelectedUser(user);
    open(setSuspendModal, user);
    setViewDrawer(false);
  }, []);

  const handleOpenArchive = useCallback((user: User) => open(setArchiveModal, user), []);
  const handleOpenUnarchive = useCallback((user: User) => open(setUnarchiveModal, user), []);
  const handleOpenUnsuspend = useCallback((user: User) => open(setUnsuspendModal, user), []);
  const handleOpenResend = useCallback((user: User) => open(setResendModal, user), []);
  const handleOpenCancelInvite = useCallback((user: User) => open(setCancelInviteModal, user), []);
  const handleOpenForceLogout = useCallback((user: User) => open(setForceLogoutModal, user), []);
  const handleOpenAssignRoles = useCallback((user: User) => open(setAssignRolesModal, user), []);

  // ── Close handlers ────────────────────────────────────────────────────────
  const closeAdd = useCallback(() => { setIsSubmitting(false); setAddModal(false); }, []);
  const closeEdit = useCallback(() => { setIsSubmitting(false); setEditModal(false); }, []);
  const closeView = useCallback(() => setViewDrawer(false), []);
  const closeSuspend = useCallback(() => close(setSuspendModal), []);
  const closeArchive = useCallback(() => close(setArchiveModal), []);
  const closeUnarchive = useCallback(() => close(setUnarchiveModal), []);
  const closeUnsuspend = useCallback(() => close(setUnsuspendModal), []);
  const closeResend = useCallback(() => close(setResendModal), []);
  const closeCancelInvite = useCallback(() => close(setCancelInviteModal), []);
  const closeForceLogout = useCallback(() => close(setForceLogoutModal), []);
  const closeAssignRoles = useCallback(() => close(setAssignRolesModal), []);

  // ── Confirm actions ───────────────────────────────────────────────────────

  const handleFormSubmit = useCallback(async (data: UserFormValues) => {
    setIsSubmitting(true);
    let uploadedAvatarUrl: string | null = null;
    try {
      const avatarUrl = await resolveAvatar(data.avatar, "users", 200, 200);
      if (avatarUrl && data.avatar instanceof File) uploadedAvatarUrl = avatarUrl;
      const payload = { ...data, avatar: avatarUrl };

      if (editModal && selectedUser) {
        await AdminService.updateUser(selectedUser._id, payload);
        toast.success("User updated successfully");
      } else if (data.isInvite) {
        await AdminService.inviteUser(payload);
        toast.success("Invitation sent successfully");
      } else {
        await AdminService.createUser(payload);
        toast.success("User created successfully");
      }

      setIsSubmitting(false);
      setAddModal(false);
      setEditModal(false);
      refresh();
    } catch (error: any) {
      if (uploadedAvatarUrl) AdminService.deleteUploadedImage(uploadedAvatarUrl).catch(() => {});
      toast.error(error?.response?.data?.message || error?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [editModal, selectedUser, refresh]);

  const confirmSuspend = useCallback(async (note: string) => {
    if (!suspendModal.target) return;
    const { start, stop } = withLoading(setSuspendModal);
    start();
    try {
      await AdminService.suspenseUser(suspendModal.target._id, note);
      toast.success("User suspended successfully");
      close(setSuspendModal);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to suspend user");
    } finally {
      stop();
    }
  }, [suspendModal.target, refresh]);

  const confirmArchive = useCallback(async () => {
    if (!archiveModal.target) return;
    const { start, stop } = withLoading(setArchiveModal);
    start();
    try {
      await AdminService.archiveUser(archiveModal.target._id);
      toast.success("User archived successfully");
      close(setArchiveModal);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to archive user");
    } finally {
      stop();
    }
  }, [archiveModal.target, refresh]);

  const confirmUnarchive = useCallback(async () => {
    if (!unarchiveModal.target) return;
    const { start, stop } = withLoading(setUnarchiveModal);
    start();
    try {
      await AdminService.unarchiveUser(unarchiveModal.target._id);
      toast.success("User unarchived successfully");
      close(setUnarchiveModal);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to unarchive user");
    } finally {
      stop();
    }
  }, [unarchiveModal.target, refresh]);

  const confirmUnsuspend = useCallback(async () => {
    if (!unsuspendModal.target) return;
    const { start, stop } = withLoading(setUnsuspendModal);
    start();
    try {
      await AdminService.restoreUser(unsuspendModal.target._id);
      toast.success("User unsuspended successfully");
      close(setUnsuspendModal);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to unsuspend user");
    } finally {
      stop();
    }
  }, [unsuspendModal.target, refresh]);

  const confirmResend = useCallback(async () => {
    if (!resendModal.target) return;
    const { start, stop } = withLoading(setResendModal);
    start();
    try {
      await AdminService.resendInvite(resendModal.target._id);
      toast.success("Invitation resent successfully");
      close(setResendModal);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to resend invitation");
    } finally {
      stop();
    }
  }, [resendModal.target]);

  const confirmCancelInvite = useCallback(async () => {
    if (!cancelInviteModal.target) return;
    const { start, stop } = withLoading(setCancelInviteModal);
    start();
    try {
      await AdminService.cancelInvitation(cancelInviteModal.target._id);
      toast.success("Invitation cancelled successfully");
      close(setCancelInviteModal);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to cancel invitation");
    } finally {
      stop();
    }
  }, [cancelInviteModal.target, refresh]);

  const confirmForceLogout = useCallback(async () => {
    if (!forceLogoutModal.target) return;
    const { start, stop } = withLoading(setForceLogoutModal);
    start();
    try {
      await AdminService.forceLogout(forceLogoutModal.target._id);
      toast.success(`${forceLogoutModal.target.name || "User"} has been logged out of all sessions`);
      close(setForceLogoutModal);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to force logout user");
    } finally {
      stop();
    }
  }, [forceLogoutModal.target]);

  return {
    // Selection
    selectedUser,

    // Form
    isSubmitting,
    handleFormSubmit,

    // Add
    addModal,
    handleOpenAdd,
    closeAdd,

    // Edit
    editModal,
    handleOpenEdit,
    closeEdit,

    // View drawer
    viewDrawer,
    handleOpenView,
    closeView,

    // Suspend
    suspendModal,
    handleOpenSuspend,
    closeSuspend,
    confirmSuspend,

    // Archive
    archiveModal,
    handleOpenArchive,
    closeArchive,
    confirmArchive,

    // Unarchive
    unarchiveModal,
    handleOpenUnarchive,
    closeUnarchive,
    confirmUnarchive,

    // Unsuspend
    unsuspendModal,
    handleOpenUnsuspend,
    closeUnsuspend,
    confirmUnsuspend,

    // Resend invite
    resendModal,
    handleOpenResend,
    closeResend,
    confirmResend,

    // Cancel invite
    cancelInviteModal,
    handleOpenCancelInvite,
    closeCancelInvite,
    confirmCancelInvite,

    // Force logout
    forceLogoutModal,
    handleOpenForceLogout,
    closeForceLogout,
    confirmForceLogout,

    // Assign roles
    assignRolesModal,
    handleOpenAssignRoles,
    closeAssignRoles,
  };
}
