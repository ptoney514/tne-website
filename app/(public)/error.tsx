'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-tne-red/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-tne-red" />
          </div>
        </div>

        <h1 className="font-bebas text-4xl text-white uppercase tracking-tight mb-3">
          Something Went Wrong
        </h1>
        <p className="text-white/50 text-sm font-mono leading-relaxed mb-8">
          We hit a snag loading this page. Try again or head back to the home court.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-6 py-3 bg-tne-red text-white text-sm font-semibold uppercase tracking-wider hover:bg-tne-red-dark transition-all rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-sm font-semibold uppercase tracking-wider hover:bg-white/10 transition-all rounded-lg"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
