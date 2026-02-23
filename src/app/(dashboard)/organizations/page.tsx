'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { Building2, Plus, Search, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { TbEdit, TbArchive } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { toast } from "sonner";
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
import { OrganizationForm, OrganizationFormValues } from "./components/organization-form";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('active');
  
  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, [search, page, activeTab]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getOrganizations(page, 10, search, activeTab === 'active');
      setOrganizations(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: OrganizationFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEdit && selectedOrg) {
        await AdminService.updateOrganization(selectedOrg._id, data);
        toast.success("Organization updated successfully");
      } else {
        await AdminService.createOrganization(data);
        toast.success("Organization created successfully");
      }
      setIsFormModalOpen(false);
      fetchOrganizations(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} organization`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedOrg(null);
    setIsEdit(false);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    setSelectedOrg(org);
    setIsEdit(true);
    setIsFormModalOpen(true);
  };

  const handleViewOrganization = (org: any) => {
    setSelectedOrg(org);
    setIsViewModalOpen(true);
  };

  const handleArchiveOrganization = (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    setSelectedOrg(org);
    setIsArchiveModalOpen(true);
  };

  const confirmArchive = async () => {
    if (!selectedOrg) return;
    try {
      await AdminService.archiveOrganization(selectedOrg._id);
      toast.success("Organization archived successfully");
      fetchOrganizations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to archive organization");
    }
  };

  const columns = useMemo(() => [
    {
      header: "Name",
      accessorKey: "name" as const,
      className: "font-medium",
    },
    {
      header: "Status",
      cell: (org: any) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {org.status}
        </span>
      ),
    },
    {
      header: "Plan",
      cell: (org: any) => <span className="capitalize">{org.plan}</span>,
    },
    {
      header: "Owner",
      cell: (org: any) => <span>{org.ownerId?.email || 'N/A'}</span>,
    },
    {
      header: "Created At",
      cell: (org: any) => <span>{new Date(org.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (org: any) => (
        <div className="flex items-center justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            onClick={(e) => handleOpenEditModal(e, org)}
            title="Edit"
          >
            <TbEdit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
            onClick={(e) => handleArchiveOrganization(e, org)}
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewOrganization(org); }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Add more actions */ }}>
                Manage Billing
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
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage all registered organizations.</p>
        </div>
        
        <Button className="shadow" onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Organization
        </Button>
        
        {/* Unified Create/Edit Modal */}
        <Modal
          title={isEdit ? "Edit Organization" : "Add Organization"}
          description={isEdit ? "Update organization details." : "Create a new organization workspace."}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
        >
          <OrganizationForm
            isEdit={isEdit}
            isSubmitting={isSubmitting}
            defaultValues={selectedOrg ? {
              name: selectedOrg.name,
              status: selectedOrg.status,
              plan: selectedOrg.plan
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
          title="Archive Organization"
          description={`Are you sure you want to archive ${selectedOrg?.name}?`}
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
              placeholder="Search organizations..."
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
        data={organizations} 
        loading={loading}
        onRowClick={handleViewOrganization}
        emptyMessage="No organizations found."
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

      {/* View Organization Modal */}
      <Modal
        title="Organization Details"
        description="View detailed information about this organization."
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      >
        {selectedOrg && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base font-semibold">{selectedOrg.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  selectedOrg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedOrg.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Plan</p>
                <p className="text-base capitalize">{selectedOrg.plan}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Owner Email</p>
                <p className="text-base">{selectedOrg.ownerId?.email || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="text-base">{new Date(selectedOrg.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Organization ID</p>
                <p className="text-xs font-mono bg-muted p-1 rounded">{selectedOrg._id}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                onClick={(e) => handleOpenEditModal(e, selectedOrg)}
              >
                <TbEdit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button 
                variant="outline" 
                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
                onClick={(e) => handleArchiveOrganization(e, selectedOrg)}
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
