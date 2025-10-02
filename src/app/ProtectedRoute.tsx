import { session, SessionData } from "@/v1/session/session";
import { Redirect, useRoute } from "wouter";

export function ProtectedRoute({
    path,
    children,
}: {
    path: string;
    children: React.ReactNode;
}) {
    const [match] = useRoute(path);
    const sd: SessionData = session.getUserData();

    if (!match) return null;

    if (!sd || !sd.isLoggedIn) {
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
}
