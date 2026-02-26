import api from '../lib/api';

export const AdminService = {
  getDashboard: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },
  getOrganizations: async (params: any = { page: 1, limit: 10, search: '', isActive: true }) => {
    const { data } = await api.get('/admin/organizations', {
      params,
    });
    return data;
  },
  createOrganization: async (orgData: any) => {
    const { data } = await api.post('/admin/organizations', orgData);
    return data;
  },
  getOrganizationDetails: async (id: string) => {
    const { data } = await api.get(`/admin/organizations/${id}`);
    return data;
  },
  updateOrganization: async (id: string, orgData: any) => {
    const { data } = await api.patch(`/admin/organizations/${id}`, orgData);
    return data;
  },
  changeOrgStatus: async (id: string, status: string, reason?: string) => {
    const { data } = await api.patch(`/admin/organizations/${id}/status`, { status, reason });
    return data;
  },
  suspendOrganization: async (id: string, reason?: string) => {
    const { data } = await api.patch(`/admin/organizations/${id}/status`, { status: 'SUSPENDED', reason });
    return data;
  },
  reactivateOrganization: async (id: string) => {
    const { data } = await api.patch(`/admin/organizations/${id}/status`, { status: 'ACTIVE' });
    return data;
  },

  // ── Subscription management (per organization) ────────────────────────────
  changeOrgPlan: async (orgId: string, planId: string, reason?: string) => {
    const { data } = await api.patch(`/admin/organizations/${orgId}/plan`, { planId, reason });
    return data;
  },
  getSubscriptionDetails: async (orgId: string) => {
    const { data } = await api.get(`/admin/organizations/${orgId}/subscription`);
    return data;
  },
  getSubscriptionHistory: async (orgId: string) => {
    const { data } = await api.get(`/admin/organizations/${orgId}/subscription`);
    return data; // returns { subscription, history }
  },
  extendTrial: async (orgId: string, additionalDays: number, reason?: string) => {
    const { data } = await api.post(`/admin/organizations/${orgId}/subscription/extend-trial`, { additionalDays, reason });
    return data;
  },
  reactivateSubscription: async (orgId: string, planId: string, billingCycle?: string) => {
    const { data } = await api.post(`/admin/organizations/${orgId}/subscription/reactivate`, { planId, billingCycle });
    return data;
  },
  cancelSubscription: async (orgId: string, reason?: string) => {
    const { data } = await api.post(`/admin/organizations/${orgId}/subscription/cancel`, { reason });
    return data;
  },

  // ── Plans ─────────────────────────────────────────────────────────────────
  getPlans: async (params: any = { page: 1, limit: 50 }) => {
    const { data } = await api.get('/plans', { params });
    return data;
  },
  getActivePlans: async () => {
    const { data } = await api.get('/plans/active');
    return data;
  },
  createPlan: async (planData: any) => {
    const { data } = await api.post('/plans', planData);
    return data;
  },
  updatePlan: async (id: string, planData: any) => {
    const { data } = await api.patch(`/plans/${id}`, planData);
    return data;
  },
  archivePlan: async (id: string) => {
    const { data } = await api.delete(`/plans/${id}`);
    return data;
  },
  seedPlans: async () => {
    const { data } = await api.post('/admin/plans/seed');
    return data;
  },

  // ── Subscriptions (direct, by subscription ID) ────────────────────────────
  getSubscriptionKpis: async () => {
    const { data } = await api.get('/admin/subscriptions/kpis');
    return data;
  },
  getSubscriptions: async (params: any = { page: 1, limit: 10 }) => {
    const { data } = await api.get('/admin/subscriptions', { params });
    return data;
  },
  getAdminSubscription: async (subscriptionId: string) => {
    const { data } = await api.get(`/admin/subscriptions/${subscriptionId}`);
    return data;
  },
  getAdminSubscriptionHistory: async (subscriptionId: string) => {
    const { data } = await api.get(`/admin/subscriptions/${subscriptionId}/history`);
    return data;
  },
  adminChangePlan: async (subscriptionId: string, payload: { newPlanId: string; billingCycle?: string; reason: string }) => {
    const { data } = await api.patch(`/admin/subscriptions/${subscriptionId}/change-plan`, payload);
    return data;
  },
  adminExtendTrial: async (subscriptionId: string, payload: { additionalDays: number; reason?: string }) => {
    const { data } = await api.patch(`/admin/subscriptions/${subscriptionId}/extend-trial`, payload);
    return data;
  },
  adminCancelSubscription: async (subscriptionId: string, reason: string) => {
    const { data } = await api.patch(`/admin/subscriptions/${subscriptionId}/cancel`, { reason });
    return data;
  },
  adminReactivateSubscription: async (subscriptionId: string, payload: { planId: string; billingCycle?: string; reason?: string }) => {
    const { data } = await api.patch(`/admin/subscriptions/${subscriptionId}/reactivate`, payload);
    return data;
  },
  adminForceExpire: async (subscriptionId: string, reason: string) => {
    const { data } = await api.patch(`/admin/subscriptions/${subscriptionId}/force-expire`, { reason });
    return data;
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  getUsers: async (params: any = { page: 1, limit: 10, search: '', tab: 'active' }) => {
    // Strip undefined/empty values so URL stays clean
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') clean[k] = v as string | number;
    }
    const { data } = await api.get('/admin/users', { params: clean });
    return data;
  },
  checkEmail: async (email: string) => {
    const { data } = await api.get('/admin/users/check-email', { params: { email } });
    return data.data;
  },
  createUser: async (userData: any) => {
    const { data } = await api.post('/admin/users', userData);
    return data;
  },
  inviteUser: async (userData: any) => {
    const { data } = await api.post('/admin/users/invite', userData);
    return data;
  },
  resendInvite: async (invitationId: string) => {
    const { data } = await api.post(`/admin/users/${invitationId}/resend-invite`);
    return data;
  },
  cancelInvitation: async (invitationId: string) => {
    const { data } = await api.delete(`/admin/users/${invitationId}/cancel-invite`);
    return data;
  },
  suspenseUser: async (userId: string, note: string) => {
    const { data } = await api.patch(`/admin/users/${userId}/suspense`, { note });
    return data;
  },
  restoreUser: async (userId: string) => {
    const { data } = await api.patch(`/admin/users/${userId}/restore`);
    return data;
  },
  forceLogout: async (userId: string) => {
    const { data } = await api.patch(`/admin/users/${userId}/force-logout`);
    return data;
  },
  deleteUser: async (userId: string) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  },
  getAuditLogs: async (params: any = { page: 1, limit: 10, search: '', action: '' }) => {
    const { data } = await api.get('/admin/audit-logs', {
      params,
    });
    return data;
  },
  getAnalytics: async (startDate?: Date, endDate?: Date) => {
    const { data } = await api.get('/admin/analytics', {
      params: { startDate, endDate },
    });
    return data;
  },
  getAnalyticsOverview: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/admin/analytics/overview', {
      params: { startDate, endDate },
    });
    return data;
  },
  getRevenueTrend: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/admin/analytics/revenue-trend', {
      params: { startDate, endDate },
    });
    return data;
  },
  getRevenueByPlan: async () => {
    const { data } = await api.get('/admin/analytics/revenue-by-plan');
    return data;
  },
  getSubscriptionStats: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/admin/analytics/subscription-stats', {
      params: { startDate, endDate },
    });
    return data;
  },
  getUserGrowth: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/admin/analytics/user-growth', {
      params: { startDate, endDate },
    });
    return data;
  },
  getOrgGrowth: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/admin/analytics/org-growth', {
      params: { startDate, endDate },
    });
    return data;
  },
  getChurnAnalysis: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/admin/analytics/churn', {
      params: { startDate, endDate },
    });
    return data;
  },
  getSettings: async () => {
    const { data } = await api.get('/admin/settings');
    return data;
  },
  updateSettings: async (settings: any) => {
    const { data } = await api.put('/admin/settings', settings);
    return data;
  },
  archiveOrganization: async (id: string) => {
    const { data } = await api.delete(`/admin/organizations/${id}`);
    return data;
  },
  deleteOrganization: async (id: string) => {
    const { data } = await api.delete(`/admin/organizations/${id}/permanent`);
    return data;
  },
  archiveUser: async (userId: string) => {
    const { data } = await api.patch(`/admin/users/${userId}/archive`);
    return data;
  },
  unarchiveUser: async (userId: string) => {
    const { data } = await api.patch(`/admin/users/${userId}/unarchive`);
    return data;
  },
  updateUser: async (userId: string, userData: any) => {
    const { data } = await api.patch(`/admin/users/${userId}`, userData);
    return data;
  },
  deleteUploadedImage: async (url: string) => {
    const { data } = await api.delete('/upload/image', { data: { url } });
    return data;
  },

  // ── Roles ─────────────────────────────────────────────────────────────────
  getRoles: async (params: any = { page: 1, limit: 50 }) => {
    const { data } = await api.get('/admin/roles', { params });
    return data;
  },
  getAllRoles: async () => {
    const { data } = await api.get('/admin/roles/all');
    return data;
  },
  getRoleUserCount: async (id: string) => {
    const { data } = await api.get(`/admin/roles/${id}/user-count`);
    return data.data as { userCount: number; roleName: string };
  },
  createRole: async (payload: any) => {
    const { data } = await api.post('/admin/roles', payload);
    return data;
  },
  updateRole: async (id: string, payload: any) => {
    const { data } = await api.patch(`/admin/roles/${id}`, payload);
    return data;
  },
  archiveRole: async (id: string) => {
    const { data } = await api.delete(`/admin/roles/${id}`);
    return data;
  },

  // ── Platform RBAC (role assignment per user) ──────────────────────────────
  getPlatformRoles: async () => {
    const { data } = await api.get('/platform-rbac/roles', { params: { page: 1, limit: 100 } });
    return data;
  },
  getUserPlatformRoles: async (userId: string) => {
    const { data } = await api.get(`/platform-rbac/users/${userId}/roles`);
    return data;
  },
  assignPlatformRole: async (userId: string, roleId: string) => {
    const { data } = await api.post(`/platform-rbac/users/${userId}/roles`, { roleId });
    return data;
  },
  removePlatformRole: async (userId: string, roleId: string) => {
    const { data } = await api.delete(`/platform-rbac/users/${userId}/roles/${roleId}`);
    return data;
  },
}
