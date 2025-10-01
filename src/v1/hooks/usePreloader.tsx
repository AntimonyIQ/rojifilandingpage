import { useState, useCallback } from "react";

interface PreloaderState {
    isLoading: boolean;
    progress: number;
    showProgress: boolean;
}

interface UsePreloaderReturn {
    preloaderState: PreloaderState;
    showPreloader: (showProgress?: boolean) => void;
    hidePreloader: () => void;
    updateProgress: (progress: number) => void;
    simulateLoading: (duration?: number) => Promise<void>;
}

export function usePreloader(): UsePreloaderReturn {
    const [preloaderState, setPreloaderState] = useState<PreloaderState>({
        isLoading: false,
        progress: 0,
        showProgress: false
    });

    const showPreloader = useCallback((showProgress = false) => {
        setPreloaderState({
            isLoading: true,
            progress: 0,
            showProgress
        });
    }, []);

    const hidePreloader = useCallback(() => {
        setPreloaderState(prev => ({
            ...prev,
            isLoading: false
        }));
    }, []);

    const updateProgress = useCallback((progress: number) => {
        setPreloaderState(prev => ({
            ...prev,
            progress: Math.min(100, Math.max(0, progress))
        }));
    }, []);

    const simulateLoading = useCallback(async (duration = 2200) => {
        showPreloader(true);

        return new Promise<void>((resolve) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(100, (elapsed / duration) * 100);

                updateProgress(progress);

                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        hidePreloader();
                        resolve();
                    }, 300);
                }
            }, 55); // Slightly slower interval to match slower animation
        });
    }, [showPreloader, updateProgress, hidePreloader]);

    return {
        preloaderState,
        showPreloader,
        hidePreloader,
        updateProgress,
        simulateLoading
    };
}
