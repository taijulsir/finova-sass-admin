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
  /** True once zustand/persist has rehydrated from localStorage */
  _hasHydrated: boolean;
  /** True while the /auth/me session check is in flight */
  isLoading: boolean;

  setToken: (token: string | null) => void;
  setUser: (user: any) => void;
  setPermissions: (permissions: string[]) => void;
  setPlatformRoles: (roles: string[]) => void;
  setHasHydrated: (value: boolean) => void;
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
      _hasHydrated: false,
      isLoading: true,

      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),
      setPermissions: (permissions) => set({ permissions }),
      setPlatformRoles: (platformRoles) => set({ platformRoles }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      logout: () => set({
        token: null,
        user: null,
        permissions: [],
        platformRoles: [],
        isAuthenticated: false,
        isLoading: false,
      }),
    }),
    {
      name: 'auth-storage',
      // Do NOT persist loading/hydration flags — they are runtime-only
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        permissions: state.permissions,
        platformRoles: state.platformRoles,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called once localStorage data has been merged into the store
        state?.setHasHydrated(true);
      },
    }
  )
);
