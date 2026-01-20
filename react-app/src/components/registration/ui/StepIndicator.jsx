import { Check } from 'lucide-react';
import { useWizard } from '../WizardContext';

const steps = [
  { number: 1, title: 'Player & Team', shortTitle: 'Player', subtitle: 'Select team and enter player info' },
  { number: 2, title: 'Parent & Contact', shortTitle: 'Contact', subtitle: 'Guardian and emergency contact' },
  { number: 3, title: 'Payment Plan', shortTitle: 'Payment', subtitle: "Secure your player's spot" },
  { number: 4, title: 'Review & Confirm', shortTitle: 'Confirm', subtitle: 'Final review and agreements' },
];

export default function StepIndicator() {
  const { currentStep } = useWizard();

  return (
    <div className="w-full">
      {/* Desktop version */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex items-center shrink-0">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 min-w-[2.5rem] rounded-full text-sm font-medium transition-all shrink-0
                  ${
                    currentStep > step.number
                      ? 'bg-emerald-500 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }
                `}
              >
                {currentStep > step.number ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-2 hidden lg:block">
                <span
                  className={`
                    text-sm font-medium whitespace-nowrap
                    ${
                      currentStep > step.number
                        ? 'text-emerald-600'
                        : 'text-neutral-500'
                    }
                  `}
                >
                  {step.shortTitle}
                </span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 lg:mx-3 transition-colors
                  ${currentStep > step.number ? 'bg-emerald-500' : 'bg-neutral-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile version - condensed */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm font-medium text-tne-red">
            {steps[currentStep - 1].title}
          </span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`
                h-1.5 flex-1 rounded-full transition-colors
                ${
                  currentStep > step.number
                    ? 'bg-emerald-500'
                    : 'bg-neutral-200'
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
