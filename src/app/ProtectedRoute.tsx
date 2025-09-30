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
        // Simulate a brief loading period for better UX
        const timer = setTimeout(() => {
            const sessionData = session.getUserData();
            setSd(sessionData);
            setIsLoading(false);
        }, 800); // 800ms loading time

        return () => clearTimeout(timer);
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
