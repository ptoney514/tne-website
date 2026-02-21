import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import {
  X,
  Loader2,
  Mail,
  User,
  Shield,
  Info,
  ChevronDown,
  Copy,
  Check,
  Link as LinkIcon,
} from 'lucide-react';

// Role option descriptions
const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', description: 'Full access to all settings and data' },
  { value: 'coach', label: 'Coach', description: 'Manage assigned teams and rosters' },
  { value: 'parent', label: 'Parent', description: 'View player info and registrations' },
];

export default function InviteUserModal({ isOpen, onClose, onSuccess }) {
  const { createInvite } = useUsers();
  const { profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [inviteUrl, setInviteUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    role: 'parent',
    personal_message: '',
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Create invite record
      const result = await createInvite({
        email: formData.email.toLowerCase().trim(),
        display_name: formData.display_name?.trim() || null,
        role: formData.role,
        personal_message: formData.personal_message?.trim() || null,
        invited_by: profile?.id,
      });

      // Show invite link
      const fullUrl = `${window.location.origin}${result.invite_url}`;
      setInviteUrl(fullUrl);
    } catch (err) {
      console.error('Error creating invite:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      display_name: '',
      role: 'parent',
      personal_message: '',
    });
    setError(null);
    if (inviteUrl) {
      setInviteUrl(null);
      setCopied(false);
      onSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-xl font-semibold text-stone-900">Invite User</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {inviteUrl ? (
          /* Success State - Show invite link */
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-sm text-green-900">
                <p className="font-medium">Invitation created successfully!</p>
                <p className="text-green-700 mt-1">
                  Share this link with <strong>{formData.email}</strong> to let them create their account.
                </p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
                <LinkIcon className="w-4 h-4 text-stone-400" />
                Invite Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-stone-50 text-sm"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                This link expires in 7 days.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
                <Mail className="w-4 h-4 text-stone-400" />
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
                <User className="w-4 h-4 text-stone-400" />
                Display Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder="John Smith (optional)"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red"
              />
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
                <Shield className="w-4 h-4 text-stone-400" />
                Role *
              </label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-10 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red cursor-pointer"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
              <p className="mt-1.5 text-xs text-stone-500">
                {ROLE_OPTIONS.find((r) => r.value === formData.role)?.description}
              </p>
            </div>

            {/* Personal Message */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Personal Message (optional)
              </label>
              <textarea
                value={formData.personal_message}
                onChange={(e) => handleChange('personal_message', e.target.value)}
                placeholder="Add a personal note to the invitation email..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-tne-red/20 focus:border-tne-red resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="flex gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">How invitations work</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• An invitation record will be created for this email</li>
                  <li>• The invitation expires after 7 days</li>
                  <li>• You can resend or cancel invitations anytime</li>
                </ul>
                <p className="mt-2 text-xs text-blue-600">
                  Note: Email sending requires backend configuration. For now, share the invite link manually.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !formData.email}
                className="px-4 py-2 rounded-lg bg-tne-red hover:bg-tne-red-dark text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Invite
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
