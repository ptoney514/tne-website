import { Phone, Mail } from 'lucide-react';
import InteriorLayout from '../components/layouts/InteriorLayout';
import FeeSchedule from '../components/payments/FeeSchedule';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentFAQ from '../components/payments/PaymentFAQ';

export default function PaymentsPage() {
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
                Payments
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70 max-w-2xl">
                View fee schedules and make secure payments for registration,
                team fees, and tournament costs.
              </p>
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
    </InteriorLayout>
  );
}
