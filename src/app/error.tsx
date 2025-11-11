'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-primary mb-4">
            500
          </h1>
          <h2 className="font-serif text-2xl md:text-3xl text-primary mb-4">
            Något gick fel
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            Ett oväntat fel uppstod. Vi arbetar på att lösa problemet.
          </p>
          {error.digest && (
            <p className="text-sm text-gray-500 font-mono">
              Fel-ID: {error.digest}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="default" size="default">
            Försök igen
          </Button>
          <Button asChild variant="secondary" size="default">
            <Link href="/dashboard">
              Gå till dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

