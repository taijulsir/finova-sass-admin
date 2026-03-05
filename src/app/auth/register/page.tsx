"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, User, Mail, Lock, Check } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { registerSchema, RegisterSchema } from '@/lib/validators/auth';
import { submitRegister } from '@/lib/auth-utils';
import AuthForm from '@/components/auth/AuthForm';
import { cn } from '@/lib/utils';
import { ShortTextInput } from '@/components/ui-system/inputs/inputs';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || undefined;

  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: RegisterSchema) => {
    setError(null);
    setSuccess(null);
    try {
      const payload: any = { name: data.name, email: data.email, password: data.password };
      if (token) payload.token = token;
      const res = await submitRegister(payload);
      if (res.success) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        router.push('/');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <AuthForm
      title="Create Account"
      description="Join thousands of teams on Finova."
      badge="Registration"
      schema={registerSchema}
      onSubmit={onSubmit}
      defaultValues={{ name: '', email: '', password: '', confirm: '' }}
      submitButtonText="Get Started"
      submittingButtonText="Creating..."
      error={error}
      success={success}
      footerContent={
        <div className="text-center pb-1">
          <p className="text-[10px] text-gray-500 font-medium tracking-tight">
            By signing up, you agree to our <Link href="#" className="text-[#4F46E5] hover:underline">Terms</Link>.
          </p>
          <p className="text-xs text-gray-500 font-medium tracking-tight mt-1.5">
            Have an account?{' '}
            <Link href="/auth/login" className="text-[#4F46E5] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      }
    >
      {(form) => {
        const password = form.watch('password') || '';
        const criteria = [
          { label: '8+ chars', met: password.length >= 8 },
          { label: 'Uppercase', met: /[A-Z]/.test(password) },
          { label: 'Number/Symbol', met: /[0-9!@#$%^&*]/.test(password) },
        ];

        return (
          <>
            <ShortTextInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="John Doe"
              icon={<User className="w-4 h-4" />}
            />

            <ShortTextInput
              control={form.control}
              name="email"
              label="Email address"
              placeholder="john@example.com"
              icon={<Mail className="w-4 h-4" />}
            />

            <div className="space-y-1.5">
              <ShortTextInput
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
              />

              <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
                {criteria.map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full flex items-center justify-center transition-colors shrink-0",
                      c.met ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                    )}>
                      {c.met ? <Check className="w-1.5 h-1.5" /> : <div className="w-[3px] h-[3px] rounded-full bg-current" />}
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-tight", c.met ? "text-emerald-700" : "text-gray-400")}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <ShortTextInput
              control={form.control}
              name="confirm"
              label="Confirm"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
            />
          </>
        );
      }}
    </AuthForm>
  );
}
