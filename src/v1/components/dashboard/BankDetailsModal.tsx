import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Check,
    Building2,
    Loader2,
    CreditCard,
    AlertCircle
} from "lucide-react";
import countries from "../../data/country_state.json";
import { ISwiftDetailsResponse, IIBanDetailsResponse, IPayment, ISortCodeDetailsResponse } from "@/v1/interface/interface";
// import { useParams } from "wouter";

interface IBankDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancel?: () => void; // Called when user clicks Cancel button (changing their mind)
    formdata: IPayment;
    onChange: (field: string, value: string) => void;
    onCodeEntered: (code: string) => void;
    loading: boolean;
    type: 'swift' | 'iban' | 'sortcode';
    swiftDetails?: ISwiftDetailsResponse | null;
    ibanDetails?: IIBanDetailsResponse | null;
    sortCodeDetails?: ISortCodeDetailsResponse | null;
}

const BankDetailsModal: React.FC<IBankDetailsModalProps> = ({
    open,
    onOpenChange,
    onCancel,
    formdata,
    onChange,
    onCodeEntered,
    loading,
    type,
    swiftDetails,
    ibanDetails,
    sortCodeDetails
}) => {
    // const { wallet } = useParams();
    const [localCode, setLocalCode] = useState("");
    const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);

    useEffect(() => {
        if (type === 'swift') {
            setLocalCode(formdata?.swiftCode || "");
        } else if (type === 'iban') {
            setLocalCode(formdata?.beneficiaryIban || "");
        } else if (type === 'sortcode') {
            setLocalCode(formdata?.beneficiarySortCode || "");
        }
    }, [formdata, type, open]);

    const handleCodeChange = (value: string) => {
        let sanitized = "";
        let fieldName = "";

        if (type === 'swift') {
            sanitized = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 11);
            fieldName = "swiftCode";
        } else if (type === 'iban') {
            sanitized = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 34);
            fieldName = "beneficiaryIban";
        } else {
            // Sort Code: 6 digits, usually displayed as XX-XX-XX
            sanitized = value.replace(/[^0-9]/g, "").slice(0, 6);
            fieldName = "beneficiarySortCode";
        }

        setLocalCode(sanitized);
        onChange(fieldName, sanitized);

        // Reset validation attempt when input changes
        setHasAttemptedValidation(false);

        if (sanitized === "" || (hasValidDetails && sanitized !== (type === 'swift' ? formdata?.swiftCode : type === 'iban' ? formdata?.beneficiaryIban : formdata?.beneficiarySortCode))) {
            onCodeEntered("");
        }
    };

    const handleContinue = () => {
        const minLength = type === 'swift' ? 8 : type === 'iban' ? 15 : 6;

        // Check if we have valid length input
        if (localCode.length < minLength) {
            return;
        }

        // First state: Validate the code if not already validated
        if (!hasValidDetails && !loading) {
            setHasAttemptedValidation(true);
            onCodeEntered(localCode);
            return;
        }

        // Second state: Proceed if validation is successful
        if (hasValidDetails) {
            onOpenChange(false);
        }
    };

    const getConfig = () => {
        if (type === 'swift') {
            return {
                title: "Enter SWIFT/BIC Code",
                description: "This helps us identify the destination bank and country",
                placeholder: "Enter a SWIFT", // "e.g., CHASUS33 or 021000021",
                hint: "", // "8 or 11 characters (letters and numbers only)",
                icon: <Building2 className="w-5 h-5" />,
                minLength: 8,
                maxLength: 11
            };
        } else if (type === 'iban') {
            return {
                title: "Enter IBAN Code",
                description: "International Bank Account Number for EUR payments",
                placeholder: "Enter IBAN code", // "e.g., DE89370400440532013000",
                hint: "15-34 characters (letters and numbers only)",
                icon: <CreditCard className="w-5 h-5" />,
                minLength: 15,
                maxLength: 34
            };
        } else {
            return {
                title: "Enter Sort Code",
                description: "Sort Code for GBP payments",
                placeholder: "Enter Sort Code", // "e.g., 123456",
                hint: "6 digits (numbers only)",
                icon: <Building2 className="w-5 h-5" />,
                minLength: 6,
                maxLength: 6
            };
        }
    };

    const config = getConfig();
    const hasValidDetails = type === 'swift'
        ? swiftDetails
        : type === 'iban'
            ? (ibanDetails?.valid)
            : sortCodeDetails; // "resultDescription": "Sortcode is valid",
    const isValidLength = localCode.length >= config.minLength;

    // Determine button text and state
    const getButtonState = () => {
        if (!isValidLength) {
            return { text: "Continue", disabled: true };
        }

        if (loading) {
            return { text: "Validating...", disabled: true };
        }

        if (!hasValidDetails) {
            return { text: "Validate", disabled: false };
        }

        return { text: "Continue", disabled: false };
    };

    const buttonState = getButtonState();

    const findCountry = (code: string): string => {
        const country = countries.find((c) => c.iso2 === code);
        return country ? country.name : code;
    }

    return (
        <Dialog open={open} onOpenChange={() => { }} modal>
            <DialogContent className="max-w-2xl bg-gray-900 border border-gray-700 shadow-2xl">
                <div className="flex flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                                <div className="text-blue-400">
                                    {config.icon}
                                </div>
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold text-white">
                                    {config.title}
                                </DialogTitle>
                                <p className="text-sm text-gray-400 mt-1">
                                    {config.description}
                                </p>
                            </div>
                        </div>
                        {/*
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/dashboard/${wallet}`}
                            className="h-8 w-8 p-0 hover:bg-gray-800 text-gray-400 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        */}
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code-input" className="text-sm font-medium text-gray-300">
                                {type === 'swift' ? '' : ''}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="code-input"
                                    type="text"
                                    placeholder={config.placeholder}
                                    value={localCode}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    className="h-12 text-center text-lg font-mono tracking-wider bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                                    maxLength={config.maxLength}
                                />
                                {loading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                {config.hint}
                            </p>
                        </div>

                        {/* SWIFT Details Display */}
                        {type === 'swift' && swiftDetails && (
                            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-medium text-green-300">
                                            Bank Details Found
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-400">Bank:</span>
                                                <p className="text-white">{swiftDetails.bank_name}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-400">Country:</span>
                                                <div className="text-white flex items-center gap-2">
                                                    <img src={`https://flagcdn.com/w320/${swiftDetails.country_code.toLowerCase()}.png`} alt="" width={18} height={18} className=" w-5 h-5 rounded-full" />
                                                    {swiftDetails.country} ({swiftDetails.country_code})
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-400">City:</span>
                                                <p className="text-white">{swiftDetails.city}</p>
                                            </div>
                                            {swiftDetails.region && (
                                                <div>
                                                    <span className="font-medium text-gray-400">Region:</span>
                                                    <p className="text-white">{swiftDetails.region}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* IBAN Details Display */}
                        {type === 'iban' && ibanDetails && (
                            <div className={`${ibanDetails.valid
                                ? 'bg-green-900/20 border-green-700/50'
                                : 'bg-red-900/20 border-red-700/50'
                                } border rounded-lg p-4`}>
                                <div className="flex items-start gap-3">
                                    {ibanDetails.valid ? (
                                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <h4 className={`font-medium ${ibanDetails.valid ? 'text-green-300' : 'text-red-300'}`}>
                                            {ibanDetails.valid ? 'IBAN Validated' : 'Invalid IBAN'}
                                        </h4>
                                        {ibanDetails.valid && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-400">Country:</span>
                                                    <div className="text-white flex items-center gap-2">
                                                        <img src={`https://flagcdn.com/w320/${ibanDetails.country.toLowerCase()}.png`} alt="" width={18} height={18} className=" w-5 h-5 rounded-full" />
                                                        {findCountry(ibanDetails.country)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-400">IBAN:</span>
                                                    <p className="text-white font-mono text-xs break-all">{ibanDetails.iban}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-400">Bank Name:</span>
                                                    <p className="text-white font-mono text-xs">{ibanDetails.bank_name}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-400">Account Number:</span>
                                                    <p className="text-white">{ibanDetails.account_number}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sort Code Details Display */}
                        {type === 'sortcode' && sortCodeDetails && (
                            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-medium text-green-300">
                                            Bank Details Found
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-400">Bank:</span>
                                                <p className="text-white">{sortCodeDetails.accountProperties?.institution}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-400">Branch:</span>
                                                <p className="text-white">{sortCodeDetails.accountProperties?.branch}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-400">City:</span>
                                                <p className="text-white">{sortCodeDetails.branchProperties?.city}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error state for invalid codes */}
                        {hasAttemptedValidation && isValidLength && !loading && !hasValidDetails && (
                            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-red-300">
                                        Unable to verify this {type === 'swift' ? 'SWIFT' : type === 'iban' ? 'IBAN' : 'Sort Code'}. Please double-check and try again.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                        <Button
                            variant="outline"
                            onClick={() => {
                                // User is canceling/changing their mind - trigger reset
                                if (onCancel) {
                                    onCancel();
                                } else {
                                    onOpenChange(false);
                                }
                            }}
                            className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleContinue}
                            disabled={buttonState.disabled}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:text-gray-500"
                        >
                            {buttonState.text}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BankDetailsModal;