import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, AlertCircle, Loader2, User } from 'lucide-react';
import TeamsNavbar from '@/components/TeamsNavbar';
import TeamsFooter from '@/components/TeamsFooter';

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const name = firstName + ' ' + lastName;
      const result = await signUp(email, password, name, firstName, lastName);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
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
                Create Account
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Join the TNE United Express family
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

              {success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                  <span>Account created successfully! Redirecting to sign in...</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      autoComplete="given-name"
                      className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/50 focus:border-[#E31837]/50"
                      placeholder="First"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      autoComplete="family-name"
                      className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/50 focus:border-[#E31837]/50"
                      placeholder="Last"
                    />
                  </div>
                </div>
              </div>

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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Password
                </label>
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
                    minLength={8}
                    autoComplete="new-password"
                    className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/50 focus:border-[#E31837]/50"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/50 focus:border-[#E31837]/50"
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E31837] text-white font-medium text-sm hover:bg-[#C41230] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
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
            Already have an account?{' '}
            <Link href="/login" className="text-[#E31837] hover:text-white transition-colors">Sign in</Link>
          </p>
        </div>
      </main>

      <TeamsFooter />
    </div>
  );
}
