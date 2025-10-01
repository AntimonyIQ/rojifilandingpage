import { session, SessionData } from "@/v1/session/session";
import { Redirect, useRoute } from "wouter";
import { useState, useEffect } from "react";
import Preloader from "@/v1/components/preloader";

export function ProtectedRoute({
    path,
    children,
}: {
    path: string;
    children: React.ReactNode;
}) {
    const [match] = useRoute(path);
    const [isLoading, setIsLoading] = useState(true);
    const [sd, setSd] = useState<SessionData | null>(null);

    useEffect(() => {
        // Get session data immediately and check if it's ready
        const sessionData = session.getUserData();

        // Check if we have the necessary data for authentication
        const isDataReady = sessionData && sessionData.isLoggedIn !== undefined;

        if (isDataReady) {
            setSd(sessionData);
            setIsLoading(false);
        } else {
            // If data isn't ready, show preloader until it is
            const checkDataReady = () => {
                const currentSessionData = session.getUserData();
                const isReady = currentSessionData && currentSessionData.isLoggedIn !== undefined;

                if (isReady) {
                    setSd(currentSessionData);
                    setIsLoading(false);
                } else {
                    // Check again in 50ms
                    setTimeout(checkDataReady, 50);
                }
            };
            checkDataReady();
        }
    }, []);

    if (!match) return null;

    if (isLoading) {
        return <Preloader />;
    }

    if (!sd || !sd.isLoggedIn) {
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
}
