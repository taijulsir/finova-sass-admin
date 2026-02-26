"use client";

import { Modal } from "@/components/ui/modal";
import { UserForm } from "./user-form";
import { UserDetailDrawer } from "./user-detail-drawer";
import { AssignRolesModal } from "./assign-roles-modal";
import { SuspendModal } from "./suspend-modal";
import { ArchiveModal } from "./archive-modal";
import { UnarchiveModal } from "./unarchive-modal";
import { UnsuspendModal } from "./unsuspend-modal";
import { ResendInviteModal } from "./resend-invite-modal";
import { CancelInviteModal } from "./cancel-invite-modal";
import { ForceLogoutModal } from "./force-logout-modal";
import type { useUserActions } from "../hooks/use-user-actions";

type Actions = ReturnType<typeof useUserActions>;

interface UserModalsProps {
  actions: Actions;
  onRefresh: () => void;
}

export function UserModals({ actions, onRefresh }: UserModalsProps) {
  return (
    <>
      {/* ── Invite Modal ─────────────────────────────────────────────── */}
      <Modal
        title="Invite User"
        description="Send an invitation email to the invitee."
        isOpen={actions.addModal}
        onClose={actions.closeAdd}
      >
        <UserForm
          key="new"
          isEdit={false}
          isSubmitting={actions.isSubmitting}
          defaultValues={undefined}
          onSubmit={actions.handleFormSubmit}
          onCancel={actions.closeAdd}
        />
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────────────── */}
      <Modal
        title="Edit User"
        description="Update user account details."
        isOpen={actions.editModal}
        onClose={actions.closeEdit}
      >
        {actions.editModal && actions.selectedUser && (
          <UserForm
            key={actions.selectedUser._id}
            isEdit={true}
            isSubmitting={actions.isSubmitting}
            defaultValues={{
              name: actions.selectedUser.name,
              email: actions.selectedUser.email,
              avatar: actions.selectedUser.avatar,
              globalRole: actions.selectedUser.globalRole ?? "USER",
            }}
            onSubmit={actions.handleFormSubmit}
            onCancel={actions.closeEdit}
          />
        )}
      </Modal>

      {/* ── User Details Drawer ──────────────────────────────────────── */}
      <UserDetailDrawer
        user={actions.selectedUser}
        isOpen={actions.viewDrawer}
        onClose={actions.closeView}
        onEdit={actions.handleOpenEdit}
        onAssignRoles={actions.handleOpenAssignRoles}
        onForceLogout={actions.handleOpenForceLogout}
      />

      {/* ── Suspend ──────────────────────────────────────────────────── */}
      <SuspendModal
        isOpen={actions.suspendModal.isOpen}
        onClose={actions.closeSuspend}
        target={actions.suspendModal.target}
        isLoading={actions.suspendModal.isLoading}
        onConfirm={actions.confirmSuspend}
      />

      {/* ── Archive ──────────────────────────────────────────────────── */}
      <ArchiveModal
        isOpen={actions.archiveModal.isOpen}
        onClose={actions.closeArchive}
        target={actions.archiveModal.target}
        isLoading={actions.archiveModal.isLoading}
        onConfirm={actions.confirmArchive}
      />

      {/* ── Unarchive ────────────────────────────────────────────────── */}
      <UnarchiveModal
        isOpen={actions.unarchiveModal.isOpen}
        onClose={actions.closeUnarchive}
        target={actions.unarchiveModal.target}
        isLoading={actions.unarchiveModal.isLoading}
        onConfirm={actions.confirmUnarchive}
      />

      {/* ── Unsuspend ────────────────────────────────────────────────── */}
      <UnsuspendModal
        isOpen={actions.unsuspendModal.isOpen}
        onClose={actions.closeUnsuspend}
        target={actions.unsuspendModal.target}
        isLoading={actions.unsuspendModal.isLoading}
        onConfirm={actions.confirmUnsuspend}
      />

      {/* ── Resend Invite ────────────────────────────────────────────── */}
      <ResendInviteModal
        isOpen={actions.resendModal.isOpen}
        onClose={actions.closeResend}
        target={actions.resendModal.target}
        isLoading={actions.resendModal.isLoading}
        onConfirm={actions.confirmResend}
      />

      {/* ── Cancel Invite ────────────────────────────────────────────── */}
      <CancelInviteModal
        isOpen={actions.cancelInviteModal.isOpen}
        onClose={actions.closeCancelInvite}
        target={actions.cancelInviteModal.target}
        isLoading={actions.cancelInviteModal.isLoading}
        onConfirm={actions.confirmCancelInvite}
      />

      {/* ── Force Logout ─────────────────────────────────────────────── */}
      <ForceLogoutModal
        isOpen={actions.forceLogoutModal.isOpen}
        onClose={actions.closeForceLogout}
        target={actions.forceLogoutModal.target}
        isLoading={actions.forceLogoutModal.isLoading}
        onConfirm={actions.confirmForceLogout}
      />

      {/* ── Assign Roles ─────────────────────────────────────────────── */}
      <AssignRolesModal
        user={actions.assignRolesModal.target}
        isOpen={actions.assignRolesModal.isOpen}
        onClose={actions.closeAssignRoles}
        onSuccess={onRefresh}
      />
    </>
  );
}
