import React, { useState } from 'react';
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
// import { Button } from "../../ui/button";
import { Check, Plus, X, Eye, ArrowRight, AlertCircle } from "lucide-react";

// import { useParams } from 'wouter';
import DocumentViewerModal from '../../modal/document-view';

interface RenderInputProps {
    fieldKey: string;
    label: string;
    value: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    readOnly?: boolean;
    type?: React.HTMLInputTypeAttribute;
    Image?: React.ReactNode;
    required?: boolean;
    onFieldChange: (field: string, value: string) => void;
}

export const RenderInput: React.FC<RenderInputProps> = ({
    fieldKey,
    label,
    value,
    placeholder,
    onChange,
    disabled = false,
    readOnly = false,
    type = "text",
    Image,
    required,
    onFieldChange,
}) => {
    const [focused, setFocused] = useState(false);
    const [touched, setTouched] = useState(false);

    const isFieldValid = (fieldKey: string, value: string): boolean => {
        // Handle null, undefined, or non-string values
        if (!value || typeof value !== 'string') {
            return false;
        }

        if (fieldKey === 'beneficiaryAmount') {
            return isValidAmount(value);
        }

        switch (fieldKey) {
            case 'beneficiaryAccountName':
            case 'recipientName':
                return /^[A-Za-z\s.,-]+$/.test(value) && value.trim().length > 1;
            case 'paymentInvoiceNumber':
                return /^[A-Za-z0-9_-]+$/.test(value) && value.length > 0;
            case 'beneficiaryIban':
            case 'iban':
                return /^[A-Za-z0-9]+$/.test(value) && value.length >= 15 && value.length <= 34;
            case 'purposeOfPayment':
            case 'reasonDescription':
                return value.trim().length > 0;
            case 'sortCode':
            case 'beneficiarySortCode':
                return /^[0-9-]{6,8}$/.test(value);
            case 'accountNumber':
            case 'beneficiaryAccountNumber':
                return /^[A-Za-z0-9]{2,}$/.test(value);
            case 'beneficiaryAbaRoutingNumber':
                return /^[0-9]{9}$/.test(value);
            case 'beneficiaryIFSC':
                return /^[A-Z]{4}[0-9]{7}$/.test(value);
            case 'beneficiaryAddress':
            case 'beneficiaryCity':
            case 'beneficiaryPostalCode':
                return value.trim().length > 0;
            default:
                return value.trim().length > 0;
        }
    };

    const isValidAmount = (value: string): boolean => {
        if (!value || typeof value !== 'string') return false;
        const trimmedValue = String(value).trim();
        if (trimmedValue === '') return false;
        const numericValue = getNumericValue(trimmedValue);
        if (!numericValue) return false;
        if (!/^\d+(\.\d{0,2})?$/.test(numericValue)) return false;
        const num = parseFloat(numericValue);
        return num > 0;
    };

    const getNumericValue = (formattedValue: string): string => {
        return formattedValue.replace(/,/g, '');
    };

    const isValid = !required || isFieldValid(fieldKey, value);
    const showError = touched && required && !isValid;

    return (
        <div key={fieldKey} className="w-full">
            <Label className="block text-sm font-semibold text-gray-800 mb-3">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
                <Input
                    id={fieldKey}
                    name={fieldKey}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    readOnly={readOnly}
                    className={`
                        ${Image ? "pl-12" : "pl-4"} 
                        h-14 
                        border-2 
                        rounded-lg 
                        transition-all 
                        duration-200 
                        text-base
                        font-medium
                        ${showError
                            ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200"
                            : focused
                                ? "border-blue-400 bg-blue-50 focus:border-blue-500 focus:ring-blue-200"
                                : "border-gray-300 bg-white hover:border-gray-400"
                        }
                        ${disabled || readOnly ? "bg-gray-100 cursor-not-allowed" : ""}
                    `}
                    value={value}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setFocused(false);
                        setTouched(true);
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        onFieldChange(fieldKey, e.target.value);
                        if (onChange) { onChange(e); }
                    }}
                />
                {Image && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        {Image}
                    </div>
                )}
            </div>
            {showError && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                    {getFieldErrorMessage(fieldKey, label)}
                </p>
            )}
        </div>
    );
};

const getFieldErrorMessage = (fieldKey: string, label: string): string => {
    switch (fieldKey) {
        case 'beneficiaryAmount':
            return 'Please enter a valid amount';
        case 'beneficiaryAccountName':
            return 'Please enter a valid name (letters, spaces, and basic punctuation only)';
        case 'paymentInvoiceNumber':
            return 'Please enter a valid invoice number (letters, numbers, underscore, dash only)';
        case 'beneficiaryIban':
        case 'iban':
            return 'Please enter a valid IBAN';
        case 'beneficiarySortCode':
            return 'Please enter a valid sort code (6 digits, may include dashes)';
        case 'beneficiaryAccountNumber':
            return 'Please enter a valid account number';
        case 'beneficiaryAbaRoutingNumber':
            return 'Please enter a valid ABA routing number (9 digits)';
        case 'beneficiaryIFSC':
            return 'Please enter a valid IFSC code (e.g., ABCD0123456)';
        default:
            return `Please enter a valid ${label.toLowerCase()}`;
    }
};

