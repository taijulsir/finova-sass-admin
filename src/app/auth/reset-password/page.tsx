"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetSchema, ResetSchema } from '@/lib/validators/auth';
import { submitReset } from '@/lib/auth-utils';
import AuthForm from '@/components/auth/AuthForm';
import { ShortTextInput } from '@/components/ui-system/inputs/inputs';
import { Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || undefined;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const onSubmit = async (data: ResetSchema) => {
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const res = await submitReset(token, { password: data.password });
      if (res.success) {
        setSuccess('Password has been reset successfully. You can now sign in with your new password.');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <AuthForm
      title="Reset Password"
      description="Enter your new password below."
      badge="Recovery"
      schema={resetSchema}
      onSubmit={onSubmit}
      defaultValues={{ password: '', confirm: '' }}
      submitButtonText="Reset password"
      submittingButtonText="Resetting..."
      error={error}
      success={success}
    >
      {(form) => (
        <>
          <ShortTextInput
            control={form.control}
            name="password"
            label="New password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
          />
          <ShortTextInput
            control={form.control}
            name="confirm"
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
          />
        </>
      )}
    </AuthForm>
  );
}
