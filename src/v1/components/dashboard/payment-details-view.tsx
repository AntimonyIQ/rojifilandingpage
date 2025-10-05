
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { UserCircle, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/v1/components/ui/dialog"
import { Card, CardContent } from "@/v1/components/ui/card"
import { IIBanDetailsResponse, IPayment, ISwiftDetailsResponse, IWallet } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session"
import { Separator } from "../ui/separator"
import { Reason } from "@/v1/enums/enums"
import DocumentViewerModal from "../modal/document-view"

// VisuallyHidden component for accessibility
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
    <span className="sr-only">
        {children}
    </span>
)

export interface TransactionFee {
    amount: string
    currency: string
}

export interface PaymentDetailsProps {
    open: boolean
    onClose: () => void
    onEdit?: () => void
    details: IPayment & {
        wallet: IWallet | null,
        ibanDetails: IIBanDetailsResponse | null,
        swiftDetails: ISwiftDetailsResponse | null,
    }
}

export default function PaymentDetailsDrawer({ open, onClose, onEdit, details }: PaymentDetailsProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewName, setPreviewName] = useState<string | null>(null);

    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (open && details) {
            /*
            console.log("PaymentDetailsDrawer received data:", {
                wallet: details.wallet,
                walletBalance: details.wallet?.balance,
                walletCurrency: details.wallet?.currency,
                walletSymbol: details.wallet?.symbol,
                beneficiaryAmount: details.beneficiaryAmount,
                swiftDetails: details.swiftDetails,
                swiftCity: details.swiftDetails?.city,
                swiftCountry: details.swiftDetails?.country,
                reason: details.reason,
                reasonDescription: details.reasonDescription
            });
            */
        }
    }, [open, details]);

    const formatCurrency = (amount: string | undefined) => {
        const cleanedAmount = amount?.replace(/,/g, '') ?? "0";
        const numAmount = Number.parseFloat(cleanedAmount);
        return `${numAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const openPreview = (url?: string | null, name?: string | null) => {
        if (!url) return
        setPreviewUrl(url)
        setPreviewName(name ?? url?.split('/')?.pop() ?? 'attachment')
        setPreviewOpen(true)
    }

    const formatReasonLabel = (reason: string): string => {
        switch (reason) {
            case Reason.GOODS_SERVICES:
                return "Goods & Services";
            case Reason.PAYROLL_SALARIES:
                return "Payroll & Salaries";
            case Reason.INVESTMENTS_DIVIDENDS:
                return "Investments & Dividends";
            case Reason.LOANS_CREDIT:
                return "Loans & Credit";
            case Reason.TAXES_GOVERNMENT:
                return "Taxes & Government";
            case Reason.PROFESSIONAL_FEES:
                return "Professional Fees";
            case Reason.TRANSFERS_REFUNDS:
                return "Transfers & Refunds";
            case Reason.OTHER:
                return "Other";
            default:
                return reason;
        }
    }

    const DetailRow = ({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) => (
        <div className="flex flex-col justify-start items-start py-3 border-b border-gray-100 last:border-b-0 w-full">
            <div className="flex items-center gap-2 text-gray-300">
                {icon}
                <span className="text-sm text-gray-400 font-medium">{label}</span>
            </div>
            <div className="text-sm text-gray-900 font-semibold w-full">
                {value}
            </div>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen && onEdit) {
                onEdit();
            } else if (!isOpen) {
                // If no onEdit callback, just prevent the modal from closing
                return;
            }
        }}>
            <DialogContent className="h-[98dvh] w-[45dvw] max-w-none p-0 bg-gray-50 flex flex-col">
                <VisuallyHidden>
                    <DialogTitle>Payment Details Review</DialogTitle>
                </VisuallyHidden>
                {/* Header */}
                <div className="bg-white border-b p-6 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-2">
                    {/* Transaction Amount Card */}
                    <Card className="border-0 bg-transparent shadow-none">
                        <CardContent className="px-6 py-0">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Amount:</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {details.wallet?.symbol}{formatCurrency(details.beneficiaryAmount)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Wallet & Balance Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="border-0 bg-transparent shadow-none">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <img src={details.wallet?.icon} alt="" width={28} height={28} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Wallet</div>
                                        <div className="font-semibold text-gray-900">{details.senderCurrency}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-transparent shadow-none">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">{details.wallet?.currency} Balance</div>
                                        <div className="font-semibold text-gray-900">{formatCurrency(String(details.wallet?.balance || "0"))}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator />

                    {/* Beneficiary Information */}
                    <Card className="border-0 bg-transparent shadow-none">
                        <CardContent className="px-4 py-2">
                            <div className="space-y-1">
                                <DetailRow
                                    label="Sender Name"
                                    value={sd.sender.businessName || "N/A"}
                                />
                                <DetailRow
                                    label="Beneficiary Name"
                                    value={details.beneficiaryAccountName || "N/A"}
                                />
                                <DetailRow
                                    label={details.beneficiaryIban ? "Beneficiary IBAN" : "Beneficiary Account Number"}
                                    value={details.beneficiaryIban || details.beneficiaryIban || details.beneficiaryAccountNumber}
                                />
                                <DetailRow
                                    label="Beneficiary Country"
                                    value={
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={`https://flagcdn.com/w320/${details.beneficiaryCountryCode.toLowerCase()}.png`}
                                                className="rounded-full h-5 w-5"
                                            />
                                            <span>{details.beneficiaryCountry || "N/A"}</span>
                                        </div>
                                    }
                                />
                                <DetailRow
                                    label="Beneficiary Address"
                                    value={details.beneficiaryAddress || "N/A"}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bank Information */}
                    {details.fundsDestinationCountry !== "UK" && (
                        <Card className="border-0 bg-transparent shadow-none">
                            <CardContent className="px-4 py-1">
                                <div className="space-y-1">
                                    <DetailRow
                                        label="SWIFT Code"
                                        value={details.swiftCode || "N/A"}
                                    />
                                    <DetailRow
                                        label="Bank Name"
                                        value={details.swiftDetails?.bank_name || details.beneficiaryBankName || "N/A"}
                                    />
                                    <DetailRow
                                        label="Bank Address"
                                        value={(details.swiftDetails?.city && details.swiftDetails?.country)
                                            ? `${details.swiftDetails.city}, ${details.swiftDetails.country}`
                                            : "N/A"}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Details */}
                    <Card className="border-0 bg-transparent shadow-none">
                        <CardContent className="px-4 py-1">
                            <div className="space-y-1">
                                <DetailRow
                                    label="Reason for Transfer"
                                    value={details?.reason ? formatReasonLabel(details.reason) : "N/A"}
                                />
                                {details?.reason === Reason.OTHER && details?.reasonDescription && (
                                    <DetailRow
                                        label="Reason Description"
                                        value={details.reasonDescription}
                                    />
                                )}
                                <DetailRow
                                    label="Invoice Number"
                                    value={details?.paymentInvoiceNumber || "N/A"}
                                />
                                <DetailRow
                                    label="Invoice Date"
                                    value={
                                        details?.paymentInvoiceDate
                                            ? new Date(details.paymentInvoiceDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }).replace(/ /g, ', ')
                                            : "N/A"
                                    }
                                />

                                {details.paymentInvoice && (
                                    <DetailRow
                                        label="Attachment"
                                        value={
                                            <div className="flex items-center justify-between gap-2 w-full border border-dashed rounded-lg border-gray-200 px-4 py-3">
                                                <span className="text-blue-600 truncate">
                                                    {decodeURIComponent(details.paymentInvoice).split('/').pop()}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openPreview(details.paymentInvoice, details.paymentInvoice)}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        }
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creation Info */}
                    <Card className="border-0 bg-transparent shadow-none">
                        <CardContent className="px-4 py-1">
                            <DetailRow
                                label="Created"
                                value={
                                    <div className="flex items-center gap-2">
                                        <UserCircle className="h-4 w-4 text-gray-500" />
                                        <span>{sd.user.fullName || "N/A"}</span>
                                    </div>
                                }
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="bg-white border-t p-6 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => onEdit && onEdit()}
                            className="sm:w-auto w-full"
                        >
                            Edit Payment
                        </Button>
                        <Button
                            onClick={onClose}
                            className="bg-blue-600 hover:bg-blue-700 text-white sm:w-auto w-full"
                        >
                            Submit Payment
                        </Button>
                    </div>
                </div>
            </DialogContent>

            <DocumentViewerModal
                open={previewOpen}
                onOpenChange={() => setPreviewOpen(false)}
                documentUrl={previewUrl ?? ""}
                documentTitle={previewName ?? "Document"}
            />
        </Dialog>
    )
}
