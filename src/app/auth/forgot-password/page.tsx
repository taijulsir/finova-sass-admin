"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotSchema, ForgotSchema } from '@/lib/validators/auth';
import { submitForgot } from '@/lib/auth-utils';
import AuthForm from '@/components/auth/AuthForm';
import { ShortTextInput } from '@/components/ui-system/inputs/inputs';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: ForgotSchema) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await submitForgot({ email: data.email });
      if (res.success) {
        setSuccess(res.message || 'If an account with that email exists, a password reset link has been sent.');
      } else {
        setError(res.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send reset link');
    }
  };

  return (
    <AuthForm
      title="Forgot Password"
      description="Enter your email address and we will send you a link to reset your password."
      badge="Recovery"
      schema={forgotSchema}
      onSubmit={onSubmit}
      defaultValues={{ email: '' }}
      submitButtonText="Send reset link"
      submittingButtonText="Sending link..."
      error={error}
      success={success}
      footerContent={
        <div className="pt-1">
          <Link href="/auth/login" className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
            Back to login
          </Link>
        </div>
      }
    >
      {(form) => (
        <ShortTextInput
          control={form.control}
          name="email"
          label="Email"
          placeholder="admin@finova.com"
          icon={<Mail className="w-4 h-4" />}
        />
      )}
    </AuthForm>
  );
}
