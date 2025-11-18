import { useEffect, useState } from "react";
import {
    Files,
    MapPin,
    UsersIcon,
    Building,
    Globe,
    Phone,
    Mail,
    Shield,
    Award,
    Clock,
    ArrowRight,
    Download,
    DollarSign,
    TrendingUp,
    Users,
    Eye,
    ChevronLeft,
    ChevronRight,
    User,
    Check,
} from "lucide-react";
import Loading from "../loading";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { ISender, IDirectorAndShareholder } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
import { useParams } from "wouter";
import { SenderStatus } from "@/v1/enums/enums";
import { industryOptions } from "@/v1/data/industries";

enum Tabs {
    KYC = "KYC",
    OVERVIEW = "Overview",
}

const legalForms = [
    { value: "SARL", label: "SARL (Limited Liability Company)" },
    { value: "SA", label: "SA (Public Limited Company)" },
    { value: "SAS", label: "SAS (Simplified Joint Stock Company)" },
    { value: "SASU", label: "SASU (Single Shareholder SAS)" },
    { value: "EURL", label: "EURL (Single Member SARL)" },
    { value: "SNC", label: "SNC (General Partnership)" },
    { value: "LLC", label: "LLC (Limited Liability Company)" },
    { value: "Corporation", label: "Corporation" },
    { value: "Partnership", label: "Partnership, Business Name" },
    { value: "Sole_Proprietorship", label: "Sole Proprietorship, Business Name" },
    { value: "LTD", label: "LTD (Private Limited Company)" },
    { value: "PLC", label: "PLC (Public Limited Company)" },
    { value: "OTHERS", label: "Others" },
];

const companyActivityOptions = [
    ...industryOptions,
];

