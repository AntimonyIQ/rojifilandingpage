import React from "react";
import { motion } from "framer-motion";
import { Shield, LoaderPinwheel, CheckCircle, AlertCircle } from "lucide-react";
import { Logo } from "./logo";

interface PreloaderVariantProps {
    variant?: "default" | "success" | "error" | "minimal";
    size?: "sm" | "md" | "lg";
}

export function PreloaderVariant({
    variant = "default",
    size = "md"
}: PreloaderVariantProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    };

    const iconSizes = {
        sm: 16,
        md: 24,
        lg: 32
    };

    if (variant === "minimal") {
        return (
            <div className="flex items-center justify-center p-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        ease: "linear"
                    }}
                >
                    <LoaderPinwheel size={iconSizes[size]} className="text-blue-600" />
                </motion.div>
            </div>
        );
    }

    if (variant === "success") {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    <CheckCircle size={iconSizes[size]} className="text-green-600" />
                </motion.div>
            </div>
        );
    }

    if (variant === "error") {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    <AlertCircle size={iconSizes[size]} className="text-red-600" />
                </motion.div>
            </div>
        );
    }

    // Default variant
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                }}
                transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Logo className="w-24 h-8" color="#0C4592" />
            </motion.div>

        </div>
    );
}

// Export individual variants for easy use
export const MinimalPreloader = (props: Omit<PreloaderVariantProps, 'variant'>) =>
    <PreloaderVariant {...props} variant="minimal" />;

export const SuccessPreloader = (props: Omit<PreloaderVariantProps, 'variant'>) =>
    <PreloaderVariant {...props} variant="success" />;

export const ErrorPreloader = (props: Omit<PreloaderVariantProps, 'variant'>) =>
    <PreloaderVariant {...props} variant="error" />;
