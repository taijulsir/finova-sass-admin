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
  getSubscriptions: async (params: any = { page: 1, limit: 10, search: '', isActive: true }) => {
    const { data } = await api.get('/admin/organizations', {
      params,
    });
    return data;
  },
  getUsers: async (params: any = { page: 1, limit: 10, search: '', tab: 'active' }) => {
    const { data } = await api.get('/admin/users', {
      params,
    });
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
  suspenseUser: async (userId: string, note: string) => {
    const { data } = await api.patch(`/admin/users/${userId}/suspense`, { note });
    return data;
  },
  restoreUser: async (userId: string) => {
    const { data } = await api.patch(`/admin/users/${userId}/restore`);
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
  archiveUser: async (userId: string) => {
    const { data } = await api.patch(`/admin/users/${userId}/archive`);
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
  updateSubscription: async (id: string, subData: any) => {
    const { data } = await api.patch(`/admin/subscriptions/${id}`, subData);
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
}
