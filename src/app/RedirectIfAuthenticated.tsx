import { session, SessionData } from "@/v1/session/session";
import { Redirect, useRoute } from "wouter";

export function RedirectIfAuthenticated({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const sd: SessionData = session.getUserData();
  const [match] = useRoute(path);

  if (!match) return null;

  // if (sd && sd.isLoggedIn) {
  //     return <Redirect to="/dashboard/NGN" />;
  // }
  if (Object.keys(sd.user).length) {
    return <Redirect to="/dashboard/NGN" />;
  }

  return <>{children}</>;
}
