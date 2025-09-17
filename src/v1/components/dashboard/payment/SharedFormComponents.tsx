import React, { useState } from 'react';
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { Check, Loader2, Plus, X } from "lucide-react";

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
                return /^[A-Za-z0-9]+$/.test(value) && value.length > 15;
            case 'purposeOfPayment':
                return /^[A-Za-z0-9\s,.\-]+$/.test(value) && value.length > 5;
            case 'sortCode':
                return /^[0-9]{6}$/.test(value);
            case 'accountNumber':
                return /^[0-9]{8}$/.test(value);
            default:
                return value.length > 0;
        }
    };

    const isValidAmount = (value: string): boolean => {
        if (!value || value.trim() === '') return false;
        const numericValue = getNumericValue(value.trim());
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
}) => {
    // Ensure value is never an empty string
    const safeValue = value || undefined;

    return (
        <div className="w-full">
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
    value?: string;
    uploading: boolean;
    uploadError: string;
    onFileUpload: (file: File) => void | Promise<void>;
    onFileRemove?: () => void;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
    fieldKey,
    label,
    description,
    value,
    uploading,
    uploadError,
    onFileUpload,
    onFileRemove,
}) => {
    const [dragActive, setDragActive] = useState(false);

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
            onFileUpload(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <div className="w-full">
            <Label className="block text-lg font-bold text-gray-700 mb-2">
                {label} <span className="text-red-500">*</span>
            </Label>
            {description && (
                <p className="text-sm text-slate-500 mb-4">
                    {description}
                </p>
            )}

            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${dragActive
                    ? "border-primary bg-primary/5"
                    : value
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                tabIndex={0}
            >
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                        <p className="text-blue-600 font-medium">Uploading...</p>
                        <p className="text-sm text-gray-500 mt-1">Please wait while we upload your file</p>
                    </div>
                ) : value ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-green-700 font-medium mb-1">File uploaded successfully!</p>
                        <p className="text-sm text-gray-600 mb-3">File has been uploaded and is ready to use</p>
                        <div className="flex gap-2">
                            {onFileRemove && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onFileRemove}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-2">
                            Drag & drop or click to choose files
                        </p>
                        <p className="text-sm text-gray-500 mb-2">JPEG, PNG, and PDF formats</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            Max file size: 2 MB
                        </div>
                    </div>
                )}

                <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    id={`file-upload-${fieldKey}`}
                />
                {!value && !uploading && (
                    <label
                        htmlFor={`file-upload-${fieldKey}`}
                        className="absolute inset-0 cursor-pointer"
                    />
                )}
            </div>

            {uploadError && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{uploadError}</p>
                </div>
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
    lastUpdated,
    walletBalance,
    insufficient,
}) => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-blue-800">Exchange Rate</h4>
                <span className="text-xs text-blue-600">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Your {fromCurrency} Balance:</span>
                    <span className="font-medium">{walletBalance.toLocaleString("en-US", { style: "currency", currency: fromCurrency })}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Exchange Rate:</span>
                    <span className="font-medium">
                        1 {fromCurrency} = {loading ? "..." : rate.toFixed(4)} {toCurrency}
                    </span>
                </div>

                {fromAmount && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">You'll send:</span>
                        <span className="font-medium">{fromAmount} {fromCurrency}</span>
                    </div>
                )}

                {toAmount && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Recipient gets:</span>
                        <span className="font-medium text-green-600">{toAmount} {toCurrency}</span>
                    </div>
                )}

                {insufficient && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                        <p className="text-sm text-red-700">
                            Insufficient balance. Please top up your {fromCurrency} wallet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};