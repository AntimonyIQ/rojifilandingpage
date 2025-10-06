import { Dialog, DialogContent } from "@/v1/components/ui/dialog"
import { Button } from "@/v1/components/ui/button"
import { Card, CardContent } from "@/v1/components/ui/card"
import { ExternalLink, X, Loader, XCircle, Check } from "lucide-react"
import { useParams } from "wouter"

export interface PaymentSuccessModalProps {
    open: boolean
    onClose?: () => void
    onEdit: () => void
    state: 'loading' | 'error' | 'success'
    errorMessage?: string
    transactionData?: {
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

export function PaymentSuccessModal({ open, onEdit, state, errorMessage, transactionData }: PaymentSuccessModalProps) {
    const { wallet } = useParams();

    const formatAmount = (amount: string) => {
        // Remove commas and format with commas
        const cleanAmount = amount.replace(/,/g, '')
        const numAmount = parseFloat(cleanAmount)
        return numAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    const renderLoadingState = () => (
        <>
            <div className="flex flex-col items-center py-12 px-8">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6">
                    <Loader className="w-10 h-10 text-white animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Processing Payment</h2>
                <p className="text-base text-gray-600 text-center max-w-md leading-relaxed">
                    Please wait while we securely process your payment request. This may take a few moments.
                </p>
                <div className="mt-6 flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </>
    )

    const renderErrorState = () => (
        <>
            <div className="flex flex-col items-center py-12 px-8">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md">
                    <p className="text-sm text-red-700 text-center leading-relaxed">
                        {errorMessage || 'An unexpected error occurred while processing your payment. Please try again.'}
                    </p>
                </div>
            </div>
            <div className="px-8 pb-8">
                <Button
                    onClick={onEdit}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                    <X className="w-4 h-4 mr-2" />
                    Edit Payment Details
                </Button>
            </div>
        </>
    )

    const renderSuccessState = () => (
        <>
            <div className="flex flex-col items-center pt-8 pb-6 px-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Created</h2>
                <p className="text-sm text-gray-600 text-center">
                    Your Payment request has been successfully created & it is now processing.
                </p>
            </div>

            {transactionData && (
                <div className="px-8 pb-6">
                    <Card className="border border-gray-200 rounded-xl bg-white">
                        <CardContent className="p-6 space-y-5">
                            <div className="text-center border-b border-gray-100 pb-4">
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    {transactionData.currencySymbol || transactionData.currency}{formatAmount(transactionData.amount)}
                                </div>
                                <div className="text-sm text-gray-500 uppercase tracking-wide">
                                    Payment Amount
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-start py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700">Beneficiary</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {transactionData.beneficiaryName}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            {transactionData.beneficiaryAccount}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-start py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700">Bank</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {transactionData.bankName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {transactionData.bankCountry}
                                            {transactionData.isSwiftTransaction && transactionData.swiftCode &&
                                                <span className="ml-1 font-mono">({transactionData.swiftCode})</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="px-8 pb-8">
                <a
                    href={`/dashboard/${wallet}/transactions?status=processing`}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                    target="_self"
                    rel="noopener noreferrer"
                >
                    <ExternalLink className="w-5 h-5" />
                    View Transaction Details
                </a>
            </div>
        </>
    )

    return (
        <Dialog open={open} onOpenChange={(_isOpen) => { }}>
            <DialogContent className="max-w-2xl mx-auto p-0 gap-0 border-0 rounded-2xl overflow-hidden bg-white">
                {state === 'loading' && renderLoadingState()}
                {state === 'error' && renderErrorState()}
                {state === 'success' && renderSuccessState()}
            </DialogContent>
        </Dialog>
    )
}

export default PaymentSuccessModal