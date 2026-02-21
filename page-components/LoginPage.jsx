import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import TeamsNavbar from '@/components/TeamsNavbar';
import TeamsFooter from '@/components/TeamsFooter';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const failedAttempts = useRef(0);

  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if locked out due to too many attempts
    if (isLockedOut) {
      setError('Too many failed attempts. Please wait before trying again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn(email, password, rememberMe);

      if (result.error) {
        failedAttempts.current += 1;

        // Check if we've hit the rate limit
        if (failedAttempts.current >= MAX_FAILED_ATTEMPTS) {
          setIsLockedOut(true);
          setError('Too many failed attempts. Please wait 30 seconds before trying again.');
          setTimeout(() => {
            setIsLockedOut(false);
            failedAttempts.current = 0;
          }, LOCKOUT_DURATION_MS);
        } else {
          setError(result.error);
        }
        setIsSubmitting(false);
      } else {
        failedAttempts.current = 0;

        // If there's a specific page to return to, go there
        if (from !== '/') {
          router.replace(from);
        } else {
          // Redirect based on user role from result
          if (result.data?.user?.role === 'admin') {
            router.replace('/admin');
          } else if (result.data?.user?.role === 'coach') {
            router.replace('/coach');
          } else {
            router.replace('/');
          }
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
      <TeamsNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white border border-neutral-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-neutral-900 text-white px-6 py-5">
              <h1 className="text-2xl font-semibold tracking-tight font-bebas">
                Sign In
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Access your TNE United Express account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/50 focus:border-[#E31837]/50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#E31837] hover:text-[#C41230] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/50 focus:border-[#E31837]/50"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#E31837] focus:ring-[#E31837]/50"
                />
                <div>
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium text-neutral-700 cursor-pointer"
                  >
                    Keep me signed in
                  </label>
                  <p className="text-xs text-neutral-500">
                    Recommended on trusted devices.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLockedOut}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E31837] text-white font-medium text-sm hover:bg-[#C41230] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : isLockedOut ? (
                  'Please wait...'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-white/50 mt-4">
            <Link href="/" className="hover:text-white transition-colors">
              Back to home
            </Link>
          </p>
          <p className="text-center text-sm text-white/50 mt-2">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#E31837] hover:text-white transition-colors">Sign up</Link>
          </p>
        </div>
      </main>

      <TeamsFooter />
    </div>
  );
}