export function BusinessProfileView() {
    const [loading, setLoading] = useState<boolean>(true);
    const [kycCompleted, setKycCompleted] = useState<boolean>(false);
    const [sender, setSender] = useState<ISender | null>(null);
    const [directors, setDirectors] = useState<Array<IDirectorAndShareholder>>([]);
    const sd: SessionData = session.getUserData();
    const { wallet } = useParams();

    const [_currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("KYC");

    // Directors & Shareholders navigation state
    const [currentDirectorIndex, setCurrentDirectorIndex] = useState(0);

    const statusTabs = Object.values(Tabs);

    useEffect(() => {
        if (sd) {
            setSender(sd.sender);
            setDirectors(sd.sender.directors);
            setKycCompleted(sd.sender.businessVerificationCompleted);
            setLoading(false);
        }
    }, [sd]);

    //Find LegalForm value and display label
    const getLegalFormLabel = (value?: string) => {
        if (!value) return "";
        const form = legalForms.find((f) => f.value === value);
        return form ? form.label : value;
    };

    // Helper function to check document status
    const [showDocumentIssues, setShowDocumentIssues] = useState(false);
    // Show director/shareholder issues panel
    const [showDirectorIssues, setShowDirectorIssues] = useState(false);

    const getDocumentStatuses = () => {
        if (!sender) return { allVerified: false, hasFailed: false, inReview: false };

        const documents = sender.documents || [];

        if (documents.length === 0) {
            return { allVerified: false, hasFailed: false, inReview: true };
        }

        // Any document with issue === true should mark the whole set as failed
        const hasFailed = documents.some((doc) => doc.issue === true || doc.smileIdStatus === "rejected");
        const allVerified = documents.every((doc) => doc.kycVerified === true && doc.issue !== true);
        const inReview = documents.some(
            (doc) => (doc.kycVerified === false || !doc.kycVerified) && doc.issue !== true
        );

        return { allVerified, hasFailed, inReview };
    };

    const { hasFailed, inReview, allVerified } = getDocumentStatuses();

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800 border-green-200";
            case "in-review":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "unapproved":
                return "bg-red-100 text-red-800 border-red-200";
            case "suspended":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Determine if any director/shareholder has an issue according to IDirectorAndShareholder
    const directorHasIssue = (directors || []).some((d: IDirectorAndShareholder) => {
        const idDoc = d?.idDocument;
        const poa = d?.proofOfAddress;

        // console.log("Director Document Status:", { idDoc, poa });

        // Consider it an issue when:
        // - the SmileID status for the idDocument is explicitly 'rejected'
        // - the explicit verified flags are false
        // - or one of the required document URLs is missing
        return (
            idDoc?.issue === true ||
            poa?.issue === true ||
            // idDoc?.smileIdStatus === 'rejected' ||
            // d?.idDocumentVerified === false ||
            // d?.proofOfAddressVerified === false ||
            !idDoc?.url ||
            !poa?.url
        );
    });

    const directorInReview: boolean = (directors || []).some((d: IDirectorAndShareholder | any) => {
        const idDoc = d?.idDocument;
        const poa = d?.proofOfAddress;

        // Consider it in review when:
        // - the SmileID status for the idDocument is 'pending' or 'in-review'
        // - the explicit verified flags are false or null
        return (
            idDoc?.smileIdStatus === "under_review" ||
            idDoc?.smileIdStatus === "not_submitted" ||
            poa?.smileIdStatus === "under_review" ||
            poa?.smileIdStatus === "not_submitted"
            // d?.idDocumentVerified === false ||
            // d?.proofOfAddressVerified === false
        );
    });

    const completeVerification: boolean = (directors || []).every(
        (d: IDirectorAndShareholder | any) => {
            const idDoc = d?.idDocument;
            const poa = d?.proofOfAddress;

            return (
                idDoc?.smileIdStatus === "verified" &&
                poa?.smileIdStatus === "verified" &&
                d?.idDocumentVerified === true &&
                d?.proofOfAddressVerified === true
            );
        }
    );

    return (
        <div className="mt-5 bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Premium Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{
                                    rotateY: [0, 180, 360],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="p-2 bg-blue-600 rounded-full"
                            >
                                <Building className="h-5 w-5 text-white" />
                            </motion.div>
                            <div className="text-left">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    Business Profile
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Manage your business information and verification
                                </p>
                            </div>
                        </div>
                        {sender && (
                            <Badge
                                className={`px-3 py-1 ${getStatusColor(
                                    allVerified ? SenderStatus.ACTIVE : sender.status
                                )} font-medium border`}
                            >
                                {allVerified ? SenderStatus.ACTIVE : sender.status}
                            </Badge>
                        )}
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center"
                >
                    <div className="flex gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                        {(hasFailed || directorHasIssue
                            ? statusTabs
                            : statusTabs.filter((tab) => tab === Tabs.KYC || tab === Tabs.OVERVIEW)
                        ).map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setCurrentPage(1);
                                }}
                                className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all ${statusFilter === status
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/60"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-20"
                    >
                        <Loading />
                    </motion.div>
                )}

                {/* KYC Incomplete State */}
                {!loading && statusFilter === Tabs.KYC && !kycCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <Card className="w-full max-w-4xl border border-gray-200 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                {allVerified && (
                                    <div className="text-center mb-8">
                                        <div
                                            className={`w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4`}
                                        >
                                            <Check className="h-8 w-8 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">KYC Verified</h2>
                                        <p className="text-gray-600 max-w-md mx-auto"></p>
                                    </div>
                                )}
                                {/* Header */}

                                {!allVerified && (
                                    <div className="text-center mb-8">
                                        <div
                                            className={`w-16 h-16 ${hasFailed ? "bg-red-600" : "bg-yellow-600"
                                                } rounded-full flex items-center justify-center mx-auto mb-4`}
                                        >
                                            <Shield className="h-8 w-8 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                            {hasFailed ? "KYC Verification Issues" : "KYC Verification In Review"}
                                        </h2>
                                        <p className="text-gray-600 max-w-md mx-auto">
                                            {hasFailed
                                                ? "Some of your submitted documents have verification issues that need to be resolved"
                                                : "Your KYC documents are currently being reviewed. We will notify you once the review is complete"}
                                        </p>
                                    </div>
                                )}

                                {/* Verification Steps - Row Layout */}
                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    {/* Business Documents Section */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className={`p-6 rounded-xl border-2 ${hasFailed
                                            ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                                            : inReview
                                                ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                                                : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div
                                                className={`w-12 h-12 ${hasFailed ? "bg-red-600" : inReview ? "bg-yellow-600" : "bg-green-600"
                                                    } rounded-full flex items-center justify-center`}
                                            >
                                                <Files className="h-6 w-6 text-white" />
                                            </div>
                                            <Badge
                                                className={
                                                    hasFailed
                                                        ? "bg-red-100 text-red-800 border-red-200"
                                                        : inReview
                                                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                            : "bg-green-100 text-green-800 border-green-200"
                                                }
                                            >
                                                {hasFailed ? "Failed" : inReview ? "In Review" : "Verified"}
                                            </Badge>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-3">Business Documents</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Upload required business registration and incorporation documents, business
                                            address with recent utility bill or bank statement
                                        </p>

                                        {/* Document Status List */}
                                        <div className="space-y-2 mb-4">
                                            {sender?.documents?.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between text-xs">
                                                    <span>
                                                        {doc.which?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                    </span>
                                                    <Badge
                                                        className={`text-xs ${doc.issue === true
                                                            ? "bg-red-100 text-red-700"
                                                            : doc.smileIdStatus === "verified"
                                                                ? "bg-green-100 text-green-700"
                                                                : doc.smileIdStatus === "rejected"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                            }`}
                                                    >
                                                        {doc.issue === true
                                                            ? "Failed"
                                                            : doc.smileIdStatus === "verified"
                                                                ? "Verified"
                                                                : "In Review"}
                                                    </Badge>
                                                </div>
                                            )) || (
                                                    <div className="text-center py-4 text-gray-500 text-xs">
                                                        No documents uploaded yet
                                                    </div>
                                                )}
                                        </div>

                                        {hasFailed && (
                                            <div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                                    onClick={() => setShowDocumentIssues((v) => !v)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Review Issues
                                                </Button>

                                                {showDocumentIssues && (
                                                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded">
                                                        <h4 className="text-sm font-semibold text-red-800 mb-2">
                                                            Document Issues
                                                        </h4>
                                                        <div className="space-y-2 text-xs text-red-700">
                                                            {sender?.documents
                                                                ?.filter((d) => d.issue === true || d.smileIdStatus === "rejected")
                                                                .map((d, i) => (
                                                                    <div key={i} className="flex items-start justify-between">
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {d.which
                                                                                    ?.replace(/_/g, " ")
                                                                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                                                            </div>
                                                                            <div className="text-red-600">
                                                                                {d.issueMessage ||
                                                                                    (d.smileIdStatus === "rejected"
                                                                                        ? "Verification failed"
                                                                                        : "Issue detected")}
                                                                            </div>
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <a
                                                                                href={`/dashboard/${wallet}/businessprofile/edit`}
                                                                                className="text-red-700 underline"
                                                                            >
                                                                                View
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Directors & Shareholders Section */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className={`p-6 rounded-xl border-2 ${directorHasIssue
                                            ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                                            : directorInReview
                                                ? "bg-yellow-50 border-yellow-200"
                                                : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div
                                                className={`w-12 h-12 ${directorHasIssue
                                                    ? "bg-red-600"
                                                    : directorInReview
                                                        ? "bg-yellow-600"
                                                        : directors.length > 0
                                                            ? "bg-green-600"
                                                            : "bg-gray-400"
                                                    } rounded-full flex items-center justify-center`}
                                            >
                                                <UsersIcon className="h-6 w-6 text-white" />
                                            </div>
                                            <Badge
                                                className={
                                                    directorHasIssue
                                                        ? "bg-red-100 text-red-800 border-red-200"
                                                        : directorInReview
                                                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                            : "bg-green-100 text-green-800 border-green-200"
                                                }
                                            >
                                                {directorHasIssue
                                                    ? "Failed"
                                                    : directorInReview
                                                        ? "In Review"
                                                        : completeVerification
                                                            ? "Completed"
                                                            : "Pending"}
                                            </Badge>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-3">
                                            Directors & Shareholders
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Add and manage all company directors and shareholders information, address
                                            with recent utility bill or bank statement
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Directors & Shareholders Added</span>
                                                <Badge className="text-xs bg-blue-100 text-blue-700">
                                                    {directors.length} Added
                                                </Badge>
                                            </div>
                                        </div>

                                        {directors.length === 0 ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                                            >
                                                <UsersIcon className="mr-2 h-4 w-4" />
                                                Add Directors & Shareholders
                                            </Button>
                                        ) : directorHasIssue ? (
                                            <div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                                    onClick={() => setShowDirectorIssues((v) => !v)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Review Issues
                                                </Button>

                                                    {showDirectorIssues && (
                                                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded">
                                                            <h4 className="text-sm font-semibold text-red-800 mb-2">
                                                                Director / Shareholder Issues
                                                            </h4>
                                                            <div className="space-y-2 text-xs text-red-700">
                                                                {(directors || []).map((d, i) => {
                                                                    const idDoc = d?.idDocument || {};
                                                                    const poa = d?.proofOfAddress || {};
                                                                    const issues: Array<{ title: string; message?: string }> = [];
                                                                    if (
                                                                        idDoc.issue === true ||
                                                                        idDoc.smileIdStatus === "rejected" ||
                                                                        !idDoc?.url
                                                                    ) {
                                                                        issues.push({
                                                                            title: "ID Document",
                                                                            message:
                                                                                idDoc.issueMessage ||
                                                                                (idDoc.smileIdStatus === "rejected"
                                                                                    ? "Verification rejected"
                                                                                    : !idDoc?.url
                                                                                        ? "No document uploaded"
                                                                                        : undefined),
                                                                        });
                                                                    }
                                                                    if (
                                                                        poa.issue === true ||
                                                                        poa.smileIdStatus === "rejected" ||
                                                                        !poa?.url
                                                                    ) {
                                                                        issues.push({
                                                                            title: "Proof of Address",
                                                                            message:
                                                                                poa.issueMessage ||
                                                                                (poa.smileIdStatus === "rejected"
                                                                                    ? "Verification rejected"
                                                                                    : !poa?.url
                                                                                        ? "No document uploaded"
                                                                                        : undefined),
                                                                        });
                                                                    }

                                                                if (issues.length === 0) return null;

                                                                return (
                                                                    <div
                                                                        key={d?._id || i}
                                                                        className="flex items-start justify-between"
                                                                    >
                                                                        <div className="min-w-0">
                                                                            <div className="font-medium truncate">
                                                                                {d?.firstName} {d?.lastName}
                                                                            </div>
                                                                            <div className="text-red-600 text-xs mt-1 space-y-1">
                                                                                {issues.map((it, idx) => (
                                                                                    <div key={idx} className="whitespace-normal break-words">
                                                                                        {it.title}: {it.message}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div className="ml-4 flex-shrink-0">
                                                                            <a
                                                                                href={`/dashboard/${wallet}/businessprofile/edit`}
                                                                                className="text-red-700 underline whitespace-nowrap"
                                                                            >
                                                                                View
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </motion.div>
                                </div>

                                {/* Status Message */}
                                {!allVerified && (
                                    <div className="text-center">
                                        <div
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${hasFailed ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {hasFailed
                                                    ? "Action required - Please review and resubmit documents"
                                                    : "Review in progress - We will notify you once complete"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* KYC Completed State */}
                {!loading && statusFilter === Tabs.KYC && kycCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <Card className="w-full max-w-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="mb-6"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Award className="h-10 w-10 text-white" />
                                    </div>
                                </motion.div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification Complete</h2>
                                <p className="text-gray-600 mb-8">
                                    Congratulations! Your business KYC verification has been successfully completed
                                    and approved.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <Button variant="outline" className="px-6 py-3 h-auto">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Certificate
                                    </Button>
                                    <Button className="px-6 py-3 h-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Business Overview */}
                {!loading && statusFilter === Tabs.OVERVIEW && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Business Info Card */}
                        <Card className=" border border-gray-200 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                {/* Header with Actions */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Building className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                                            <p className="text-gray-600">Company details and registration information</p>
                                        </div>
                                    </div>
                                    {/* <div className="flex gap-2">
                                        <Link href={`/dashboard/${wallet}/businessprofile/edit`}>
                                            <Button className="px-4 py-2 h-auto">
                                                <Building className="mr-2 h-4 w-4" />
                                                Edit Profile
                                            </Button>
                                        </Link>
                                    </div> */}
                                </div>

                                {/* Business Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Business Name
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">
                                                {sender?.businessName || "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Trading Name
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">
                                                {sender?.tradingName || "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Registration Number
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-mono text-gray-900">
                                                {sender?.businessRegistrationNumber || "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Website
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900 break-all">
                                                {sender?.website || "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Legal Form
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">
                                                {getLegalFormLabel(sender?.legalForm) || "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Company Activity
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">
                                                {companyActivityOptions.find((opt) => opt.value === sender?.companyActivity)
                                                    ? `${companyActivityOptions.find((opt) => opt.value === sender?.companyActivity)?.label}`
                                                    : "Not Provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Country of Incorporation
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="font-semibold text-gray-900">
                                                {sender?.country || "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Registration Date
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.dateOfIncorporation
                                                    ? new Date(sender.dateOfIncorporation).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Onboarding Date
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.onboardingDate
                                                    ? new Date(sender.onboardingDate).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Information Card */}
                        <Card className="border border-gray-200 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                                        <MapPin className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
                                        <p className="text-gray-600">Registered business address details</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Street Address
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.streetAddress || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Street Address 2
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.streetAddress2 || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            City
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.city || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            State
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.state || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Region
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.region || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Postal Code
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">{sender?.postalCode || "Not provided"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Information Card */}
                        <Card className="border border-gray-200 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Financial Information</h2>
                                        <p className="text-gray-600">Company financial details and projections</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Share Capital (₦)
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.shareCapital
                                                    ? `${sender.shareCapital.toLocaleString()}`
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    {/*
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Last Year Turnover (₦)
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.lastYearTurnover
                                                    ? `${sender.lastYearTurnover.toLocaleString()}`
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Company Assets (₦)
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.companyAssets
                                                    ? `${sender.companyAssets.toLocaleString()}`
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Monthly Volume ($)
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.volume ? `${sender.volume.toLocaleString()}` : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Expected Monthly Inbound Crypto ($)
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.expectedMonthlyInboundCryptoPayments
                                                    ? `${sender.expectedMonthlyInboundCryptoPayments.toLocaleString()}`
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Expected Monthly Outbound Crypto ($)
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.expectedMonthlyOutboundCryptoPayments
                                                    ? `${sender.expectedMonthlyOutboundCryptoPayments.toLocaleString()}`
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Expected Monthly Inbound Fiat (₦)
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.expectedMonthlyInboundFiatPayments
                                                    ? `${sender.expectedMonthlyInboundFiatPayments.toLocaleString()}`
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Expected Monthly Outbound Fiat (₦)
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-gray-900">
                                                {sender?.expectedMonthlyOutboundFiatPayments
                                                    ? `${sender.expectedMonthlyOutboundFiatPayments.toLocaleString()}`
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                    </div>
                                    */}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Services & Sources Card */}
                        <Card className="border border-gray-200 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Services & Sources</h2>
                                        <p className="text-gray-600">Requested services and funding sources</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Source of Wealth
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <div className="flex flex-wrap gap-2">
                                                {sender?.sourceOfWealth && sender.sourceOfWealth.length > 0 ? (
                                                    sender.sourceOfWealth.map((source, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="bg-green-50 text-green-700 border-green-200"
                                                        >
                                                            {source.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-900">Not provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            Anticipated Source of Funds
                                        </Label>
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <div className="flex flex-wrap gap-2">
                                                {sender?.anticipatedSourceOfFundsOnDunamis &&
                                                    sender.anticipatedSourceOfFundsOnDunamis.length > 0 ? (
                                                    sender.anticipatedSourceOfFundsOnDunamis.map((source, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="bg-blue-50 text-blue-700 border-blue-200"
                                                        >
                                                            {source.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-900">Not provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Directors & Shareholders Card */}
                        <Card className="border border-gray-200 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Directors & Shareholders</h2>
                                            <p className="text-gray-600">Company leadership and ownership structure</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="px-3 py-1">
                                            {directors.length} {directors.length === 1 ? "Person" : "People"}
                                        </Badge>
                                    </div>
                                </div>

                                {directors.length > 0 ? (
                                    <>
                                        {/* Progress Indicator */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-gray-700">
                                                    {currentDirectorIndex + 1} of {directors.length}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {directors[currentDirectorIndex]?.firstName}{" "}
                                                    {directors[currentDirectorIndex]?.lastName}
                                                </p>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                                                    style={{
                                                        width: `${((currentDirectorIndex + 1) / directors.length) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Current Director/Shareholder Details */}
                                        <motion.div
                                            key={currentDirectorIndex}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            {/* Personal Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <User className="h-4 w-4 text-indigo-600" />
                                                        Full Name
                                                    </Label>
                                                    <div className="p-4 rounded-lg border">
                                                        <p className="font-semibold text-gray-900">
                                                            {`${directors[currentDirectorIndex]?.firstName} ${directors[currentDirectorIndex]?.middleName
                                                                ? directors[currentDirectorIndex]?.middleName + " "
                                                                : ""
                                                                }${directors[currentDirectorIndex]?.lastName}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-indigo-600" />
                                                        Email Address
                                                    </Label>
                                                    <div className="p-4 rounded-lg border">
                                                        <p className="text-gray-900">
                                                            {directors[currentDirectorIndex]?.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-indigo-600" />
                                                        Role & Position
                                                    </Label>
                                                    <div className="p-4 rounded-lg border">
                                                        <p className="font-semibold text-gray-900">
                                                            {directors[currentDirectorIndex]?.role}
                                                        </p>
                                                        {directors[currentDirectorIndex]?.jobTitle && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {directors[currentDirectorIndex]?.jobTitle}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                                                        Ownership
                                                    </Label>
                                                    <div className="p-4 rounded-lg border">
                                                        <p className="font-semibold text-gray-900">
                                                            {directors[currentDirectorIndex]?.isShareholder
                                                                ? `${directors[currentDirectorIndex]?.shareholderPercentage}% shareholding`
                                                                : "No shareholding"}
                                                        </p>
                                                        <div className="flex gap-2 mt-2">
                                                            {directors[currentDirectorIndex]?.isDirector && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs bg-blue-100 text-blue-800"
                                                                >
                                                                    Director
                                                                </Badge>
                                                            )}
                                                            {directors[currentDirectorIndex]?.isShareholder && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs bg-green-100 text-green-800"
                                                                >
                                                                    Shareholder
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-indigo-600" />
                                                        Phone Number
                                                    </Label>
                                                    <div className="p-4 rounded-lg border">
                                                        <p className="text-gray-900">
                                                            +{directors[currentDirectorIndex]?.phoneCode}{" "}
                                                            {directors[currentDirectorIndex]?.phoneNumber}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Globe className="h-4 w-4 text-indigo-600" />
                                                        Nationality
                                                    </Label>
                                                    <div className="p-4 rounded-lg border">
                                                        <p className="text-gray-900">
                                                            {directors[currentDirectorIndex]?.nationality}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                                    Address Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-indigo-600" />
                                                            Street Address
                                                        </Label>
                                                        <div className="p-4 rounded-lg border">
                                                            <p className="text-gray-900">
                                                                {directors[currentDirectorIndex]?.streetAddress}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700">
                                                            City & Postal Code
                                                        </Label>
                                                        <div className="p-4 rounded-lg border">
                                                            <p className="text-gray-900">
                                                                {directors[currentDirectorIndex]?.city},{" "}
                                                                {directors[currentDirectorIndex]?.postalCode}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700">
                                                            State/Province
                                                        </Label>
                                                        <div className="p-4 rounded-lg border">
                                                            <p className="text-gray-900">
                                                                {directors[currentDirectorIndex]?.state}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700">Country</Label>
                                                        <div className="p-4 rounded-lg border">
                                                            <p className="text-gray-900">
                                                                {directors[currentDirectorIndex]?.country}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Verification Status */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                                    Verification Status
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-indigo-600" />
                                                            ID Document
                                                        </Label>
                                                        <div className="p-4 rounded-lg border">
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    className={
                                                                        directors[currentDirectorIndex]?.idDocumentVerified
                                                                            ? "bg-green-100 text-green-800 border-green-200"
                                                                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                                    }
                                                                >
                                                                    {directors[currentDirectorIndex]?.idDocumentVerified
                                                                        ? "Verified"
                                                                        : "Pending"}
                                                                </Badge>
                                                                <span className="text-sm text-gray-600">
                                                                    {directors[currentDirectorIndex]?.idType === "passport"
                                                                        ? "Passport"
                                                                        : "Driver's License"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-indigo-600" />
                                                            Proof of Address
                                                        </Label>
                                                        <div className="p-4 rounded-lg border">
                                                            <Badge
                                                                className={
                                                                    directors[currentDirectorIndex]?.proofOfAddressVerified
                                                                        ? "bg-green-100 text-green-800 border-green-200"
                                                                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                                }
                                                            >
                                                                {directors[currentDirectorIndex]?.proofOfAddressVerified
                                                                    ? "Verified"
                                                                    : "Pending"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Navigation Buttons */}
                                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setCurrentDirectorIndex(Math.max(0, currentDirectorIndex - 1))
                                                }
                                                disabled={currentDirectorIndex === 0}
                                                className="flex items-center gap-2"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>

                                            <div className="flex gap-2">
                                                {directors.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentDirectorIndex(index)}
                                                        className={`w-3 h-3 rounded-full transition-all ${index === currentDirectorIndex
                                                            ? "bg-indigo-600 scale-125"
                                                            : "bg-gray-300 hover:bg-gray-400"
                                                            }`}
                                                    />
                                                ))}
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setCurrentDirectorIndex(
                                                        Math.min(directors.length - 1, currentDirectorIndex + 1)
                                                    )
                                                }
                                                disabled={currentDirectorIndex === directors.length - 1}
                                                className="flex items-center gap-2"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            No Directors or Shareholders
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Add directors and shareholders to complete your business profile.
                                        </p>
                                        <Button className="px-6 py-3 h-auto">
                                            <Users className="mr-2 h-4 w-4" />
                                            Add Directors & Shareholders
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
