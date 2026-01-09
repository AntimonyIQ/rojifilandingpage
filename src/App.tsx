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

function App() {
    React.useEffect(() => {
        PoweredByRojifi();
    }, []);

    const appDomainName = `https://use.rojifi.com`;

    useEffect(() => {
        if (window.location.pathname.startsWith("/dashboard")) {
            window.location.replace(`${appDomainName}/dashboard`);
            return;
        }
        if (window.location.pathname.startsWith("/login")) {
            window.location.replace(`${appDomainName}/dashboard`);
            return;
        }
        if (window.location.pathname.startsWith("/request-access")) {
            window.location.replace(`${appDomainName}/request-access`);
            return;
        }
    }, [appDomainName]);

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
                        window.location.pathname.startsWith("/login") ? (
                        ""
                    ) : (
                        <NotFound />
                    )}
                </Route>
            </Switch>
        </AnimatePresence>
    );
}

export default App;
