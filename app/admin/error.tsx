'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react';

export default function AdminError({
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
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Dashboard Error
        </h1>
        <p className="text-stone-400 text-sm leading-relaxed mb-6">
          Something went wrong loading this section. Try refreshing, or return to the dashboard.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <pre className="text-left text-xs text-red-300/70 bg-red-950/30 border border-red-900/30 rounded-lg p-4 mb-6 overflow-x-auto max-h-32">
            {error.message}
          </pre>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-stone-900 text-sm font-semibold rounded-lg hover:bg-stone-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-5 py-2.5 border border-stone-700 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
