'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from "sonner";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/data-table";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { OrganizationForm, OrganizationFormValues } from "./components/organization-form";
import { OrganizationView } from "./components/organization-view";
import { getOrganizationColumns } from "./organization-utils";
import { useOrganizationHandlers } from "./organization-helpers";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getOrganizations(page, limit, search, activeTab === 'active');
      setOrganizations(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch organizations");
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
    selectedOrganization,
    handleOpenAddModal,
    handleOpenEditModal,
    handleViewOrganization,
    handleArchiveOrganization,
    handleDeleteOrganization
  } = useOrganizationHandlers(fetchOrganizations);

  useEffect(() => {
    fetchOrganizations();
  }, [search, page, limit, activeTab]);

  const handleFormSubmit = async (data: OrganizationFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditModalOpen && selectedOrganization) {
        await AdminService.updateOrganization(selectedOrganization._id, data);
        toast.success("Organization updated successfully");
      } else {
        await AdminService.createOrganization(data);
        toast.success("Organization created successfully");
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchOrganizations(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || `Failed to ${isEditModalOpen ? 'update' : 'create'} organization`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => getOrganizationColumns({
    onView: handleViewOrganization,
    onEdit: (org) => handleOpenEditModal(org),
    onArchive: (org) => handleArchiveOrganization(org),
    onDelete: (org) => handleDeleteOrganization(org)
  }), [handleViewOrganization, handleOpenEditModal, handleArchiveOrganization, handleDeleteOrganization]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organizations"
        description="Manage all registered organizations."
        action={{
          label: "Add Organization",
          icon: Plus,
          onClick: handleOpenAddModal
        }}
      />

      <FilterSection 
        searchPlaceholder="Search organizations..."
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
          { label: "Active", value: "active" },
          { label: "Archived", value: "archived" }
        ]}
      />

      <DataTable 
        columns={columns as any} 
        data={organizations} 
        loading={loading}
        onRowClick={handleViewOrganization}
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
          itemName="organizations"
          className="justify-end"
        />
      </div>

      {/* Forms Modal */}
      <Modal
        title={isEditModalOpen ? "Edit Organization" : "Add Organization"}
        description={isEditModalOpen ? "Update organization details." : "Create a new organization workspace."}
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
      >
        <OrganizationForm
          isEdit={isEditModalOpen}
          isSubmitting={isSubmitting}
          defaultValues={selectedOrganization ? {
            name: selectedOrganization.name,
            status: selectedOrganization.status,
            plan: selectedOrganization.plan
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
        />
      </Modal>

      {/* Details View Modal */}
      <OrganizationView 
        organization={selectedOrganization}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleOpenEditModal}
        onArchive={handleArchiveOrganization}
      />
    </div>
  );
}
