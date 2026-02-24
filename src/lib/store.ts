import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PermissionMap } from './permissions';

interface AuthState {
  token: string | null;
  user: any | null;
  /** Flat permission map populated from designation on login: { USERS: ['VIEW','CREATE'], ... } */
  permissions: PermissionMap | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setToken: (token: string | null) => void;
  setUser: (user: any) => void;
  setPermissions: (permissions: PermissionMap | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: null,
      isAuthenticated: false,
      isLoading: true,

      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),
      setPermissions: (permissions) => set({ permissions }),
      logout: () => set({ token: null, user: null, permissions: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
