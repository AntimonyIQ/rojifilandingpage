"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/v1/components/ui/sheet"
import { Download, MoreVertical, FileText, Repeat, Edit, UserCircle } from "lucide-react"
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/v1/components/ui/dropdown-menu";
import FilePreviewModal from "./file-preview-modal";
import PayAgainModal from "./pay-again-modal";
import { useState } from "react";
import { ITransaction } from "@/v1/interface/interface";
import { Link } from "wouter";

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

export function TransactionDetailsDrawer({ isOpen, onClose, transaction }: TransactionDetailsDrawerProps) {
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewName, setPreviewName] = useState<string | null>(null)

    const openPreview = (url?: string | null, name?: string | null) => {
        if (!url) return
        setPreviewUrl(url)
        setPreviewName(name ?? url?.split('/')?.pop() ?? 'attachment')
        setPreviewOpen(true)
    }

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

    const handleDownloadMT103 = () => {
        // TODO: implement actual MT103 download logic (API call / file fetch)
        console.log("Download MT103 for", transaction?._id)
        handleDownloadReceipt();
        onClose()
    }

    const handlePayAgain = () => {
        onClose();
        setPayAgainOpen(true);
    }

    const [payAgainOpen, setPayAgainOpen] = useState(false)

    const handlePayAgainSubmit = (payload: any) => {
        // implement submission logic here; for now, just log and close
        console.log('Submitting pay again payload', payload)
        setPayAgainOpen(false)
    }

    const handleRequestAmendment = () => {
        // TODO: implement request amendment flow (open modal / send request)
        console.log("Request amendment for", transaction?._id)
        onClose()
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "successful":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "processing":
                return "bg-blue-100 text-blue-800"
            case "failed":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const formatCurrency = (amount: string | number | undefined) => {
        const amountStr = String(amount ?? "0");
        const cleanedAmount = amountStr.replace(/,/g, '');
        const numAmount = Number.parseFloat(cleanedAmount);
        return `${numAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
                <div className="p-5 h-full flex flex-col">
                    {/* Header */}
                    <SheetHeader className="flex flex-row items-center justify-between mb-6">
                        <SheetTitle className="text-xl font-semibold text-gray-900">Payment Details</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-row items-center justify-between mb-4 border-y py-4">
                        <button onClick={handleDownloadReceipt} className="flex flex-col items-center justify-center w-full text-blue-500 border-r text-sm">
                            <Download size={24} className=" text-blue-500" />
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
                                <DropdownMenuItem className="py-3" onSelect={handleDownloadMT103}>
                                    <FileText className="mr-2" />
                                    Download MT103
                                </DropdownMenuItem>
                                <DropdownMenuItem className="py-3" onSelect={handlePayAgain}>
                                    <Repeat className="mr-2" />
                                    Pay again
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="py-3" onSelect={handleRequestAmendment}>
                                    <Edit className="mr-2" />
                                    Request Amendment
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <SheetDescription className="sr-only">
                        Details of the selected transaction, including amount, status,  and date.
                    </SheetDescription>

                    <div className="space-y-4 flex-1 overflow-y-auto">
                        <h4 className="text-lg font-medium text-gray-900">Summary</h4>

                        {/* Transaction Details */}
                        <div className="space-y-3 flex flex-col items-start gap-1 w-full">

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Transaction Status</span>
                                <span className={`text-gray-900 font-medium text-xs px-2 py-[2px] rounded-md capitalize ${getStatusColor(transaction?.status)} `}>{transaction?.status ?? "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Transaction Amount</span>
                                <span className="text-gray-900 font-medium text-sm">{formatCurrency(transaction?.amount) ?? "N/A"} {transaction.wallet}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Transaction Wallet</span>
                                <div className="flex flex-row items-center justify-start gap-2">
                                    <img src="https://img.icons8.com/color/50/usa-circular.png" alt="" className="w-5 h-5 rounded-full" />
                                    <span className="text-gray-900 font-medium text-sm">{transaction?.wallet ?? "N/A"}</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Sender:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.senderName ?? "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Beneficiary's Account Name:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.beneficiaryAccountName ?? "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Beneficiary's Account Number:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.beneficiaryAccountNumber ?? "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Beneficiary's Country:</span>
                                <div className="flex flex-row items-center justify-start gap-2">
                                    <img src={`https://flagcdn.com/w320/${transaction.beneficiaryCountryCode.toLowerCase()}.png`} alt="" className="w-5 h-5 rounded-full" />
                                    <span className="text-gray-900 font-medium text-sm">{transaction?.beneficiaryCountry ?? "N/A"}</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">SWIFT Code / Routing Number:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.swiftCode ?? "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Bank Name:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.beneficiaryBankName ?? "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Bank Address:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.beneficiaryBankAddress ?? "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Attachment:</span>
                                <div className="w-full flex flex-row items-center justify-between border-2 border-dashed border-blue-500 rounded-md px-4">
                                    <span className="text-gray-900 font-medium text-sm max-w-[140px] truncate" title={transaction?.paymentInvoice ?? "N/A"}>
                                        {transaction?.paymentInvoice ?? "N/A"}
                                    </span>
                                    <Button variant="link" onClick={() => openPreview(transaction?.paymentInvoice, transaction?.paymentInvoice)}>
                                        View
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Invoice Number:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.paymentInvoiceNumber ?? "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Invoice Date:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.paymentInvoiceDate ? new Date(transaction.paymentInvoiceDate).toLocaleDateString() : "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <div className="flex flex-row items-start justify-between w-full">
                                    <span className="text-gray-500 uppercase text-xs">Tracking Reference:</span>
                                    <Link href="" className="text-blue-500 capitalize text-xs underline">Track Payment:</Link>
                                </div>
                                <div className="border-l-[4px] px-3 border-gray-300 ml-2">
                                    <div className="flex flex-col justify-start items-start gap-1">
                                        <span className="text-gray-500 capitalize text-xs">UETR:</span>
                                        <span className="text-gray-900 font-medium text-sm">{transaction?.reference ?? transaction?.txId ?? "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Reference:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.reference}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Initiated Date:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : "N/A"}</span>
                            </div>

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Completed Date:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.updatedAt ? new Date(transaction.updatedAt).toLocaleDateString() : "N/A"}</span>
                            </div>

                            {/*
                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Processed Date:</span>
                                <span className="text-gray-900 font-medium text-sm">{transaction?.updatedAt ? new Date(transaction.updatedAt).toLocaleDateString() : "N/A"}</span>
                            </div>
                            */}

                            <div className="flex flex-col justify-start items-start gap-1 pb-3 border-b border-gray-100 w-full">
                                <span className="text-gray-500 uppercase text-xs">Created By:</span>
                                <div className="flex items-center gap-1">
                                    <UserCircle size={18} />
                                    <span className="text-gray-900 font-medium text-sm">
                                        {transaction?.userId && typeof transaction.userId === "object" && "fullName" in transaction.userId
                                            ? (transaction.userId as any).fullName
                                            : "N/A"}
                                    </span>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </SheetContent>
            <FilePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} fileUrl={previewUrl ?? undefined} fileName={previewName ?? undefined} />
            <PayAgainModal open={payAgainOpen} onClose={() => setPayAgainOpen(false)} transaction={transaction} onSubmit={handlePayAgainSubmit} />

        </Sheet>
    )
}
