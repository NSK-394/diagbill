import { Check } from 'lucide-react';

const steps = [
  { num: 1, label: 'Select Clinic' },
  { num: 2, label: 'Patient Info' },
  { num: 3, label: 'Select Tests' },
  { num: 4, label: 'Review & Pay' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const isDone = currentStep > step.num;
        const isActive = currentStep === step.num;
        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : step.num}
              </div>
              <span
                className={`text-xs mt-1 font-medium whitespace-nowrap hidden sm:block ${
                  isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-0 transition-colors duration-300 ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
