import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import PublicLayout from '../components/layouts/PublicLayout';
import FeeSchedule from '../components/payments/FeeSchedule';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentFAQ from '../components/payments/PaymentFAQ';

export default function PaymentsPage() {
  return (
    <PublicLayout>
      {/* Compact Header (Task-oriented page) */}
      <header className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.2),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(139,31,58,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {/* Breadcrumb */}
              <div className="inline-flex items-center gap-2 mb-2">
                <Link
                  to="/"
                  className="text-[0.7rem] font-mono text-white/50 uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  Home
                </Link>
                <span className="text-white/30">/</span>
                <span className="text-[0.7rem] font-mono text-tne-red uppercase tracking-[0.2em]">
                  Payments
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-bebas uppercase">
                Make a Payment
              </h1>
            </div>
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full self-start sm:self-auto">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-400">
                Secure Checkout
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-neutral-50 text-neutral-900">
        {/* Payment Form Area */}
        <section className="py-10 lg:py-16 relative z-10">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Left Column: Fee Information */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <FeeSchedule />
              </div>

              {/* Right Column: Payment Form */}
              <div className="lg:col-span-7 order-1 lg:order-2">
                <PaymentForm />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <PaymentFAQ />

        {/* Contact CTA */}
        <section className="bg-[#08090A] w-full py-16 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Need help with payment?
                </h3>
                <p className="text-neutral-400">
                  Contact us for payment plans or questions about fees
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="tel:+14025104919"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 font-medium rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>(402) 510-4919</span>
                </a>
                <a
                  href="mailto:amitch2am@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Us</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
