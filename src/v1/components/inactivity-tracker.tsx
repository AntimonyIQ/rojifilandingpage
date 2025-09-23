import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { session } from "@/v1/session/session";

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
const MODAL_COUNTDOWN_SECONDS = 30;

const LS_INACTIVITY_EXPIRES = 'rojifi:inactivity:expires';
const LS_MODAL_EXPIRES = 'rojifi:inactivity:modal_expires';

export const InactivityTracker: React.FC = () => {
    const [location, navigate] = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(MODAL_COUNTDOWN_SECONDS);

    const inactivityTimerRef = useRef<number | null>(null);
    const countdownIntervalRef = useRef<number | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    const inactivityExpiresAtRef = useRef<number | null>(null);
    const modalExpiresAtRef = useRef<number | null>(null);

    const isMonitoredRoute = useCallback(() => {
        if (!location) return false;
        return location.startsWith("/signup/") || location.startsWith("/dashboard/");
    }, [location]);

    const clearInactivityTimer = () => {
        if (inactivityTimerRef.current) {
            window.clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
        inactivityExpiresAtRef.current = null;
        try { localStorage.removeItem(LS_INACTIVITY_EXPIRES); } catch (e) { }
    };

    const clearCountdown = () => {
        if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        modalExpiresAtRef.current = null;
        try { localStorage.removeItem(LS_MODAL_EXPIRES); } catch (e) { }
    };

    const resetInactivityTimer = useCallback(() => {
        if (!isMonitoredRoute()) return;
        clearInactivityTimer();
        const expiresAt = Date.now() + INACTIVITY_TIMEOUT_MS;
        inactivityExpiresAtRef.current = expiresAt;
        try { localStorage.setItem(LS_INACTIVITY_EXPIRES, String(expiresAt)); } catch (e) { }

        inactivityTimerRef.current = window.setTimeout(() => {
            setShowModal(true);

            const modalExpires = Date.now() + MODAL_COUNTDOWN_SECONDS * 1000;
            modalExpiresAtRef.current = modalExpires;
            try { localStorage.setItem(LS_MODAL_EXPIRES, String(modalExpires)); } catch (e) { }
            setCountdown(MODAL_COUNTDOWN_SECONDS);
        }, INACTIVITY_TIMEOUT_MS);
    }, [isMonitoredRoute]);

    const handleActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        if (showModal) return;
        resetInactivityTimer();
    }, [showModal, resetInactivityTimer]);

    useEffect(() => {
        if (showModal) return;
        if (isMonitoredRoute()) {
            resetInactivityTimer();
        } else {
            clearInactivityTimer();
        }
    }, [location]);

    useEffect(() => {
        const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
        events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));
        return () => {
            events.forEach(ev => window.removeEventListener(ev, handleActivity));
        };
    }, [handleActivity]);

    const handleAutoAction = useCallback(() => {
        if (!location) return;
        setShowModal(false);
        clearInactivityTimer();
        clearCountdown();

        if (location.startsWith("/signup/")) {
            navigate("/");
        } else if (location.startsWith("/dashboard/")) {
            session.logout();
            navigate("/login");
        }
    }, [location, navigate]);

    useEffect(() => {
        const startCountdown = () => {
            clearCountdown();
            if (!modalExpiresAtRef.current) {
                try {
                    const stored = localStorage.getItem(LS_MODAL_EXPIRES);
                    if (stored) modalExpiresAtRef.current = Number(stored);
                } catch (e) { /* ignore */ }
            }

            if (!modalExpiresAtRef.current) {
                modalExpiresAtRef.current = Date.now() + MODAL_COUNTDOWN_SECONDS * 1000;
                try { localStorage.setItem(LS_MODAL_EXPIRES, String(modalExpiresAtRef.current)); } catch (e) { }
            }

            const tick = () => {
                const expires = modalExpiresAtRef.current as number;
                const remainingMs = Math.max(0, expires - Date.now());
                const remainingSec = Math.ceil(remainingMs / 1000);
                setCountdown(remainingSec);
                if (remainingMs <= 0) {
                    // auto action
                    window.setTimeout(() => handleAutoAction(), 0);
                }
            };

            tick();
            countdownIntervalRef.current = window.setInterval(tick, 1000);
        };

        if (showModal) {
            startCountdown();
        } else {
            clearCountdown();
        }

        return () => clearCountdown();
    }, [showModal]);

    useEffect(() => {
        const onStorage = (ev: StorageEvent) => {
            if (!ev.key) return;
            if (ev.key === LS_INACTIVITY_EXPIRES) {
                try {
                    const stored = ev.newValue ? Number(ev.newValue) : null;
                    if (stored && Date.now() >= stored && isMonitoredRoute()) {
                        setShowModal(true);
                        const modalExpires = Date.now() + MODAL_COUNTDOWN_SECONDS * 1000;
                        modalExpiresAtRef.current = modalExpires;
                        try { localStorage.setItem(LS_MODAL_EXPIRES, String(modalExpires)); } catch (e) { }
                    }
                } catch (e) { }
            }

            if (ev.key === LS_MODAL_EXPIRES) {
                try {
                    const stored = ev.newValue ? Number(ev.newValue) : null;
                    if (stored) {
                        modalExpiresAtRef.current = stored;
                        if (Date.now() >= stored) {
                            handleAutoAction();
                        } else {
                            setShowModal(true);
                        }
                    }
                } catch (e) { }
            }
        };

        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [handleAutoAction, isMonitoredRoute]);

    useEffect(() => {
        const onVisibility = () => {
            try {
                const storedInactivity = localStorage.getItem(LS_INACTIVITY_EXPIRES);
                if (storedInactivity) {
                    const inactivityExp = Number(storedInactivity);
                    if (Date.now() >= inactivityExp && isMonitoredRoute()) {
                        setShowModal(true);
                        const modalExpires = Date.now() + MODAL_COUNTDOWN_SECONDS * 1000;
                        modalExpiresAtRef.current = modalExpires;
                        try { localStorage.setItem(LS_MODAL_EXPIRES, String(modalExpires)); } catch (e) { }
                    }
                }

                const storedModal = localStorage.getItem(LS_MODAL_EXPIRES);
                if (storedModal) {
                    const modalExp = Number(storedModal);
                    modalExpiresAtRef.current = modalExp;
                    if (Date.now() >= modalExp) {
                        handleAutoAction();
                    } else {
                        setShowModal(true);
                    }
                }
            } catch (e) { }
        };

        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [handleAutoAction, isMonitoredRoute]);

    const handleContinue = () => {
        setShowModal(false);
        resetInactivityTimer();
    };
    const handleEndSessionNow = () => {
        handleAutoAction();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearInactivityTimer();
            clearCountdown();
        };
    }, []);

    if (!showModal) return null;

    const isSignup = location?.startsWith("/signup/");
    const isDashboard = location?.startsWith("/dashboard/");

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inactivity-title"
        >
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border">
                <h2 id="inactivity-title" className="text-lg font-semibold text-gray-900 mb-2 text-center">
                    Are you still there?
                </h2>
                <p className="text-sm text-gray-600 mb-4 text-center">
                    You've been inactive for a while. {isSignup && "For security, your signup session will end."}
                    {isDashboard && "For security, you'll be logged out soon."}
                </p>
                <div className="flex items-center justify-center mb-6">
                    <div className="text-4xl font-bold tabular-nums text-primary">
                        {countdown}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleContinue}
                        autoFocus
                        className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Continue Session
                    </button>
                    <button
                        onClick={handleEndSessionNow}
                        className="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                    >
                        {isSignup ? "Go Home Now" : "Logout Now"}
                    </button>
                </div>
                <p className="mt-4 text-[11px] text-center text-gray-400">
                    Auto {isSignup ? "redirect" : "logout"} after timeout for your security.
                </p>
            </div>
        </div>
    );
};

export default InactivityTracker;
