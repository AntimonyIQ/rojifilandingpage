import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/v1/components/ui/sheet";
import {
    Download,
    MoreVertical,
    FileText,
    Repeat,
    // Edit,
    UserCircle,
    Loader,
    Copy,
} from "lucide-react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    // DropdownMenuSeparator,
} from "@/v1/components/ui/dropdown-menu";
import PayAgainModal from "./pay-again-modal";
import { useState } from "react";
import { IResponse, ITransaction } from "@/v1/interface/interface";
import { PurposeOfPayment, Status, TransactionStatus } from "@/v1/enums/enums";
import DocumentViewerModal from "../modal/document-view";
import Defaults from "@/v1/defaults/defaults";
import { session, SessionData } from "@/v1/session/session";
import { toast } from "sonner";
import { Country, ICountry } from "country-state-city";
// import { randomUUID } from "crypto";

export enum TxType {
    DEPOSIT = "deposit",
    SWAP = "swap",
    WITHDRAWAL = "withdrawal",
    TRANSFER = "transfer",
}

export interface TransactionDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: ITransaction;
}

const reasonData = [
    { value: PurposeOfPayment.PAYMENT_FOR_GOODS, label: "Payment for Goods" },
    {
        value: PurposeOfPayment.CAPITAL_INVESTMENT_OR_ITEM,
        label: "Capital Investment or Item",
    },
    {
        value: PurposeOfPayment.PAYMENT_FOR_BUSINESS_SERVICES,
        label: "Payment for Business Services",
    },
    { value: PurposeOfPayment.OTHER, label: "Other" },
];

