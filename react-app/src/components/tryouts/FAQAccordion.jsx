import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqItems = [
  {
    question: 'What is the tryout process like?',
    answer:
      'Tryouts are approximately 2-3 hours long and include skills assessment, drills, and scrimmages. Our coaches evaluate ball handling, shooting, defense, teamwork, and attitude. All skill levels are welcome, but players should be prepared for a competitive environment.',
  },
  {
    question: 'What are the program fees?',
    answer:
      'There is a $25 tryout fee that is applied toward season registration if selected. Full season fees range from $400-$600 depending on age group. This includes uniforms, tournament entry fees, and practice facility costs. Payment plans are available.',
  },
  {
    question: 'How will I know if my child made the team?',
    answer:
      'Coaches will contact parents within 48-72 hours after tryouts with results. Selected players will receive information about team placement, practice schedules, and next steps for registration.',
  },
  {
    question: 'Can my child try out if they miss the scheduled date?',
    answer:
      'We strongly encourage attendance at scheduled tryout dates. However, if you have a conflict, please contact us at amitch2am@gmail.com to discuss alternative arrangements.',
  },
  {
    question: 'Is financial assistance available?',
    answer:
      'Yes, TNE United is committed to ensuring basketball is accessible to all players regardless of financial circumstances. We offer payment plans and limited scholarship opportunities. Please contact us to discuss your situation.',
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="rounded-3xl bg-white border border-neutral-300 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="divide-y divide-neutral-100">
        {faqItems.map((item, index) => (
          <div key={index} className="px-5">
            <button
              onClick={() => toggleItem(index)}
              className="w-full py-4 flex items-center justify-between gap-4 text-left"
            >
              <span className="font-medium text-neutral-900">
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="pb-4 pr-8">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
