import { Route, Switch } from "wouter";

import React from "react";
import NotFound from "@/pages/not-found";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "./app/ProtectedRoute";
// import { RedirectIfAuthenticated } from "./app/RedirectIfAuthenticated";
import LoginPage from "./v1/app/login/page";
import { DashboardLayout } from "./v1/components/dashboard/dashboard-layout";
import { VerificationInReview } from "./v1/components/dashboard/verification-in-review";
import Home from "./v1/app/page";
import ContactPage from "./v1/app/contactus/page";
import DashboardPage from "./v1/app/dashboard/[wallet]/page";
import VirtualCardPage from "./v1/app/dashboard/[wallet]/virtualcard/page";
import BeneficiaryPage from "./v1/app/dashboard/[wallet]/beneficiary/page";
import WalletPage from "./v1/app/dashboard/[wallet]/wallet/page";
import TeamsPage from "./v1/app/dashboard/[wallet]/teams/page";
import StatementPage from "./v1/app/dashboard/[wallet]/statement/page";
import SwapPage from "./v1/app/dashboard/[wallet]/swap/page";
import SenderPage from "./v1/app/dashboard/[wallet]/sender/page";
import OTCDashboardPage from "./v1/app/dashboard/[wallet]/otc/page";
import PaymentPage from "./v1/app/dashboard/[wallet]/payment/page";
import BusinessProfilePage from "./v1/app/dashboard/[wallet]/businessprofile/page";
import OnboardingBusinessRegistration from "./v1/app/dashboard/[wallet]/businessprofile/OnboardingBusinessRegistration";
import DepositPage from "./v1/app/dashboard/[wallet]/deposit/page";
import SettingsPage from "./v1/app/dashboard/[wallet]/settings/page";
import TransactionsPage from "./v1/app/dashboard/[wallet]/transactions/page";
import AboutPage from "./v1/app/about/page";
import CardsPage from "./v1/app/cards/page";
import ForgotPasswordPage from "./v1/app/forgot-password/page";
import HelpPage from "./v1/app/help/page";
import MulticurrencyPage from "./v1/app/multicurrency/page";
import OnboardingPage from "./v1/app/onboarding/page";
import OtcPage from "./v1/app/otc/page";
// import OtpPage from "./v1/app/otp/page";
import PrivacyPage from "./v1/app/privacy/page";
import RequestAccessPage from "./v1/app/request-access/page";
import ResetPasswordPage from "./v1/app/reset-password/page";
import VerifyEmailPage from "./v1/app/verify-email/page";
import SignupPage from "./v1/app/signup/[id]/page";
import BusinessDetailsPage from "./v1/app/signup/[id]/business-details/page";
import BusinessFinancialsPage from "./v1/app/signup/[id]/business-financials/page";
import KYCKYBVerificationPage from "./v1/app/signup/[id]/verification/page";
import InvitationPage from "./v1/app/invitation/[id]/page";
import FaqPage from "./v1/app/faq/page";
import DirectorPage from "./v1/app/signup/[id]/director/page";
import { session, SessionData } from "./v1/session/session";
import EditSenderPage from "./v1/app/dashboard/[wallet]/sender/edit/EditSenderPage";
import InactivityTracker from "@/v1/components/inactivity-tracker";
import AddSenderPage from "./v1/app/dashboard/[wallet]/sender/add/page";
// ...existing code...

