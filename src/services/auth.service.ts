import api from '../lib/api';

export const AuthService = {
  login: async (credentials: any) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (payload: any) => {
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  refreshToken: async () => {
    const { data } = await api.post('/auth/refresh-token');
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
}