interface RenderSelectProps {
    fieldKey: string;
    label: string;
    value: string;
    placeholder: string;
    options: Array<{ value: string; label: string; }>;
    onFieldChange: (field: string, value: string) => void;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
}

export const RenderSelect: React.FC<RenderSelectProps> = ({
    fieldKey,
    label,
    value,
    placeholder,
    options,
    onFieldChange,
    required = false,
    disabled = false,
    hidden = false,
}) => {
    const [touched, setTouched] = useState(false);

    // Check if we have a valid value
    const hasValue = value && value.trim().length > 0;
    const showError = touched && required && !hasValue;

    return (
        <div className="w-full" style={{ display: hidden ? 'none' : 'block' }}>
            <Label htmlFor={fieldKey} className="block text-sm font-semibold text-gray-800 mb-3">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
                <Select
                    value={value || undefined}
                    onValueChange={(val: string) => {
                        onFieldChange(fieldKey, val);
                        setTouched(true);
                    }}
                    disabled={disabled}
                >
                    <SelectTrigger className={`
                        w-full 
                        h-14 
                        border-2 
                        rounded-lg 
                        transition-all 
                        duration-200 
                        text-base
                        font-medium
                        ${showError
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }
                        ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                    `}>
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                        {options.map((option, index) => (
                            <SelectItem
                                key={index}
                                value={option.value || `option-${index}`}
                                className="hover:bg-blue-50 cursor-pointer py-3 text-base font-medium"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {showError && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                    Please select a {label.toLowerCase()}
                </p>
            )}
        </div>
    );
};

interface FileUploadFieldProps {
    fieldKey: string;
    label: string;
    description?: string;
    uploading: boolean;
    uploadError: string;
    onFileUpload: (file: File) => void | Promise<void>;
    onFileRemove?: () => void;
    uploadedFile?: File | null;
    uploadedUrl?: string | null;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
    fieldKey,
    label,
    description,
    uploading,
    uploadError,
    onFileUpload,
    onFileRemove,
    uploadedFile = null,
    uploadedUrl = null,
}) => {
    const [dragActive, setDragActive] = useState(false);
    // Keep a local reference to the selected/dropped file so we can always show and preview it
    const [internalFile, setInternalFile] = useState<File | null>(null);
    const [fileViewerState, setFileViewerState] = useState<{
        isOpen: boolean;
        file: File | null;
        label: string;
        fileUrl: string | null;
    }>({
        isOpen: false,
        file: null,
        label: "",
        fileUrl: null,
    });
    // Use internal file primarily (set immediately on select/drop), fallback to uploadedFile prop
    const displayFile = internalFile || uploadedFile || null;

    // Derive filename from uploadedUrl (last path segment), decoded when possible
    const uploadedFilename = (() => {
        if (!uploadedUrl) return "";
        const path = uploadedUrl.split(/[?#]/)[0];
        const normalized = path.replace(/\\/g, "/");
        const parts = normalized.split("/").filter(Boolean);
        const last = parts.length ? parts[parts.length - 1] : normalized;
        const name = last.replace(/^uploads[\/\\]+/i, "").trim();
        return name || "";
    })();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Store immediately for UI and preview
            setInternalFile(file);
            onFileUpload(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Store immediately for UI and preview
            setInternalFile(file);
            onFileUpload(file);
        }
    };

    const clearFileInput = () => {
        try {
            const el = document.getElementById(`file-upload-${fieldKey}`) as HTMLInputElement | null;
            if (el) {
                el.value = "";
            }
        } catch (e) {
            console.warn("Could not clear file input:", e);
        }
    };

    const handleFileRemove = () => {
        console.log("Removing file for field:", fieldKey);
        // Clear local state and native input so user can re-select same file
        setInternalFile(null);
        clearFileInput();
        if (onFileRemove) {
            console.log("Removing file for field [1]:", fieldKey);
            onFileRemove();
        }
    };

    return (
        <div className="w-full">
            <Label className="block text-lg font-bold text-gray-700 mb-2">
                {label} <span className="text-red-500">*</span>
            </Label>
            {description && (
                <p className="text-lg text-slate-500 mb-4">
                    {description}
                </p>
            )}

            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${dragActive ? "border-primary bg-primary/5" : "border-gray-300"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                tabIndex={0}
            >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">Drag & drop or click to choose files</p>
                <p className="text-sm text-gray-500 mb-2">JPEG, PNG, and PDF formats</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                    Max file size: 20 MB
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    id={`file-upload-${fieldKey}`}
                />
                <label htmlFor={`file-upload-${fieldKey}`} className="absolute inset-0 cursor-pointer" />
            </div>

            {/* File status display */}
            <div className="mt-3">
                {uploading ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600">Uploading...</p>
                            <p className="text-xs text-gray-400">Preparing file</p>
                        </div>

                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-2 bg-primary rounded-full"
                                style={{
                                    width: "30%",
                                    transform: "translateX(-100%)",
                                    animation: "upload-slide 1.2s linear infinite",
                                }}
                            />
                        </div>

                        <style>{`
                            @keyframes upload-slide {
                                0% { transform: translateX(-120%); }
                                50% { transform: translateX(20%); }
                                100% { transform: translateX(120%); }
                            }
                        `}</style>
                    </div>
                ) : uploadedUrl ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {uploadedUrl ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <Check className="h-4 w-4" />
                                        <p className="text-sm font-medium">{uploadedFilename || 'Uploaded'}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                                                <Check className="h-5 w-5 text-gray-400" />
                                    </div>
                                            <p className="text-sm font-medium text-gray-600">File Selected</p>
                                </>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    // console.log("👁️ Viewing file:", uploadedUrl.slice(uploadedUrl.lastIndexOf('/') + 1));
                                    setFileViewerState({
                                        isOpen: true,
                                        file: displayFile,
                                        label: label,
                                        fileUrl: uploadedUrl,
                                    });
                                }}
                                className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                aria-label={`View ${uploadedUrl ? 'uploaded' : 'selected'} ${fieldKey}`}
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </button>

                            <button
                                type="button"
                                onClick={handleFileRemove}
                                className="ml-2 text-red-500 hover:text-red-600"
                                aria-label={`Remove ${fieldKey}`}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No file selected</p>
                )}

                {uploadError && (
                    <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                )}
            </div>

            {/* File Viewer Modal - Using DocumentViewerModal */}
            {fileViewerState.isOpen && fileViewerState.fileUrl && (
                <DocumentViewerModal
                    open={fileViewerState.isOpen}
                    onOpenChange={(open) => {
                        if (!open && fileViewerState.fileUrl) {
                            URL.revokeObjectURL(fileViewerState.fileUrl);
                        }
                        setFileViewerState((prev) => ({
                            ...prev,
                            isOpen: open,
                            fileUrl: open ? prev.fileUrl : null
                        }));
                    }}
                    documentUrl={fileViewerState.fileUrl}
                    documentTitle={fileViewerState.fileUrl.slice(fileViewerState.fileUrl.lastIndexOf('/') + 1)}
                    documentType="auto"
                />
            )}


        </div>
    );
};

