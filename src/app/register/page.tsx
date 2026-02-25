'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../lib/store';
import { AuthService } from '../../services/auth.service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInvitation, setIsInvitation] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email) {
          setEmail(payload.email);
          setIsInvitation(true);
        }
      } catch (err) {
        console.error('Failed to decode token', err);
      }
    }
  }, [token]);

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pw)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pw)) return 'Password must contain at least one number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    const errors: { password?: string; confirm?: string } = {};
    const pwError = validatePassword(password);
    if (pwError) errors.password = pwError;
    if (password !== confirmPassword) errors.confirm = 'Passwords do not match';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setIsLoading(true);
    try {
      const response = await AuthService.register({
        name,
        email,
        password,
        token: token || undefined
      });

      if (response.success) {
        setToken(response.data.accessToken);
        setUser(response.data.user);
        router.push('/');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isInvitation && (
              <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                You&apos;ve been invited! Please complete your registration.
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isInvitation}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                disabled={isLoading}
                className={fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {fieldErrors.password ? (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters and include an <span className="font-medium">uppercase</span> letter, lowercase letter, and number.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirm: undefined })); }}
                disabled={isLoading}
                className={fieldErrors.confirm ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {fieldErrors.confirm && (
                <p className="text-xs text-destructive">{fieldErrors.confirm}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
