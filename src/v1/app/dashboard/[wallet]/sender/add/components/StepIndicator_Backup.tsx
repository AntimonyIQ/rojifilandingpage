import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

    const getStepStatus = (index: number) => {
        if (index < currentStepIndex) return 'completed';
        if (index === currentStepIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="mb-12">
            <div className="max-w-5xl mx-auto">
                {/* Progress bar background */}
                <div className="relative">
                    <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-200"></div>
                    <motion.div
                        className="absolute top-8 left-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 transition-all duration-500 ease-out"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    />

                    {/* Steps */}
                    <div className="relative flex justify-between">
                        {steps.map((step, index) => {
                            const status = getStepStatus(index);

                            return (
                                <motion.div
                                    key={step.key}
                                    className="flex flex-col items-center group cursor-pointer"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {/* Step circle */}
                                    <motion.div
                                        className={`relative flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300 ${status === 'completed'
                                            ? 'bg-gradient-to-r from-primary to-blue-600 border-primary shadow-lg'
                                            : status === 'current'
                                                ? 'bg-white border-primary shadow-xl ring-4 ring-primary/20'
                                                : 'bg-white border-gray-300 group-hover:border-gray-400'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {status === 'completed' ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <Check className="w-7 h-7 text-white" strokeWidth={3} />
                                            </motion.div>
                                        ) : (
                                            <span className={`text-lg font-bold ${status === 'current'
                                                ? 'text-primary'
                                                : 'text-gray-500 group-hover:text-gray-700'
                                                }`}>
                                                {step.number}
                                            </span>
                                        )}

                                        {/* Pulse animation for current step */}
                                        {status === 'current' && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-4 border-primary"
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        )}
                                    </motion.div>

                                    {/* Step label */}
                                    <motion.div
                                        className="mt-4 text-center"
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1 + 0.2 }}
                                    >
                                        <div className={`text-sm font-semibold mb-1 transition-colors ${status === 'completed' || status === 'current'
                                            ? 'text-primary'
                                            : 'text-gray-500'
                                            }`}>
                                            {step.label}
                                        </div>
                                        <div className={`text-xs transition-colors ${status === 'completed'
                                            ? 'text-green-600'
                                            : status === 'current'
                                                ? 'text-blue-600'
                                                : 'text-gray-400'
                                            }`}>
                                            {status === 'completed'
                                                ? 'Completed'
                                                : status === 'current'
                                                    ? 'In Progress'
                                                    : 'Pending'}
                                        </div>
                                    </motion.div>

                                    {/* Arrow indicator for current step */}
                                    {status === 'current' && (
                                        <motion.div
                                            className="mt-2"
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full shadow-md">
                                                <ChevronRight className="w-3 h-3 text-white" />
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Progress text */}
                <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className="text-sm text-gray-600">
                        Step <span className="font-semibold text-primary">{currentStepIndex + 1}</span> of {steps.length}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
                    </div>
                </motion.div>
            </div>
        </div>
    );
};