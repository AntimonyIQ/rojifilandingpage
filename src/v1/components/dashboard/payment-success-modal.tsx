import { Dialog, DialogContent } from "@/v1/components/ui/dialog"
import { Button } from "@/v1/components/ui/button"
import { Card, CardContent } from "@/v1/components/ui/card"
import { Check, ExternalLink } from "lucide-react"
import { useParams } from "wouter"

export interface PaymentSuccessModalProps {
    open: boolean
    onClose: () => void
    transactionData: {
        amount: string
        currency: string
        currencySymbol?: string
        beneficiaryName: string
        beneficiaryAccount: string // Account number or IBAN
        bankName: string
        bankCountry: string
        swiftCode?: string
        isSwiftTransaction?: boolean
    }
}

export function PaymentSuccessModal({ open, onClose, transactionData }: PaymentSuccessModalProps) {
    const { wallet } = useParams();

    const handleViewTransaction = () => {
        // Navigate to transactions page
        window.location.href = `/dashboard/${wallet}/transactions?status=processing`;
        onClose()
    }

    const formatAmount = (amount: string) => {
        // Remove commas and format with commas
        const cleanAmount = amount.replace(/,/g, '')
        const numAmount = parseFloat(cleanAmount)
        return numAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl mx-auto p-0 gap-0">
                {/* Header with check mark */}
                <div className="flex flex-col items-center pt-8 pb-6 px-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Created</h2>
                    <p className="text-sm text-gray-600 text-center">
                        Your Payment request has been successfully created & is now processing.
                    </p>
                </div>

                {/* Transaction Details Card */}
                <div className="px-6 pb-6">
                    <Card className="border border-gray-200 rounded-lg">
                        <CardContent className="p-4 space-y-4">
                            {/* Amount */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Amount:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {transactionData.currencySymbol || transactionData.currency}{formatAmount(transactionData.amount)}
                                </span>
                            </div>

                            {/* Beneficiary Account Details */}
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-700">Beneficiary Account Details:</span>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {transactionData.beneficiaryName}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        ({transactionData.beneficiaryAccount})
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-700">Bank Details:</span>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {transactionData.bankName}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {transactionData.bankCountry}
                                        {transactionData.isSwiftTransaction && transactionData.swiftCode &&
                                            ` (${transactionData.swiftCode})`
                                        }
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 p-6 pt-0">
                    <Button
                        variant="default"
                        onClick={handleViewTransaction}
                        className="flex-1 flex items-center justify-center gap-2 text-white"
                    >
                        View Transaction
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                    {/*
                    <Button
                        onClick={onClose}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Close
                    </Button>
                    */}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PaymentSuccessModal