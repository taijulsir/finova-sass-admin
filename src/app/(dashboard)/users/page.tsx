'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { Users, Search, Plus, MoreHorizontal } from 'lucide-react';
import { TbEdit, TbArchive } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArchiveModal } from "@/components/ui-system/archive-modal";
import { Pagination } from "@/components/ui-system/pagination";
import { FilterTabs } from "@/components/ui-system/filter-tabs";
import { DataTable } from "@/components/ui-system/data-table";
import { UserForm, UserFormValues } from "./components/user-form";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('active');

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, page, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getUsers(page, 10, search, activeTab === 'active');
      setUsers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEdit && selectedUser) {
        await AdminService.updateUser(selectedUser._id, data);
        toast.success("User updated successfully");
      } else {
        // Assume AdminService has a createUser or similar
        // await AdminService.createUser(data);
        toast.success("User logic not implemented yet");
      }
      setIsFormModalOpen(false);
      fetchUsers(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setIsEdit(false);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setSelectedUser(user);
    setIsEdit(true);
    setIsFormModalOpen(true);
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleArchiveUser = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setSelectedUser(user);
    setIsArchiveModalOpen(true);
  };

  const confirmArchive = async () => {
    if (!selectedUser) return;
    try {
      await AdminService.archiveUser(selectedUser._id);
      toast.success("User archived successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to archive user");
    }
  };

  const columns = useMemo(() => [
    {
      header: "User",
      cell: (user: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (user: any) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          user.globalRole === 'super-admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {user.globalRole}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (user: any) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          user.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {user.isEmailVerified ? 'Verified' : 'Pending'}
        </span>
      ),
    },
    {
      header: "Joined At",
      cell: (user: any) => <span>{new Date(user.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (user: any) => (
        <div className="flex items-center justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            onClick={(e) => handleOpenEditModal(e, user)}
            title="Edit"
          >
            <TbEdit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
            onClick={(e) => handleArchiveUser(e, user)}
            title="Archive"
          >
            <TbArchive className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewUser(user); }}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Add more actions */ }}>
                Reset Password
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage all registered users in the platform.</p>
        </div>
        
        <Button className="shadow" onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>

        {/* Unified Create/Edit Modal */}
        <Modal
          title={isEdit ? "Edit User" : "Add User"}
          description={isEdit ? "Update user details." : "Invite a new user to the platform."}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
        >
          <UserForm
            isEdit={isEdit}
            isSubmitting={isSubmitting}
            defaultValues={selectedUser ? {
              name: selectedUser.name,
              email: selectedUser.email
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormModalOpen(false)}
          />
        </Modal>

        {/* Archive Modal */}
        <ArchiveModal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          onConfirm={confirmArchive}
          title="Archive User"
          description={`Are you sure you want to archive ${selectedUser?.name}? This will prevent them from logging in.`}
        />
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <FilterTabs 
          activeTab={activeTab} 
          onTabChange={(val) => {
            setActiveTab(val);
            setPage(1);
          }} 
        />
        
        <div className="flex items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading}
        onRowClick={handleViewUser}
        emptyMessage="No users found."
      />

      {/* Pagination */}
      <div className="pt-4">
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
          className="justify-end"
        />
      </div>

      {/* View User Modal */}
      <Modal
        title="User Details"
        description="View detailed information about this user."
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                <p className="text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Global Role</p>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800">
                  {selectedUser.globalRole}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email Status</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  selectedUser.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedUser.isEmailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Joined At</p>
                <p className="text-base">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-xs font-mono bg-muted p-1 rounded">{selectedUser._id}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
               <Button 
                variant="outline" 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                onClick={(e) => handleOpenEditModal(e, selectedUser)}
              >
                <TbEdit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button 
                variant="outline" 
                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
                onClick={(e) => handleArchiveUser(e, selectedUser)}
              >
                <TbArchive className="mr-2 h-4 w-4" /> Archive
              </Button>
              <Button variant="default" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
