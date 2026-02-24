import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: any | null;
  /** Flat array of permission strings from platform RBAC: ['ORG_VIEW', 'ADMIN_INVITE', ...] */
  permissions: string[];
  /** Platform role names assigned to the user: ['SUPER_ADMIN'] */
  platformRoles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;

  setToken: (token: string | null) => void;
  setUser: (user: any) => void;
  setPermissions: (permissions: string[]) => void;
  setPlatformRoles: (roles: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: [],
      platformRoles: [],
      isAuthenticated: false,
      isLoading: true,

      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),
      setPermissions: (permissions) => set({ permissions }),
      setPlatformRoles: (platformRoles) => set({ platformRoles }),
      logout: () => set({ token: null, user: null, permissions: [], platformRoles: [], isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        permissions: state.permissions,
        platformRoles: state.platformRoles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