function AppRoute({ path, page: Page }: { path: string; page: React.ComponentType }) {
  const sd: SessionData = session.getUserData();
  const getDocumentStatuses = () => {
    if (!sd.sender) return { allVerified: false, hasFailed: false, inReview: false };

    const documents = sd.sender.documents || [];

    if (documents.length === 0) {
      return { allVerified: false, hasFailed: false, inReview: true };
    }

    // Any document with issue === true should mark the whole set as failed
    const hasFailed = documents.some((doc) => doc.issue === true || doc.smileIdStatus === "failed");
    const allVerified = documents.every((doc) => doc.kycVerified === true && doc.issue !== true);
    const inReview = documents.some(
      (doc) => (doc.kycVerified === false || !doc.kycVerified) && doc.issue !== true
    );

    return { allVerified, hasFailed, inReview };
  };

  const { allVerified } = getDocumentStatuses();

  if (
    sd &&
    sd.sender &&
    sd.sender.directors.length === 0 &&
    path.startsWith("/dashboard/:wallet")
  ) {
    return (
      <Route path={path}>
        {() => (
          <ProtectedRoute path={path}>
            <DashboardLayout>
              <OnboardingBusinessRegistration rojifiId={sd.user.rojifiId} />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
    );
  }

  // const isVerificationComplete = sd?.sender?.businessVerificationCompleted;
  if (!allVerified) {
    if (path === "/dashboard/:wallet/businessprofile") {
      return (
        <Route path={path}>
          {() => (
            <ProtectedRoute path={path}>
              <DashboardLayout>
                <BusinessProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
      );
    }

    if (path === "/dashboard/:wallet/businessprofile/edit") {
      return (
        <Route path={path}>
          {() => (
            <ProtectedRoute path={path}>
              <DashboardLayout>
                <EditSenderPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
      );
    }

    return (
      <Route path={path}>
        {() => (
          <ProtectedRoute path={path}>
            <DashboardLayout>
              <VerificationInReview />
              {/****** <VerificationInReview />  <OnboardingBusinessRegistration rojifiId={sd.user.rojifiId} /> */}
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
    );
  }

  // State 3: Verification complete - show normal pages
  return (
    <Route path={path}>
      {() => (
        <ProtectedRoute path={path}>
          <DashboardLayout>
            <Page />
          </DashboardLayout>
        </ProtectedRoute>
      )}
    </Route>
  );
}

function App() {
  const routes: Array<{ path: string; element: React.ReactElement }> = [
    { path: "/", element: <Home /> },
    { path: "/about", element: <AboutPage /> },
    { path: "/cards", element: <CardsPage /> },
    { path: "/contactus", element: <ContactPage /> },
    { path: "/faq", element: <FaqPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/help", element: <HelpPage /> },
    { path: "/multicurrency", element: <MulticurrencyPage /> },
    { path: "/onboarding", element: <OnboardingPage /> },
    { path: "/otc", element: <OtcPage /> },
    // { path: "/otp", element: <OtpPage /> },
    { path: "/privacy", element: <PrivacyPage /> },
    { path: "/request-access", element: <RequestAccessPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
    { path: "/verify-email", element: <VerifyEmailPage /> },
    { path: "/signup/:id/verification", element: <KYCKYBVerificationPage /> },
    { path: "/signup/:id/business-details", element: <BusinessDetailsPage /> },
    { path: "/signup/:id/business-financials", element: <BusinessFinancialsPage /> },
    { path: "/signup/:id/director", element: <DirectorPage /> },
    { path: "/signup/:id", element: <SignupPage /> },
    { path: "/invitation/:id", element: <InvitationPage /> },
    { path: "/login", element: <LoginPage /> },
  ];

  // Track signup progress on signup pages
  React.useEffect(() => {
    const sd: SessionData = session.getUserData();
    const path = window.location.pathname;
    if (/^\/signup\//.test(path)) {
      if (sd && sd.isLoggedIn) {
        if (sd.signupTracker !== path) {
          session.updateSession({ ...sd, signupTracker: path });
        }
      }
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      {/* Global inactivity tracker */}
      <InactivityTracker />
      <Switch>
        {/*
                <RedirectIfAuthenticated path="/login">
                    <LoginPage />
                </RedirectIfAuthenticated>
                */}
        <AppRoute key="virtualcard" path="/dashboard/:wallet/virtualcard" page={VirtualCardPage} />
        <AppRoute key="bankstatement" path="/dashboard/:wallet/bankstatement" page={StatementPage} />
        <AppRoute key="beneficiary" path="/dashboard/:wallet/beneficiary" page={BeneficiaryPage} />
        <AppRoute key="wallet" path="/dashboard/:wallet/wallet" page={WalletPage} />
        <AppRoute key="teams" path="/dashboard/:wallet/teams" page={TeamsPage} />
        <AppRoute key="statement" path="/dashboard/:wallet/statement" page={StatementPage} />
        <AppRoute key="swap" path="/dashboard/:wallet/swap" page={SwapPage} />
        <AppRoute key="businessprofile-edit" path="/dashboard/:wallet/businessprofile/edit" page={EditSenderPage} />
        <AppRoute key="sender-add" path="/dashboard/:wallet/sender/add" page={AddSenderPage} />
        <AppRoute key="sender" path="/dashboard/:wallet/sender" page={SenderPage} />
        <AppRoute key="otc" path="/dashboard/:wallet/otc" page={OTCDashboardPage} />
        <AppRoute key="payment" path="/dashboard/:wallet/payment" page={PaymentPage} />
        <AppRoute key="businessprofile" path="/dashboard/:wallet/businessprofile" page={BusinessProfilePage} />
        <AppRoute key="deposit" path="/dashboard/:wallet/deposit" page={DepositPage} />
        <AppRoute key="settings" path="/dashboard/:wallet/settings" page={SettingsPage} />
        <AppRoute key="transactions" path="/dashboard/:wallet/transactions" page={TransactionsPage} />
        <AppRoute key="dashboard" path="/dashboard/:wallet" page={DashboardPage} />

        {routes.map((r, i) => (
          <Route key={i} path={r.path}>
            {r.element}
          </Route>
        ))}

        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

export default App;
