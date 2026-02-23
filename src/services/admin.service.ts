import api from '../lib/api';

export const AdminService = {
  getDashboard: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },
  getOrganizations: async (page = 1, limit = 10, search = '') => {
    const { data } = await api.get('/admin/organizations', {
      params: { page, limit, search },
    });
    return data;
  },
  getOrganizationDetails: async (id: string) => {
    const { data } = await api.get(`/admin/organizations/${id}`);
    return data;
  },
  getUsers: async (page = 1, limit = 10, search = '') => {
    const { data } = await api.get('/admin/users', {
      params: { page, limit, search },
    });
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
}
