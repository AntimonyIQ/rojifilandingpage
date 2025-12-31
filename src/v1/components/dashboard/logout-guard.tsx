import { useState, useEffect } from "react";
import { session } from "@/v1/session/session";
import { createPortal } from "react-dom";

export function LogoutGuard() {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let currentPath = window.location.pathname;
        const isProtected = (path: string) => path.startsWith("/dashboard");

        // Override history methods to intercept navigation
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        window.history.pushState = function (...args) {
            const url = args[2]?.toString() || "";
            const newPath = url.startsWith("http") ? new URL(url).pathname : url;

            // console.log("LogoutGuard: pushState from", currentPath, "to", newPath);

            if (isProtected(currentPath) && newPath && !isProtected(newPath)) {
                //console.log("LogoutGuard: BLOCKED pushState");
                setShowModal(true);
                return;
            }

            currentPath = newPath || currentPath;
            return originalPushState.apply(this, args);
        };

        window.history.replaceState = function (...args) {
            const url = args[2]?.toString() || "";
            const newPath = url.startsWith("http") ? new URL(url).pathname : url;

            //console.log("LogoutGuard: replaceState from", currentPath, "to", newPath);

            if (isProtected(currentPath) && newPath && !isProtected(newPath)) {
                // console.log("LogoutGuard: BLOCKED replaceState");
                setShowModal(true);
                return;
            }

            currentPath = newPath || currentPath;
            return originalReplaceState.apply(this, args);
        };

        // Handle browser back/forward
        const handlePopState = () => {
            const newPath = window.location.pathname;
        // console.log("LogoutGuard: popstate from", currentPath, "to", newPath);

            if (isProtected(currentPath) && !isProtected(newPath)) {
                //console.log("LogoutGuard: BLOCKED popstate");
                window.history.pushState(null, "", currentPath);
                setShowModal(true);
                return;
            }

            currentPath = newPath;
        };

        window.addEventListener("popstate", handlePopState);

        //console.log("LogoutGuard: Initialized at", currentPath);

        return () => {
            // console.log("LogoutGuard: Cleanup");
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    const handleLogout = () => {
        setShowModal(false);
        session.logout();
        window.location.href = "/login";
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    if (!showModal) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Confirm Logout
                    </h3>
                    <p className="text-gray-500 mb-6">
                        You are about to leave your Dashboard. Do you want to logout?
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
                        >
                            Stay
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
