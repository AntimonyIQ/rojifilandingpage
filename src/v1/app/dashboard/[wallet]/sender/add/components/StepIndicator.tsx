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
        <div className="mb-4">
            <div className="max-w-6xl mx-auto">
                {/* Ultra Compact Enhanced Breadcrumb */}
                <motion.div
                    className="relative bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl p-3 border border-gray-200 shadow-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Mini progress bar */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 rounded-t-xl overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary via-blue-500 to-green-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                    </div>

                    {/* Compact progress counter */}
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-600">Sender Onboarding</span>
                        <span className="text-xs font-bold text-primary">
                            {currentStepIndex + 1}/{steps.length} • {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {steps.map((step, index) => {
                            const status = getStepStatus(index);

                            return (
                                <React.Fragment key={step.key}>
                                    <motion.div
                                        className={`relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-300 group cursor-pointer ${status === 'completed'
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                                            : status === 'current'
                                                ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-sm ring-1 ring-primary/20'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-150'
                                            }`}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.03, y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        {/* Mini step icon */}
                                        <div className={`flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${status === 'completed'
                                            ? 'bg-green-500 text-white'
                                            : status === 'current'
                                                ? 'bg-white text-primary'
                                                : 'bg-gray-300 text-gray-600'
                                            }`}>
                                            {status === 'completed' ? (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -90 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                                                >
                                                    <Check className="w-3 h-3" strokeWidth={4} />
                                                </motion.div>
                                            ) : (
                                                step.number
                                            )}
                                        </div>

                                        {/* Compact label */}
                                        <span className="text-xs font-medium leading-tight max-w-[80px] truncate">
                                            {step.label}
                                        </span>

                                        {/* Mini activity indicator */}
                                        {status === 'current' && (
                                            <motion.div
                                                className="w-1 h-1 bg-white rounded-full"
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}

                                        {/* Subtle glow for current */}
                                        {status === 'current' && (
                                            <motion.div
                                                className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-blue-600 opacity-20"
                                                animate={{ opacity: [0.2, 0.4, 0.2] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        )}
                                    </motion.div>

                                    {/* Tiny arrow separator */}
                                    {index < steps.length - 1 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.05 + 0.1 }}
                                        >
                                            <ChevronRight
                                                className={`w-3 h-3 transition-colors ${index < currentStepIndex
                                                    ? 'text-green-500'
                                                    : index === currentStepIndex
                                                        ? 'text-primary'
                                                        : 'text-gray-400'
                                                    }`}
                                            />
                                        </motion.div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                </motion.div>
            </div>
        </div>
    );
};