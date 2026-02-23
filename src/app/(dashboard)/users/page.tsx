'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { Users as UserIcon, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/data-table";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { UserForm, UserFormValues } from "./components/user-form";
import { UserView } from "./components/user-view";
import { getUserColumns } from "./user-utils";
import { useUserHandlers } from "./user-helpers";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getUsers(page, limit, search, activeTab === 'active');
      setUsers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

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
    handleArchiveUser,
    handleDeleteUser
  } = useUserHandlers(fetchUsers);

  useEffect(() => {
    fetchUsers();
  }, [search, page, limit, activeTab]);

  const handleFormSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditModalOpen && selectedUser) {
        await AdminService.updateUser(selectedUser._id, data);
        toast.success("User updated successfully");
      } else {
        await AdminService.createUser(data);
        toast.success("User created successfully");
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchUsers(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || `Failed to ${isEditModalOpen ? 'update' : 'create'} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => getUserColumns({
    onView: handleViewUser,
    onEdit: (user) => handleOpenEditModal(user),
    onArchive: (user) => handleArchiveUser(user),
    onDelete: (user) => handleDeleteUser(user),
  }), [handleViewUser, handleOpenEditModal, handleArchiveUser, handleDeleteUser]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Users"
        description="Manage system users, roles, and permissions."
        action={{
          label: "Add User",
          icon: Plus,
          onClick: handleOpenAddModal
        }}
      />

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
        }}
        tabs={[
          { label: "Active Users", value: "active" },
          { label: "Archived", value: "archived" }
        ]}
      />

      <DataTable 
        columns={columns as any} 
        data={users} 
        loading={loading}
        onRowClick={handleViewUser}
      />

      <div className="pt-4">
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
          className="justify-end"
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
            status: selectedUser.status
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
        onArchive={handleArchiveUser}
      />
    </div>
  );
}
