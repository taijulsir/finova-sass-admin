import api from '@/lib/api';

// ── DTOs ────────────────────────────────────────────────────────────────────────

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  timezone?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  timezone?: string;
  avatar?: string;
  globalRole: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface UserSession {
  sessionId: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface LoginActivity {
  _id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  status: 'success' | 'failed';
  loginTime: string;
}

export interface Setup2FAResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface LoginHistoryParams {
  page?: number;
  limit?: number;
}

// ── Service ─────────────────────────────────────────────────────────────────────

export const AccountService = {
  // Profile
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get('/account/profile');
    return data.data;
  },

  updateProfile: async (dto: UpdateProfileDto): Promise<UserProfile> => {
    const { data } = await api.patch('/account/profile', dto);
    return data.data;
  },

  // Password
  changePassword: async (dto: ChangePasswordDto): Promise<void> => {
    await api.post('/account/change-password', dto);
  },

  // 2FA
  setup2FA: async (): Promise<Setup2FAResponse> => {
    const { data } = await api.post('/account/2fa/setup');
    return data.data;
  },

  verify2FA: async (token: string): Promise<{ backupCodes: string[] }> => {
    const { data } = await api.post('/account/2fa/verify', { token });
    return data.data;
  },

  disable2FA: async (token: string): Promise<void> => {
    await api.post('/account/2fa/disable', { token });
  },

  // Sessions
  getSessions: async (): Promise<UserSession[]> => {
    const { data } = await api.get('/account/sessions');
    return data.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/account/sessions/${sessionId}`);
  },

  revokeAllSessions: async (): Promise<void> => {
    await api.delete('/account/sessions/revoke-all');
  },

  // Login history
  getLoginHistory: async (
    params: LoginHistoryParams = {}
  ): Promise<{ activity: LoginActivity[]; total: number; page: number; totalPages: number }> => {
    const { data } = await api.get('/account/login-history', { params });
    return data.data;
  },
};
