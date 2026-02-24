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
import { UserView } from "./components/user-view";
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
    handleDeleteUser
  } = useUserHandlers(refresh);

  const handleFormSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    let uploadedAvatarUrl: string | null = null;
    try {
      // Upload the image only NOW (on submit) if a File was picked
      const avatarUrl = await resolveAvatar(data.avatar, "users", 200, 200);
      // Track the URL so we can roll back if the API call fails
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
          setActiveTab('invited'); // ← auto-switch to invited tab
        } else {
          await AdminService.createUser(payload);
          toast.success("User created successfully");
        }
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      refresh();
    } catch (error: any) {
      // ── Rollback: delete the just-uploaded image so storage isn't polluted ──
      if (uploadedAvatarUrl) {
        AdminService.deleteUploadedImage(uploadedAvatarUrl).catch(() => {});
      }
      console.error(error);
      toast.error(error?.response?.data?.message || error?.message || `Failed to ${isEditModalOpen ? 'update' : 'create'} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => getUserColumns({
    onView: handleViewUser,
    onEdit: (user) => handleOpenEditModal(user),
    onDelete: (user) => handleDeleteUser(user),
    onSuspend: (user) => { setSuspendNote(''); handleOpenSuspendModal(user); },
    tab: activeTab,
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

      {/* Forms Modal */}
      <Modal
        title={isEditModalOpen ? "Edit User" : "Invite User"}
        description={
          isEditModalOpen
            ? "Update user account details."
            : "Send an invitation email. The invitee will receive a link to complete their registration."
        }
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
      >
        <UserForm
          isEdit={isEditModalOpen}
          isSubmitting={isSubmitting}
          defaultValues={selectedUser ? {
            name: selectedUser.name,
            email: selectedUser.email,
            avatar: selectedUser.avatar,
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
        />
      </Modal>

      {/* Details View Modal */}
      <UserView 
        user={selectedUser}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleOpenEditModal}
      />

      {/* Suspend User Modal */}
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
    </div>
  );
}
