import type React from "react";
import { useState, useEffect } from "react";
import {
    Menu,
    AlertTriangle,
    X,
    ListTodo,
    Plus,
} from "lucide-react";
import { Button } from "@/v1/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/v1/components/ui/sheet";
import { DashboardSidebar } from "./dashboard-sidebar";
import { BottomNavigation } from "./bottom-navigation";
import { session, SessionData } from "@/v1/session/session";
import { IResponse, ISender, ITransaction } from "@/v1/interface/interface";
import { motion } from "framer-motion";
import { Link, useLocation, useParams } from "wouter";
import { SenderStatus, Status } from "@/v1/enums/enums";
import { PaymentModal } from "../modals/PaymentModal";
import { PaymentView } from "./payment";
import Defaults from "@/v1/defaults/defaults";
import PayAgainModal from "./pay-again-modal";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [transactionsWithIssues, setTransactionsWithIssues] = useState<Array<ITransaction>>([]);
    const [sender, setSender] = useState<ISender | null>(null);
    const [showKycWarning, setShowKycWarning] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isTransactionIssuesSheetOpen, setIsTransactionIssuesSheetOpen] = useState(false);
    const sd: SessionData = session.getUserData();
    const { wallet } = useParams();
    const [location] = useLocation();
    const [allSenders, _setAllSenders] = useState<Record<SenderStatus, number>>({
        [SenderStatus.ACTIVE]: 0,
        [SenderStatus.IN_REVIEW]: 0,
        [SenderStatus.UNAPPROVED]: 0,
        [SenderStatus.SUSPENDED]: 0,
    });
    const [selectedTransactions, setSelectedTransactions] = useState<ITransaction | null>(null);
    const [payAgainOpen, setPayAgainOpen] = useState(false);

    useEffect(() => {
        setSender(sd.sender);
    }, []);

    const buttonShown = location === `/dashboard/${wallet}/transactions`;

    // KYC state computation (three states)
    const isVerified = sender?.businessVerificationCompleted === true;
    const hasNoDirectors = !(sender?.directors && sender.directors.length > 0);
    // const hasNoDocuments = !(sender?.documents && sender.documents.length > 0);
    const documentsHaveIssue = !!(
        sender?.documents &&
        sender.documents.some((d) => d.issue === true || d.smileIdStatus === "rejected")
    );
    const directorsHaveIssue = !!(
        sender?.directors &&
        sender.directors.some(
            (d) => d?.idDocument?.smileIdStatus === "rejected"
        )
    );
    const hasAnyIssue = documentsHaveIssue || directorsHaveIssue;

    const fetchTransactionsWithIssues = async () => {
        try {
            console.log("Fetching transactions with issues...");
            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/issues`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData: Array<ITransaction> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setTransactionsWithIssues(parseData);
            }
        } catch (error: any) {
            console.error("Error fetching transactions with issues:", error);
        }
    }

    useEffect(() => {
        fetchTransactionsWithIssues();
    }, []);

    const handlePayAgainSubmit = () => {

    }

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden relative">
            <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} allSenders={allSenders} />
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
                                    onClick={() => setIsPaymentModalOpen(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="inline">Create Payment</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </header>

                {/** KYC Warning Banner */}
                {!sender ? null : (
                    <>
                        {!isVerified && showKycWarning && (hasNoDirectors || hasAnyIssue) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`${hasNoDirectors
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
                                                            className={`font-semibold text-sm ${hasNoDirectors ? "text-red-900" : "text-amber-900"
                                                                }`}
                                                        >
                                                            {hasNoDirectors
                                                                ? "Incomplete Onboarding"
                                                                : hasAnyIssue
                                                                    ? "KYC Verification Issues"
                                                                    : "KYC Verification Required"}
                                                        </h4>
                                                        <p
                                                            className={`text-xs ${hasNoDirectors ? "text-red-800" : "text-amber-800"
                                                                } opacity-90`}
                                                        >
                                                            {hasNoDirectors
                                                                ? "Complete your business onboarding process. Add them to complete KYC and unlock platform features."
                                                                : hasAnyIssue
                                                                    ? "Submitted documents has verification issues that needs your attention."
                                                                    : "Complete your business verification to unlock all platform features"
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
                                                        {!hasAnyIssue && (
                                                            <Link
                                                                href={sd.signupTracker || `/signup/${sd.user.rojifiId}/business-details`}
                                                                className={`flex flex-row items-center gap-1 rounded-md ${hasNoDirectors ? "h-7 px-3 bg-red-600 hover:bg-red-800" : "h-7 px-3 bg-orange-600"
                                                                    } text-white text-xs font-medium`} >
                                                                <ListTodo className="h-3 w-3 mr-1" />
                                                                {hasNoDirectors
                                                                    ? "Complete Onboarding"
                                                                    : hasAnyIssue
                                                                        ? "Review Issues"
                                                                        : "Start Verification"}
                                                            </Link>
                                                        )}
                                                        {!hasNoDirectors && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={`${hasNoDirectors
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
                    </>
                )}

                {/** Transaction Issues Banner */}
                {transactionsWithIssues.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="bg-gradient-to-r from-red-50 to-pink-50 border-b-2 border-red-200 shadow-lg flex-shrink-0"
                    >
                        <div className="relative overflow-hidden">
                            {/* Animated background pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 animate-pulse"></div>
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
                                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                                            <AlertTriangle className="h-4 w-4 text-white" />
                                        </div>
                                    </motion.div>

                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm text-red-900">
                                                    Transaction Issues Detected
                                                </h4>
                                                <p className="text-xs text-red-800 opacity-90">
                                                    {transactionsWithIssues.length} transaction{transactionsWithIssues.length > 1 ? 's have' : ' has'} errors that need your attention. Click "View More" to resolve these issues.
                                                </p>
                                            </div>

                                            {/* Action button */}
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
                                                <Button
                                                    size="sm"
                                                    className="h-7 px-3 bg-red-600 hover:bg-red-800 text-white text-xs font-medium"
                                                    onClick={() => setIsTransactionIssuesSheetOpen(true)}
                                                >
                                                    View More
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress indicator */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-200">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 to-pink-600"
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

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Create New Payment"
            >
                <PaymentView />
            </PaymentModal>

            {/* Transaction Issues Sheet */}
            <Sheet open={isTransactionIssuesSheetOpen} onOpenChange={setIsTransactionIssuesSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="text-red-900">Transaction Issues</SheetTitle>
                        <SheetDescription className="text-red-700">
                            {transactionsWithIssues.length} transaction{transactionsWithIssues.length > 1 ? 's' : ''} require{transactionsWithIssues.length === 1 ? 's' : ''} your attention
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                        {transactionsWithIssues.map((transaction, index) => (
                            <motion.div
                                key={transaction._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border rounded-lg p-4 bg-red-50 border-red-200"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                            <span className="font-medium text-sm text-red-900">
                                                {transaction.type?.toUpperCase()} Transaction
                                            </span>
                                        </div>
                                        <p className="text-xs text-red-800 mb-2">
                                            Amount: {transaction.beneficiaryCurrency} {transaction.amount?.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-red-700 mb-3">
                                            {transaction.issue?.description || 'Transaction requires attention'}
                                        </p>
                                        <div className="text-xs text-red-600">
                                            Created: {new Date(transaction.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-xs border-red-300 text-red-700 hover:bg-red-100"
                                        onClick={() => {
                                            setSelectedTransactions(transaction);
                                            setPayAgainOpen(true);
                                            // Navigate to transaction details or open modal --- IGNORE ---
                                            // window.location.href = `/dashboard/${wallet}/transactions`; --- IGNORE ---
                                        }}
                                    >
                                        View Details
                                    </Button>
                                    {/*
                                    <Button
                                        size="sm"
                                        className="h-6 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => {
                                            // Open resolution modal or navigate
                                            console.log("Resolve issue for transaction:", transaction._id);
                                        }}
                                    >
                                        Resolve
                                    </Button>
                                    */}
                                </div>
                            </motion.div>
                        ))}

                        {transactionsWithIssues.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No transaction issues found</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {!selectedTransactions ? null : (
                <PayAgainModal open={payAgainOpen} onClose={() => setPayAgainOpen(false)} transaction={selectedTransactions} onSubmit={handlePayAgainSubmit} title="Resolve Transaction Issue" />
            )}
        </div>
    );
};
