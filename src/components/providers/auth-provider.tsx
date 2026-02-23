'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/store';
import api from '../../lib/api';
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, logout, isAuthenticated, isLoading } = useAuthStore();
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = useAuthStore.getState().token;
      
      if (!token) {
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
  }, [setUser, logout]);

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

  // Only show the global centered loader if we don't even have a persisted session hint
  const token = useAuthStore.getState().token;
  if (isLoading && !token) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background animate-in fade-in duration-500">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-80" />
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
          Initializing session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
