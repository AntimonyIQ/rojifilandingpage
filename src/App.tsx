import { Route, Switch } from "wouter";
import React, { useEffect } from "react";
import NotFound from "@/pages/not-found";
import { AnimatePresence } from "framer-motion";
import Home from "./v1/app/page";
import ContactPage from "./v1/app/contactus/page";
import AboutPage from "./v1/app/about/page";
import CardsPage from "./v1/app/cards/page";
import HelpPage from "./v1/app/help/page";
import MulticurrencyPage from "./v1/app/multicurrency/page";

import OtcPage from "./v1/app/otc/page";
import PrivacyPage from "./v1/app/privacy/page";
import TermsPage from "./v1/app/terms/page";
import FaqPage from "./v1/app/faq/page";
import PoweredByRojifi from "./utils/powered-by-rojifi";
import TermsOfOperationPage from "./v1/app/terms/termsofoperation";
import { motion, Variants } from "framer-motion";
import { Logo } from "./v1/components/logo";

const logoVariants: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

function App() {
  React.useEffect(() => {
    PoweredByRojifi();
  }, []);

  const appDomainName = `https://use.rojifi.com`;

  useEffect(() => {
    if (window.location.origin === appDomainName) return;

    const path = window.location.pathname;
    const idMatch = path.match(/\/(signup|invitation|reset-password)\/([^/]+)/);
    const id = idMatch ? idMatch[2] : "";

    const redirect = (targetPath: string) => {
      window.location.replace(`${appDomainName}${targetPath}`);
    };

    if (path.startsWith("/signup")) {
      if (path.includes("/verification")) {
        redirect(`/signup/${id}/verification`);
      } else if (path.includes("/business-details")) {
        redirect(`/signup/${id}/business-details`);
      } else if (path.includes("/business-financials")) {
        redirect(`/signup/${id}/business-financials`);
      } else if (path.includes("/director")) {
        redirect(`/signup/${id}/director`);
      } else {
        redirect(`/signup/${id}`);
      }
      return;
    }

    if (path.startsWith("/invitation/")) {
      redirect(`/invitation/${id}`);
      return;
    }
    if (path.startsWith("/reset-password/")) {
      redirect(`/reset-password/${id}`);
      return;
    }
    if (path.startsWith("/dashboard")) {
      redirect("/dashboard/USD");
    }
    if (path.startsWith("/login")) {
      redirect("/login");
    }
  }, [appDomainName]); // Added params.id to dependency array

  const routes: Array<{ path: string; element: React.ReactElement }> = [
    { path: "/", element: <Home /> },
    { path: "/about", element: <AboutPage /> },
    { path: "/cards", element: <CardsPage /> },
    { path: "/contactus", element: <ContactPage /> },
    { path: "/faq", element: <FaqPage /> },
    { path: "/help", element: <HelpPage /> },
    { path: "/multicurrency", element: <MulticurrencyPage /> },
    // { path: "/onboarding", element: <OnboardingPage /> },
    { path: "/otc", element: <OtcPage /> },
    { path: "/privacy", element: <PrivacyPage /> },
    { path: "/terms", element: <TermsPage /> },
    { path: "/terms-of-operation", element: <TermsOfOperationPage /> },
  ];

  return (
    <AnimatePresence mode="wait">
      <Switch>
        {routes.map((r, i) => {
          return (
            <Route path={r.path} key={i}>
              {r.element}
            </Route>
          );
        })}

        <Route path="*">
          {window.location.pathname.startsWith("/dashboard") ||
          window.location.pathname.startsWith("/request-access") ||
          window.location.pathname.startsWith("/login") ||
          window.location.pathname.startsWith("/verify-email") ||
          window.location.pathname.startsWith("/reset-password") ||
          window.location.pathname.startsWith("/invitation") ||
          window.location.pathname.startsWith("/signup") ? (
            <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-white">
              <div className="flex min-h-screen items-center justify-center bg-background">
                <motion.div variants={logoVariants} animate="animate">
                  <Logo className="h-16 w-auto" />
                </motion.div>
              </div>
            </div>
          ) : (
            <NotFound />
          )}
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

export default App;
