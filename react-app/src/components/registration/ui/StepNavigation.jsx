import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useWizard } from '../WizardContext';

export default function StepNavigation({
  onNext,
  onPrev,
  nextLabel = 'Continue',
  prevLabel = 'Back',
  showPrev = true,
  isLoading = false,
  disabled = false,
  nextIcon = <ArrowRight className="w-4 h-4" />,
}) {
  const { currentStep } = useWizard();

  return (
    <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
      <div>
        {showPrev && currentStep > 1 && (
          <button
            type="button"
            onClick={onPrev}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            {prevLabel}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled || isLoading}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-tne-red text-white font-medium hover:bg-tne-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {nextLabel}
            {nextIcon}
          </>
        )}
      </button>
    </div>
  );
}
