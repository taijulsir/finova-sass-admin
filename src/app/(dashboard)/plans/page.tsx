"use client";

import { useState, useMemo } from "react";
import { AdminService } from "@/services/admin.service";
import { Plus, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { PlanForm, PlanFormValues } from "./components/plan-form";
import { PlanView } from "./components/plan-view";
import { getPlanColumns, Plan } from "./plan-utils";
import { usePlanHandlers } from "./plan-helpers";
import { useFetchData } from "@/hooks/use-fetch-data";
import { Button } from "@/components/ui/button";

export default function PlansPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParams = useMemo(
    () => ({
      page,
      limit,
      search,
      ...(activeTab === "active" ? { isActive: true } : activeTab === "archived" ? { isActive: false } : {}),
    }),
    [page, limit, search, activeTab]
  );

  const {
    data: plans,
    loading,
    totalItems,
    totalPages,
    refresh,
  } = useFetchData<Plan>(AdminService.getPlans, fetchParams, [activeTab]);

  const {
    isViewModalOpen,
    setIsViewModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedPlan,
    handleViewPlan,
    handleEditPlan,
    handleArchivePlan,
    handleSeedPlans,
  } = usePlanHandlers(refresh);

  // ── Transform form data → API payload ──────────────────────────────────
  const toApiPayload = (data: PlanFormValues) => ({
    name: data.name,
    description: data.description || "",
    price: data.price,
    yearlyPrice: data.yearlyPrice || 0,
    billingCycle: data.billingCycle,
    trialDays: data.trialDays || 0,
    sortOrder: data.sortOrder || 0,
    isPublic: data.isPublic ?? true,
    limits: {
      maxMembers: data.maxMembers,
      maxLeads: data.maxLeads,
      maxStorage: data.maxStorage,
    },
    features: (data.featuresText || "")
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean),
  });

  // ── Transform Plan → form default values ───────────────────────────────
  const toFormValues = (plan: Plan): Partial<PlanFormValues> => ({
    name: plan.name,
    description: plan.description || "",
    price: plan.price,
    yearlyPrice: plan.yearlyPrice || 0,
    billingCycle: plan.billingCycle as "monthly" | "yearly",
    trialDays: plan.trialDays,
    sortOrder: plan.sortOrder,
    isPublic: plan.isPublic,
    maxMembers: plan.limits.maxMembers,
    maxLeads: plan.limits.maxLeads,
    maxStorage: plan.limits.maxStorage,
    featuresText: plan.features.join("\n"),
  });

  const handleCreatePlan = async (data: PlanFormValues) => {
    setIsSubmitting(true);
    try {
      await AdminService.createPlan(toApiPayload(data));
      toast.success("Plan created successfully");
      setIsCreateModalOpen(false);
      refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePlan = async (data: PlanFormValues) => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      await AdminService.updatePlan(selectedPlan._id, toApiPayload(data));
      toast.success("Plan updated successfully");
      setIsEditModalOpen(false);
      refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () =>
      getPlanColumns({
        onView: handleViewPlan,
        onEdit: handleEditPlan,
        onArchive: handleArchivePlan,
      }),
    [handleViewPlan, handleEditPlan, handleArchivePlan]
  );

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Plans"
          description="Create and manage subscription plans available on the platform."
          action={{
            label: "Create Plan",
            icon: Plus,
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedPlans}
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Seed Default Plans
          </Button>
        </div>
      </div>

      <div className="px-6 shrink-0">
        <FilterSection
          searchPlaceholder="Search plans by name..."
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
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Archived", value: "archived" },
          ]}
        />
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <DataTable
          columns={columns as any}
          data={plans}
          loading={loading}
          onRowClick={handleViewPlan}
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
          itemName="plans"
        />
      </div>

      {/* Create Plan Modal */}
      <Modal
        title="Create New Plan"
        description="Add a new subscription plan to the platform."
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="lg"
      >
        <PlanForm
          isSubmitting={isSubmitting}
          onSubmit={handleCreatePlan}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        title="Edit Plan"
        description={`Update details for ${selectedPlan?.name || "plan"}.`}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="lg"
      >
        <PlanForm
          isSubmitting={isSubmitting}
          isEdit
          defaultValues={selectedPlan ? toFormValues(selectedPlan) : undefined}
          onSubmit={handleUpdatePlan}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Plan View Modal */}
      <PlanView
        plan={selectedPlan}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleEditPlan}
        onArchive={handleArchivePlan}
      />
    </div>
  );
}
