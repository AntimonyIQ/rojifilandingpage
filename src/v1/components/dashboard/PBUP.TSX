"use client";

import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import {
    Globe,
    Plus,
    X,
    CheckIcon,
    ChevronsUpDownIcon,
    Check,
    Building2,
    MapPin,
    Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Country, ICountry } from "country-state-city";
import PaymentDetailsDrawer from "./payment-details-view";
import Loading from "../loading";
import { cn } from "@/v1/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/v1/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/v1/components/ui/calendar"
import Defaults from "@/v1/defaults/defaults";
import { IPayment, IResponse, ISender, ITransaction, IWallet } from "@/v1/interface/interface";
import { Fiat, Status, TransactionStatus, TransactionType } from "@/v1/enums/enums";
import { session, SessionData } from "@/v1/session/session";
import { Link } from "wouter";
import { toast } from "sonner";

interface IIBan {
    id: string;
    account_number: string;
    national_bank_code: string;
    national_branch_code: string;
    swift: {
        id: string;
        address: string;
        postcode: string;
        branch_name: string;
        branch_code: string;
        country: {
            id: string;
            name: string;
        };
        city: {
            id: string;
            country_id: string;
            name: string;
        };
        bank: {
            id: string;
            country_id: string;
            code: string;
            name: string;
        };
    };
    country: {
        id: string;
        name: string;
    };
}

interface ISwiftDetails {
    bank_name: string;
    city: string;
    region: string;
    country: string;
    country_code: string;
    swift_code: string;
}

interface SwiftOrRoutingProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formdata: IPayment;
    onChange: (field: string, value: string) => void;
    onSwiftEntered: (swiftCode: string) => void;
    swiftDetails: ISwiftDetails | null;
    loading: boolean;
}

interface ILiveExchnageRate {
    from: string,
    to: string,
    rate: number,
    icon: string
}

