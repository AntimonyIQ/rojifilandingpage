import React, { useState, useEffect } from 'react';
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { Check, Plus, X, Eye, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/v1/components/ui/dialog";
import { useParams } from 'wouter';

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
                return /^[A-Za-z\s]+$/.test(value) && value.length > 2;
            case 'paymentInvoiceNumber':
                return /^[A-Za-z0-9_-]+$/.test(value) && value.length > 0;
            case 'beneficiaryIban':
            case 'iban':
                console.log("IBAN input changed:", value);
                return /^[A-Za-z0-9]+$/.test(value) && value.length >= 15 && value.length <= 34;
            case 'purposeOfPayment':
                return /^[A-Za-z0-9\s,.\-]+$/.test(value) && value.length > 5;
            case 'sortCode':
            case 'beneficiarySortCode':
                return /^[0-9]{6}$/.test(value);
            case 'accountNumber':
            case 'beneficiaryAccountNumber':
                return /^[0-9]{8}$/.test(value);
            default:
                return value.length > 0;
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

    const isValid = isFieldValid(fieldKey, value);

    return (
        <div key={fieldKey} className="w-full">
            <Label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
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
                    className={`${Image ? "pl-10" : ""} h-12 ${focused && !isValid ? "border-2 border-red-500" : ""}`}
                    value={value}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        onFieldChange(fieldKey, e.target.value);
                        if (onChange) { onChange(e); }
                    }}
                />
                {Image}
            </div>
            {focused && !isValid && (
                <span className="text-xs text-red-500">Invalid value</span>
            )}
        </div>
    );
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
    // Ensure value is never an empty string
    const safeValue = value || undefined;

    return (
        <div className="w-full" style={{ display: hidden ? 'none' : 'block' }}>
            <Label htmlFor={fieldKey} className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
                <Select
                    value={safeValue}
                    onValueChange={(val: string) => onFieldChange(fieldKey, val)}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option, index) => (
                            <SelectItem key={index} value={option.value || `option-${index}`}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
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
    }>({
        isOpen: false,
        file: null,
        label: "",
    });
    // Use internal file primarily (set immediately on select/drop), fallback to uploadedFile prop
    const displayFile = internalFile || uploadedFile || null;

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
        // Clear local state and native input so user can re-select same file
        setInternalFile(null);
        clearFileInput();
        if (onFileRemove) {
            onFileRemove();
        }
    };

    // File Viewer Modal Component
    const FileViewerModal = ({
        file,
        isOpen,
        onClose,
        onDelete,
        label,
    }: {
        file: File | null;
        isOpen: boolean;
        onClose: () => void;
        onDelete: () => void;
        label: string;
    }) => {
        const [fileUrl, setFileUrl] = useState<string | null>(null);

        useEffect(() => {
            if (file && isOpen) {
                const url = URL.createObjectURL(file);
                setFileUrl(url);

                // Cleanup function to revoke the object URL
                return () => {
                    URL.revokeObjectURL(url);
                    setFileUrl(null);
                };
            }
        }, [file, isOpen]);

        const handleDelete = () => {
            onDelete();
            onClose();
        };

        const renderFileContent = () => {
            if (!file || !fileUrl) {
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No file to display</p>
                    </div>
                );
            }

            const fileType = file.type.toLowerCase();
            const fileName = file.name;

            // Handle images
            if (fileType.startsWith("image/")) {
                return (
                    <img
                        src={fileUrl}
                        alt={fileName}
                        className="max-w-full max-h-full object-contain mx-auto"
                    />
                );
            }

            // Handle PDFs using browser's built-in PDF viewer
            if (fileType === "application/pdf") {
                return (
                    <iframe
                        src={fileUrl}
                        className="w-full h-full border-0"
                        title={fileName ?? "pdf-preview"}
                    />
                );
            }

            // Handle other documents - show download option
            if (
                fileType.includes("document") ||
                fileType.includes("spreadsheet") ||
                fileType.includes("presentation")
            ) {
                return (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="text-6xl text-blue-500">📄</div>
                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-700">{fileName}</p>
                            <p className="text-sm text-gray-500">Document preview</p>
                            <p className="text-xs text-gray-400 mt-2">
                                File size: {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <a
                                href={fileUrl}
                                download={fileName}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Download Document
                            </a>
                        </div>
                    </div>
                );
            }

            // Fallback for other file types
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="text-6xl text-gray-300">📄</div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-700">{fileName}</p>
                        <p className="text-sm text-gray-500">Preview not available for this file type</p>
                        <p className="text-xs text-gray-400 mt-2">
                            File size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                </div>
            );
        };

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[80vw] w-[80vw] h-[80vh] p-0 flex flex-col">
                    <DialogHeader className="p-6 pb-2 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-lg font-semibold">{label}</DialogTitle>
                                <DialogDescription className="text-sm text-gray-600">
                                    {file?.name} ({((file?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                                </DialogDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                                <Button variant="outline" size="sm" onClick={onClose}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 p-6 pt-2 overflow-hidden min-h-0">
                        <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden">
                            {renderFileContent()}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
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
                    Max file size: 10 MB
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
                ) : displayFile ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {uploadedUrl ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <Check className="h-4 w-4" />
                                    <p className="text-sm font-medium">Uploaded</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 text-gray-400"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11" />
                                            <polyline points="17 8 12 3 7 8" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">Selected</p>
                                </>
                                )}
                            </div>

                            <p className="text-sm text-gray-700 truncate">{displayFile.name}</p>

                            <button
                                type="button"
                                onClick={() => {
                                    setFileViewerState({
                                        isOpen: true,
                                        file: displayFile,
                                        label: label,
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

            {/* File Viewer Modal */}
            <FileViewerModal
                file={fileViewerState.file}
                isOpen={fileViewerState.isOpen}
                onClose={() => setFileViewerState((prev) => ({ ...prev, isOpen: false }))}
                onDelete={handleFileRemove}
                label={fileViewerState.label}
            />
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
    lastUpdated,
    walletBalance,
    insufficient,
}) => {
    const { wallet } = useParams();
    const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds

    useEffect(() => {
        // Calculate time left based on lastUpdated (5 minutes expiration)
        const updateTimeLeft = () => {
            const now = new Date().getTime();
            const updatedTime = lastUpdated.getTime();
            const elapsedSeconds = Math.floor((now - updatedTime) / 1000);
            const remainingSeconds = Math.max(0, 300 - elapsedSeconds); // 300 seconds = 5 minutes
            setTimeLeft(remainingSeconds);
        };

        // Update immediately
        updateTimeLeft();

        // Update every second
        const interval = setInterval(updateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [lastUpdated]);

    const formatTimeLeft = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getTimerColor = (): string => {
        if (timeLeft > 120) return "text-emerald-400"; // > 2 minutes: green
        if (timeLeft > 60) return "text-amber-400"; // > 1 minute: yellow
        return "text-red-400"; // < 1 minute: red
    };

    const getProgressPercentage = (): number => {
        return (timeLeft / 300) * 100;
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white">Exchange Rate</h4>
                        <p className="text-sm text-slate-400">Live market data</p>
                    </div>
                </div>

                {/* Timer with circular progress */}
                <div className="relative">
                    <div className="w-16 h-16 relative">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-slate-700"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className={getTimerColor()}
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 28}`,
                                    strokeDashoffset: `${2 * Math.PI * 28 * (1 - getProgressPercentage() / 100)}`,
                                    transition: 'stroke-dashoffset 1s ease-in-out'
                                }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xs font-bold ${getTimerColor()}`}>
                                {timeLeft > 0 ? formatTimeLeft(timeLeft) : "0:00"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content grid */}
            <div className="space-y-4">
                {/* Wallet Balance */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                    <div className="relative bg-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 hover:border-slate-500/50 transition-all duration-300">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-300">Your {fromCurrency} Balance</p>
                                    <p className="text-xs text-slate-500">Available to send</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-white">
                                    {walletBalance.toLocaleString("en-US", { style: "currency", currency: fromCurrency })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exchange Rate */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                    <div className="relative bg-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 hover:border-slate-500/50 transition-all duration-300">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-300">Exchange Rate</p>
                                    <p className="text-xs text-slate-500">Real-time conversion</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-white">
                                    1 {fromCurrency} = {loading ? (
                                        <div className="inline-block">
                                            <div className="w-20 h-6 bg-slate-700 rounded animate-pulse"></div>
                                        </div>
                                    ) : (
                                        <span className="text-emerald-400">{rate.toFixed(4)}</span>
                                    )} {toCurrency}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction Preview */}
                {(fromAmount || toAmount) && (
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                        <div className="relative bg-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 hover:border-slate-500/50 transition-all duration-300 space-y-4">
                            {fromAmount && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">You'll send</span>
                                    </div>
                                    <span className="text-lg font-bold text-orange-400">
                                        ${Number(fromAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            {/* Conversion arrow */}
                            {fromAmount && toAmount && (
                                <div className="flex justify-center">
                                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {toAmount && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">Beneficiary Receive</span>
                                    </div>
                                    <span className="text-lg font-bold text-emerald-400">
                                        {toCurrency === "GBP"
                                            ? `£${toAmount}`
                                            : toCurrency === "EUR"
                                                ? `€${toAmount}`
                                                : `$${toAmount}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Insufficient Balance Warning */}
                {insufficient && (
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-xl blur-sm"></div>
                        <div className="relative bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center animate-pulse">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-red-300">Insufficient Balance</p>
                                        <p className="text-xs text-red-400">Top up your {fromCurrency} wallet to continue</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={(): void => { window.location.href = `/dashboard/${wallet}/deposit` }}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Top Up
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rate Expiry Warning */}
                {timeLeft <= 60 && timeLeft > 0 && (
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl blur-sm animate-pulse"></div>
                        <div className="relative bg-amber-900/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center animate-bounce">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-amber-300">
                                        ⚡ Rate expires in {formatTimeLeft(timeLeft)}!
                                    </p>
                                    <p className="text-xs text-amber-400">Complete your transaction quickly</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rate expired */}
                {timeLeft === 0 && (
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-red-600/30 rounded-xl blur-sm"></div>
                        <div className="relative bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-red-300">Rate Expired</p>
                                    <p className="text-xs text-red-400">Please refresh to get a new rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};