import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import TeamsNavbar from '../components/TeamsNavbar';
import TeamsFooter from '../components/TeamsFooter';

const ROLE_LABELS = {
  admin: 'Admin',
  director: 'Director',
  coach: 'Coach',
  parent: 'Parent',
};

export default function AcceptInvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/public/invite?code=${code}`);
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 410 && data.status === 'accepted') {
            setAlreadyAccepted(true);
          } else {
            setError(data.error || 'This invitation is no longer valid.');
          }
          return;
        }

        setInvite(data);
      } catch {
        setError('Failed to load invitation. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchInvite();
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/public/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password, firstName, lastName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to create account.');
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#050505] text-white antialiased min-h-screen flex flex-col font-sans">
      <TeamsNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {loading ? (
            <div className="rounded-3xl bg-white border border-neutral-200 shadow-lg overflow-hidden">
              <div className="bg-neutral-900 text-white px-6 py-5">
                <h1 className="text-2xl font-semibold tracking-tight font-bebas">
                  Loading Invitation
                </h1>
              </div>
              <div className="p-6 flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
              </div>
            </div>
          ) : alreadyAccepted ? (
            <div className="rounded-3xl bg-white border border-neutral-200 shadow-lg overflow-hidden">
              <div className="bg-neutral-900 text-white px-6 py-5">
                <h1 className="text-2xl font-semibold tracking-tight font-bebas">
                  Already Accepted
                </h1>
              </div>
              <div className="p-6 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-neutral-700">
                  This invitation has already been accepted. You can sign in with your account.
                </p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-2.5 rounded-xl bg-[#E31837] text-white font-medium text-sm hover:bg-[#C41230] transition-colors"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white border border-neutral-200 shadow-lg overflow-hidden">
              <div className="bg-neutral-900 text-white px-6 py-5">
                <h1 className="text-2xl font-semibold tracking-tight font-bebas">
                  Invalid Invitation
                </h1>
              </div>
              <div className="p-6 text-center space-y-4">
                <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-neutral-700">{error}</p>
                <p className="text-sm text-neutral-500">
                  Please contact your administrator for a new invitation.
                </p>
              </div>
            </div>
          ) : success ? (
            <div className="rounded-3xl bg-white border border-neutral-200 shadow-lg overflow-hidden">
              <div className="bg-neutral-900 text-white px-6 py-5">
                <h1 className="text-2xl font-semibold tracking-tight font-bebas">
                  Account Created
                </h1>
              </div>
              <div className="p-6 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-neutral-700">
                  Your account has been created successfully. Redirecting to sign in...
                </p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-2.5 rounded-xl bg-[#E31837] text-white font-medium text-sm hover:bg-[#C41230] transition-colors"
                >
                  Sign In Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-neutral-200 shadow-lg overflow-hidden">
              <div className="bg-neutral-900 text-white px-6 py-5">
                <h1 className="text-2xl font-semibold tracking-tight font-bebas">
                  Accept Invitation
                </h1>
                <p className="text-sm text-white/60 mt-1">
                  Create your TNE United Express account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Email (read-only) */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-neutral-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={invite.email}
                    readOnly
                    className="block w-full rounded-xl border border-neutral-200 bg-neutral-100 pl-3 pr-3 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
                  />
                </div>

                {/* Role badge */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-neutral-700">
                    Role
                  </label>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {ROLE_LABELS[invite.role] || invite.role}
                  </span>
                </div>

                {/* First Name + Last Name */}
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
                        className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/50 focus:border-[#E31837]/50"
                        placeholder="Last"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
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
                      placeholder="At least 8 characters"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
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
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#E31837] text-white font-medium text-sm hover:bg-[#C41230] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            </div>
          )}

          <p className="text-center text-sm text-white/50 mt-4">
            <Link to="/" className="hover:text-white transition-colors">
              Back to home
            </Link>
          </p>
        </div>
      </main>

      <TeamsFooter />
    </div>
  );
}
