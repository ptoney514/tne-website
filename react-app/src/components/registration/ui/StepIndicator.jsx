import { Check } from 'lucide-react';
import { useWizard } from '../WizardContext';

const steps = [
  { number: 1, title: 'Player & Team', shortTitle: 'Player' },
  { number: 2, title: 'Parent & Contact', shortTitle: 'Contact' },
  { number: 3, title: 'Payment Plan', shortTitle: 'Payment' },
  { number: 4, title: 'Review & Confirm', shortTitle: 'Confirm' },
];

export default function StepIndicator() {
  const { currentStep } = useWizard();

  return (
    <div className="w-full">
      {/* Desktop version */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all
                  ${
                    currentStep > step.number
                      ? 'bg-emerald-500 text-white'
                      : currentStep === step.number
                      ? 'bg-tne-red text-white ring-4 ring-tne-red/20'
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
              <span
                className={`
                  ml-3 text-sm font-medium
                  ${
                    currentStep === step.number
                      ? 'text-tne-red'
                      : currentStep > step.number
                      ? 'text-emerald-600'
                      : 'text-neutral-500'
                  }
                `}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-4 transition-colors
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
                    : currentStep === step.number
                    ? 'bg-tne-red'
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
