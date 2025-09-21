
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { UserCircle, FileText, User, Building, CreditCard } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/v1/components/ui/sheet"
import { Card, CardContent } from "@/v1/components/ui/card"
import FilePreviewModal from "./file-preview-modal"
import { IIBanDetailsResponse, IPayment, ISwiftDetailsResponse, IUser } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session"

export interface TransactionFee {
    amount: string
    currency: string
}

export interface PaymentDetailsProps {
    open: boolean
    onClose: () => void
    onEdit?: () => void
    details: IPayment & {
        balance: number,
        ibanDetails: IIBanDetailsResponse | null,
        swiftDetails: ISwiftDetailsResponse | null,
    }
}

export default function PaymentDetailsDrawer({ open, onClose, onEdit, details }: PaymentDetailsProps) {
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewName, setPreviewName] = useState<string | null>(null)
    const [_user, setUser] = useState<IUser | null>(null)
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd && sd.user) {
            setUser(sd.user);
        }
    }, [sd]);

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

    const DetailRow = ({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) => (
        <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm text-gray-600 font-medium">{label}</span>
            </div>
            <div className="text-sm text-gray-900 font-semibold text-right max-w-[60%]">
                {value}
            </div>
        </div>
    )

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
            <SheetContent side="right" className="w-full sm:max-w-2xl p-0 bg-gray-50">
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-white border-b p-6">
                        <SheetHeader className="space-y-2">
                            <SheetTitle className="text-xl font-semibold text-gray-900">Payment Summary</SheetTitle>
                            <p className="text-sm text-gray-600">Review your payment details before submission</p>
                        </SheetHeader>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Transaction Amount Card */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Transaction Amount</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {formatCurrency(details.beneficiaryAmount)} {details.senderCurrency}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Wallet & Balance Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <CreditCard className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Wallet</div>
                                            <div className="font-semibold text-gray-900">{details.senderCurrency}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Building className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Balance</div>
                                            <div className="font-semibold text-gray-900">{formatCurrency(String(details.balance))}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sender Information */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Sender Information
                                </h3>
                                <DetailRow
                                    label="Sender Name"
                                    value={sd.sender.businessName || "N/A"}
                                />
                            </CardContent>
                        </Card>

                        {/* Beneficiary Information */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-green-600" />
                                    Beneficiary Information
                                </h3>
                                <div className="space-y-1">
                                    <DetailRow
                                        label="Account Name"
                                        value={details.beneficiaryAccountName || "N/A"}
                                    />
                                    <DetailRow
                                        label={details.beneficiaryIban ? "IBAN" : "Account Number"}
                                        value={details.beneficiaryIban || details.beneficiaryIban || details.beneficiaryAccountNumber}
                                    />
                                    <DetailRow
                                        label="Country"
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
                                        label="Address"
                                        value={details.beneficiaryAddress || "N/A"}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bank Information */}
                        {details.fundsDestinationCountry !== "UK" && (
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Building className="h-5 w-5 text-purple-600" />
                                        Bank Information
                                    </h3>
                                    <div className="space-y-1">
                                        <DetailRow
                                            label="Bank Name"
                                            value={details.beneficiaryBankName || "N/A"}
                                        />
                                        <DetailRow
                                            label="Bank Address"
                                            value={details.swiftDetails?.city || "N/A"}
                                        />
                                        <DetailRow
                                            label="SWIFT/Routing Code"
                                            value={details.swiftCode || "N/A"}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Details */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                    Payment Details
                                </h3>
                                <div className="space-y-1">
                                    <DetailRow
                                        label="Purpose of Payment"
                                        value={details?.purposeOfPayment || "N/A"}
                                    />
                                    <DetailRow
                                        label="Invoice Number"
                                        value={details?.paymentInvoiceNumber || "N/A"}
                                    />
                                    <DetailRow
                                        label="Invoice Date"
                                        value={String(details?.paymentInvoiceDate) || "N/A"}
                                    />
                                    {details.paymentInvoice && (
                                        <DetailRow
                                            label="Attachment"
                                            value={
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-600 truncate max-w-32">
                                                        {details.paymentInvoice.split('/').pop()}
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
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
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
                    <div className="bg-white border-t p-6">
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
                </div>
            </SheetContent>

            <FilePreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                fileUrl={previewUrl ?? undefined}
                fileName={previewName ?? undefined}
            />
        </Sheet>
    )
}
