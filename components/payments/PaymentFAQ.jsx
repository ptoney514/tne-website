import { ChevronDown } from 'lucide-react';
import { faqItems } from '@/constants/payments';

export default function PaymentFAQ() {
  return (
    <section
      className="bg-neutral-100 border-y border-neutral-200 py-16 lg:py-24"
      data-testid="payment-faq"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-4">
            Payment Questions
          </h2>
          <p className="text-neutral-500">
            Common questions about fees and payments
          </p>
        </div>

        <div className="space-y-4" data-testid="faq-list">
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="group bg-white rounded-xl border border-neutral-200 overflow-hidden"
              data-testid={`faq-item-${index}`}
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-medium text-neutral-900 pr-4">
                  {item.question}
                </span>
                <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform shrink-0" />
              </summary>
              <div className="px-6 pb-6 text-neutral-600">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
