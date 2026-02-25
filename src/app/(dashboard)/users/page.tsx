'use client';

import { useState, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { UserForm, UserFormValues } from "./components/user-form";
import { UserDetailDrawer } from "./components/user-detail-drawer";
import { AssignRolesModal } from "./components/assign-roles-modal";
import { getUserColumns } from "./user-utils";
import { useUserHandlers } from "./user-helpers";
import { useFetchData } from "@/hooks/use-fetch-data";
import { resolveAvatar } from "@/components/ui/image-uploader/image-uploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suspendNote, setSuspendNote] = useState('');
  const [isSuspending, setIsSuspending] = useState(false);

  // ── Resend-invite confirmation modal ─────────────────────────────────────
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [resendTarget, setResendTarget] = useState<any>(null);
  const [isResending, setIsResending] = useState(false);

  // ── Archive confirmation modal ────────────────────────────────────────────
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<any>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // ── Cancel invite confirmation modal ──────────────────────────────────────
  const [isCancelInviteModalOpen, setIsCancelInviteModalOpen] = useState(false);
  const [cancelInviteTarget, setCancelInviteTarget] = useState<any>(null);
  const [isCancellingInvite, setIsCancellingInvite] = useState(false);

  // ── Unarchive confirmation modal ──────────────────────────────────────────
  const [isUnarchiveModalOpen, setIsUnarchiveModalOpen] = useState(false);
  const [unarchiveTarget, setUnarchiveTarget] = useState<any>(null);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  // ── Unsuspend confirmation modal ──────────────────────────────────────────
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false);
  const [unsuspendTarget, setUnsuspendTarget] = useState<any>(null);
  const [isUnsuspending, setIsUnsuspending] = useState(false);

  // ── Force Logout confirmation modal ──────────────────────────────────────
  const [isForceLogoutModalOpen, setIsForceLogoutModalOpen] = useState(false);
  const [forceLogoutTarget, setForceLogoutTarget] = useState<any>(null);
  const [isForceLoggingOut, setIsForceLoggingOut] = useState(false);

  // ── Assign Roles modal ────────────────────────────────────────────────────
  const [isAssignRolesModalOpen, setIsAssignRolesModalOpen] = useState(false);
  const [assignRolesTarget, setAssignRolesTarget] = useState<any>(null);

  const fetchParams = useMemo(() => ({
    page,
    limit,
    search,
    tab: activeTab,
  }), [page, limit, search, activeTab]);

  const {
    data: users,
    loading,
    totalItems,
    totalPages,
    refresh
  } = useFetchData(AdminService.getUsers, fetchParams);

  const {
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
  } = useUserHandlers(refresh);

  const handleFormSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    let uploadedAvatarUrl: string | null = null;
    try {
      const avatarUrl = await resolveAvatar(data.avatar, "users", 200, 200);
      if (avatarUrl && data.avatar instanceof File) {
        uploadedAvatarUrl = avatarUrl;
      }
      const payload = { ...data, avatar: avatarUrl };

      if (isEditModalOpen && selectedUser) {
        await AdminService.updateUser(selectedUser._id, payload);
        toast.success("User updated successfully");
      } else {
        if (data.isInvite) {
          await AdminService.inviteUser(payload);
          toast.success("Invitation sent successfully");
          setActiveTab('invited');
        } else {
          await AdminService.createUser(payload);
          toast.success("User created successfully");
        }
      }
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      refresh();
    } catch (error: any) {
      if (uploadedAvatarUrl) {
        AdminService.deleteUploadedImage(uploadedAvatarUrl).catch(() => {});
      }
      console.error(error);
      toast.error(error?.response?.data?.message || error?.message || `Failed to ${isEditModalOpen ? 'update' : 'create'} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Resend invite ─────────────────────────────────────────────────────────
  const handleResendClick = (user: any) => {
    setResendTarget(user);
    setIsResendModalOpen(true);
  };

  const handleConfirmResend = async () => {
    if (!resendTarget) return;
    setIsResending(true);
    try {
      await AdminService.resendInvite(resendTarget._id);
      toast.success('Invitation resent successfully');
      setIsResendModalOpen(false);
      setResendTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to resend invitation');
    } finally {
      setIsResending(false);
    }
  };

  // ── Cancel invite ─────────────────────────────────────────────────────────
  const handleCancelInviteClick = (user: any) => {
    setCancelInviteTarget(user);
    setIsCancelInviteModalOpen(true);
  };

  const handleConfirmCancelInvite = async () => {
    if (!cancelInviteTarget) return;
    setIsCancellingInvite(true);
    try {
      await handleCancelInvite(cancelInviteTarget);
      setIsCancelInviteModalOpen(false);
      setCancelInviteTarget(null);
    } catch {
      // error already toasted in handleCancelInvite
    } finally {
      setIsCancellingInvite(false);
    }
  };

  // ── Archive user ──────────────────────────────────────────────────────────
  const handleArchiveClick = (user: any) => {
    setArchiveTarget(user);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      await AdminService.archiveUser(archiveTarget._id);
      toast.success('User archived successfully');
      setIsArchiveModalOpen(false);
      setArchiveTarget(null);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to archive user');
    } finally {
      setIsArchiving(false);
    }
  };

  // ── Unarchive user ────────────────────────────────────────────────────────
  const handleUnarchiveClick = (user: any) => {
    setUnarchiveTarget(user);
    setIsUnarchiveModalOpen(true);
  };

  const handleConfirmUnarchive = async () => {
    if (!unarchiveTarget) return;
    setIsUnarchiving(true);
    try {
      await AdminService.unarchiveUser(unarchiveTarget._id);
      toast.success('User unarchived successfully');
      setIsUnarchiveModalOpen(false);
      setUnarchiveTarget(null);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to unarchive user');
    } finally {
      setIsUnarchiving(false);
    }
  };

  // ── Unsuspend user ────────────────────────────────────────────────────────
  const handleUnsuspendClick = (user: any) => {
    setUnsuspendTarget(user);
    setIsUnsuspendModalOpen(true);
  };

  const handleConfirmUnsuspend = async () => {
    if (!unsuspendTarget) return;
    setIsUnsuspending(true);
    try {
      await AdminService.restoreUser(unsuspendTarget._id);
      toast.success('User unsuspended successfully');
      setIsUnsuspendModalOpen(false);
      setUnsuspendTarget(null);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to unsuspend user');
    } finally {
      setIsUnsuspending(false);
    }
  };

  // ── Force Logout ──────────────────────────────────────────────────────────
  const handleForceLogoutClick = (user: any) => {
    setForceLogoutTarget(user);
    setIsForceLogoutModalOpen(true);
  };

  const handleConfirmForceLogout = async () => {
    if (!forceLogoutTarget) return;
    setIsForceLoggingOut(true);
    try {
      await AdminService.forceLogout(forceLogoutTarget._id);
      toast.success(`${forceLogoutTarget.name || 'User'} has been logged out of all sessions`);
      setIsForceLogoutModalOpen(false);
      setForceLogoutTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to force logout user');
    } finally {
      setIsForceLoggingOut(false);
    }
  };

  // ── Assign Roles ──────────────────────────────────────────────────────────
  const handleAssignRolesClick = (user: any) => {
    setAssignRolesTarget(user);
    setIsAssignRolesModalOpen(true);
  };

  const columns = useMemo(() => getUserColumns({
    onView: handleViewUser,
    onEdit: (user) => handleOpenEditModal(user),
    onDelete: (user) => {
      if (activeTab === 'invited') {
        handleCancelInviteClick(user);
      } else if (activeTab === 'suspended') {
        handleUnsuspendClick(user);
      } else {
        handleDeleteUser(user);
      }
    },
    onSuspend: (user) => { setSuspendNote(''); handleOpenSuspendModal(user); },
    onResend: handleResendClick,
    onArchive: handleArchiveClick,
    onUnarchive: handleUnarchiveClick,
    onAssignRoles: handleAssignRolesClick,
    onForceLogout: handleForceLogoutClick,
    tab: activeTab,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [handleViewUser, handleOpenEditModal, handleDeleteUser, handleOpenSuspendModal, activeTab]);

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Users"
          description="Manage system users, roles, and permissions."
          action={{
            label: "Invite User",
            icon: Plus,
            onClick: handleOpenAddModal
          }}
        />
      </div>

      <div className="px-6 shrink-0">
        <FilterSection
          searchPlaceholder="Search users by name or email..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          activeTab={activeTab}
          onTabChange={(val) => {
            setActiveTab(val);
            setPage(1);
            setSearch('');
          }}
          tabs={[
            { label: "Active", value: "active" },
            { label: "Suspended", value: "suspended" },
            { label: "Archived", value: "archived" },
            { label: "Invited", value: "invited" },
          ]}
        />
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <DataTable
          columns={columns as any}
          data={users}
          loading={loading}
          onRowClick={handleViewUser}
        />
      </div>

      <div className="px-6 pb-6 pt-2 border-t mt-auto shrink-0 bg-background/80 backdrop-blur-sm z-20">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          itemName="users"
        />
      </div>

      {/* ── Invite / Edit Modal ─────────────────────────────────────────── */}
      <Modal
        title={isEditModalOpen ? "Edit User" : "Invite User"}
        description={
          isEditModalOpen
            ? "Update user account details."
            : "Send an invitation email to the invitee."
        }
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsSubmitting(false);
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setIsViewModalOpen(false);
        }}
      >
        <UserForm
          key={selectedUser?._id ?? 'new'}
          isEdit={isEditModalOpen}
          isSubmitting={isSubmitting}
          defaultValues={selectedUser ? {
            name: selectedUser.name,
            email: selectedUser.email,
            avatar: selectedUser.avatar,
            globalRole: selectedUser.globalRole ?? 'USER',
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsSubmitting(false);
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
        />
      </Modal>

      {/* ── User Details Drawer ─────────────────────────────────────────── */}
      <UserDetailDrawer
        user={selectedUser}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleOpenEditModal}
        onAssignRoles={handleAssignRolesClick}
        onForceLogout={handleForceLogoutClick}
      />

      {/* ── Suspend Modal ──────────────────────────────────────────────── */}
      <Modal
        title="Suspend User"
        description={`Suspend ${selectedUser?.name || 'this user'}. They will not be able to log in until restored.`}
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="suspend-note">Reason for suspension <span className="text-destructive">*</span></Label>
            <Textarea
              id="suspend-note"
              placeholder="Describe why this user is being suspended..."
              value={suspendNote}
              onChange={(e) => setSuspendNote(e.target.value)}
              rows={3}
              disabled={isSuspending}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsSuspendModalOpen(false)}
              disabled={isSuspending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!suspendNote.trim() || isSuspending}
              onClick={async () => {
                setIsSuspending(true);
                await handleConfirmSuspend(suspendNote.trim());
                setIsSuspending(false);
              }}
            >
              {isSuspending ? "Suspending..." : "Confirm Suspend"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Resend Invite Confirmation Modal ───────────────────────────── */}
      <Modal
        title="Resend Invitation"
        description={`Resend invitation email to ${resendTarget?.name || resendTarget?.email || 'this invitee'}?`}
        isOpen={isResendModalOpen}
        onClose={() => { setIsResendModalOpen(false); setResendTarget(null); }}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            A new invitation link will be sent to <span className="font-medium text-foreground">{resendTarget?.email}</span>.
            The previous link will be invalidated.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setIsResendModalOpen(false); setResendTarget(null); }}
              disabled={isResending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmResend}
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend Invitation"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Archive Confirmation Modal ─────────────────────────────────── */}
      <Modal
        title="Archive User"
        description={`Archive ${archiveTarget?.name || 'this user'}? This will deactivate their account and all assigned roles.`}
        isOpen={isArchiveModalOpen}
        onClose={() => { setIsArchiveModalOpen(false); setArchiveTarget(null); }}
      >
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm text-destructive font-medium">What will happen:</p>
            <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>User will be deactivated and cannot log in</li>
              <li>All platform roles will be deactivated</li>
              <li>Active session will be invalidated immediately</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setIsArchiveModalOpen(false); setArchiveTarget(null); }}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmArchive}
              disabled={isArchiving}
            >
              {isArchiving ? "Archiving..." : "Archive User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Cancel Invite Confirmation Modal ───────────────────────────── */}
      <Modal
        title="Cancel Invitation"
        description={`Cancel invitation for ${cancelInviteTarget?.name || cancelInviteTarget?.email || 'this invitee'}?`}
        isOpen={isCancelInviteModalOpen}
        onClose={() => { setIsCancelInviteModalOpen(false); setCancelInviteTarget(null); }}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            The invitation link sent to{' '}
            <span className="font-medium text-foreground">{cancelInviteTarget?.email}</span>{' '}
            will be cancelled and they will no longer be able to register with this link.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setIsCancelInviteModalOpen(false); setCancelInviteTarget(null); }}
              disabled={isCancellingInvite}
            >
              Keep Invitation
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancelInvite}
              disabled={isCancellingInvite}
            >
              {isCancellingInvite ? "Cancelling..." : "Cancel Invitation"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Assign Roles Modal ──────────────────────────────────────────── */}
      <AssignRolesModal
        user={assignRolesTarget}
        isOpen={isAssignRolesModalOpen}
        onClose={() => { setIsAssignRolesModalOpen(false); setAssignRolesTarget(null); }}
        onSuccess={refresh}
      />

      {/* ── Force Logout Confirmation Modal ───────────────────────────────── */}
      <Modal
        title="Force Logout"
        description={`Log out ${forceLogoutTarget?.name || 'this user'} from all active sessions?`}
        isOpen={isForceLogoutModalOpen}
        onClose={() => { setIsForceLogoutModalOpen(false); setForceLogoutTarget(null); }}
      >
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3">
            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">What will happen:</p>
            <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>All active sessions will be immediately terminated</li>
              <li>Refresh tokens will be invalidated</li>
              <li>User will need to log in again</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setIsForceLogoutModalOpen(false); setForceLogoutTarget(null); }}
              disabled={isForceLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmForceLogout}
              disabled={isForceLoggingOut}
              className="bg-amber-600 hover:bg-amber-700 text-white border-transparent"
            >
              {isForceLoggingOut ? "Logging out..." : "Force Logout"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Unarchive Confirmation Modal ───────────────────────────────── */}
      <Modal
        title="Unarchive User"
        description={`Restore ${unarchiveTarget?.name || 'this user'} from archive?`}
        isOpen={isUnarchiveModalOpen}
        onClose={() => { setIsUnarchiveModalOpen(false); setUnarchiveTarget(null); }}
      >
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-3">
            <p className="text-sm text-green-800 dark:text-green-400 font-medium">What will happen:</p>
            <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>User account will be re-activated</li>
              <li>All platform roles will be restored</li>
              <li>User can log in again with their credentials</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setIsUnarchiveModalOpen(false); setUnarchiveTarget(null); }}
              disabled={isUnarchiving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUnarchive}
              disabled={isUnarchiving}
            >
              {isUnarchiving ? "Restoring..." : "Unarchive User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Unsuspend Confirmation Modal ───────────────────────────────── */}
      <Modal
        title="Unsuspend User"
        description={`Lift suspension for ${unsuspendTarget?.name || 'this user'}?`}
        isOpen={isUnsuspendModalOpen}
        onClose={() => { setIsUnsuspendModalOpen(false); setUnsuspendTarget(null); }}
      >
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-3">
            <p className="text-sm text-green-800 dark:text-green-400 font-medium">What will happen:</p>
            <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Suspension will be lifted immediately</li>
              <li>User will be able to log in again</li>
              <li>Suspension reason will be cleared</li>
            </ul>
          </div>
          {unsuspendTarget?.suspenseNote && (
            <div className="rounded-lg border border-muted bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground font-medium mb-1">Suspension reason</p>
              <p className="text-sm text-foreground">{unsuspendTarget.suspenseNote}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setIsUnsuspendModalOpen(false); setUnsuspendTarget(null); }}
              disabled={isUnsuspending}
            >
              Keep Suspended
            </Button>
            <Button
              onClick={handleConfirmUnsuspend}
              disabled={isUnsuspending}
            >
              {isUnsuspending ? "Unsuspending..." : "Unsuspend User"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
