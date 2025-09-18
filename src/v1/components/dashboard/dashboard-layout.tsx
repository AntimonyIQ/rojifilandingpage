import type React from "react";
import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Send,
  Plus,
  Menu,
  ArrowDownLeft,
  AlertTriangle,
  X,
  Shield,
} from "lucide-react";
import { Button } from "@/v1/components/ui/button";
import { DashboardSidebar } from "./dashboard-sidebar";
import { BottomNavigation } from "./bottom-navigation";
import { session, SessionData } from "@/v1/session/session";
import { ISender } from "@/v1/interface/interface";
import { motion } from "framer-motion";
import { useParams, useLocation } from "wouter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sender, setSender] = useState<ISender | null>(null);
  const [showKycWarning, setShowKycWarning] = useState(true);
  const sd: SessionData = session.getUserData();
  const { wallet } = useParams();
  const [location] = useLocation();

  const buttonShown =
    location === `/dashboard/${wallet}/transactions` || location === `/dashboard/${wallet}`;

  useEffect(() => {
    if (sd) {
      setSender(sd.sender);
    }
  }, []);

  // KYC state computation (three states)
  const isVerified = sender?.businessVerificationCompleted === true;
  const hasNoDirectors = !(sender?.directors && sender.directors.length > 0);
  const documentsHaveIssue = !!(
    sender?.documents &&
    sender.documents.some((d) => d.issue === true || d.smileIdStatus === "failed")
  );
  const directorsHaveIssue = !!(
    sender?.directors &&
    sender.directors.some(
      (d) => d?.idDocument?.smileIdStatus === "rejected" // TODO: FIX HERE ||
      // d?.idDocument?.smileIdStatus === "" ||
      // d?.proofOfAddress?.issue === true ||
      // d?.idDocument?.smileIdStatus === 'rejected' ||
      // d?.proofOfAddress?.smileIdStatus === 'rejected'
    )
  );
  const hasAnyIssue = documentsHaveIssue || directorsHaveIssue;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden relative">
      <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 lg:p-6 h-[73px] flex items-center flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            {buttonShown && (
              <div className="flex items-center gap-2 lg:gap-3">
                <Button
                  size="sm"
                  id="top-button"
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                >
                  <a
                    href={`/dashboard/${wallet}/payment`}
                    className="flex flex-row items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="inline">Create Payment</span>
                  </a>
                </Button>
              </div>
            )}
            <div className="hidden items-center gap-2 lg:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={() => {}}
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden md:inline">Swap</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={() => {}}
              >
                <Send className="h-4 w-4" />
                <span className="hidden md:inline">Transfer</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={() => {}}
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span className="hidden md:inline">Withdraw</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden p-2"
                onClick={() => {}}
                title="Swap"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden p-2"
                onClick={() => {}}
                title="Transfer"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden p-2"
                onClick={() => {}}
                title="Withdraw"
              >
                <ArrowDownLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                onClick={() => {}}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Deposit</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Enhanced KYC Verification Warning - Integrated into layout flow */}
        {!isVerified && showKycWarning && (hasNoDirectors || hasAnyIssue) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`${
              hasNoDirectors
                ? "bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-red-200"
                : "bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-b-2 border-amber-300"
            } shadow-lg flex-shrink-0`}
          >
            <div className="relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse"></div>
              </div>

              <div className="relative px-4 lg:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Animated warning icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex-shrink-0"
                  >
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <div className="flex-1">
                        <h4
                          className={`font-semibold text-sm ${
                            hasNoDirectors ? "text-red-900" : "text-amber-900"
                          }`}
                        >
                          {hasNoDirectors
                            ? "KYC Verification Required"
                            : hasAnyIssue
                            ? "KYC Verification Issues"
                            : "KYC Verification Required"}
                        </h4>
                        <p
                          className={`text-xs ${
                            hasNoDirectors ? "text-red-800" : "text-amber-800"
                          } opacity-90`}
                        >
                          {hasNoDirectors
                            ? "No directors or shareholders added — add them to complete KYC and unlock platform features."
                            : hasAnyIssue
                            ? "Some submitted documents or director records have verification issues that need your attention."
                            : "Complete your business verification to unlock all platform features"}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
                        {!hasAnyIssue && (
                          <Button
                            size="sm"
                            className={`${
                              hasNoDirectors ? "h-7 px-3 bg-red-600" : "h-7 px-3 bg-orange-600"
                            } text-white text-xs font-medium shadow-md`}
                            onClick={() =>
                              (window.location.href = `/signup/${sd.user.rojifiId}/business-details`)
                            }
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {hasNoDirectors
                              ? "Start Verification"
                              : hasAnyIssue
                              ? "Review Issues"
                              : "Start Verification"}
                          </Button>
                        )}
                        {!hasNoDirectors && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${
                              hasNoDirectors
                                ? "h-7 px-2 text-red-700 hover:bg-red-100"
                                : "h-7 px-2 text-amber-700 hover:bg-amber-100"
                            } text-xs hidden sm:inline-flex`}
                            onClick={() =>
                              (window.location.href = `/dashboard/${wallet}/businessprofile`)
                            }
                          >
                            Review Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-amber-700 hover:text-amber-900 hover:bg-amber-200 rounded-full flex-shrink-0 ml-2"
                  onClick={() => setShowKycWarning(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20 lg:pb-6">{children}</main>
        <BottomNavigation />
      </div>
      {/** {modalProps && <KYCModal isOpen={true} {...modalProps} />} */}
    </div>
  );
};
