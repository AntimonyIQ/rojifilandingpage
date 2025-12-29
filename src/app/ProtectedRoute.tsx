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
  const storage: SessionData = session.getUserData();

  if (!match) return null;

  //   if (!storage || storage.isLoggedIn === false) {
  //     return <Redirect to="/login" />;
  //   }

  if (Object.keys(storage.user).length === 0) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
