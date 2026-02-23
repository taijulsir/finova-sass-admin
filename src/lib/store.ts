import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null; // Replace any with proper User type
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null, // Initial state
      isAuthenticated: false,
      isLoading: true, // Start loading

      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
