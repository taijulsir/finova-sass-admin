'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { CreditCard, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from "sonner";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/data-table";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { SubscriptionForm, SubscriptionFormValues } from "./components/subscription-form";
import { SubscriptionView } from "./components/subscription-view";
import { getSubscriptionColumns } from "./subscription-utils";
import { useSubscriptionHandlers } from "./subscription-helpers";

export default function SubscriptionsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getOrganizations(page, limit, search, activeTab === 'active');
      setOrganizations(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const {
    isViewModalOpen,
    setIsViewModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedSub,
    handleViewSubscription,
    handleEditSubscription,
    handleArchiveSubscription,
    handleManageSubscription
  } = useSubscriptionHandlers(fetchSubscriptions);

  useEffect(() => {
    fetchSubscriptions();
  }, [search, page, limit, activeTab]);

  const handleUpdateSubscription = async (data: SubscriptionFormValues) => {
    if (!selectedSub) return;
    
    setIsSubmitting(true);
    try {
      await AdminService.updateOrganization(selectedSub._id, { plan: data.plan });
      toast.success("Subscription updated successfully");
      setIsEditModalOpen(false);
      fetchSubscriptions(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(() => getSubscriptionColumns({
    onView: handleViewSubscription,
    onEdit: (sub) => handleEditSubscription(sub),
    onArchive: (sub) => handleArchiveSubscription(sub),
    onManage: (sub) => handleManageSubscription(sub),
  }), [handleViewSubscription, handleEditSubscription, handleArchiveSubscription, handleManageSubscription]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Subscriptions"
        description="Monitor and manage all organization subscriptions and billing plans."
        action={{
          label: "Create Custom Plan",
          icon: Plus,
          onClick: () => toast.info("Custom plan creation would go here (Mock)")
        }}
      />

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
          { label: "Cancelled", value: "archived" }
        ]}
      />

      <DataTable 
        columns={columns as any} 
        data={organizations} 
        loading={loading}
        onRowClick={handleViewSubscription}
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
          itemName="subscriptions"
          className="justify-end"
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
          defaultValues={selectedSub ? {
            plan: selectedSub.plan
          } : undefined}
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
