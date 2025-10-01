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
// import { Input } from "../ui/input";
import {
    X,
    Building2
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import PaymentDetailsDrawer from "./payment-details-view";
import Loading from "../loading";
import Defaults from "@/v1/defaults/defaults";
import { IPayment, IResponse, ISender, ITransaction, IWallet, ISwiftDetailsResponse, IIBanDetailsResponse } from "@/v1/interface/interface";
import { Fiat, PaymentRail, Status, TransactionStatus, TransactionType, Reason } from "@/v1/enums/enums";
import { session, SessionData } from "@/v1/session/session";
import countries from "../../data/country_state.json";

// Import the new flow components
import { USDPaymentFlow } from "./payment/USDPaymentFlow";
import { EURPaymentFlow } from "./payment/EURPaymentFlow";
import { GBPPaymentFlow } from "./payment/GBPPaymentFlow";
import { useExchangeRate } from "./payment/useExchangeRate";
import BankDetailsModal from "./BankDetailsModal";
import PaymentSuccessModal from "./payment-success-modal";

/*
interface ITransactionPaymentData {
    paymentData: {
        senderCurrency: string;
        walletId: string;
        rojifiId: string;
        sender: string;
        creatorId: string;
        senderWallet: string;
        senderName: string;
        status: string;
        swiftCode: string;
        fundsDestinationCountry: string;
        beneficiaryCountryCode: string;
        beneficiaryBankName: string;
        beneficiaryCurrency: string;
        paymentRail: string;
        beneficiaryIban: string;
        beneficiaryAccountName: string;
        beneficiaryAccountType: string;
        beneficiaryAddress: string;
        beneficiaryCity: string;
        beneficiaryPostalCode: string;
        beneficiaryCountry: string;
        paymentInvoiceNumber: string;
        paymentInvoiceDate: string;
        purposeOfPayment: string;
        paymentInvoice: string;
        beneficiaryAmount: string;
        beneficiaryAccountNumber: string;
        beneficiaryAbaRoutingNumber: string;
        beneficiaryBankStateBranch: string;
        beneficiaryIFSC: string;
        beneficiaryInstitutionNumber: string;
        paymentFor: string;
        beneficiaryTransitNumber: string;
        beneficiaryRoutingCode: string;
        type: string;
        fees: any[];
    };
    bankData: {
        rail: string;
        recipientInfo: {
            accountType: string;
            recipientName: string;
            recipientAddress: string;
            recipientCountry: string;
            fundsDestinationCountry: string;
            iban: string;
            swiftCode: string;
            accountNumber: string;
            abaRoutingCode: string;
            bankStateBranch: string;
            ifsc: string;
            institutionNumber: string;
            transitNumber: string;
            routingCode: string;
        };
        name: string;
    };
}
    */

const findCountryByName = (name: string) => {
    return countries.find(c => c.name === name || '');
}

export const PaymentView: React.FC = () => {
    // State management
    // const { wallet } = useParams();
    const [swiftmodal, setSwiftModal] = useState(false);
    const [loading, setLoading] = useState(false);
    /// const [dragActive, setDragActive] = useState(false);
    // const [focused, setFocused] = useState(false);
    const [formdata, setFormdata] = useState<IPayment | null>(null);
    const [ibanLoading, setIbanLoading] = useState(false);
    const [ibanDetails, setIbanDetails] = useState<IIBanDetailsResponse | null>(null);
    const [paymentDetailsModal, setPaymentDetailsModal] = useState(false);
    // const [popOpen, setPopOpen] = useState(false);
    const [wallets, setWallets] = useState<Array<IWallet>>([]);
    const [selectedWallet, setSelectedWallet] = useState<IWallet | null>(null);
    const [_sender, setSender] = useState<ISender | null>(null);
    // const [fileUpload, setFileUpload] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [swiftDetails, setSwiftDetails] = useState<ISwiftDetailsResponse | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [walletActivationModal, setWalletActivationModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    const sd: SessionData = session.getUserData();

    const usdWallet = wallets.find(w => w.currency === Fiat.USD);
    const exchangeRate = useExchangeRate({
        fromCurrency: Fiat.USD,
        toCurrency: formdata?.senderCurrency || '',
        walletBalance: usdWallet?.balance || 0,
        apiBaseUrl: Defaults.API_BASE_URL,
        enabled: formdata?.senderCurrency !== undefined && formdata.senderCurrency !== Fiat.USD
    });

    const ibanlist: Array<string> = ["AR", "CA", "AU", "NZ", "HK", "CO", "SG", "JP", "BR", "ZA", "TR", "MX", "NG", "IN", "US", "PR", "AS", "GU", "MP", "VI", "MY", "CX", "CC", "KM", "HM", "MO", "SC", "AI", "AW", "BM", "BT", "BQ", "BV", "IO", "FK", "KY", "CK", "CW", "FM", "MS", "NU", "NF", "PW", "PN", "SH", "KN", "TG", "SX", "GS", "SJ", "TC", "UM", "BW", "MA", "TD", "CL", "GY", "HN", "ID", "JM", "BZ", "BO", "SV", "AO", "FJ", "AG", "AM", "BS", "DJ", "BB", "KH", "DM", "EC", "GQ", "GM", "MN", "GD", "VC", "NR", "NP", "PA", "PG", "PY", "PE", "PH", "RW", "WS", "SL", "LK", "SB", "SR", "TJ", "TZ", "TH", "TO", "GH", "UG", "KE", "KI", "KG", "LS", "LR", "MV", "MW", "VN", "OM", "ST", "ZM", "TT", "TM", "TV", "UY", "UZ", "VU", "CG", "CN"];

    useEffect(() => {
        if (sd) {
            setSender(sd.sender);
            // console.log("Sender data:", sd.sender);
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

    const getNumericValue = (formattedValue: string): string => {
        return formattedValue.replace(/,/g, '');
    };

    const fetchIbanDetails = async (iban: string): Promise<void> => {
        try {
            setIbanLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/iban/${iban}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData: IIBanDetailsResponse = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);

                // Check if parseData is empty or invalid
                if (!parseData || (typeof parseData === 'object' && Object.keys(parseData).length === 0)) {
                    // Set ibanDetails to invalid response object
                    setIbanDetails({ valid: false } as IIBanDetailsResponse);
                    return;
                }

                setIbanDetails(parseData);
                setFormdata(prev => ({
                    ...prev,
                    fundsDestinationCountry: parseData.country,
                    beneficiaryCountryCode: parseData.country,
                    beneficiaryBankName: parseData.bank_name,
                    beneficiaryCurrency: countries.find(c => c.iso2 === parseData.country)?.currency || '',
                    paymentRail: formdata?.senderCurrency === "USD" ? PaymentRail.SWIFT : PaymentRail.FPS,
                    beneficiaryAccountNumber: parseData.account_number,
                    beneficiaryIban: iban
                } as IPayment));
            }
        } catch (error: any) {
            console.error('Failed to fetch IBAN details:', error);
        } finally {
            setIbanLoading(false);
        }
    }

    const fetchBicDetails = async (bic: string): Promise<void> => {
        try {
            setLoading(true);
            // clean swift to remove extra xxx if added at the end:
            const cleanBic = bic.endsWith("XXX") ? bic.slice(0, -3) : bic;
            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/swift/${cleanBic}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData: Array<ISwiftDetailsResponse> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);

                // Check if parseData is empty array (invalid SWIFT code)
                if (!parseData || parseData.length === 0) {
                    // Set swiftDetails to null to indicate invalid code
                    setSwiftDetails(null);
                    return;
                }

                setSwiftDetails(parseData[0]);
                setFormdata(prev => ({
                    ...prev,
                    fundsDestinationCountry: parseData[0].country_code,
                    beneficiaryCountryCode: parseData[0].country_code,
                    beneficiaryBankName: parseData[0].bank_name,
                    beneficiaryCurrency: parseData[0].country_code,
                    paymentRail: PaymentRail.SWIFT,
                    swiftCode: parseData[0].swift_code
                } as IPayment));
            }
        } catch (error: any) {
            console.error('Failed to fetch bic details:', error);
        } finally {
            setLoading(false);
        }
    }

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
                // setFileUpload(file);
            }
        } catch (err: any) {
            setUploadError(err.message || 'File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (
        field: string,
        value: string | boolean | File | Date
    ): void => {
        let sanitizedValue: string | boolean | File | Date = value;

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
                    break;
                case 'beneficiaryIban':
                case "iban":
                    sanitizedValue = value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 34);
                    if (sanitizedValue.length >= 15) {
                        console.log("Fetching IBAN details for:", sanitizedValue);
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
                return /^[A-Za-z0-9]+$/.test(value) && value.length >= 15;
            case 'purposeOfPayment':
                return /^[A-Za-z0-9\s,.\-]+$/.test(value) && value.length > 5;
            default:
                return value.length > 0; // Basic non-empty validation for other fields
        }
    };

    const validateForm = (): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];
        console.log("senderCurrency: ", formdata?.senderCurrency);

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
            // { key: 'purposeOfPayment', label: 'Purpose of Payment' },
            { key: 'paymentInvoiceNumber', label: 'Invoice Number' },
            { key: 'reason', label: 'Reason for Transfer' },
        ];

        // Check required fields
        for (const field of requiredFields) {
            if (formdata.senderCurrency && formdata.senderCurrency === "GBP" && field.label !== "Bank Name") {
                const value = formdata[field.key as keyof IPayment];
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    errors.push(`${field.label} is required`);
                }
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

        const fundingCountryISO2: string = getFundsDestinationCountry(formdata.swiftCode);

        // Country-specific validations
        if (formdata.senderCurrency && formdata.senderCurrency !== "GBP") {
            if (!ibanlist.includes(fundingCountryISO2)) {
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
        }

        // Specific country validations
        if (fundingCountryISO2 === "IN" && (!formdata.beneficiaryIFSC || formdata.beneficiaryIFSC.trim() === '')) {
            errors.push("IFSC Code is required for India");
        }

        if (["US", "PR", "AS", "GU", "MP", "VI"].includes(fundingCountryISO2) &&
            (!formdata.beneficiaryAbaRoutingNumber || formdata.beneficiaryAbaRoutingNumber.trim() === '')) {
            errors.push("ABA/Routing number is required for US payments");
        }

        // Address validation for certain countries
        if (["CA", "US", "GB", "AU"].includes(fundingCountryISO2)) {
            if (!formdata.beneficiaryAddress || formdata.beneficiaryAddress.trim() === '') {
                errors.push("Beneficiary address is required");
            }
            if (!formdata.beneficiaryCity || formdata.beneficiaryCity.trim() === '') {
                errors.push("Beneficiary city is required");
            }
        }

        // Reason validation
        if (!formdata.reason || formdata.reason.trim() === '') {
            errors.push("Reason for transfer is required");
        }

        // Reason description validation - required if reason is OTHER
        if (formdata.reason === Reason.OTHER) {
            if (!formdata.reasonDescription || formdata.reasonDescription.trim() === '') {
                errors.push("Reason description is required when 'Other' is selected");
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

    /*
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
    */

    // Helper functions for the new payment flow components
    const handleActivateWallet = (): void => {
        setWalletActivationModal(true);
    };

    const handleSubmitPayment = (): void => {
        handleShowPaymentDetails();
    };

    const getFundsDestinationCountry = (swiftCode: string): string => {
        if (!swiftCode || swiftCode.length < 6) {
            return "";
        }
        const iso = swiftCode.substring(4, 6).toUpperCase();
        return iso;
    }

    const processPayment = async (): Promise<void> => {
        if (!formdata || !selectedWallet) return;

        try {
            setPaymentLoading(true);
            setPaymentDetailsModal(false);
            Defaults.LOGIN_STATUS();
            const paymentData: Partial<ITransaction> & { walletId: string, creatorId: string } = {
                ...formdata,
                sender: sd.sender ? sd.sender._id : '',
                senderWallet: selectedWallet._id,
                senderName: sd.sender ? sd.sender.businessName : '',
                status: TransactionStatus.PENDING,
                type: TransactionType.TRANSFER,
                beneficiaryAmount: getNumericValue(formdata.beneficiaryAmount || "0"),
                fees: [],
                rojifiId: sd.sender ? sd.sender.rojifiId : '',
                walletId: selectedWallet._id,
                creatorId: sd.user ? sd.user._id : '',
            };

            const payload = {
                paymentData: paymentData,
                bankData: {
                    rail: formdata.paymentRail,
                    recipientInfo: {
                        accountType: formdata.beneficiaryAccountType,
                        recipientName: formdata.beneficiaryAccountName,
                        recipientAddress: formdata.beneficiaryAddress,
                        recipientCountry: findCountryByName(formdata.beneficiaryCountry)?.iso2 || "", // beneficiaryCountry
                        fundsDestinationCountry: formdata.fundsDestinationCountry, // beneficiaryCurrency
                        iban: formdata.beneficiaryIban,
                        swiftCode: formdata.swiftCode,
                        accountNumber: formdata.beneficiaryAccountNumber,
                        abaRoutingCode: formdata.beneficiaryAbaRoutingNumber,
                        bankStateBranch: formdata.beneficiaryBankStateBranch,
                        ifsc: formdata.beneficiaryIFSC,
                        institutionNumber: formdata.beneficiaryInstitutionNumber,
                        transitNumber: formdata.beneficiaryTransitNumber,
                        routingCode: formdata.beneficiaryRoutingCode,
                        sortCode: formdata.beneficiarySortCode,
                    },
                    name: sd.sender.businessName,
                }
            }

            console.log("Submitting Payment Data:", payload);

            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
                body: JSON.stringify(payload),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                // Prepare success modal data
                const successTransactionData = {
                    amount: formdata.beneficiaryAmount || "0",
                    currency: formdata.senderCurrency || "",
                    currencySymbol: selectedWallet?.symbol || "",
                    beneficiaryName: formdata.beneficiaryAccountName || "",
                    beneficiaryAccount: formdata.beneficiaryIban || formdata.beneficiaryAccountNumber || "",
                    bankName: swiftDetails?.bank_name || formdata.beneficiaryBankName || "",
                    bankCountry: swiftDetails?.country || formdata.beneficiaryCountry || "",
                    swiftCode: formdata.swiftCode || "",
                    isSwiftTransaction: !!formdata.swiftCode
                };

                setSuccessData(successTransactionData);
                setSuccessModal(true);

                // toast.success('Payment created successfully and is pending approval.');
                // session.updateSession({ ...sd, draftPayment: { ...formdata } });
                // window.location.href = `/dashboard/NGN/transactions`;
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
        <div className="space-y-6 sm:px-[15px] lg:px-[20px]">

            {/* Validation Errors Display */}
            {uploadError && uploadError.includes('Please fix the following:') && (
                <div className="border border-red-200 rounded-md p-4 mb-6 bg-white">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <X className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-700 mb-2">
                                Please fix the following errors:
                            </h4>
                            <div className="text-sm text-red-600 whitespace-pre-line">
                                {uploadError.replace('Please fix the following:\\n', '')}
                            </div>
                        </div>
                        <button
                            onClick={() => setUploadError('')}
                            className="flex-shrink-0 text-red-400 hover:text-red-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Currency Selection */}
            <div className="space-y-3">
                <div>
                    <Label className="text-sm font-medium text-gray-900 mb-1 block">
                        Payment Currency <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500 mb-3">Choose the currency for your international transfer</p>
                </div>

                <Select
                    value={formdata?.senderCurrency || ""}
                    onValueChange={(value): void => {
                        handleInputChange("senderCurrency", value);
                        const selectedWalletData: IWallet | undefined = wallets.find(wallet => wallet.currency === value);
                        if (selectedWalletData) {
                            setSelectedWallet(selectedWalletData);
                        }
                        if (value === Fiat.USD) {
                            setSwiftModal(true);
                        } else if (value === Fiat.EUR) {
                            setSwiftModal(true);
                        }
                    }}
                >
                    <SelectTrigger className="w-full h-12 border-gray-200 focus:border-gray-400">
                        <SelectValue placeholder="Select your payment currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {wallets
                            .filter(wallet => wallet.currency !== Fiat.NGN)
                            .map((wallet, index) => (
                                <SelectItem key={index} value={wallet.currency}>
                                    <div className="flex items-center gap-3">
                                        <img src={wallet.icon} alt={`${wallet.currency} icon`} className="w-5 h-5 rounded-full" />
                                        <span className="font-medium">{wallet.currency}</span>
                                    </div>
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            </div>

            {formdata?.senderCurrency === "USD" && (
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-1">SWIFT Code</h3>
                            <p className="text-xs text-gray-500">Bank identification code for USD transfers</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 border border-gray-200 rounded-md px-3 py-3 bg-gray-50">
                                <span className="font-mono text-sm text-gray-900 tracking-wide">
                                    {formdata.swiftCode || "No SWIFT code selected"}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSwiftDetails(null);
                                    handleInputChange("swiftCode", "");
                                    setSwiftModal(true)
                                }}
                                className="px-4 py-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900"
                            >
                                {formdata.swiftCode ? "Change" : "Select"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {formdata?.senderCurrency === "EUR" && (
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-1">IBAN Code</h3>
                            <p className="text-xs text-gray-500">International Bank Account Number for EUR transfers</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 border border-gray-200 rounded-md px-3 py-3 bg-gray-50">
                                <span className="font-mono text-sm text-gray-900 tracking-wide">
                                    {formdata.beneficiaryIban || "No IBAN selected"}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSwiftModal(true)}
                                className="px-4 py-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900"
                            >
                                {formdata.beneficiaryIban ? "Change" : "Select"}
                            </Button>
                        </div>

                        {ibanDetails && ibanDetails.valid && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div><span className="font-medium text-gray-700">Bank:</span> {ibanDetails.bank_name}</div>
                                    <div><span className="font-medium text-gray-700">Country:</span> {ibanDetails.country}</div>
                                    {ibanDetails.account_number && (
                                        <div><span className="font-medium text-gray-700">Account:</span> {ibanDetails.account_number}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center w-full mt-80">
                    <Loading />
                </div>
            )}

            {/* Render payment flow based on selected currency */}
            {formdata?.senderCurrency === Fiat.USD && formdata?.swiftCode && formdata?.swiftCode.length > 7 && !loading && (
                <USDPaymentFlow
                    formdata={formdata}
                    onFieldChange={handleInputChange}
                    loading={loading}
                    ibanlist={ibanlist}
                    onFileUpload={uploadFile}
                    uploadError={uploadError}
                    uploading={uploading}
                    onSubmit={handleSubmitPayment}
                    paymentLoading={paymentLoading}
                    validateForm={validateForm}
                    selectedWallet={selectedWallet}
                    ibanDetails={ibanDetails}
                    ibanLoading={ibanLoading}
                />
            )}

            {formdata?.senderCurrency === Fiat.EUR && formdata?.beneficiaryIban && formdata?.beneficiaryIban.length >= 15 && !loading && (
                <EURPaymentFlow
                    formdata={formdata}
                    onFieldChange={handleInputChange}
                    loading={loading}
                    onSubmit={handleSubmitPayment}
                    paymentLoading={paymentLoading}
                    validateForm={validateForm}
                    walletActivated={selectedWallet?.activated || false}
                    onActivateWallet={handleActivateWallet}
                    exchangeRate={exchangeRate}
                    uploading={uploading}
                    uploadError={uploadError}
                    onFileUpload={uploadFile}
                />
            )}

            {formdata?.senderCurrency === Fiat.GBP && !loading && (
                <GBPPaymentFlow
                    formdata={formdata}
                    onFieldChange={handleInputChange}
                    loading={loading}
                    onSubmit={handleSubmitPayment}
                    paymentLoading={paymentLoading}
                    validateForm={validateForm}
                    walletActivated={selectedWallet?.activated || false}
                    onActivateWallet={handleActivateWallet}
                    exchangeRate={exchangeRate}
                    uploading={uploading}
                    uploadError={uploadError}
                    onFileUpload={uploadFile}
                />
            )}

            <BankDetailsModal
                open={swiftmodal}
                onOpenChange={setSwiftModal}
                formdata={formdata as IPayment}
                onChange={(field, value): void =>
                    handleInputChange(field, value)
                }
                onCodeEntered={(code: string): void => {
                    // Clear validation data if empty code is provided
                    if (code === "") {
                        setSwiftDetails(null);
                        setIbanDetails(null);
                        return;
                    }

                    if (formdata?.senderCurrency === Fiat.USD) {
                        fetchBicDetails(code);
                    } else if (formdata?.senderCurrency === Fiat.EUR) {
                        fetchIbanDetails(code);
                    }
                }}
                loading={formdata?.senderCurrency === Fiat.USD ? loading : ibanLoading}
                type={formdata?.senderCurrency === Fiat.USD ? 'swift' : 'iban'}
                swiftDetails={swiftDetails}
                ibanDetails={ibanDetails}
            />

            {paymentDetailsModal && (
                <PaymentDetailsDrawer
                    open={paymentDetailsModal}
                    onClose={processPayment}
                    onEdit={() => setPaymentDetailsModal(false)}
                    details={{
                        ...formdata as IPayment,
                        wallet: selectedWallet,
                        swiftDetails: swiftDetails,
                        ibanDetails: ibanDetails,
                    }}
                />
            )}

            {/* Wallet Activation Modal */}
            <Dialog open={walletActivationModal} onOpenChange={setWalletActivationModal}>
                <DialogContent className="max-w-md">
                    <div className="flex flex-col gap-6 p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-5 h-5 text-gray-600" />
                            </div>
                            <DialogTitle className="text-lg font-medium text-gray-900 mb-2">
                                Wallet Not Activated
                            </DialogTitle>
                            <p className="text-sm text-gray-600">
                                Your {selectedWallet?.currency} wallet needs to be activated before you can make payments.
                            </p>
                        </div>

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
                                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                Activate Wallet
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Payment Success Modal */}
            {successModal && successData && (
                <PaymentSuccessModal
                    open={successModal}
                    onClose={() => {
                        setSuccessModal(false);
                        setSuccessData(null);
                    }}
                    transactionData={successData}
                />
            )}
        </div>
    );
};
