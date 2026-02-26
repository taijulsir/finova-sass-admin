"use client";

import { useState, useCallback } from "react";
import { AdminService } from "@/services/admin.service";
import { toast } from "sonner";
import { Plan } from "./plan-utils";

export function usePlanHandlers(refresh: () => void) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleViewPlan = useCallback((plan: Plan) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  }, []);

  const handleEditPlan = useCallback((plan: Plan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  }, []);

  const handleArchivePlan = useCallback(
    async (plan: Plan) => {
      const action = plan.isActive ? "archive" : "restore";
      try {
        if (plan.isActive) {
          await AdminService.archivePlan(plan._id);
        } else {
          await AdminService.updatePlan(plan._id, { isActive: true });
        }
        toast.success(`Plan ${action}d successfully`);
        refresh();
      } catch (error: any) {
        console.error(error);
        toast.error(error?.response?.data?.message || `Failed to ${action} plan`);
      }
    },
    [refresh]
  );

  const handleSeedPlans = useCallback(async () => {
    try {
      await AdminService.seedPlans();
      toast.success("Default plans seeded successfully");
      refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to seed plans");
    }
  }, [refresh]);

  return {
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
  };
}
