import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  description?: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

const FormStepper: React.FC<FormStepperProps> = ({ steps, currentStep, className = "" }) => {
  return (
    <div className={`w-full py-6 px-2 ${className}`}>
      <div className="flex items-start justify-between relative max-w-4xl mx-auto">
        {/* Connection Line */}
        <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-gray-100 -z-0">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group flex-1">
              {/* Step Circle */}
              <div 
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 
                    isActive ? 'bg-white border-blue-600 text-blue-600 shadow-lg shadow-blue-600/10 scale-110' : 
                    'bg-white border-gray-100 text-gray-300'}
                `}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} className="animate-in zoom-in duration-300" />
                ) : (
                  <span className="text-xs font-black tracking-tighter italic">{step.id.toString().padStart(2, '0')}</span>
                )}
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <p className={`
                  text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300
                  ${isActive ? 'text-gray-900' : 'text-gray-300'}
                `}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="hidden md:block text-[9px] font-bold text-gray-400 mt-0.5 italic max-w-[80px] mx-auto leading-tight">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormStepper;
