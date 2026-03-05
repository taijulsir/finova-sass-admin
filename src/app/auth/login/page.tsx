"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, Info } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { loginSchema, LoginSchema } from '@/lib/validators/auth';
import { submitLogin } from '@/lib/auth-utils';
import AuthForm from '@/components/auth/AuthForm';
import { PasswordInput, ShortTextInput } from '@/components/ui-system/inputs/inputs';

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: LoginSchema) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await submitLogin(data);
      if (res.success) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        router.push('/');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      description="Sign in to your admin account to manage SaaS."
      schema={loginSchema}
      onSubmit={onSubmit}
      defaultValues={{ email: '', password: '' }}
      submitButtonText="Sign In to Dashboard"
      submittingButtonText="Signing in..."
      error={error}
      success={success}
      footerContent={
        <p className="text-[12px] text-gray-500 font-medium">
          Need an account?{' '}
          <Link href={`${process.env.NEXT_PUBLIC_LANDING_PAGE_URL}/contact`} className="text-[#4F46E5] font-bold hover:underline">
            Contact Support
          </Link>
        </p>
      }
    >
      {(form) => (
        <>
          <ShortTextInput
            control={form.control}
            name="email"
            label="Email address"
            placeholder="admin@finova.com"
            icon={<Mail className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-gray-700 tracking-wide uppercase shrink-0">Password</label>
              <Link href="/auth/forgot-password" title="Forgot password" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                Forgot?
              </Link>
            </div>
            <PasswordInput
              control={form.control}
              name="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>
        </>
      )}
    </AuthForm>
  );
}
