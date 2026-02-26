'use client';

import { useState, useMemo, useEffect } from 'react';
import { AdminService } from '@/services/admin.service';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from "sonner";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { OrganizationForm } from "./components/organization-form";
import { OrganizationView } from "./components/organization-view";
import { getOrganizationColumns, Plan } from "./organization-utils";
import { useOrganizationHandlers } from "./organization-helpers";
import { useFetchData } from "@/hooks/use-fetch-data";

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Fetch available plans for the create form
  useEffect(() => {
    AdminService.getPlans({ page: 1, limit: 50 }).then((res) => {
      setPlans(res.data || []);
    }).catch(() => {});
  }, []);

  const fetchParams = useMemo(() => ({
    page,
    limit,
    search,
    isActive: activeTab === 'active'
  }), [page, limit, search, activeTab]);

  const {
    data: organizations,
    loading,
    totalItems,
    totalPages,
    refresh
  } = useFetchData(AdminService.getOrganizations, fetchParams, [activeTab]);

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
  } = useOrganizationHandlers(refresh);

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isEditModalOpen && selectedOrganization) {
        await AdminService.updateOrganization(selectedOrganization._id, data);
        toast.success("Organization updated successfully");
      } else {
        await AdminService.createOrganization(data);
        toast.success("Organization created successfully");
      }
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      refresh(); 
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
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Organizations"
          description="Manage all registered organizations."
          action={{
            label: "Add Organization",
            icon: Plus,
            onClick: handleOpenAddModal
          }}
        />
      </div>

      <div className="px-6 shrink-0">
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
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <DataTable 
          columns={columns as any} 
          data={organizations} 
          loading={loading}
          onRowClick={handleViewOrganization}
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
          itemName="organizations"
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
          plans={plans}
          defaultValues={
            isEditModalOpen && selectedOrganization
              ? {
                  name: selectedOrganization.name,
                  status: selectedOrganization.status,
                  logo: selectedOrganization.logo,
                }
              : undefined
          }
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
