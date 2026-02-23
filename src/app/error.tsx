'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-12 w-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Oops!</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Something went wrong</h2>
          <p className="text-muted-foreground">
            We apologize for the inconvenience. An unexpected error has occurred. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button onClick={() => reset()} variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
