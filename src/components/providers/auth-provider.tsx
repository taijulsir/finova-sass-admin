'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/store';
import api from '../../lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // We need to fetch current user profile
  // The 'setToken' here is actually handled by interceptor if refresh token is used.
  // But if page reloads, we need to try refresh token explicitly because we don't have access token in memory yet.
  const { setUser, setToken, logout, isAuthenticated, isLoading } = useAuthStore();
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = useAuthStore.getState().token;
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (!token && !refreshToken) {
        useAuthStore.setState({ isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        
        if (data.success && data.data.user) {
            setUser(data.data.user);
            useAuthStore.setState({ isAuthenticated: true, isLoading: false }); 
        } else {
             setUser(data.data || data);
             useAuthStore.setState({ isAuthenticated: true, isLoading: false });
        }
      } catch (error) {
        logout();
        useAuthStore.setState({ isAuthenticated: false, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    
    if (!isLoading) {
      if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push('/login');
      } else if (isAuthenticated && publicRoutes.includes(pathname)) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