interface ExchangeRateDisplayProps {
    fromCurrency: string;
    toCurrency: string;
    fromAmount: string;
    toAmount: string;
    rate: number;
    loading: boolean;
    lastUpdated: Date;
    walletBalance: number;
    insufficient: boolean;
}

export const ExchangeRateDisplay: React.FC<ExchangeRateDisplayProps> = ({
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    rate,
    loading,
    walletBalance,
    insufficient,
}) => {
    // const { wallet } = useParams();

    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
            {/* Header: Rate & Timer */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 font-medium">Exchange Rate</p>
                    <div className="flex items-center gap-2 mt-1">
                        <h3 className="text-lg font-bold text-gray-900">
                            1 {fromCurrency} = {loading ? "..." : (rate && rate > 0 ? rate.toFixed(4) : "N/A")} {toCurrency}
                        </h3>
                    </div>
                </div>
                {/*
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${timeLeft < 60 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                    }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeLeft > 0 ? formatTimeLeft(timeLeft) : "Expired"}</span>
                </div>
                */}
            </div>

            {/* Conversion Summary */}
            {(fromAmount || toAmount) && rate > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600">You send</span>
                        <span className="text-sm font-semibold text-gray-900">
                            {fromAmount && !isNaN(Number(fromAmount)) ? Number(fromAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"} {fromCurrency}
                        </span>
                    </div>

                    <div className="relative flex items-center justify-center my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative bg-gray-50 px-2">
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-gray-600">Recipient gets</span>
                        <span className="text-base font-bold text-green-600">
                            {toAmount ? (toCurrency === "GBP" ? "£" : toCurrency === "EUR" ? "€" : "$") : ""}{toAmount || "0.00"}
                        </span>
                    </div>
                </div>
            )}

            {/* Footer Info: Balance & Warnings */}
            <div className="space-y-3 pt-2">
                {/* Balance */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <span>Available Balance</span>
                    </div>
                    <span className="font-medium text-gray-700">
                        {walletBalance.toLocaleString("en-US", { style: "currency", currency: fromCurrency })}
                    </span>
                </div>

                {/* Insufficient Balance Warning */}
                {insufficient && (
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-medium text-red-700">Insufficient balance</span>
                        </div>
                        {/*
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800 bg-white"
                            onClick={() => window.location.href = `/dashboard/${wallet}/deposit`}
                        >
                            Top Up
                        </Button>
                        */}
                    </div>
                )}
            </div>
        </div>
    );
};