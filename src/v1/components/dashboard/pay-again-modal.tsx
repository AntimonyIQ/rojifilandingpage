import { useEffect, useState } from "react"
import { Country, ICountry } from "country-state-city";
import PaymentDetailsDrawer from "./payment-details-view"
import { IExternalAccountsPayload, IIBanDetailsResponse, IPayment, IResponse, ISwiftDetailsResponse, ITransaction, IWallet } from "@/v1/interface/interface"
import { Fiat, PaymentRail, Status, TransactionStatus, TransactionType } from "@/v1/enums/enums"
import { USDPaymentFlow } from "./payment/USDPaymentFlow"
import { session, SessionData } from "@/v1/session/session"
import Defaults from "@/v1/defaults/defaults"
import { useExchangeRate } from "./payment/useExchangeRate"
import { EURPaymentFlow } from "./payment/EURPaymentFlow"
import { GBPPaymentFlow } from "./payment/GBPPaymentFlow"
import PaymentSuccessModal from "./payment-success-modal"
import { updateSession } from "@/v1/hooks/use-session";
import { MarketClosedNotice } from "./payment/MarketClosedNotice";


export interface PayAgainModalProps {
    open: boolean
    onClose: () => void
    transaction?: ITransaction | null
    onSubmit?: (payload: any) => void;
    title?: string
    action: "pay-again" | "new-payment" | "fixed-rejected";
}

const findCountryByName = (name: string) => {
    const countries: Array<ICountry> = Country.getAllCountries();
    return countries.find(c => c.name === name || '');
}

