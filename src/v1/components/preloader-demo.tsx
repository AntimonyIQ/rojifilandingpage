import { useState } from "react";
import Preloader from "./preloader";

/**
 * Demo component to test the preloader functionality
 * This can be used for testing and demonstration purposes
 */
export default function PreloaderDemo() {
    const [showPreloader, setShowPreloader] = useState(false);
    const [progress, setProgress] = useState(0);

    const simulateLoading = () => {
        setShowPreloader(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setShowPreloader(false), 500);
                    return 100;
                }
                return prev + 8; // Slower progress to match slower animation
            });
        }, 220); // Slower interval to match slower animation
    };

    if (showPreloader) {
        return (
            <Preloader
                showProgress={true}
                progress={progress}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Preloader Demo
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Click the button below to see the preloader in action
                </p>
                <button
                    onClick={simulateLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Show Preloader (Data-Driven)
                </button>
            </div>
        </div>
    );
}
