"use client";

import { useState, useMemo } from "react";
import { AdminService } from "@/services/admin.service";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { SubscriptionForm, SubscriptionFormValues } from "./components/subscription-form";
import { SubscriptionView } from "./components/subscription-view";
import { getSubscriptionColumns } from "./subscription-utils";
import { useSubscriptionHandlers } from "./subscription-helpers";
import { useFetchData } from "@/hooks/use-fetch-data";

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParams = useMemo(
    () => ({
      page,
      limit,
      search,
      isActive: activeTab === "active",
    }),
    [page, limit, search, activeTab]
  );

  const {
    data: subscriptions,
    loading,
    totalItems,
    totalPages,
    refresh,
  } = useFetchData(AdminService.getSubscriptions, fetchParams, [activeTab]);

  const {
    isViewModalOpen,
    setIsViewModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedSub,
    handleViewSubscription,
    handleEditSubscription,
    handleArchiveSubscription,
    handleManageSubscription,
  } = useSubscriptionHandlers(refresh);

  const handleUpdateSubscription = async (data: SubscriptionFormValues) => {
    if (!selectedSub) return;

    setIsSubmitting(true);
    try {
      await AdminService.updateOrganization(selectedSub._id, { plan: data.plan });
      toast.success("Subscription updated successfully");
      setIsEditModalOpen(false);
      refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () =>
      getSubscriptionColumns({
        onView: handleViewSubscription,
        onEdit: (sub) => handleEditSubscription(sub),
        onArchive: (sub) => handleArchiveSubscription(sub),
        onManage: (sub) => handleManageSubscription(sub),
      }),
    [handleViewSubscription, handleEditSubscription, handleArchiveSubscription, handleManageSubscription]
  );

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Subscriptions"
          description="Monitor and manage all organization subscriptions and billing plans."
          action={{
            label: "Create Custom Plan",
            icon: Plus,
            onClick: () => toast.info("Custom plan creation would go here (Mock)"),
          }}
        />
      </div>

      <div className="px-6 shrink-0">
        <FilterSection
          searchPlaceholder="Search by organization or email..."
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
            { label: "Cancelled", value: "archived" },
          ]}
        />
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <DataTable
          columns={columns as any}
          data={subscriptions}
          loading={loading}
          onRowClick={handleViewSubscription}
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
          itemName="subscriptions"
          
        />
      </div>

      {/* Edit/Change Plan Modal */}
      <Modal
        title="Change Subscription Plan"
        description={`Modify the subscription for ${selectedSub?.name}.`}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <SubscriptionForm
          isSubmitting={isSubmitting}
          defaultValues={
            selectedSub
              ? {
                  plan: selectedSub.plan,
                }
              : undefined
          }
          onSubmit={handleUpdateSubscription}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Details View Modal */}
      <SubscriptionView
        subscription={selectedSub}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleEditSubscription}
        onArchive={handleArchiveSubscription}
      />
    </div>
  );
}