export function PayAgainModal({ open, onClose, transaction, title, action }: PayAgainModalProps) {
    // State management - follow the same structure as payment.tsx
    const [loading, setLoading] = useState(false);
    const [formdata, setFormdata] = useState<IPayment | null>(null);
    const [ibanLoading, setIbanLoading] = useState(false);
    const [ibanDetails, setIbanDetails] = useState<IIBanDetailsResponse | null>(null);
    const [paymentDetailsModal, setPaymentDetailsModal] = useState(false);
    const [wallets, setWallets] = useState<Array<IWallet>>([]);
    const [selectedWallet, setSelectedWallet] = useState<IWallet | null>(null);
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [swiftDetails, setSwiftDetails] = useState<ISwiftDetailsResponse | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);
    const [modalState, setModalState] = useState<'loading' | 'error' | 'success' | null>(null);
    const [modalErrorMessage, setModalErrorMessage] = useState<string>('');
    const { fetchSession } = updateSession();

    const storage: SessionData = session.getUserData();

    // Modal callback functions
    const handleShowModal = (state: 'loading' | 'error' | 'success', errorMessage?: string, transactionData?: any) => {
        setModalState(state);
        setSuccessModal(true);
        if (errorMessage) {
            setModalErrorMessage(errorMessage);
        }
        if (transactionData) {
            setSuccessData(transactionData);
        }
    };


    const handleCloseModal = () => {
        setSuccessModal(false);
        setModalState(null);
        setModalErrorMessage('');
        setSuccessData(null);
    ;      
    };

    const handleEditPayment = () => {
        handleCloseModal();
        // Optionally scroll to top or show form for editing
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const usdWallet = wallets.find(w => w.currency === Fiat.USD);
    const exchangeRate = useExchangeRate({
        fromCurrency: Fiat.USD,
        toCurrency: formdata?.senderCurrency || '',
        walletBalance: usdWallet?.balance || 0,
        apiBaseUrl: Defaults.API_BASE_URL,
        enabled: formdata?.senderCurrency !== undefined && formdata.senderCurrency !== Fiat.USD
    });

    const ibanlist: Array<string> = ["AR", "CA", "AU", "NZ", "HK", "CO", "SG", "JP", "BR", "ZA", "TR", "MX", "NG", "IN", "US", "PR", "AS", "GU", "MP", "VI", "MY", "CX", "CC", "KM", "HM", "MO", "SC", "AI", "AW", "BM", "BT", "BQ", "BV", "IO", "FK", "KY", "CK", "CW", "FM", "MS", "NU", "NF", "PW", "PN", "SH", "KN", "TG", "SX", "GS", "SJ", "TC", "UM", "BW", "MA", "TD", "CL", "GY", "HN", "ID", "JM", "BZ", "BO", "SV", "AO", "FJ", "AG", "AM", "BS", "DJ", "BB", "KH", "DM", "EC", "GQ", "GM", "MN", "GD", "VC", "NR", "NP", "PA", "PG", "PY", "PE", "PH", "RW", "WS", "SL", "LK", "SB", "SR", "TJ", "TZ", "TH", "TO", "GH", "UG", "KE", "KI", "KG", "KR", "LS", "LR", "MV", "MW", "VN", "OM", "ST", "ZM", "TT", "TM", "TV", "UY", "UZ", "VU", "CG", "CN"];

    const countries: Array<ICountry> = Country.getAllCountries();

    useEffect(() => {
        if (storage) {
            setWallets(storage.wallets);
            const matchingWallet = storage.wallets.find(w => w.currency === transaction?.wallet);
            setSelectedWallet(matchingWallet || storage.wallets[0] || null); // Fallback to first wallet if no match
        }
    }, [storage, transaction?.senderCurrency]);

    useEffect(() => {
        if (!open || !transaction) return;
        // console.log("Initializing Pay Again Modal with transaction:", transaction);

        // remove phone code and + from transaction.phoneNumber, phone code is in transaction.phoneCode
        const rawPhone = transaction.phoneNumber ? String(transaction.phoneNumber).replace(/\D/g, '') : '';
        const phoneCodeDigits = transaction.phoneCode ? String(transaction.phoneCode).replace(/\D/g, '') : '';
        const phoneNumber = phoneCodeDigits && rawPhone.startsWith(phoneCodeDigits)
            ? rawPhone.slice(phoneCodeDigits.length)
            : rawPhone;

        // Initialize form data from transaction, but clear amount and invoice fields
        const payAgainData: IPayment = {
            // Required fields
            _id: transaction._id,
            rojifiId: '',
            sender: storage.sender ? storage.sender._id : '',
            senderWallet: storage.activeWallet || transaction.senderWallet || '',
            senderName: storage.sender ? storage.sender.businessName : transaction.senderName || '',
            senderCurrency: transaction.wallet || Fiat.USD,
            status: TransactionStatus.PENDING,
            swiftCode: transaction.swiftCode || '',
            beneficiaryAccountName: transaction.beneficiaryAccountName || '',
            beneficiaryCountry: transaction.beneficiaryCountry
                ? transaction.beneficiaryCountry.charAt(0).toUpperCase() + transaction.beneficiaryCountry.slice(1).toLowerCase()
                : '',
            beneficiaryCountryCode: transaction.beneficiaryCountryCode || '',
            fundsDestinationCountry: transaction.fundsDestinationCountry || '',
            beneficiaryBankName: transaction.beneficiaryBankName || '',
            beneficiaryCurrency: transaction.wallet || '',
            beneficiaryAccountNumber: transaction.beneficiaryAccountNumber || '',
            beneficiaryBankAddress: transaction.beneficiaryBankAddress || '',
            beneficiaryAccountType: (transaction.beneficiaryAccountType as "business" | "personal") || "personal",
            beneficiaryIban: transaction.beneficiaryIban || '',
            beneficiaryAddress: transaction.beneficiaryAddress || '',
            beneficiaryCity: transaction.beneficiaryCity || '',
            beneficiaryState: transaction.beneficiaryState || '',
            beneficiaryPostalCode: transaction.beneficiaryPostalCode || '',
            beneficiaryAbaRoutingNumber: transaction.beneficiaryAbaRoutingNumber || '',
            beneficiaryBankStateBranch: transaction.beneficiaryBankStateBranch || '',
            beneficiaryIFSC: transaction.beneficiaryIFSC || '',
            beneficiaryInstitutionNumber: transaction.beneficiaryInstitutionNumber || '',
            beneficiaryTransitNumber: transaction.beneficiaryTransitNumber || '',
            beneficiaryRoutingCode: transaction.beneficiaryRoutingCode || '',
            beneficiarySortCode: transaction.beneficiarySortCode || '',
            purposeOfPayment: transaction.purposeOfPayment || '',
            paymentFor: transaction.paymentFor || '',
            paymentRail: transaction.paymentRail || PaymentRail.SWIFT,
            reference: transaction.reference || '',
            reason: transaction.reason || undefined,
            reasonDescription: transaction.reasonDescription || '',
            createdAt: new Date(),
            updatedAt: new Date(),




            // Clear these fields for fresh input
            beneficiaryAmount: transaction.beneficiaryAmount,
            paymentInvoiceNumber: transaction.paymentInvoiceNumber || '',
            paymentInvoiceDate: transaction.paymentInvoiceDate || new Date(),
            paymentInvoice: "", // transaction.paymentInvoice,
            phoneCode: transaction.phoneCode || "",
            phoneNumber: transaction.phoneNumber || "",
            beneficiaryPhone: phoneNumber,
            beneficiaryPhoneCode: transaction.phoneCode || "",
            email: transaction.email || ""
        };

        setFormdata(payAgainData);

        // If transaction has SWIFT code and it's USD, fetch swift details
        if (transaction.swiftCode && transaction.wallet === Fiat.USD) {
            fetchBicDetails(transaction.swiftCode);
        }

        if (transaction.beneficiaryIban) {
            fetchIbanDetails(transaction.beneficiaryIban);
        }

        // If transaction has IBAN and it's EUR, fetch IBAN details  
        if (transaction.beneficiaryIban && transaction.wallet === Fiat.EUR) {
            fetchIbanDetails(transaction.beneficiaryIban);
        }

    }, [open, transaction, storage])

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

    const getNumericValue = (formattedValue: any): string => {
        if (typeof formattedValue === 'string') {
            return formattedValue.replace(/,/g, '');
        }
        if (typeof formattedValue === 'number') {
            return formattedValue.toString();
        }
        return '';
    };

    const fetchIbanDetails = async (iban: string): Promise<void> => {
        try {
            setIbanLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/iban/${iban}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': storage.client.publicKey,
                    'x-rojifi-deviceid': storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData: IIBanDetailsResponse = Defaults.PARSE_DATA(data.data, storage.client.privateKey, data.handshake);

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
                    beneficiaryCurrency: countries.find(c => c.isoCode === parseData.country)?.currency || '',
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
                    'x-rojifi-handshake': storage.client.publicKey,
                    'x-rojifi-deviceid': storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData: Array<ISwiftDetailsResponse> = Defaults.PARSE_DATA(data.data, storage.client.privateKey, data.handshake);
                // console.log("SWIFT parseData: ", parseData);

                if (!parseData || parseData.length === 0) {
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
        const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

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
                    'x-rojifi-handshake': storage.client?.publicKey || '',
                    'x-rojifi-deviceid': storage.deviceid || '',
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: form,
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error || 'Upload failed');
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process upload response right now, please try again.');
                const parseData: { url: string } = Defaults.PARSE_DATA(data.data, storage.client.privateKey, data.handshake);

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

    // Form completion check for button state
    const isFormComplete = (): boolean => {
        if (!formdata) return false;

        // Core required fields for all payment types
        const coreFields = [
            'beneficiaryAccountName',
            ...(action !== "fixed-rejected" ? ['beneficiaryAmount'] : []),
            'reason',
            'paymentInvoice',
            'paymentInvoiceNumber',
            'paymentInvoiceDate'
        ];
        // Check core fields
        for (const field of coreFields) {
            const value = formdata[field as keyof IPayment];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                return false;
            }
        }

        const fundingCountryISO2: string = getFundsDestinationCountry(formdata.swiftCode || '');

        // Currency-specific validations
        if (formdata.senderCurrency === "USD") {
            // Country-specific fields for USD
            if (!ibanlist.includes(fundingCountryISO2)) {
                if (!formdata.beneficiaryIban || formdata.beneficiaryIban.trim() === '') return false;
            } else {
                if (!formdata.beneficiaryAccountNumber || formdata.beneficiaryAccountNumber.trim() === '') return false;
            }

            // India specific
            if (fundingCountryISO2 === "IN" && (!formdata.beneficiaryIFSC || formdata.beneficiaryIFSC.trim() === '')) {
                return false;
            }

            // US specific
            if (["US", "PR", "AS", "GU", "MP", "VI"].includes(fundingCountryISO2) &&
                (!formdata.beneficiaryAbaRoutingNumber || formdata.beneficiaryAbaRoutingNumber.trim() === '')) {
                return false;
            }

        } else if (formdata.senderCurrency === "EUR") {
            // EUR specific required fields
            const eurRequiredFields = ['beneficiaryAddress', 'beneficiaryCity', 'beneficiaryPostalCode', 'beneficiaryCountry', 'beneficiaryIban'];
            for (const field of eurRequiredFields) {
                const value = formdata[field as keyof IPayment];
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return false;
                }
            }
        } else if (formdata.senderCurrency === "GBP") {
            // GBP specific required fields
            const gbpRequiredFields = ['beneficiaryAddress', 'beneficiaryCity', 'beneficiaryPostalCode', 'beneficiaryCountry', 'beneficiarySortCode', 'beneficiaryAccountNumber'];
            for (const field of gbpRequiredFields) {
                const value = formdata[field as keyof IPayment];
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return false;
                }
            }
        }

        return true;
    };

    // Simplified validation method
    const isValidAmount = (value: string): boolean => {
        if (action === "fixed-rejected" || action === "pay-again") return true;
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
                return /^[A-Za-z0-9\s\/_-]+$/.test(value) && value.trim().length > 0;
            case 'beneficiaryIban':
                return /^[A-Za-z0-9]+$/.test(value) && value.length >= 15;
            case 'reason':
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
            { key: 'reason', label: 'Reason of Payment' },
            { key: 'paymentInvoiceNumber', label: 'Invoice Number' },
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

    // Helper functions for the new payment flow components
    const handleActivateWallet = (): void => {
        // TODO: Implement wallet activation modal
        // console.log('Activate wallet requested');
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
        /*
        console.log("processPayment called", {
            formdata: !!formdata,
            selectedWallet: !!selectedWallet,
            beneficiaryAmount: formdata?.beneficiaryAmount,
            walletInfo: selectedWallet ? { currency: selectedWallet.currency, balance: selectedWallet.balance } : null
        });
        */
        if (!formdata || !selectedWallet) {
            console.log("Missing required data for payment processing");
            return;
        }

        try {
            setPaymentLoading(true);
            setPaymentDetailsModal(false);
            // Show loading modal immediately
            handleShowModal('loading');
            Defaults.LOGIN_STATUS();
            const phoneNumber: string = (formdata as any).beneficiaryPhone ? `+${(formdata as any).beneficiaryPhoneCode || ''}${(formdata as any).beneficiaryPhone}` : "";

            const recipient: IExternalAccountsPayload = {
                customerId: storage.sender ? String(storage.sender.providerId) : '',
                name: formdata.beneficiaryAccountName,
                phone: phoneNumber,
                address: {
                    street1: formdata.beneficiaryAddress,
                    city: formdata.beneficiaryCity,
                    country: findCountryByName(formdata.beneficiaryCountry)?.isoCode
                },
                bankName: swiftDetails?.bank_name || formdata.beneficiaryBankName,
                bankAddress: {
                    street1: swiftDetails?.address,
                    city: swiftDetails?.city,
                    country: swiftDetails?.country_code || "GB"
                },
                swift: {
                    accountNumber: formdata.beneficiaryIban ? null : (formdata.beneficiaryAccountNumber || null),
                    iban: formdata.beneficiaryIban || null,
                    bic: formdata.swiftCode || null
                },
            } as any;

            const paymentData: Partial<ITransaction> & { walletId: string, creatorId: string } = {
                ...formdata,
                sender: storage.sender ? storage.sender._id : '',
                senderWallet: selectedWallet._id,
                senderName: storage.sender ? storage.sender.businessName : '',
                status: TransactionStatus.PENDING,
                type: TransactionType.TRANSFER,
                beneficiaryAmount: getNumericValue(formdata.beneficiaryAmount || "0"),
                fees: [],
                rojifiId: storage.sender ? storage.sender.rojifiId : '',
                walletId: selectedWallet._id,
                creatorId: storage.user ? storage.user._id : '',
                phoneCode: (formdata as any).beneficiaryPhoneCode || '',
                phoneNumber: phoneNumber,
            };

            const payload = {
                paymentData: paymentData,
                bankData: {
                    rail: formdata.paymentRail,
                    recipientInfo: {
                        accountType: formdata.beneficiaryAccountType,
                        recipientName: formdata.beneficiaryAccountName,
                        recipientAddress: formdata.beneficiaryAddress,
                        recipientCountry: findCountryByName(formdata.beneficiaryCountry)?.isoCode || "", // beneficiaryCountry
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
                    name: storage.sender.businessName,
                },
                action: action,
                txid: transaction?._id,
                recipient: recipient
            };

            console.log("Submitting payment with payload:", payload);
            // return; // Remove this line to enable actual submission

            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': storage.client.publicKey,
                    'x-rojifi-deviceid': storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify(payload),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                await fetchSession();
                // Prepare success modal data
                const successTransactionData = {
                    amount: String(formdata.beneficiaryAmount || "0"),
                    currency: formdata.senderCurrency || "",
                    currencySymbol: selectedWallet?.symbol || "",
                    beneficiaryName: formdata.beneficiaryAccountName || "",
                    beneficiaryAccount: formdata.beneficiaryIban || formdata.beneficiaryAccountNumber || "",
                    bankName: swiftDetails?.bank_name || formdata.beneficiaryBankName || "",
                    bankCountry: swiftDetails?.country || formdata.beneficiaryCountry || "",
                    swiftCode: formdata.swiftCode || "",
                    isSwiftTransaction: !!formdata.swiftCode
                };

                // Show success modal
                handleShowModal('success', undefined, successTransactionData);

                // toast.success('Payment created successfully and is pending approval.');
                // onClose(); // Close the modal after successful payment
            }
        } catch (error: any) {
            console.error("Failed to create payment:", error);
            // Show error modal instead of just setting upload error
            handleShowModal('error', error.message || 'Failed to create payment');
        } finally {
            setPaymentLoading(false);
            setPaymentDetailsModal(false);
        }
    };

    // function setPayAgainOpen(arg0: boolean): void {
    //     throw new Error("Function not implemented.");
    // }

    return (
        <>
            {open && !paymentDetailsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop - no onClick to prevent outside clicks from closing */}
                    <div className="fixed inset-0 bg-black bg-opacity-50">
                       
                    </div>

                    {/* Modal Content */}
                    <div className="relative w-full sm:w-[90%] md:w-[70%] lg:w-[50%] h-[95dvh] bg-white rounded-lg shadow-xl flex flex-col">
                        <div className="p-5 border-b flex justify-between items-center">
                            <div className="mb-0">
                                <h2 className="text-lg font-semibold">{title || "Pay Again"}</h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Upload error display */}
                            {uploadError && uploadError.includes('Please fix the following:') && (
                                <div className="mb-4 p-4 border border-red-200 rounded-md bg-red-50">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Please correct the following errors:
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <ul className="list-disc space-y-1 pl-5">
                                                    {uploadError.split('\n• ').slice(1).map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="relative mb-5">
                                    <div className={`group flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 ${formdata?.swiftCode
                                        ? "border-green-200 bg-green-50 hover:border-green-300"
                                        : "border-gray-200 bg-gray-50 hover:border-blue-300"
                                        }`}>
                                        <div className="flex-1">
                                            {formdata?.swiftCode ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                                                            {formdata?.swiftCode}
                                                        </span>
                                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    {swiftDetails && (
                                                        <div className="text-sm text-gray-600">
                                                            <span className="font-medium">{swiftDetails.bank_name}</span>
                                                            {swiftDetails?.country && (
                                                                <span className="text-gray-500"> • {swiftDetails.country}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-gray-500">
                                                    <div className="font-medium text-gray-700">Invalid SWIFT code selected</div>
                                                    <div className="text-sm text-gray-500 mt-1">Click Select to choose your beneficiary bank</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* USD Payment Flow */}
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
                                    isFormComplete={isFormComplete}
                                    onClose={onClose}
                                    action={action}
                                />
                            )}

                            {/* EUR Market Closed Notice */}
                            {formdata?.senderCurrency === Fiat.EUR &&
                                formdata?.beneficiaryIban &&
                                formdata?.beneficiaryIban.length >= 15 &&
                                !loading &&
                                !exchangeRate?.loading &&
                                exchangeRate?.isLive === false && (
                                    <MarketClosedNotice currency="EUR" />
                                )}

                            {/* EUR Payment Flow */}
                            {formdata?.senderCurrency === Fiat.EUR &&
                                formdata?.beneficiaryIban &&
                                formdata?.beneficiaryIban.length >= 15 &&
                                !loading &&
                                exchangeRate?.isLive !== false && (
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
                                    isFormComplete={isFormComplete}
                                   onClose={onClose}
                                />
                            )}

                            {/* GBP Market Closed Notice */}
                            {formdata?.senderCurrency === Fiat.GBP &&
                                !loading &&
                                !exchangeRate?.loading &&
                                exchangeRate?.isLive === false && (
                                    <MarketClosedNotice currency="GBP" />
                                )}

                            {/* GBP Payment Flow */}
                            {formdata?.senderCurrency === Fiat.GBP &&
                                !loading &&
                                exchangeRate?.isLive !== false && (
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
                                    isFormComplete={isFormComplete}
                                    onClose={onClose} 
                                />
                            )}

                            {/* Loading state */}
                            {loading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            )}

                            {/* Currency selection state - when form is loaded but no flows match */}
                            {formdata && !loading && (
                                <>
                                    {/* USD but no SWIFT code yet */}
                                    {formdata.senderCurrency === Fiat.USD && (!formdata.swiftCode || formdata.swiftCode.length <= 7) && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-600">Please provide SWIFT/BIC code to continue with USD payment.</p>
                                        </div>
                                    )}

                                    {/* EUR but no IBAN yet */}
                                    {formdata.senderCurrency === Fiat.EUR && (!formdata.beneficiaryIban || formdata.beneficiaryIban.length < 15) && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-600">Please provide IBAN to continue with EUR payment.</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Cancel button - Always available when market is closed or no flow is ready */}
                            {(formdata?.senderCurrency === Fiat.EUR && !loading && !exchangeRate?.loading && exchangeRate?.isLive === false) ||
                                (formdata?.senderCurrency === Fiat.GBP && !loading && !exchangeRate?.loading && exchangeRate?.isLive === false) ||
                                (formdata && !loading &&
                                    ((formdata.senderCurrency === Fiat.USD && (!formdata.swiftCode || formdata.swiftCode.length <= 7)) ||
                                        (formdata.senderCurrency === Fiat.EUR && (!formdata.beneficiaryIban || formdata.beneficiaryIban.length < 15)))) ? (
                                <div className="flex justify-end w-full mt-8">
                                    <button
                                        className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 border-2 border-red-600 hover:border-red-700 rounded-lg font-medium transition-all duration-200"
                                        onClick={onClose}>
                                        Cancel
                                    </button>
                                </div>
                            ) : null}
                        </div>
 
                        {/**
                    <div className="p-5 border-t flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="button" className="text-white" onClick={handleFormSubmit}>Submit Payment</Button>
                    </div>
                    */}
                    </div>
                </div>
            )}

            {/* Render modals outside the main Dialog to ensure proper z-index layering */}
            {paymentDetailsModal && !successModal && !modalState && (
                <PaymentDetailsDrawer
                    open={paymentDetailsModal && !successModal && !modalState}
                    onClose={processPayment}
                    onEdit={() => {
                        console.log("PaymentDetailsDrawer edit callback triggered");
                        setPaymentDetailsModal(false);
                    }}
                    details={{
                        ...formdata as IPayment,
                        wallet: selectedWallet,
                        swiftDetails: swiftDetails || {
                            country: formdata?.beneficiaryCountry || "",
                            country_code: formdata?.beneficiaryCountryCode || "",
                            swift_code: formdata?.swiftCode || "",
                            bank_name: formdata?.beneficiaryBankName || "",
                            city: formdata?.beneficiaryCity || "",
                            region: formdata?.beneficiaryState || "",
                            address: formdata?.beneficiaryBankAddress || "",
                        },
                        ibanDetails: ibanDetails,
                    }}
                />
            )}

            {/* Payment Success Modal */}
            {successModal && modalState && (
                <PaymentSuccessModal
                    open={successModal}
                    onClose={() => {
                        handleCloseModal();
                        onClose(); // Close pay-again modal after success modal is closed
                    }}
                    errorMessage={modalErrorMessage}
                    transactionData={successData}
                    state={modalState}
                    onEdit={handleEditPayment}
                />
            )}
        </>
    )
}

export default PayAgainModal
