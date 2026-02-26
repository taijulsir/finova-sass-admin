'use client';

import { useState, useMemo, useEffect } from 'react';
import { AdminService } from '@/services/admin.service';
import { Plus, Building2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from "sonner";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { Button } from "@/components/ui/button";
import { OrganizationForm } from "./components/organization-form";
import { OrganizationView } from "./components/organization-view";
import { ChangePlanModal } from "./components/change-plan-modal";
import { ExtendTrialModal } from "./components/extend-trial-modal";
import { getOrganizationColumns, Plan, Organization } from "./organization-utils";
import { useOrganizationHandlers } from "./organization-helpers";
import { useFetchData } from "@/hooks/use-fetch-data";

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Fetch available plans for create form & change-plan modal
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
  } = useFetchData<Organization>(AdminService.getOrganizations, fetchParams, [activeTab]);

  const {
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    isChangePlanModalOpen,
    setIsChangePlanModalOpen,
    isExtendTrialModalOpen,
    setIsExtendTrialModalOpen,
    selectedOrganization,
    handleOpenAddModal,
    handleOpenEditModal,
    handleViewOrganization,
    handleOpenChangePlanModal,
    handleOpenExtendTrialModal,
    handleSuspendOrganization,
    handleReactivateOrganization,
    handleArchiveOrganization,
    handleDeleteOrganization,
    handleCancelSubscription,
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
    onChangePlan: (org) => handleOpenChangePlanModal(org),
    onExtendTrial: (org) => handleOpenExtendTrialModal(org),
    onCancelSubscription: (org) => handleCancelSubscription(org),
    onSuspend: (org) => handleSuspendOrganization(org),
    onReactivate: (org) => handleReactivateOrganization(org),
    onArchive: (org) => handleArchiveOrganization(org),
    onDelete: (org) => handleDeleteOrganization(org),
  }), [
    handleViewOrganization,
    handleOpenEditModal,
    handleOpenChangePlanModal,
    handleOpenExtendTrialModal,
    handleCancelSubscription,
    handleSuspendOrganization,
    handleReactivateOrganization,
    handleArchiveOrganization,
    handleDeleteOrganization,
  ]);

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Organizations"
          description="Manage all registered organizations, subscriptions, and billing."
          action={{
            label: "Add Organization",
            icon: Plus,
            onClick: handleOpenAddModal
          }}
        />
      </div>

      <div className="px-6 shrink-0">
        <FilterSection
          searchPlaceholder="Search by name, email, or organization ID..."
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
        {/* Empty state */}
        {!loading && organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">
              {search ? "No organizations found" : "Create your first organization"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search
                ? "Try adjusting your search query or filters."
                : "Get started by creating an organization. It will automatically set up the owner account and subscription."}
            </p>
            {!search && (
              <Button className="mt-4" onClick={handleOpenAddModal}>
                <Plus className="mr-2 h-4 w-4" /> Add Organization
              </Button>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns as any}
            data={organizations}
            loading={loading}
            onRowClick={handleViewOrganization}
          />
        )}
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

      {/* ── Create / Edit Modal ───────────────────────────────────── */}
      <Modal
        title={isEditModalOpen ? "Edit Organization" : "Add Organization"}
        description={
          isEditModalOpen
            ? "Update organization details."
            : "Create a new organization with owner and subscription."
        }
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
                  status: selectedOrganization.status as "active" | "suspended" | "archived",
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

      {/* ── Details View (Sheet / Drawer) ─────────────────────────── */}
      <OrganizationView
        organization={selectedOrganization}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleOpenEditModal}
        onArchive={handleArchiveOrganization}
        onChangePlan={handleOpenChangePlanModal}
        onExtendTrial={handleOpenExtendTrialModal}
        onCancelSubscription={handleCancelSubscription}
        onSuspend={handleSuspendOrganization}
        onReactivate={handleReactivateOrganization}
      />

      {/* ── Change Plan Modal ─────────────────────────────────────── */}
      <ChangePlanModal
        organization={selectedOrganization}
        plans={plans}
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        onSuccess={refresh}
      />

      {/* ── Extend Trial Modal ────────────────────────────────────── */}
      <ExtendTrialModal
        organization={selectedOrganization}
        isOpen={isExtendTrialModalOpen}
        onClose={() => setIsExtendTrialModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
