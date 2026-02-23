import api from '../lib/api';

export const AdminService = {
  getDashboard: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },
  getOrganizations: async (page = 1, limit = 10, search = '', isActive = true) => {
    const { data } = await api.get('/admin/organizations', {
      params: { page, limit, search, isActive },
    });
    return data;
  },
  createOrganization: async (orgData: any) => {
    const { data } = await api.post('/organizations', orgData);
    return data;
  },
  getOrganizationDetails: async (id: string) => {
    const { data } = await api.get(`/admin/organizations/${id}`);
    return data;
  },
  getUsers: async (page = 1, limit = 10, search = '', isActive = true) => {
    const { data } = await api.get('/admin/users', {
      params: { page, limit, search, isActive },
    });
    return data;
  },
  createUser: async (userData: any) => {
    const { data } = await api.post('/admin/users', userData);
    return data;
  },
  getAuditLogs: async (page = 1, limit = 10) => {
    const { data } = await api.get('/admin/audit-logs', {
      params: { page, limit },
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
  archiveUser: async (id: string) => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },
  archiveSubscription: async (id: string) => {
    const { data } = await api.delete(`/admin/subscriptions/${id}`);
    return data;
  },
  updateOrganization: async (id: string, orgData: any) => {
    const { data } = await api.patch(`/admin/organizations/${id}`, orgData);
    return data;
  },
  updateUser: async (id: string, userData: any) => {
    const { data } = await api.patch(`/admin/users/${id}`, userData);
    return data;
  },
  updateSubscription: async (id: string, subData: any) => {
    const { data } = await api.patch(`/admin/subscriptions/${id}`, subData);
    return data;
  },
}
