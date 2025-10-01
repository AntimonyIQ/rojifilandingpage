import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Logo } from "./logo";

interface PreloaderProps {
    showProgress?: boolean;
    progress?: number;
}

export default function Preloader({
    showProgress = false,
    progress = 0
}: PreloaderProps) {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-8">
                {/* Logo/Brand Section */}
                <div className="flex flex-col items-center space-y-4">
                    <motion.div
                        className="relative"
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
                        <Logo className="w-32 h-12" color="#0C4592" />
                    </motion.div>
                </div>


                {/* Progress Bar (Optional) */}
                {showProgress && (
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Loading</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
