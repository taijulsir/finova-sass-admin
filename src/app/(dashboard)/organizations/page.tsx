'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { AdminService } from '@/services/admin.service';
import { Plus, Building2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { DeleteModal } from '@/components/ui-system/delete-modal';
import { toast } from "sonner";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizationForm } from "./components/organization-form";
import { OrganizationView } from "./components/organization-view";
import { ChangePlanModal } from "./components/change-plan-modal";
import { ExtendTrialModal } from "./components/extend-trial-modal";
import { CancelSubscriptionModal } from "./components/cancel-subscription-modal";
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

  // Filter state
  const [filterSubStatus, setFilterSubStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterBilling, setFilterBilling] = useState('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');

  // Fetch available plans
  useEffect(() => {
    AdminService.getPlans({ page: 1, limit: 50 }).then((res) => {
      setPlans(res.data || []);
    }).catch(() => {});
  }, []);

  const fetchParams = useMemo(() => ({
    page,
    limit,
    search,
    isActive: activeTab === 'active',
    ...(filterSubStatus && { subscriptionStatus: filterSubStatus }),
    ...(filterPlan && { planId: filterPlan }),
    ...(filterBilling && { billingCycle: filterBilling }),
    ...(filterCreatedBy && { createdBy: filterCreatedBy }),
  }), [page, limit, search, activeTab, filterSubStatus, filterPlan, filterBilling, filterCreatedBy]);

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
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isCancelSubModalOpen,
    setIsCancelSubModalOpen,
    selectedOrganization,
    handleOpenAddModal,
    handleOpenEditModal,
    handleViewOrganization,
    handleOpenChangePlanModal,
    handleOpenExtendTrialModal,
    handleOpenDeleteModal,
    handleOpenCancelSubModal,
    handleSuspendOrganization,
    handleReactivateOrganization,
    handleArchiveOrganization,
    handleDeleteOrganization,
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

  const handleCloseFormModal = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  }, [setIsAddModalOpen, setIsEditModalOpen]);

  const columns = useMemo(() => getOrganizationColumns({
    onView: handleViewOrganization,
    onEdit: (org) => handleOpenEditModal(org),
    onChangePlan: (org) => handleOpenChangePlanModal(org),
    onExtendTrial: (org) => handleOpenExtendTrialModal(org),
    onCancelSubscription: (org) => handleOpenCancelSubModal(org),
    onSuspend: (org) => handleSuspendOrganization(org),
    onReactivate: (org) => handleReactivateOrganization(org),
    onArchive: (org) => handleArchiveOrganization(org),
    onDelete: (org) => handleOpenDeleteModal(org),
  }), [
    handleViewOrganization,
    handleOpenEditModal,
    handleOpenChangePlanModal,
    handleOpenExtendTrialModal,
    handleOpenCancelSubModal,
    handleSuspendOrganization,
    handleReactivateOrganization,
    handleArchiveOrganization,
    handleOpenDeleteModal,
  ]);

  // Delete warning text
  const deleteWarning =
    selectedOrganization?.subscription &&
    selectedOrganization.subscription.status === "ACTIVE" &&
    !selectedOrganization.subscription.isTrial
      ? "This organization has an active paid subscription. Deleting it may cause billing issues."
      : undefined;

  const resetFilters = () => {
    setFilterSubStatus('');
    setFilterPlan('');
    setFilterBilling('');
    setFilterCreatedBy('');
  };

  const hasFilters = filterSubStatus || filterPlan || filterBilling || filterCreatedBy;

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

      <div className="px-6 shrink-0 space-y-3">
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

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterSubStatus} onValueChange={(v) => { setFilterSubStatus(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Sub Status" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="TRIAL">Trial</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PAST_DUE">Past Due</SelectItem>
              <SelectItem value="CANCELED">Canceled</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPlan} onValueChange={(v) => { setFilterPlan(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-35 h-8 text-xs">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="all">All Plans</SelectItem>
              {plans.filter(p => p.isActive).map(p => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterBilling} onValueChange={(v) => { setFilterBilling(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-35 h-8 text-xs">
              <SelectValue placeholder="Billing" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="all">All Billing</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCreatedBy} onValueChange={(v) => { setFilterCreatedBy(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-35 h-8 text-xs">
              <SelectValue placeholder="Created By" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SELF_SERVICE">Self-Service</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={resetFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6">
        {/* Empty state */}
        {!loading && organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">
              {search || hasFilters ? "No organizations found" : "Create your first organization"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search || hasFilters
                ? "Try adjusting your search query or filters."
                : "Get started by creating an organization. It will automatically set up the owner account and subscription."}
            </p>
            {!search && !hasFilters && (
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

      {/* ── Create Modal ──────────────────────────────────────────── */}
      {isAddModalOpen && (
        <Modal
          title="Add Organization"
          description="Create a new organization with owner and subscription."
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          size="lg"
        >
          <OrganizationForm
            isEdit={false}
            isSubmitting={isSubmitting}
            plans={plans}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Modal>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────── */}
      {isEditModalOpen && selectedOrganization && (
        <Modal
          title="Edit Organization"
          description="Update organization details."
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <OrganizationForm
            isEdit
            isSubmitting={isSubmitting}
            plans={plans}
            defaultValues={{
              name: selectedOrganization.name,
              status: selectedOrganization.status as "ACTIVE" | "SUSPENDED" | "ARCHIVED",
              logo: selectedOrganization.logo,
            }}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}

      {/* ── Details View (Sheet / Drawer) ─────────────────────────── */}
      <OrganizationView
        organization={selectedOrganization}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleOpenEditModal}
        onArchive={handleArchiveOrganization}
        onChangePlan={handleOpenChangePlanModal}
        onExtendTrial={handleOpenExtendTrialModal}
        onCancelSubscription={handleOpenCancelSubModal}
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

      {/* ── Cancel Subscription Modal ─────────────────────────────── */}
      <CancelSubscriptionModal
        organization={selectedOrganization}
        isOpen={isCancelSubModalOpen}
        onClose={() => setIsCancelSubModalOpen(false)}
        onSuccess={refresh}
      />

      {/* ── Delete Modal ──────────────────────────────────────────── */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteOrganization}
        title="Delete Organization"
        description="This action cannot be undone."
        entityName={selectedOrganization?.name}
        warning={deleteWarning}
      />
    </div>
  );
}
