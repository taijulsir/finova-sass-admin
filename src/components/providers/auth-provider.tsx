'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/store';
import api from '../../lib/api';
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const _hasHydrated  = useAuthStore((s) => s._hasHydrated);
  const isLoading     = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser       = useAuthStore((s) => s.setUser);
  const logout        = useAuthStore((s) => s.logout);

  // Step 1: Once zustand/persist has rehydrated from localStorage, validate the session
  useEffect(() => {
    if (!_hasHydrated) return;

    const checkAuth = async () => {
      const token = useAuthStore.getState().token;

      if (!token) {
        useAuthStore.setState({ isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (data.success && data.data?.user) {
          setUser(data.data.user);
        } else if (data.data) {
          setUser(data.data);
        }
        useAuthStore.setState({ isAuthenticated: true, isLoading: false });
      } catch {
        logout();
        useAuthStore.setState({ isAuthenticated: false, isLoading: false });
      }
    };

    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  // Step 2: Once loading is done, handle route protection
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace('/login');
    } else if (isAuthenticated && PUBLIC_ROUTES.includes(pathname)) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Block ALL rendering until:
  //   a) zustand has rehydrated from localStorage (_hasHydrated), AND
  //   b) the /auth/me session check has finished (!isLoading)
  // This eliminates the flash of login UI on page refresh.
  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-4 border-primary/10" />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="mt-5 text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
          Loading session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

