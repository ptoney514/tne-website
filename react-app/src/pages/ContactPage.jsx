import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  ChevronRight,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import PublicLayout from '../components/layouts/PublicLayout';
import { useContactForm } from '../hooks/useContactForm';

const subjectOptions = [
  { value: '', label: 'Select a topic...' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'registration', label: 'Registration Question' },
  { value: 'tryouts', label: 'Tryouts Information' },
  { value: 'schedule', label: 'Schedule Question' },
  { value: 'sponsorship', label: 'Sponsorship Inquiry' },
  { value: 'coaching', label: 'Coaching / Employment' },
  { value: 'media', label: 'Media / Press' },
  { value: 'other', label: 'Other' },
];

const quickLinks = [
  { path: '/tryouts', label: 'Tryouts & Registration' },
  { path: '/schedule', label: 'Practice & Game Schedule' },
  { path: '/teams', label: 'Team Rosters & Coaches' },
  { path: '/schedule#tournaments', label: 'Tournament Information' },
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitInquiry(formData);
    if (result.success) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }
  };

  const handleNewMessage = () => {
    reset();
  };

  return (
    <PublicLayout>
      {/* Hero Header */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="sm:px-6 sm:pt-16 sm:pb-14 max-w-6xl mx-auto pt-12 px-4 pb-10 relative">
          <div className="flex flex-col gap-6 animate-enter">
            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2">
              <Link
                to="/"
                className="text-[0.7rem] font-mono text-white/50 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Home
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-[0.7rem] font-mono text-tne-red uppercase tracking-[0.2em]">
                Contact
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Get in Touch
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                Have questions about our program? We'd love to hear from you.
                Reach out and our team will get back to you within 24 hours.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center text-xs sm:text-sm text-white/70">
              <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <span className="font-mono uppercase tracking-[0.22em] text-[0.7rem]">
                  Quick Response
                </span>
              </div>
              <div className="inline-flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" />
                <span>Typically respond within 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-enter {
            animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Contact Form - 3 columns */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
                <div className="bg-neutral-900 text-white px-5 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                    Send Us a Message
                  </h2>
                  <p className="text-sm text-white/60 mt-1">
                    Fill out the form below and we'll get back to you soon.
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
                      Thank you for reaching out. We'll get back to you within
                      24 hours.
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

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-neutral-700"
                        >
                          First Name <span className="text-tne-red">*</span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50 transition-colors"
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-neutral-700"
                        >
                          Last Name <span className="text-tne-red">*</span>
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50 transition-colors"
                          placeholder="Smith"
                        />
                      </div>
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

                    {/* Phone (Optional) */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Phone Number{' '}
                        <span className="text-neutral-400">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tne-red/50 focus:border-tne-red/50 transition-colors"
                        placeholder="(402) 555-0123"
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
              <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
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
              <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
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

              {/* Quick Links Card */}
              <div className="rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border border-neutral-700 shadow-lg overflow-hidden">
                <div className="px-5 py-5 sm:px-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Looking for something specific?
                  </h3>
                  <p className="text-sm text-white/60 mb-4">
                    These pages might have what you need:
                  </p>

                  <div className="space-y-2">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-tne-red" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
