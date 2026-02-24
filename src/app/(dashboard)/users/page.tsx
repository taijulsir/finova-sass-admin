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

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    selectedUser,
    handleOpenAddModal,
    handleOpenEditModal,
    handleViewUser,
    handleDeleteUser
  } = useUserHandlers(refresh);

  const handleFormSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // Upload the image only NOW (on submit) if a File was picked
      const avatarUrl = await resolveAvatar(data.avatar, "users", 200, 200);
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
    tab: activeTab,
  }), [handleViewUser, handleOpenEditModal, handleDeleteUser, activeTab]);

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Users"
          description="Manage system users, roles, and permissions."
          action={{
            label: "Add User",
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
            { label: "Deactivated", value: "deactivated" },
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
        title={isEditModalOpen ? "Edit User" : "Add User"}
        description={isEditModalOpen ? "Update user account information." : "Onboard a new system user."}
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
            role: selectedUser.role,
            avatar: selectedUser.avatar
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
    </div>
  );
}