export function TransactionDetailsDrawer({
    isOpen,
    onClose,
    transaction,
}: TransactionDetailsDrawerProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewName, setPreviewName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [payAgainOpen, setPayAgainOpen] = useState(false);
    const storage: SessionData = session.getUserData();
    const countries: Array<ICountry> = Country.getAllCountries();

    const openPreview = (url?: string | null, name?: string | null) => {
        if (!url) return;
        setPreviewUrl(url);
        setPreviewName(name ?? url?.split("/")?.pop() ?? "attachment");
        setPreviewOpen(true);
    };

    /*
        const handleDownloadReceipt = async () => {
            const url = transaction?.receipt ?? transaction?.paymentInvoice
            if (!url) {
                console.log("No receipt available for", transaction?._id)
                onClose()
                return
            }
    
            try {
                const res = await fetch(url)
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
                const blob = await res.blob()
    
                // try to determine filename
                let filename = url.split('/').pop() ?? 'receipt'
                const contentDisp = res.headers.get('content-disposition')
                if (contentDisp) {
                    const m = contentDisp.match(/filename\*?=(?:UTF-8'' )?"?([^;\"\n]+)/i)
                    if (m && m[1]) filename = decodeURIComponent(m[1].replace(/['"]/g, ''))
                }
    
                const blobUrl = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = blobUrl
                a.download = filename
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(blobUrl)
            } catch (err) {
                console.warn('Download failed; opening in new tab', err)
                // fallback: open in new tab (may allow user to manually download)
                window.open(url, '_blank', 'noopener,noreferrer')
            } finally {
                onClose()
            }
        }
        */

    const handlePayAgain = () => {
        onClose();
        setPayAgainOpen(true);
    };

    const handlePayAgainSubmit = (payload: any) => {
        // implement submission logic here; for now, just log and close
        console.log("Submitting pay again payload", payload);
        setPayAgainOpen(false);
    };

    /*
    const handleRequestAmendment = () => {
        onClose();
    };
    */

    const handleCopyMt103 = async (mt103: string) => {
        try {
            await navigator.clipboard.writeText(mt103);
            toast.success("MT103 copied to clipboard");
        } catch (error) {
            toast.error("Failed to copy MT103");
        }
    };

    const getStatusColor = (status: string) => {
        const displayStatus = status?.toLowerCase();
        switch (displayStatus) {
            case TransactionStatus.SUCCESSFUL:
                return "bg-green-100 text-green-800";
            case TransactionStatus.PENDING:
                return "bg-yellow-100 text-yellow-800";
            case TransactionStatus.PROCESSING:
            case TransactionStatus.INITIALIZING: // Treat INITIALIZING as PROCESSING for display
                return "bg-blue-100 text-blue-800";
            case TransactionStatus.FAILED:
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getDisplayStatus = (status: string) => {
        // Map INITIALIZING to "processing" for customer display
        if (status === TransactionStatus.INITIALIZING) {
            return "processing";
        }
        return status;
    };

    const formatCurrency = (amount: string | number | undefined) => {
        const amountStr = String(amount ?? "0");
        const cleanedAmount = amountStr.replace(/,/g, "");
        const numAmount = Number.parseFloat(cleanedAmount);
        return `${numAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const directDownload = (url: string, filename: string) => {
        const encodedDownloadFilename = encodeURIComponent(filename);
        const downloadUrl = `${Defaults.API_BASE_URL
            }/download?url=${encodeURIComponent(
                url
            )}&filename=${encodedDownloadFilename}`;
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.target = "_self";
        a.rel = "noopener noreferrer";
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const fetchTransactionReceipt = async (transactionId: string) => {
        if (transaction.receipt) {
            directDownload(
                transaction.receipt,
                `receipt-${transaction.reference}.pdf`
            );
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(
                `${Defaults.API_BASE_URL}/transaction/receipt/${transactionId}`,
                {
                    method: "GET",
                    headers: {
                        ...Defaults.HEADERS,
                        "x-rojifi-handshake": sd.client.publicKey,
                        "x-rojifi-deviceid": sd.deviceid,
                        Authorization: `Bearer ${sd.authorization}`,
                    },
                }
                */

    const handlePayAgain = () => {
                onClose();
                setPayAgainOpen(true);
            };

            const handlePayAgainSubmit = (payload: any) => {
                // implement submission logic here; for now, just log and close
                console.log("Submitting pay again payload", payload);
                setPayAgainOpen(false);
            };

            const handleRequestAmendment = () => {
                onClose();
            };

            const getStatusColor = (status: string) => {
                const displayStatus = status?.toLowerCase();
                switch (displayStatus) {
                    case TransactionStatus.SUCCESSFUL:
                        return "bg-green-100 text-green-800";
                    case TransactionStatus.PENDING:
                        return "bg-yellow-100 text-yellow-800";
                    case TransactionStatus.PROCESSING:
                    case TransactionStatus.INITIALIZING: // Treat INITIALIZING as PROCESSING for display
                        return "bg-blue-100 text-blue-800";
                    case TransactionStatus.FAILED:
                        return "bg-red-100 text-red-800";
                    default:
                        return "bg-gray-100 text-gray-800";
                }
      );

    const data: IResponse = await res.json();
    if (data.status === Status.SUCCESS && data.handshake) {
        const parseData: { mt103Url: string } = Defaults.PARSE_DATA(
            data.data,
            storage.client.privateKey,
            data.handshake
        );
        directDownload(
            parseData.mt103Url,
            `mt103-${transaction.reference || transactionId}.pdf`
        );
    }
} catch (error: any) {
    console.error("Error fetching mt103:", error);
    toast.error(
        error.message || "Failed to fetch mt103. Please try again later."
    );
} finally {
    setLoading(false);
}
    };

return (
    <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
            <div className="p-5 h-full flex flex-col">
                {/* Header */}
                <SheetHeader className="flex flex-row items-center justify-between mb-6">
                    <SheetTitle className="text-xl font-semibold text-gray-900">
                        Payment Details
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-row items-center justify-between mb-4 border-y py-4">
                    <button
                        disabled={loading}
                        onClick={() => {
                            fetchTransactionReceipt(transaction._id);
                        }}
                        className="flex flex-col items-center justify-center w-full text-blue-500 border-r text-sm"
                    >
                        {loading ? (
                            <Loader className="mr-2 animate-spin" size={16} />
                        ) : (
                            <Download size={24} className=" text-blue-500" />
                        )}
                        Download Receipt
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex flex-col items-center justify-center w-full text-sm">
                                <MoreVertical size={24} className=" text-gray-600" />
                                More
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {transaction.status === TransactionStatus.SUCCESSFUL && (
                                <DropdownMenuItem
                                    className="py-3"
                                    onSelect={() => {
                                        fetchTransactionMt103(transaction._id);
                                    }}
                                >
                                    {loading ? (
                                        <Loader className="mr-2 animate-spin" size={16} />
                                    ) : (
                                        <FileText className="mr-2" />
                                    )}
                                    Download MT103
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                className="py-3"
                                disabled={storage.user?.payoutEnabled === false ? true : false}
                                onSelect={handlePayAgain}
                            >
                                <Repeat className="mr-2" />
                                Pay again
                            </DropdownMenuItem>
                            {/*
                                {transaction.status === TransactionStatus.SUCCESSFUL && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="py-3"
                                            onSelect={handleRequestAmendment}
                                        >
                                            <Edit className="mr-2" />
                                            Request Amendment
                                        </DropdownMenuItem>
                                    </>
                                )}
                                */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <SheetDescription className="sr-only">
                    Details of the selected transaction, including amount, status, and
                    date.
                </SheetDescription>

                <div className="space-y-4 flex-1 overflow-y-auto">
                    <h4 className="text-lg font-medium text-gray-900">Summary</h4>

                    {/* Transaction Details */}
                    <div className="space-y-3 flex flex-col items-start gap-1 w-full">
                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">
                                Transaction Status
                            </span>
                            <span
                                className={`text-gray-900 font-medium text-xs px-2 py-[2px] rounded-md capitalize ${getStatusColor(
                                    transaction?.status
                                )} `}
                            >
                                {getDisplayStatus(transaction?.status ?? "N/A")}
                            </span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">
                                Transaction Amount
                            </span>
                            <span className="text-gray-900 font-medium text-sm">
                                {formatCurrency(transaction?.amount) ?? "N/A"}{" "}
                                {transaction.wallet}
                            </span>
                        </div>

                        {transaction.status === TransactionStatus.SUCCESSFUL &&
                            transaction.mt103 && (
                                <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                    <div className="flex flex-row items-start justify-between w-full">
                                        <span className="text-gray-500 uppercase text-xs">
                                            Tracking Reference:
                                        </span>
                                    </div>
                                    <div className="border-l-[4px] px-3 border-gray-300 ml-2">
                                        <div className="flex flex-col justify-start items-start gap-1">
                                            <span className="text-gray-500 capitalize text-xs">
                                                UETR:
                                            </span>
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="text-gray-900 font-medium text-sm flex-1">
                                                    {transaction.mt103}
                                                </span>
                                                <button
                                                    onClick={() => transaction.mt103 && handleCopyMt103(transaction.mt103)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    title="Copy MT103"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">
                                Transaction Wallet
                            </span>
                            <div className="flex flex-row items-center justify-start gap-2">
                                <img
                                    src="https://img.icons8.com/color/50/usa-circular.png"
                                    alt=""
                                    className="w-5 h-5 rounded-full"
                                />
                                <span className="text-gray-900 font-medium text-sm">
                                    {transaction?.wallet ?? "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">Sender:</span>
                            <span className="text-gray-900 font-medium text-sm">
                                {transaction?.senderName ?? "N/A"}
                            </span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">
                                Beneficiary's Account Name:
                            </span>
                            <span className="text-gray-900 font-medium text-sm">
                                {transaction?.beneficiaryAccountName ?? "N/A"}
                            </span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">
                                Beneficiary's Account Number:
                            </span>
                            <span className="text-gray-900 font-medium text-sm">
                                {transaction?.beneficiaryAccountNumber ?? "N/A"}
                            </span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">
                                Beneficiary's Country:
                            </span>
                            <div className="flex flex-row items-center justify-start gap-2">
                                <img
                                    src={`https://flagcdn.com/w320/${(
                                        countries.find(
                                            (c) => c.name === transaction.beneficiaryCountry
                                        )?.isoCode || transaction?.beneficiaryCountryCode
                                    ).toLowerCase()}.png`}
                                    alt=""
                                    className="w-5 h-5 rounded-full"
                                />
                                <span className="text-gray-900 font-medium text-sm">
                                    {transaction?.beneficiaryCountry ?? "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">
                                SWIFT Code / Routing Number:
                            </span>
                            <span className="text-gray-900 font-medium text-sm">
                                {transaction?.swiftCode ?? "N/A"}
                            </span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">
                                Bank Name:
                            </span>
                            <span className="text-gray-900 font-medium text-sm">
                                {transaction?.beneficiaryBankName ?? "N/A"}
                            </span>
                        </div>

                        <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                            <span className="text-gray-500 uppercase text-xs">
                                Bank Address:
                            </span>
                            <span className="text-gray-900 font-medium text-sm">
                                {transaction?.beneficiaryBankAddress ?? "N/A"}
                            </span>
                        </div>

                        <button
                            onClick={() =>
                                !copied && copyFunction(String(transaction.mt103))
                            }
                            disabled={copied}
                            className={`
    flex items-center justify-center gap-2 w-24 py-1.5 px-3 rounded-full text-xs font-medium transition-all duration-300
    ${copied
                                    ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
                                }
  `}
                        >
                            {copied ? (
                                <>
                                    <CopyCheck size={14} className="text-green-600" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <CopyIcon size={14} />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
        </SheetContent>
        <PayAgainModal
            open={payAgainOpen}
            onClose={() => setPayAgainOpen(false)}
            transaction={transaction}
            onSubmit={handlePayAgainSubmit}
            action="pay-again"
        />
        <DocumentViewerModal
            open={previewOpen}
            onOpenChange={() => setPreviewOpen(false)}
            documentUrl={previewUrl ?? ""}
            documentTitle={previewName ?? "Document"}
        />
    </Sheet>
);
}