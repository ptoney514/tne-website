import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Send,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import InteriorLayout from '../components/layouts/InteriorLayout';
import { useContactForm } from '../hooks/useContactForm';

// Simplified subject options for formal inquiries only
// Common questions (schedules, teams, registration) handled by AI chat widget
const subjectOptions = [
  { value: '', label: 'Select a topic...' },
  { value: 'sponsorship', label: 'Sponsorship Inquiry' },
  { value: 'coaching', label: 'Employment / Coaching' },
  { value: 'media', label: 'Media / Press' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' },
];

const socialLinks = [
  {
    icon: Facebook,
    href: 'https://www.facebook.com/teamnebraskaexpressunited',
    label: 'Facebook',
  },
  {
    icon: Twitter,
    href: 'https://twitter.com/TNEBasketball',
    label: 'Twitter',
  },
  {
    icon: Instagram,
    href: 'https://www.instagram.com/tneunitedexpress',
    label: 'Instagram',
  },
];

export default function ContactPage() {
  const { submitInquiry, loading, error, success, reset } = useContactForm();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Split name into first/last for database compatibility
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const result = await submitInquiry({
      firstName,
      lastName,
      email: formData.email,
      phone: null,
      subject: formData.subject,
      message: formData.message,
    });
    if (result.success) {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }
  };

  const handleNewMessage = () => {
    reset();
  };

  return (
    <InteriorLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-6 animate-enter">
            <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 w-fit">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem] text-white/80">
                2025-2026 Fall/Winter Season
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Get in Touch
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                For sponsorship, media inquiries, or partnership opportunities,
                reach out below.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Contact Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Contact Form - 3 columns */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-neutral-900 text-white px-5 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                    Send Us a Message
                  </h2>
                  <p className="text-sm text-white/60 mt-1">
                    For formal inquiries and business opportunities.
                  </p>
                </div>

                {success ? (
                  <div className="px-5 py-12 sm:px-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Thank you for reaching out. We'll be in touch soon.
                    </p>
                    <button
                      onClick={handleNewMessage}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="px-5 py-5 sm:px-6 sm:py-6 space-y-5"
                  >
                    {error && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                      </div>
                    )}

                    {/* Name Field */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Name <span className="text-tne-red">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50 transition-colors"
                        placeholder="John Smith"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Email Address <span className="text-tne-red">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50 transition-colors"
                        placeholder="john.smith@example.com"
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Subject <span className="text-tne-red">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50 transition-colors"
                      >
                        {subjectOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Message <span className="text-tne-red">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50 transition-colors resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info Sidebar - 2 columns */}
            <div className="lg:col-span-2 space-y-5">
              {/* Direct Contact Card */}
              <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-5 py-5 sm:px-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Contact Information
                  </h3>

                  <div className="space-y-4">
                    {/* Email */}
                    <a
                      href="mailto:amitch2am@gmail.com"
                      className="flex items-start gap-3 group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-tne-red/10 text-tne-red group-hover:bg-tne-red group-hover:text-white transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          Email
                        </p>
                        <p className="text-sm text-neutral-600 group-hover:text-tne-red transition-colors">
                          amitch2am@gmail.com
                        </p>
                      </div>
                    </a>

                    {/* Phone */}
                    <a
                      href="tel:+14025104919"
                      className="flex items-start gap-3 group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-tne-red/10 text-tne-red group-hover:bg-tne-red group-hover:text-white transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          Phone
                        </p>
                        <p className="text-sm text-neutral-600 group-hover:text-tne-red transition-colors">
                          (402) 510-4919
                        </p>
                      </div>
                    </a>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-tne-red/10 text-tne-red">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          Location
                        </p>
                        <p className="text-sm text-neutral-600">
                          Omaha, Nebraska
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links Card */}
              <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-5 py-5 sm:px-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Follow Us
                  </h3>

                  <div className="flex gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-600 hover:bg-tne-red hover:text-white transition-colors"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Assistant Coach Card */}
              <div
                className="relative rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white border border-neutral-700/50 shadow-lg overflow-hidden"
                data-testid="ai-assistant-cta"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-tne-red/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative px-5 py-5 sm:px-6">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 mb-3">
                    <Sparkles className="w-3 h-3 text-tne-red" />
                    <span className="text-[0.65rem] font-mono uppercase tracking-wider text-white/70">
                      AI Assistant Coach
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">
                    Need Quick Answers?
                  </h3>
                  <p className="text-sm text-white/70 mb-4">
                    Get instant help with schedules, registration, and program info.
                  </p>

                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-600 text-white/60 text-sm font-medium cursor-not-allowed"
                      data-testid="open-chat-button"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat with AI Coach
                    </button>
                    <p className="text-[0.65rem] text-white/40 font-mono uppercase tracking-wider text-center">
                      Feature coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InteriorLayout>
  );
}
