import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import TeamsNavbar from '../components/TeamsNavbar';
import TeamsFooter from '../components/TeamsFooter';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        setError(resetError.message || 'Failed to reset password. The link may have expired.');
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
        <TeamsNavbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="rounded-3xl bg-white border border-neutral-200 shadow-lg overflow-hidden">
              <div className="bg-neutral-900 text-white px-6 py-5">
                <h1 className="text-2xl font-semibold tracking-tight font-bebas">
                  Invalid Link
                </h1>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>This password reset link is invalid or has expired. Please request a new one.</p>
                </div>
                <Link
                  to="/forgot-password"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#E31837] text-white font-medium text-sm hover:bg-[#C41230] transition-colors"
                >
                  Request New Link
                </Link>
              </div>
            </div>
          </div>
        </main>
        <TeamsFooter />
      </div>
    );
  }

  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
      <TeamsNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white border border-neutral-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-neutral-900 text-white px-6 py-5">
              <h1 className="text-2xl font-semibold tracking-tight font-bebas">
                Set New Password
              </h1>
              <p className="text-sm text-white/60 mt-1">
                {isSuccess ? 'Your password has been updated' : 'Enter your new password below'}
              </p>
            </div>

            <div className="p-6">
              {isSuccess ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Password updated!</p>
                      <p className="mt-1 text-green-600">
                        Your password has been reset successfully. You can now sign in with your new
                        password.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#E31837] text-white font-medium text-sm hover:bg-[#C41230] transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      New Password
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
                        placeholder="At least 8 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="confirm-password"
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
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#E31837] text-white font-medium text-sm hover:bg-[#C41230] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-white/50 mt-4">
            <Link to="/login" className="hover:text-white transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Back to Sign In
            </Link>
          </p>
        </div>
      </main>

      <TeamsFooter />
    </div>
  );
}
