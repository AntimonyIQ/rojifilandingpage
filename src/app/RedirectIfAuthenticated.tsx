import { session, SessionData } from "@/v1/session/session";
import { Redirect, useRoute } from "wouter";

export function RedirectIfAuthenticated({
    path,
    children,
}: {
        path: string;
        children: React.ReactNode;
}) {
    const storage: SessionData = session.getUserData();
    const [match] = useRoute(path);

    if (!match) return null;

    // if (storage && storage.isLoggedIn) {
    //     return <Redirect to="/dashboard/NGN" />;
    // }
    if (storage && Object.keys(storage.user).length) {
        return <Redirect to="/dashboard/USD" />;
    }

    return <>{children}</>;
}
