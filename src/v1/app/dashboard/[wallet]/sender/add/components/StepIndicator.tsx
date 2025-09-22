import React from 'react';

interface Step {
    key: string;
    label: string;
    number: number;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
    const currentStepIndex = steps.findIndex(step => step.key === currentStep);

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
                {steps.map((step, index) => (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full text-base font-semibold ${index <= currentStepIndex
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {step.number}
                            </div>
                            <span className={`mt-3 text-sm font-medium ${index <= currentStepIndex ? 'text-primary' : 'text-gray-500'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-4">
                                <div className={`h-1 rounded-full ${index < currentStepIndex ? 'bg-primary' : 'bg-gray-200'
                                    }`} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};