const SwiftOrRouting: React.FC<SwiftOrRoutingProps> = ({
    open,
    onOpenChange,
    formdata,
    onChange,
    onSwiftEntered,
    swiftDetails,
    loading
}) => {
    const [localSwiftCode, setLocalSwiftCode] = useState(formdata?.swiftCode || "");

    const handleSwiftCodeChange = (value: string) => {
        const sanitized = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 11);
        setLocalSwiftCode(sanitized);
        onChange("swiftCode", sanitized);

        // Trigger SWIFT details fetch when valid length
        if (sanitized.length === 8 || sanitized.length === 11) {
            onSwiftEntered(sanitized);
        }
    };

    const handleContinue = () => {
        if (localSwiftCode.length >= 8) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl">
                <div className="flex flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold text-gray-900">
                                    Enter SWIFT Code / Routing Number
                                </DialogTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    This helps us identify the destination bank and country
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="swift-input" className="text-sm font-medium text-gray-700">
                                SWIFT Code / Routing Number
                            </Label>
                            <div className="relative">
                                <Input
                                    id="swift-input"
                                    type="text"
                                    placeholder="e.g., CHASUS33 or 021000021"
                                    value={localSwiftCode}
                                    onChange={(e) => handleSwiftCodeChange(e.target.value)}
                                    className="h-12 text-center text-lg font-mono tracking-wider"
                                    maxLength={11}
                                />
                                {loading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                8 or 11 characters (letters and numbers only)
                            </p>
                        </div>

                        {/* SWIFT Details Display */}
                        {swiftDetails && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-medium text-green-900">
                                            Bank Details Found
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Bank:</span>
                                                <p className="text-gray-900">{swiftDetails.bank_name}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Country:</span>
                                                <p className="text-gray-900">
                                                    {swiftDetails.country} ({swiftDetails.country_code})
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">City:</span>
                                                <p className="text-gray-900">{swiftDetails.city}</p>
                                            </div>
                                            {swiftDetails.region && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Region:</span>
                                                    <p className="text-gray-900">{swiftDetails.region}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error state for invalid SWIFT */}
                        {localSwiftCode.length >= 8 && !loading && !swiftDetails && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-amber-600" />
                                    <p className="text-sm text-amber-800">
                                        Unable to verify this SWIFT/Routing code. Please double-check and try again.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleContinue}
                            disabled={localSwiftCode.length < 8}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const PaymentView: React.FC = () => {
    // State management
    // const { wallet } = useParams();
    const [swiftmodal, setSwiftModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [focused, setFocused] = useState(false);
    const [formdata, setFormdata] = useState<IPayment | null>(null);
    const [_ibanLoading, setIbanLoading] = useState(false);
    const [_ibanDetails, setIbanDetails] = useState<IIBan | null>(null);
    const [paymentDetailsModal, setPaymentDetailsModal] = useState(false);
    const [popOpen, setPopOpen] = useState(false);
    const [wallets, setWallets] = useState<Array<IWallet>>([]);
    const [selectedWallet, setSelectedWallet] = useState<IWallet | null>(null);
    const [_sender, setSender] = useState<ISender | null>(null);
    const [fileUpload, setFileUpload] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [swiftDetails, setSwiftDetails] = useState<ISwiftDetails | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [walletActivationModal, setWalletActivationModal] = useState(false);
    const [liveRates, setLiveRates] = useState<Array<ILiveExchnageRate>>([]);
    const [loadingRates, setLoadingRates] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const sd: SessionData = session.getUserData();

    // European countries (ISO 3166-1 alpha-2) + Middle East 
    const ibanlist: Array<string> = [
        // Europe
        "AL", "AD", "AM", "AT", "AZ", "BY", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GE", "DE", "GR", "HU", "IS", "IE", "IT", "KZ", "XK", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO", "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "TR", "UA", "GB", "VA",
        // Middle East
        "AE", "BH", "EG", "IR", "IQ", "IL", "JO", "KW", "LB", "OM", "PS", "QA", "SA", "SY", "YE"
    ];

    const countries: Array<ICountry> = Country.getAllCountries();

    // Initialize component data
    useEffect(() => {
        if (sd) {
            setSender(sd.sender);
            setWallets(sd.wallets);
            const draftPayment: IPayment = {
                ...sd.draftPayment,
                sender: sd.sender ? sd.sender._id : '',
                senderWallet: sd.activeWallet,
                senderName: sd.sender ? sd.sender.businessName : '',
                status: TransactionStatus.PENDING,
                rojifiId: ""
            };

            session.updateSession({ ...sd, draftPayment: draftPayment });
        }
    }, [sd]);

    // Helper functions
    const filterCurrency = (countryCode: string): ICountry | null => {
        return countries.find(country => country.isoCode === countryCode) || null;
    };

    const formatNumberWithCommas = (value: string): string => {
        // Remove all non-digit characters except decimal point
        const cleanValue = value.replace(/[^\d.]/g, '');

        // Split by decimal point
        const parts = cleanValue.split('.');

        // Add commas to the integer part
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Return formatted number (limit to 2 decimal places if decimal exists)
        return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
    };

    // Remove commas from formatted number to get raw value
    const getNumericValue = (formattedValue: string): string => {
        return formattedValue.replace(/,/g, '');
    };

    const getSwiftDetails = async (swift: string): Promise<void> => {
        try {
            setLoading(true);
            setSwiftDetails(null);

            const res = await fetch(`https://api.api-ninjas.com/v1/swiftcode?swift=${swift}`, {
                method: 'GET',
                headers: {
                    Accept: '*/*',
                    'X-Api-Key': 'sb9Oble0p7t4CvSvTkd0zw==P7Jw6EB07C0T4Mhf'
                },
            });

            const data = await res.json();
            if (data && data.length > 0) {
                const swiftDetailsData: ISwiftDetails = data[0];
                const countryInfo = filterCurrency(swiftDetailsData.country_code);

                setSwiftDetails(swiftDetailsData);
                setFormdata(prev => ({
                    ...prev,
                    beneficiaryCountry: swiftDetailsData.country,
                    beneficiaryCountryCode: swiftDetailsData.country_code,
                    beneficiaryBankName: swiftDetailsData.bank_name,
                    beneficiaryCurrency: countryInfo ? countryInfo.currency : '',
                    paymentRail: "SWIFT",
                } as IPayment));
            }
        } catch (err: any) {
            console.error('Failed to fetch SWIFT details:', err);
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (file: File): Promise<void> => {
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setUploadError(`File exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
            return;
        }

        try {
            setUploadError("");
            setUploading(true);

            const form = new FormData();
            form.append('file', file);

            // clone headers and remove content-type so browser sets boundary
            const headers: Record<string, string> = { ...Defaults.HEADERS } as Record<string, string>;
            if (headers['Content-Type']) delete headers['Content-Type'];
            if (headers['content-type']) delete headers['content-type'];

            const res = await fetch(`${Defaults.API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'x-rojifi-handshake': sd.client?.publicKey || '',
                    'x-rojifi-deviceid': sd.deviceid || '',
                    Authorization: `Bearer ${sd.authorization}`,
                },
                body: form,
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error || 'Upload failed');
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process upload response right now, please try again.');
                const parseData: { url: string } = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);

                setFormdata(prev => ({
                    ...prev,
                    paymentInvoice: parseData.url
                } as IPayment));
                setFileUpload(file);
            }
        } catch (err: any) {
            setUploadError(err.message || 'File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (
        field: string,
        value: string | boolean | File
    ): void => {
        let sanitizedValue: string | boolean | File = value;

        if (typeof value === "string") {
            switch (field) {
                case "firstName":
                case "lastName":
                case "middleName":
                    sanitizedValue = value.replace(/[^a-zA-Z]/g, "");
                    break;
                case "email":
                    sanitizedValue = value.replace(/\s+/g, "").toLowerCase();
                    sanitizedValue = sanitizedValue.replace(/[^a-z0-9@._-]/g, "");
                    break;
                case "phoneNumber":
                case "volume":
                    sanitizedValue = value.replace(/[^0-9]/g, "");
                    break;
                case "beneficiaryAmount":
                    // Handle formatted number input
                    const rawValue = getNumericValue(value);
                    const numericValue = rawValue.replace(/[^0-9.]/g, "");
                    sanitizedValue = formatNumberWithCommas(numericValue);
                    break;
                case "swiftcode":
                    sanitizedValue = value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 11);
                    if (sanitizedValue.length === 8 || sanitizedValue.length === 11) {
                        fetchSwiftDetails(sanitizedValue);
                    }
                    break;
                case "iban":
                    sanitizedValue = value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 34);
                    if (sanitizedValue.length > 18) {
                        fetchIbanDetails(sanitizedValue);
                    }
                    break;
                default:
                    break;
            }
        }

        setFormdata(prev => ({
            ...(prev ?? {}),
            [field]: sanitizedValue,
            rojifiId: (prev?.rojifiId ?? ""),
            sender: (prev?.sender ?? ""),
            senderWallet: (prev?.senderWallet ?? ""),
            senderName: (prev?.senderName ?? ""),
            status: (prev?.status ?? "pending"),
        } as IPayment));
    };

    const fetchSwiftDetails = async (swiftCode: string): Promise<void> => {
        try {
            setLoading(true);
            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/swift/${swiftCode}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                console.log("Parsed SWIFT Details:", parseData);
            }
        } catch (error) {
            console.error("Failed to fetch SWIFT details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchIbanDetails = async (iban: string): Promise<void> => {
        try {
            setIbanLoading(true);
            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/iban/${iban}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                console.log("Parsed IBAN Details:", parseData);
                setIbanDetails(parseData);
            }
        } catch (error: any) {
            console.error("Failed to fetch IBAN details:", error);
        } finally {
            setIbanLoading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e: React.DragEvent, _field: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFileUpload(file);
            // Automatically upload the file
            uploadFile(file);
        }
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        _field: string
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileUpload(file);
            // Automatically upload the file
            uploadFile(file);
        }
    };

    const fetchProviderRates = async () => {
        try {
            setLoadingRates(true);
            console.log("Fetching rates...");
            const res = await fetch(`${Defaults.API_BASE_URL}/provider/rate/USD`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData: Array<ILiveExchnageRate> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                console.log(parseData);
                setLiveRates(parseData);
                setLastUpdated(new Date());
            }
        } catch (error: any) {
            console.error(error.message || "Error fetching rates");
        } finally {
            setLoadingRates(false);
        }
    }

    const renderUploadField = ({ fieldKey, label, }: { fieldKey: string; label: string; }) => {
        return (
            <div key={fieldKey} className="w-full">
                <Label className="block text-lg font-bold text-gray-700 mb-2">
                    {label} <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-slate-500">
                    (please attach invoice or any related document that shows the purpose of
                    this payment. Also note that data should match beneficiary details to
                    avoid delays)
                </p>

                {/* File Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${dragActive
                        ? "border-primary bg-primary/5"
                        : formdata?.paymentInvoice
                            ? "border-green-300 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, fieldKey)}
                    tabIndex={0}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                            <p className="text-blue-600 font-medium">Uploading...</p>
                            <p className="text-sm text-gray-500 mt-1">Please wait while we upload your file</p>
                        </div>
                    ) : formdata?.paymentInvoice ? (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-green-700 font-medium mb-1">File uploaded successfully!</p>
                            <p className="text-sm text-gray-600 mb-3">{fileUpload?.name || 'invoice'}</p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setFileUpload(null);
                                        setUploadError("");
                                        setFormdata(prev => ({
                                            ...prev,
                                            paymentInvoice: "",
                                        } as IPayment));
                                    }}
                                >
                                    Remove
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(formdata.paymentInvoice, '_blank')}
                                >
                                    View
                                </Button>
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
                                <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                Max file size: 2 MB
                            </div>
                        </div>
                    )}

                    <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileChange(e, fieldKey)}
                        id={`file-upload-${fieldKey}`}
                    />
                    {!formdata?.paymentInvoice && !uploading && (
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

    // Simplified validation method
    const isValidAmount = (value: string): boolean => {
        if (!value || value.trim() === '') return false;

        // Get numeric value (remove commas)
        const numericValue = getNumericValue(value.trim());
        if (!numericValue) return false;

        // Check if it's a valid number format
        if (!/^\d+(\.\d{0,2})?$/.test(numericValue)) return false;

        // Check if the number is greater than 0
        const num = parseFloat(numericValue);
        return num > 0;
    };

    const isFieldValid = (fieldKey: string, value: string): boolean => {
        if (fieldKey === 'beneficiaryAmount') {
            return isValidAmount(value);
        }

        // Simple validation for other common fields
        switch (fieldKey) {
            case 'beneficiaryAccountName':
                return /^[A-Za-z\s]+$/.test(value) && value.length > 2;
            case 'paymentInvoiceNumber':
                return /^[A-Za-z0-9_-]+$/.test(value) && value.length > 0;
            case 'beneficiaryIban':
                return /^[A-Za-z0-9]+$/.test(value) && value.length > 15;
            case 'purposeOfPayment':
                return /^[A-Za-z0-9\s,.\-]+$/.test(value) && value.length > 5;
            default:
                return value.length > 0; // Basic non-empty validation for other fields
        }
    }; const validateForm = (): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!formdata) {
            errors.push("Form data is missing");
            return { isValid: false, errors };
        }

        // Required fields for all payments
        const requiredFields = [
            { key: 'beneficiaryAccountName', label: 'Beneficiary Name' },
            { key: 'beneficiaryAmount', label: 'Beneficiary Amount' },
            { key: 'beneficiaryCountry', label: 'Beneficiary Country' },
            { key: 'beneficiaryBankName', label: 'Bank Name' },
            { key: 'purposeOfPayment', label: 'Purpose of Payment' },
            { key: 'paymentInvoiceNumber', label: 'Invoice Number' },
        ];

        // Check required fields
        for (const field of requiredFields) {
            const value = formdata[field.key as keyof IPayment];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                errors.push(`${field.label} is required`);
            }
        }

        // Validate amount format
        if (formdata.beneficiaryAmount) {
            if (!isValidAmount(formdata.beneficiaryAmount)) {
                errors.push("Beneficiary amount must be a valid number with up to 2 decimal places");
            }
        }

        // Validate invoice number format
        if (formdata.paymentInvoiceNumber && !isFieldValid('paymentInvoiceNumber', formdata.paymentInvoiceNumber)) {
            errors.push("Invoice number format is invalid");
        }

        // Country-specific validations
        if (ibanlist.includes(formdata.beneficiaryCountryCode || "")) {
            if (!formdata.beneficiaryIban || formdata.beneficiaryIban.trim() === '') {
                errors.push("IBAN is required for this country");
            } else if (!isFieldValid('beneficiaryIban', formdata.beneficiaryIban)) {
                errors.push("IBAN format is invalid");
            }
        } else {
            if (!formdata.beneficiaryAccountNumber || formdata.beneficiaryAccountNumber.trim() === '') {
                errors.push("Account number is required");
            }
        }

        // Specific country validations
        if (formdata.beneficiaryCountryCode === "IN" && (!formdata.beneficiaryIFSC || formdata.beneficiaryIFSC.trim() === '')) {
            errors.push("IFSC Code is required for India");
        }

        if (["US", "PR", "AS", "GU", "MP", "VI"].includes(formdata.beneficiaryCountryCode || "") &&
            (!formdata.beneficiaryAbaRoutingNumber || formdata.beneficiaryAbaRoutingNumber.trim() === '')) {
            errors.push("ABA/Routing number is required for US payments");
        }

        // Address validation for certain countries
        if (["CA", "US", "GB", "AU"].includes(formdata.beneficiaryCountryCode || "")) {
            if (!formdata.beneficiaryAddress || formdata.beneficiaryAddress.trim() === '') {
                errors.push("Beneficiary address is required");
            }
            if (!formdata.beneficiaryCity || formdata.beneficiaryCity.trim() === '') {
                errors.push("Beneficiary city is required");
            }
        }

        return { isValid: errors.length === 0, errors };
    };

    const handleShowPaymentDetails = (): void => {
        const validation = validateForm();

        if (!validation.isValid) {
            // Show validation errors in a better way
            setUploadError(`Please fix the following:\n• ${validation.errors.join('\n• ')}`);

            // Scroll to top to show errors
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setPaymentDetailsModal(true);
    };

    const RenderInput = (props: {
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
    }) => {
        const {
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
        } = props;

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
                        onChange={(e) => {
                            handleInputChange(fieldKey, e.target.value);
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

    const processPayment = async (): Promise<void> => {
        if (!formdata || !selectedWallet) return;

        try {
            setPaymentLoading(true);
            setPaymentDetailsModal(false);
            Defaults.LOGIN_STATUS();
            const paymentData: Partial<ITransaction> = {
                ...formdata,
                sender: sd.sender ? sd.sender._id : '',
                senderWallet: selectedWallet._id,
                senderName: sd.sender ? sd.sender.businessName : '',
                status: TransactionStatus.PENDING,
                type: TransactionType.TRANSFER,
                beneficiaryAmount: getNumericValue(formdata.beneficiaryAmount || "0"),
                fees: []
            };

            console.log("Submitting Payment Data:", paymentData);

            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
                body: JSON.stringify(paymentData),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success('Payment created successfully and is pending approval.');
                session.updateSession({ ...sd, draftPayment: { ...formdata } });
                window.location.href = `/dashboard/NGN/transactions`;
            }
        } catch (error: any) {
            console.error("Failed to create payment:", error);
            setUploadError(error.message || 'Failed to create payment');
        } finally {
            setPaymentLoading(false);
            setPaymentDetailsModal(false);
        }
    };

    return (
        <div className="space-y-6 sm:px-[150px] lg:px-[200px]">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Create New Payment
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Request a new payment for approval.
                    </p>
                </div>
            </div>

            {/* Validation Errors Display */}
            {uploadError && uploadError.includes('Please fix the following:') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <X className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-800 mb-2">
                                Form Validation Errors
                            </h4>
                            <div className="text-sm text-red-700 whitespace-pre-line">
                                {uploadError.replace('Please fix the following:\\n', '')}
                            </div>
                        </div>
                        <button
                            onClick={() => setUploadError('')}
                            className="flex-shrink-0 text-red-400 hover:text-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Currency Selection */}
            <div>
                <Label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Select Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formdata?.senderCurrency || ""}
                    onValueChange={(value): void => {
                        handleInputChange("senderCurrency", value);
                        const selectedWalletData: IWallet | undefined = wallets.find(wallet => wallet.currency === value);
                        if (selectedWalletData) {
                            setSelectedWallet(selectedWalletData);

                            // Check if wallet is not activated and currency is not USD
                            if (value !== Fiat.USD && selectedWalletData.activated === false) {
                                setWalletActivationModal(true);
                            }
                        }
                        if (value === Fiat.USD) {
                            setSwiftModal(true);
                        }

                        if (value !== Fiat.USD) {

                        }

                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Payment Currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {wallets
                            .filter(wallet => wallet.currency !== Fiat.NGN)
                            .map((wallet, index) => (
                                <SelectItem key={index} value={wallet.currency}>
                                    <div className="flex flex-row items-center gap-2">
                                        <img src={wallet.icon} alt={`${wallet.currency} icon`} className="w-5 h-5 rounded-full" />
                                        {wallet.currency}
                                    </div>
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            </div>

            {formdata?.senderCurrency === "USD" && (
                <RenderInput
                    fieldKey="swiftCode"
                    label="Swift/Routing Code"
                    value={formdata.swiftCode || ""}
                    disabled={true}
                    readOnly={true}
                    type="text"
                    required={true}
                />
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center w-full mt-80">
                    <Loading />
                </div>
            )}

            {formdata?.senderCurrency && formdata?.swiftCode && formdata?.swiftCode.length > 7 && !loading && (
                <div className="flex flex-col items-center gap-4 w-full pb-20">
                    <RenderInput
                        fieldKey="destinationCountry"
                        label="Beneficiary's Country"
                        value={formdata.beneficiaryCountry || ""}
                        disabled={true}
                        readOnly={true}
                        type="text"
                        required={true}
                        Image={formdata.beneficiaryCountryCode ? (
                            <img
                                src={`https://flagsapi.com/${formdata.beneficiaryCountryCode}/flat/64.png`}
                                className="rounded-full absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                            />
                        ) : (
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        )}
                    />

                    <RenderInput
                        fieldKey="beneficiaryBankName"
                        label="Bank Name"
                        placeholder="Bank Name"
                        value={formdata.beneficiaryBankName || ""}
                        disabled={true}
                        readOnly={true}
                        type="text"
                        required={true}
                    />

                    <div className="divide-gray-300 w-full h-[1px] bg-slate-300"></div>

                    <div className="w-full">
                        <Label
                            htmlFor="sender"
                            className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                        >
                            Create Payment For <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Select
                                value={String(formdata.sender)}
                                onValueChange={(value) =>
                                    handleInputChange("sender", value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={`${sd.sender?.businessName} (My Sender)`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Business A">
                                        {sd.sender?.businessName}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="w-full">
                        <Label
                            htmlFor="sender_name"
                            className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                        >
                            Sender Name <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Select
                                value={formdata.senderName}
                                onValueChange={(value) =>
                                    handleInputChange("senderName", value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="AntimonyIQ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AntimonyIQ">
                                        AntimonyIQ
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="divide-gray-300 w-full h-[1px] bg-slate-300"></div>

                    <RenderInput
                        fieldKey="currency"
                        label="Wallet (Balance)"
                        placeholder="Wallet Balance"
                        value={Number(selectedWallet?.balance || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        disabled={true}
                        readOnly={true}
                        type="text"
                        required={true}
                    />

                    <RenderInput
                        fieldKey="beneficiaryCountry"
                        label="Beneficiary Country"
                        placeholder="Enter Beneficiary Country"
                        value={formdata.beneficiaryCountry || ""}
                        disabled={true}
                        readOnly={true}
                        type="text"
                        required={true}
                        Image={<img
                            src={`https://flagsapi.com/${formdata.beneficiaryCountryCode}/flat/64.png`}
                            className="rounded-full absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                        />}
                    />

                    <RenderInput
                        fieldKey="beneficiaryAmount"
                        label="Amount"
                        value={formdata.beneficiaryAmount || ""}
                        disabled={loading}
                        readOnly={loading}
                        type="text"
                        required={true}
                        placeholder="Enter Amount To Send"
                    />

                    <div className="w-full">
                        <Label
                            htmlFor="account_type"
                            className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                        >
                            Recipient Account <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Select
                                value={formdata.beneficiaryAccountType}
                                onValueChange={(value) =>
                                    handleInputChange("beneficiaryAccountType", value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Business" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="personal">Personal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <RenderInput
                        fieldKey="beneficiaryAccountName"
                        label="Beneficiary Name"
                        placeholder="Enter Beneficiary Name"
                        value={formdata.beneficiaryAccountName || ""}
                        disabled={loading}
                        readOnly={loading}
                        type="text"
                        required={true}
                    />

                    {ibanlist.includes(formdata.beneficiaryCountryCode || "") ? (
                        <RenderInput
                            fieldKey="beneficiaryIban"
                            label="IBAN"
                            placeholder="Enter IBAN"
                            value={formdata.beneficiaryIban || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />
                    ) : (
                        <RenderInput
                            fieldKey="beneficiaryAccountNumber"
                            label="Beneficiary Account Number"
                            placeholder="Enter Beneficiary Account Number"
                            value={formdata.beneficiaryAccountNumber || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />
                    )}

                    {formdata.beneficiaryCountryCode === "IN" && (
                        <RenderInput
                            fieldKey="beneficiaryIFSC"
                            label="Beneficiary IFSC Code"
                            placeholder="Enter IFSC Code"
                            value={formdata.beneficiaryIFSC || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />
                    )}

                    {["US", "PR", "AS", "GU", "MP", "VI"].includes(formdata.beneficiaryCountryCode || "") && (
                        <RenderInput
                            fieldKey="beneficiaryAbaRoutingNumber"
                            label="Beneficiary ABA / Routing number"
                            placeholder="Enter ABA / Routing number"
                            value={formdata.beneficiaryAbaRoutingNumber || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />
                    )}

                    {formdata.beneficiaryCountryCode === "AU" && (
                        <RenderInput
                            fieldKey="beneficiaryBankStateBranch"
                            label="Beneficiary Bank-State-Branch (BSB) number"
                            placeholder="Enter Bank-State-Branch (BSB) number"
                            value={formdata.beneficiaryBankStateBranch || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />
                    )}

                    {formdata.beneficiaryCountryCode === "CA" && (
                        <RenderInput
                            fieldKey="beneficiaryInstitutionNumber"
                            label="Institution number (Bank code)"
                            placeholder="Enter Institution number (Bank code)"
                            value={formdata.beneficiaryInstitutionNumber || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />
                    )}

                    {formdata.beneficiaryCountryCode === "CA" && (
                        <RenderInput
                            fieldKey="beneficiaryTransitNumber"
                            label="Transit number (Branch code)"
                            placeholder="Enter Transit number (Branch code)"
                            value={formdata.beneficiaryTransitNumber || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />
                    )}

                    {formdata.beneficiaryCountryCode === "ZA" && (
                        <RenderInput
                            fieldKey="beneficiaryRoutingCode"
                            label="Beneficiary Routing code."
                            placeholder="Enter Routing number"
                            value={formdata.beneficiaryRoutingCode || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <RenderInput
                            fieldKey="beneficiaryAddress"
                            label="Beneficiary Address"
                            placeholder="Beneficiary Address"
                            value={formdata.beneficiaryAddress || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />

                        <RenderInput
                            fieldKey="beneficiaryCity"
                            label="Beneficiary City"
                            placeholder="Beneficiary City"
                            value={formdata.beneficiaryCity || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <RenderInput
                            fieldKey="beneficiaryPostalCode"
                            label="Beneficiary Post code"
                            placeholder="Beneficiary Post code"
                            value={formdata.beneficiaryPostalCode || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                        />

                        <div className="w-full">
                            <Label
                                htmlFor="beneficiary_country"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Beneficiary Country <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox" size="md"
                                            aria-expanded={popOpen}
                                            className="w-full justify-between"
                                        >
                                            {formdata.beneficiaryCountry
                                                ? countries.find((country) => country.name === formdata.beneficiaryCountry)?.name
                                                : "Select country..."}
                                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search country..." />
                                            <CommandList>
                                                <CommandEmpty>No country found.</CommandEmpty>
                                                <CommandGroup>
                                                    {countries.map((country) => (
                                                        <CommandItem
                                                            key={country.name}
                                                            value={country.name}
                                                            onSelect={(currentValue) => {
                                                                setFormdata(prev => ({
                                                                    ...prev,
                                                                    beneficiaryCountry: currentValue,
                                                                    beneficiaryCountryCode: country.isoCode
                                                                } as IPayment));
                                                                setPopOpen(false);
                                                            }}
                                                        >
                                                            <CheckIcon
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formdata.beneficiaryCountry === country.name ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <img src={`https://flagcdn.com/w320/${country.isoCode.toLowerCase()}.png`} alt="" width={18} height={18} />
                                                            {country.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <div className="divide-gray-300 w-full h-[1px] bg-slate-300"></div>

                    {renderUploadField({
                        fieldKey: "paymentInvoice",
                        label: "Attach Invoice"
                    })}

                    <div className="w-full">
                        <Label
                            htmlFor="beneficiary_city"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Invoice
                        </Label>
                        <p className="text-sm text-orange-700">
                            (Ensure to use an invoice number that matches the one in the
                            uploaded invoice. Using an incorrect/exhausted invoice number
                            may cause delays in processing your payment)
                        </p>
                    </div>

                    <RenderInput
                        fieldKey="paymentInvoiceNumber"
                        label="Invoice Number"
                        placeholder="Invoice Number"
                        value={formdata.paymentInvoiceNumber || ""}
                        disabled={loading}
                        readOnly={loading}
                        type="text"
                        required={true}
                    />

                    <div className="w-full">
                        <Label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700 mb-2">
                            Invoice Date <span className="text-red-500">*</span>
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    data-empty={!formdata.paymentInvoiceDate}
                                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon />
                                    {formdata.paymentInvoiceDate ? format(formdata.paymentInvoiceDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formdata.paymentInvoiceDate}
                                    onSelect={(date) => {
                                        setFormdata(prev => ({
                                            ...prev,
                                            paymentInvoiceDate: date || new Date(),
                                        } as IPayment));
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <RenderInput
                        fieldKey="purposeOfPayment"
                        label="Purpose of Payment"
                        placeholder="State Purpose of Payment"
                        value={formdata.purposeOfPayment || ""}
                        disabled={loading}
                        readOnly={loading}
                        type="text"
                        required={true}
                    />

                    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
                        <Link
                            href="/dashboard/NGN"
                            className="text-primary hover:underline border-[2px] border-primary rounded-md px-4 py-2 inline-block text-center w-full sm:w-auto min-w-[120px]"
                        >
                            Cancel
                        </Link>
                        <Button
                            className="text-white w-full sm:w-auto min-w-[160px]"
                            variant="default"
                            size="lg"
                            disabled={paymentLoading}
                            onClick={handleShowPaymentDetails}
                        >
                            {paymentLoading ? "Sending..." : "Create Payment"}
                        </Button>
                    </div>
                </div>
            )}

            <SwiftOrRouting
                open={swiftmodal}
                onOpenChange={setSwiftModal}
                formdata={formdata as IPayment}
                onChange={(field, value): void =>
                    handleInputChange(field, value)
                }
                onSwiftEntered={(swiftCode: string): void => {
                    getSwiftDetails(swiftCode);
                }}
                swiftDetails={swiftDetails}
                loading={loading}
            />

            {paymentDetailsModal && (
                <PaymentDetailsDrawer
                    open={paymentDetailsModal}
                    onClose={processPayment}
                    onEdit={() => setPaymentDetailsModal(false)}
                    details={{
                        ...formdata as IPayment,
                        balance: selectedWallet ? selectedWallet.balance : 0
                    }}
                />
            )}

            {/* Wallet Activation Modal */}
            <Dialog open={walletActivationModal} onOpenChange={setWalletActivationModal}>
                <DialogContent className="max-w-md bg-white border-0 shadow-2xl">
                    <div className="flex flex-col gap-6 p-6">
                        {/* Header */}
                        <div className="flex items-center justify-center">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>

                        <div className="text-center">
                            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                                Wallet Not Activated
                            </DialogTitle>
                            <p className="text-sm text-gray-600">
                                Your {selectedWallet?.currency} wallet needs to be activated before you can make payments with it.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setWalletActivationModal(false)}
                                className="flex-1"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    setWalletActivationModal(false);
                                    window.location.href = `/dashboard/${selectedWallet?.currency}`;
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Activate
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
