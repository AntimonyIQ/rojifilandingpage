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
import { X, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import PaymentDetailsDrawer from "./payment-details-view";
import Loading from "../loading";
import Defaults from "@/v1/defaults/defaults";
import {
    IPayment,
    IResponse,
    ISender,
    ITransaction,
    IWallet,
    ISwiftDetailsResponse,
    IIBanDetailsResponse,
    IExternalAccountsPayload,
    ISortCodeDetailsResponse,
} from "@/v1/interface/interface";
import {
    Fiat,
    PaymentRail,
    Status,
    TransactionStatus,
    TransactionType,
    PurposeOfPayment,
} from "@/v1/enums/enums";
import { session, SessionData } from "@/v1/session/session";
import countries from "../../data/country_state.json";

// Import the new flow components
import { USDPaymentFlow } from "./payment/USDPaymentFlow";
import { EURPaymentFlow } from "./payment/EURPaymentFlow";
import { GBPPaymentFlow } from "./payment/GBPPaymentFlow";
import { useExchangeRate } from "./payment/useExchangeRate";
import BankDetailsModal from "./BankDetailsModal";
import PaymentSuccessModal from "./payment-success-modal";
import { updateSession } from "@/v1/hooks/use-session";
import { MarketClosedNotice } from "./payment/MarketClosedNotice";

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
    return countries.find((c) => c.name === name || "");
};

interface PaymentViewProps {
    onClose?: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({ onClose }) => {
    // State management
    // const { wallet } = useParams();
    const [swiftmodal, setSwiftModal] = useState(false);
    const [loading, setLoading] = useState(false);
    /// const [dragActive, setDragActive] = useState(false);
    // const [focused, setFocused] = useState(false);
    const [formdata, setFormdata] = useState<IPayment | null>(null);
    // const [ibanLoading, setIbanLoading] = useState(false);
    const [ibanDetails, _setIbanDetails] = useState<IIBanDetailsResponse | null>(null);
    const [paymentDetailsModal, setPaymentDetailsModal] = useState(false);
    // const [popOpen, setPopOpen] = useState(false);
    const [wallets, setWallets] = useState<Array<IWallet>>([]);
    const [selectedWallet, setSelectedWallet] = useState<IWallet | null>(null);
    const [_sender, setSender] = useState<ISender | null>(null);
    // const [fileUpload, setFileUpload] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [swiftDetails, setSwiftDetails] =
        useState<ISwiftDetailsResponse | null>(null);
    const [sortCodeDetails, _setSortCodeDetails] =
        useState<ISortCodeDetailsResponse | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [walletActivationModal, setWalletActivationModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);
    const [modalState, setModalState] = useState<
        "loading" | "error" | "success" | null
    >(null);
    const [modalErrorMessage, setModalErrorMessage] = useState<string>("");
    const { fetchSession } = updateSession();

    const storage: SessionData = session.getUserData();

    // Modal callback functions
    const handleShowModal = (
        state: "loading" | "error" | "success",
        errorMessage?: string,
        transactionData?: any
    ) => {
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
        setModalErrorMessage("");
        setSuccessData(null);
    };

    const handleEditPayment = () => {
        handleCloseModal();
        // Optionally scroll to top or show form for editing
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const usdWallet = wallets.find((w) => w.currency === Fiat.USD);

    // Only enable exchange rate fetching when:
    // 1. Currency is EUR or GBP (not USD)
    // 2. SWIFT is validated for EUR/GBP
    const shouldFetchExchangeRate =
        formdata?.senderCurrency !== undefined &&
        formdata.senderCurrency !== Fiat.USD &&
        swiftDetails !== null &&
        (formdata.senderCurrency === Fiat.EUR ||
            formdata.senderCurrency === Fiat.GBP);

    const exchangeRate = useExchangeRate({
        fromCurrency: Fiat.USD,
        toCurrency: formdata?.senderCurrency || "",
        walletBalance: usdWallet?.balance || 0,
        apiBaseUrl: Defaults.API_BASE_URL,
        enabled: shouldFetchExchangeRate,
    });

    // console.log("Exchange rate data:", exchangeRate);

    const ibanlist: Array<string> = [
        "AR",
        "CA",
        "AU",
        "NZ",
        "HK",
        "CO",
        "SG",
        "JP",
        "BR",
        "ZA",
        "TR",
        "MX",
        "NG",
        "IN",
        "US",
        "PR",
        "AS",
        "GU",
        "MP",
        "VI",
        "MY",
        "CX",
        "CC",
        "KM",
        "HM",
        "MO",
        "SC",
        "AI",
        "AW",
        "BM",
        "BT",
        "BQ",
        "BV",
        "IO",
        "FK",
        "KY",
        "CK",
        "CW",
        "FM",
        "MS",
        "NU",
        "NF",
        "PW",
        "PN",
        "SH",
        "KN",
        "TG",
        "SX",
        "GS",
        "SJ",
        "TC",
        "UM",
        "BW",
        "MA",
        "TD",
        "CL",
        "GY",
        "HN",
        "ID",
        "JM",
        "BZ",
        "BO",
        "SV",
        "AO",
        "FJ",
        "AG",
        "AM",
        "BS",
        "DJ",
        "BB",
        "KH",
        "DM",
        "EC",
        "GQ",
        "GM",
        "MN",
        "GD",
        "VC",
        "NR",
        "NP",
        "PA",
        "PG",
        "PY",
        "PE",
        "PH",
        "RW",
        "WS",
        "SL",
        "LK",
        "SB",
        "SR",
        "TJ",
        "TZ",
        "TH",
        "TO",
        "GH",
        "UG",
        "KE",
        "KI",
        "KG",
        "KR",
        "LS",
        "LR",
        "MV",
        "MW",
        "VN",
        "OM",
        "ST",
        "ZM",
        "TT",
        "TM",
        "TV",
        "UY",
        "UZ",
        "VU",
        "CG",
        "CN",
    ];

    useEffect(() => {
        if (storage) {
            setSender(storage.sender);
            // console.log("Sender data:", storage.sender);
            setWallets(storage.wallets);
            const draftPayment: IPayment = {
                ...storage.draftPayment,
                sender: storage.sender ? storage.sender._id : "",
                senderWallet: storage.activeWallet,
                senderName: storage.sender ? storage.sender.businessName : "",
                status: TransactionStatus.PENDING,
                rojifiId: "",
            };

            session.updateSession({ ...storage, draftPayment: draftPayment });
        }
    }, [storage]);

    const formatNumberWithCommas = (value: string): string => {
        // Remove all non-digit characters except decimal point
        const cleanValue = value.replace(/[^\d.]/g, "");

        // Split by decimal point
        const parts = cleanValue.split(".");

        // Add commas to the integer part
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Return formatted number (limit to 2 decimal places if decimal exists)
        return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
    };

    const getNumericValue = (formattedValue: string): string => {
        return formattedValue.replace(/,/g, "");
    };

    /*
    const fetchIbanDetails = async (iban: string): Promise<void> => {
        try {
            setIbanLoading(true);
            const res = await fetch(
                `${Defaults.API_BASE_URL}/transaction/iban/${iban}`,
                {
                    method: "GET",
                    headers: {
                        ...Defaults.HEADERS,
                        "x-rojifi-handshake": storage.client.publicKey,
                        "x-rojifi-deviceid": storage.deviceid,
                        Authorization: `Bearer ${storage.authorization}`,
                    },
                }
            );

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake)
                    throw new Error(
                        "Unable to process response right now, please try again."
                    );
                const parseData: IIBanDetailsResponse = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );

                // Check if parseData is empty or invalid
                if (
                    !parseData ||
                    (typeof parseData === "object" && Object.keys(parseData).length === 0)
                ) {
                    // Set ibanDetails to invalid response object
                    setIbanDetails({ valid: false } as IIBanDetailsResponse);
                    return;
                }

                setIbanDetails(parseData);
                setFormdata(
                    (prev) =>
                    ({
                        ...prev,
                        fundsDestinationCountry: parseData.country,
                        beneficiaryCountryCode: parseData.country,
                        beneficiaryBankName: parseData.bank_name,
                        beneficiaryCurrency:
                            countries.find((c) => c.iso2 === parseData.country)?.currency ||
                            "",
                        paymentRail:
                            formdata?.senderCurrency === "USD"
                                ? PaymentRail.SWIFT
                                : PaymentRail.FPS,
                        beneficiaryAccountNumber: parseData.account_number,
                        beneficiaryIban: iban,
                    } as IPayment)
                );
            }
        } catch (error: any) {
            console.error("Failed to fetch IBAN details:", error);
        } finally {
            setIbanLoading(false);
        }
    };
    */

    const fetchBicDetails = async (bic: string): Promise<void> => {
        try {
            setLoading(true);
            // clean swift to remove extra xxx if added at the end:
            const cleanBic = bic.endsWith("XXX") ? bic.slice(0, -3) : bic;
            const res = await fetch(
                `${Defaults.API_BASE_URL}/transaction/swift/${cleanBic}`,
                {
                    method: "GET",
                    headers: {
                        ...Defaults.HEADERS,
                        "x-rojifi-handshake": storage.client.publicKey,
                        "x-rojifi-deviceid": storage.deviceid,
                        Authorization: `Bearer ${storage.authorization}`,
                    },
                }
            );

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Invalid Response.");
                const parseData: Array<ISwiftDetailsResponse> = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );
                console.log("SWIFT details fetched:", parseData);

                // Check if parseData is empty array (invalid SWIFT code)
                if (!parseData || parseData.length === 0) {
                    // Set swiftDetails to null to indicate invalid code
                    setSwiftDetails(null);
                    return;
                }

                setSwiftDetails(parseData[0]);
                setFormdata(
                    (prev) =>
                    ({
                        ...prev,
                        fundsDestinationCountry: parseData[0].country_code,
                        beneficiaryCountryCode: parseData[0].country_code,
                        beneficiaryBankName: parseData[0].bank_name,
                        beneficiaryCurrency: formdata?.senderCurrency || parseData[0].country_code,
                        paymentRail: PaymentRail.SWIFT,
                        swiftCode: parseData[0].swift_code,
                        beneficiaryBankAddress: parseData[0].address,
                    } as IPayment)
                );
            }
        } catch (error: any) {
            console.error("Failed to fetch bic details:", error);
        } finally {
            setLoading(false);
        }
    };

    /*
      const fetchSortCodeDetails = async (sortcode: string): Promise<void> => {
          try {
              setLoading(true); // CHANGE THIS TO SORT CODE LOADING STATE
              const res = await fetch(`${Defaults.API_BASE_URL}/transaction/sortcode/${sortcode}`, {
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
                  const parseData: ISortCodeDetailsResponse = Defaults.PARSE_DATA(data.data, storage.client.privateKey, data.handshake);
                  // console.log("SORT CODE details fetched:", parseData);
  
                  if (!parseData) {
                      setSortCodeDetails(null);
                      return;
                  }
  
                  setSortCodeDetails(parseData);
                  setFormdata(prev => ({
                      ...prev,
                      fundsDestinationCountry: "UK", // Sort code is UK specific
                      beneficiaryCountryCode: "UK",
                      beneficiaryBankName: parseData.accountProperties?.institution || "",
                      beneficiaryCurrency: "GBP",
                      paymentRail: PaymentRail.FPS,
                      beneficiarySortCode: sortcode,
                      beneficiaryBankAddress: parseData.branchProperties?.address || "",
                      beneficiaryCity: parseData.branchProperties?.city || "",
                      beneficiaryPostalCode: parseData.branchProperties?.postcode || "",
                      beneficiaryCountry: "United Kingdom"
                  } as IPayment));
              }
          } catch (error: any) {
              console.error('Failed to fetch sort code details:', error);
          } finally {
              setLoading(false);  // CHANGE THIS TO SORT CODE LOADING STATE
          }
      }
      */

    const uploadFile = async (file: File): Promise<void> => {
        const MAX_FILE_SIZE = 20 * 1024 * 1024; // 2MB

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setUploadError(`File exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
            return;
        }

        try {
            setUploadError("");
            setUploading(true);

            const form = new FormData();
            form.append("file", file);

            // clone headers and remove content-type so browser sets boundary
            const headers: Record<string, string> = { ...Defaults.HEADERS } as Record<
                string,
                string
            >;
            if (headers["Content-Type"]) delete headers["Content-Type"];
            if (headers["content-type"]) delete headers["content-type"];

            const res = await fetch(`${Defaults.API_BASE_URL}/upload`, {
                method: "POST",
                headers: {
                    ...headers,
                    "x-rojifi-handshake": storage.client?.publicKey || "",
                    "x-rojifi-deviceid": storage.deviceid || "",
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: form,
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error || "Upload failed");
            if (data.status === Status.SUCCESS) {
                if (!data.handshake)
                    throw new Error(
                        "Unable to process upload response right now, please try again."
                    );
                const parseData: { url: string } = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );

                setFormdata(
                    (prev) =>
                    ({
                        ...prev,
                        paymentInvoice: parseData.url,
                    } as IPayment)
                );
                // setFileUpload(file);
            }
        } catch (err: any) {
            setUploadError(err.message || "File upload failed");
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
                case "beneficiaryIban":
                case "iban":
                    sanitizedValue = value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 34);
                    // IBAN validation will be triggered only when "Validate" button is clicked
                    if (
                        formdata?.senderCurrency &&
                        formdata.senderCurrency === Fiat.USD &&
                        field === "beneficiaryIban" &&
                        String(value).length >= 15
                    ) {
                    }
                    break;
                default:
                    break;
            }
        }

        setFormdata(
            (prev) =>
            ({
                ...(prev ?? {}),
                [field]: sanitizedValue,
                rojifiId: prev?.rojifiId ?? "",
                // sender: (prev?.sender ?? ""),
                senderWallet: prev?.senderWallet ?? "",
                // senderName: (prev?.senderName ?? ""),
                status: prev?.status ?? "pending",
            } as IPayment)
        );
    };

    // ========================================================================
    // PRODUCTION CHANGE: Currency-aware amount validation (uses debitAmountUSD logic)
    // ========================================================================
    // REVERT INSTRUCTIONS: To restore old behavior, replace this entire function with:
    /*
    const isValidAmount = (value: string): boolean => {
        if (!value || value.trim() === "") return false;
        const numericValue = getNumericValue(value.trim());
        if (!numericValue) return false;
        if (!/^\d+(\.\d{0,2})?$/.test(numericValue)) return false;
        const num = parseFloat(numericValue);
        if (num < 15000) return false;
        return num > 0;
    };
    */
    // And update isFieldValid to: return isValidAmount(value);
    // And update validateForm error message to: errors.push("Minimum amount is $15,000");
    // ========================================================================

    // Simplified validation method
    // NOTE: For USD payments, validates the entered amount directly
    // For EUR/GBP payments, validates the USD equivalent (using exchange rate)
    const isValidAmount = (value: string, currency?: string): boolean => {
        if (!value || value.trim() === "") return false;

        const numericValue = getNumericValue(value.trim());
        if (!numericValue) return false;

        if (!/^\d+(\.\d{0,2})?$/.test(numericValue)) return false;

        const num = parseFloat(numericValue);

        // ✅ NEW LOGIC: For EUR/GBP, validate USD equivalent amount
        if (currency && (currency === Fiat.EUR || currency === Fiat.GBP)) {
            // Convert to USD using exchange rate
            if (exchangeRate && exchangeRate.rate > 0) {
                const usdEquivalent = num / exchangeRate.rate;
                if (usdEquivalent < 15000) return false;
                return usdEquivalent > 0;
            }
            // If exchange rate not available, fall back to direct validation
            // (This should not happen in normal flow, but safety fallback)
            if (num < 15000) return false;
            return num > 0;
        }

        // ✅ DEFAULT: For USD payments, validate direct amount
        if (num < 15000) return false;
        return num > 0;
    };

    const isFieldValid = (fieldKey: string, value: string): boolean => {
        if (fieldKey === "beneficiaryAmount") {
            return isValidAmount(value, formdata?.senderCurrency);
        }

        // Simple validation for other common fields
        switch (fieldKey) {
            case "beneficiaryAccountName":
                return /^[A-Za-z\s]+$/.test(value) && value.length > 2;
            case "paymentInvoiceNumber":
                return /^[A-Za-z0-9\s\/_-]+$/.test(value) && value.trim().length > 0;
            case "beneficiaryIban":
                return /^[A-Za-z0-9]+$/.test(value) && value.length >= 15;
            case "purposeOfPayment":
                return /^[A-Za-z0-9\s,.\-]+$/.test(value) && value.length > 5;
            default:
                return value.length > 0; // Basic non-empty validation for other fields
        }
    };

    // Function to check if all required fields are completed for button state
    const isFormComplete = (): boolean => {
        if (!formdata) return false;

        // Core required fields for all payment types
        const coreFields = [
            "beneficiaryAccountName",
            "beneficiaryAmount",
            "reason",
            "paymentInvoice",
            "paymentInvoiceNumber",
            "paymentInvoiceDate",
        ];

        // Check core fields
        for (const field of coreFields) {
            const value = formdata[field as keyof IPayment];
            if (!value || (typeof value === "string" && value.trim() === "")) {
                return false;
            }
        }

        // Check reason description if OTHER is selected
        if (formdata.reason === PurposeOfPayment.OTHER) {
            if (
                !formdata.reasonDescription ||
                formdata.reasonDescription.trim() === ""
            ) {
                return false;
            }
        }

        const fundingCountryISO2: string = getFundsDestinationCountry(
            formdata.swiftCode || ""
        );

        // Currency-specific validations
        if (formdata.senderCurrency === "USD") {
            // USD specific required fields
            if (!formdata.senderName || formdata.senderName.trim() === "")
                return false;

            // Phone number validation for USD
            if (
                !(formdata as any).beneficiaryPhone ||
                (formdata as any).beneficiaryPhone.trim() === ""
            )
                return false;
            if (!(formdata as any).beneficiaryPhoneCode) return false;

            // NEW LOGIC: At least one of IBAN or Account Number must be provided
            const hasIban = formdata.beneficiaryIban && formdata.beneficiaryIban.trim() !== "";
            const hasAccountNumber = formdata.beneficiaryAccountNumber && formdata.beneficiaryAccountNumber.trim() !== "";

            if (!hasIban && !hasAccountNumber) {
                return false; // Neither IBAN nor Account Number provided
            }

            // India specific
            if (
                fundingCountryISO2 === "IN" &&
                (!formdata.beneficiaryIFSC || formdata.beneficiaryIFSC.trim() === "")
            ) {
                return false;
            }

            // US specific - TEMPORARILY COMMENTED OUT - ABA/Routing Validation
            /* if (
                ["US", "PR", "AS", "GU", "MP", "VI"].includes(fundingCountryISO2) &&
                (!formdata.beneficiaryAbaRoutingNumber ||
                    formdata.beneficiaryAbaRoutingNumber.trim() === "")
            ) {
                return false;
            } */

            // TEMPORARILY COMMENTED OUT - Australia BSB Validation
            /* if (
                fundingCountryISO2 === "AU" &&
                (!formdata.beneficiaryBankStateBranch ||
                    formdata.beneficiaryBankStateBranch.trim() === "")
            ) {
                return false;
            } */

            // TEMPORARILY COMMENTED OUT - Canada Institution/Transit Number Validation
            // Canada specific
            /* if (fundingCountryISO2 === "CA") {
                if (
                    !formdata.beneficiaryInstitutionNumber ||
                    formdata.beneficiaryInstitutionNumber.trim() === ""
                )
                    return false;
                if (
                    !formdata.beneficiaryTransitNumber ||
                    formdata.beneficiaryTransitNumber.trim() === ""
                )
                    return false;
            } */

            // South Africa specific
            if (
                fundingCountryISO2 === "ZA" &&
                (!formdata.beneficiaryRoutingCode ||
                    formdata.beneficiaryRoutingCode.trim() === "")
            ) {
                return false;
            }
        } else if (formdata.senderCurrency === "EUR") {
            // EUR specific required fields (excluding IBAN since it's either IBAN or Account Number)
            const eurRequiredFields = [
                "beneficiaryAddress",
                "beneficiaryCity",
                "beneficiaryCountry",
            ];
            for (const field of eurRequiredFields) {
                const value = formdata[field as keyof IPayment];
                if (!value || (typeof value === "string" && value.trim() === "")) {
                    return false;
                }
            }

            // EUR Flow: Require either IBAN or Account Number (not both)
            const hasIban =
                formdata.beneficiaryIban && formdata.beneficiaryIban.trim() !== "";
            const hasAccountNumber =
                formdata.beneficiaryAccountNumber &&
                formdata.beneficiaryAccountNumber.trim() !== "";
            if (!hasIban && !hasAccountNumber) {
                return false;
            }

            // Phone number validation for EUR (required in EUR flow)
            if (
                !(formdata as any).beneficiaryPhone ||
                (formdata as any).beneficiaryPhone.trim() === ""
            )
                return false;
            if (!(formdata as any).beneficiaryPhoneCode) return false;
        } else if (formdata.senderCurrency === "GBP") {
            // ⚠️ SORT CODE VALIDATION TEMPORARILY DISABLED - ADD 'beneficiarySortCode' BACK TO RE-ENABLE
            // GBP specific required fields
            const gbpRequiredFields = [
                "beneficiaryAddress",
                "beneficiaryCity",
                "beneficiaryPostalCode",
                "beneficiaryCountry",
                "beneficiaryAccountNumber",
            ];
            // ⚠️ REMOVED: 'beneficiarySortCode' from required fields - add it back to array above to re-enable
            for (const field of gbpRequiredFields) {
                const value = formdata[field as keyof IPayment];
                if (!value || (typeof value === "string" && value.trim() === "")) {
                    return false;
                }
            }

            // Phone number validation for GBP (required in GBP flow)
            if (
                !(formdata as any).beneficiaryPhone ||
                (formdata as any).beneficiaryPhone.trim() === ""
            )
                return false;
            if (!(formdata as any).beneficiaryPhoneCode) return false;
        }

        return true;
    };

    const validateForm = async (): Promise<{ isValid: boolean; errors: string[] }> => {
        const errors: string[] = [];
        //console.log("senderCurrency: ", formdata?.senderCurrency);

        if (!formdata) {
            errors.push("Form data is missing");
            return { isValid: false, errors };
        }

        // Required fields for all payments
        const requiredFields = [
            { key: "beneficiaryAccountName", label: "Beneficiary Name" },
            { key: "beneficiaryAmount", label: "Beneficiary Amount" },
            { key: "beneficiaryCountry", label: "Beneficiary Country" },
            { key: "beneficiaryBankName", label: "Bank Name" },
            // { key: 'purposeOfPayment', label: 'Purpose of Payment' },
            { key: "paymentInvoiceNumber", label: "Invoice Number" },
            { key: "reason", label: "Reason for Transfer" },
        ];

        // Check required fields
        for (const field of requiredFields) {
            if (
                formdata.senderCurrency &&
                formdata.senderCurrency === "GBP" &&
                field.label !== "Bank Name"
            ) {
                const value = formdata[field.key as keyof IPayment];
                if (!value || (typeof value === "string" && value.trim() === "")) {
                    errors.push(`${field.label} is required`);
                }
            }
        }

        // Validate amount format
        if (formdata.beneficiaryAmount) {
            const numericAmount = parseFloat(
                getNumericValue(formdata.beneficiaryAmount)
            );
            if (!isValidAmount(formdata.beneficiaryAmount, formdata.senderCurrency)) {
                // ✅ NEW LOGIC: Currency-specific error messages
                if (formdata.senderCurrency === Fiat.USD) {
                    if (numericAmount < 15000) {
                        errors.push("Minimum amount is $15,000 USD");
                    } else {
                        errors.push("Please enter a valid amount");
                    }
                } else if (formdata.senderCurrency === Fiat.EUR || formdata.senderCurrency === Fiat.GBP) {
                    // Calculate USD equivalent for error message
                    if (exchangeRate && exchangeRate.rate > 0) {
                        const usdEquivalent = numericAmount / exchangeRate.rate;
                        if (usdEquivalent < 15000) {
                            const symbol = formdata.senderCurrency === Fiat.EUR ? '€' : '£';
                            const minRequired = (15000 * exchangeRate.rate).toFixed(2);
                            errors.push(
                                `Minimum amount is $15,000 USD (approximately ${symbol}${formatNumberWithCommas(minRequired)} ${formdata.senderCurrency})`
                            );
                        } else {
                            errors.push("Please enter a valid amount");
                        }
                    } else {
                        // Fallback if exchange rate not available
                        errors.push("Minimum amount is $15,000 USD equivalent");
                    }
                } else {
                    errors.push("Please enter a valid amount");
                }
            }
        }

        // Validate invoice number format
        if (
            formdata.paymentInvoiceNumber &&
            !isFieldValid("paymentInvoiceNumber", formdata.paymentInvoiceNumber)
        ) {
            errors.push("Invoice number format is invalid");
        }

        const fundingCountryISO2: string = getFundsDestinationCountry(
            formdata.swiftCode
        );

        // Country-specific validations
        if (formdata.senderCurrency && formdata.senderCurrency !== "GBP") {
            // EUR and USD Flow: Allow either IBAN or Account Number (not both required)
            // UPDATED: Removed restrictive ibanlist validation - allow customers to provide either IBAN or Account Number for all countries
            if (formdata.senderCurrency === "EUR" || formdata.senderCurrency === "USD") {
                const hasIban =
                    formdata.beneficiaryIban && formdata.beneficiaryIban.trim() !== "";
                const hasAccountNumber =
                    formdata.beneficiaryAccountNumber &&
                    formdata.beneficiaryAccountNumber.trim() !== "";

                if (!hasIban && !hasAccountNumber) {
                    errors.push("Either IBAN or Account Number is required");
                } else if (
                    hasIban &&
                    !isFieldValid("beneficiaryIban", formdata.beneficiaryIban)
                ) {
                    errors.push("IBAN format is invalid");
                }
            }
            // REMOVED: restrictive ibanlist validation block that was forcing specific countries to only accept IBAN or Account Number
            // This allows all countries to accept either IBAN or Account Number based on what the customer has
        }

        // Specific country validations
        if (
            fundingCountryISO2 === "IN" &&
            (!formdata.beneficiaryIFSC || formdata.beneficiaryIFSC.trim() === "")
        ) {
            errors.push("IFSC Code is required for India");
        }

        // TEMPORARILY COMMENTED OUT - ABA/Routing Validation
        /* if (
            ["US", "PR", "AS", "GU", "MP", "VI"].includes(fundingCountryISO2) &&
            (!formdata.beneficiaryAbaRoutingNumber ||
                formdata.beneficiaryAbaRoutingNumber.trim() === "")
        ) {
            errors.push("ABA/Routing number is required for US payments");
        } */

        // Address validation for certain countries
        if (["CA", "US", "GB", "AU"].includes(fundingCountryISO2)) {
            if (
                !formdata.beneficiaryAddress ||
                formdata.beneficiaryAddress.trim() === ""
            ) {
                errors.push("Beneficiary address is required");
            }
            if (!formdata.beneficiaryCity || formdata.beneficiaryCity.trim() === "") {
                errors.push("Beneficiary city is required");
            }
        }

        // Postal code validation for GBP
        if (formdata.senderCurrency === "GBP") {
            if (
                !formdata.beneficiaryPostalCode ||
                formdata.beneficiaryPostalCode.trim() === ""
            ) {
                errors.push("Postal code is required for GBP payments");
            }
        }

        // State validation when filled (optional field, but must be valid if provided)
        if (formdata.beneficiaryState && formdata.beneficiaryState.trim() !== "") {
            // Validate that the state is valid for the selected country
            const selectedCountry = formdata.beneficiaryCountry?.trim().toLowerCase();
            if (selectedCountry) {
                const { State, Country } = await import("country-state-city");
                const countries = Country.getAllCountries();
                const countryObj = countries.find(
                    (c) => c.name.trim().toLowerCase() === selectedCountry
                );

                if (countryObj) {
                    const states = State.getStatesOfCountry(countryObj.isoCode);
                    const isValidState = states.some(
                        (s) => s.isoCode === formdata.beneficiaryState
                    );

                    if (!isValidState) {
                        errors.push("Please select a valid state/province for the selected country");
                    }
                } else {
                    errors.push("Please select a valid country first");
                }
            }
        }

        // Reason validation
        if (!formdata.reason || formdata.reason.trim() === "") {
            errors.push("Reason for transfer is required");
        }

        // Reason description validation - required if reason is OTHER
        if (formdata.reason === PurposeOfPayment.OTHER) {
            if (
                !formdata.reasonDescription ||
                formdata.reasonDescription.trim() === ""
            ) {
                errors.push("Reason description is required when 'Other' is selected");
            }
        }

        return { isValid: errors.length === 0, errors };
    };

    const handleShowPaymentDetails = async (): Promise<void> => {
        const validation = await validateForm();

        if (!validation.isValid) {
            // Show validation errors in a better way
            setUploadError(
                `Please fix the following:\n• ${validation.errors.join("\n• ")}`
            );

            // Scroll to top to show errors
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setPaymentDetailsModal(true);
    };

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
    };

    const isUSorUKSwift = (swiftCode: string): boolean => {
        const cleaned = swiftCode.trim().toUpperCase();

        if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleaned)) {
            return false;
        }

        const countryCode = cleaned.substring(4, 6);
        return countryCode === 'US' || countryCode === 'GB';
    }

    const processPayment = async (): Promise<void> => {
        if (!formdata || !selectedWallet) return;

        try {
            setPaymentLoading(true);
            setPaymentDetailsModal(false);
            // Show loading state immediately after closing details modal
            handleShowModal("loading");
            Defaults.LOGIN_STATUS();

            // Calculate the USD amount to debit from customer's wallet
            // For USD payments, this equals beneficiaryAmount
            // For EUR/GBP payments, this is the converted amount using exchange rate
            let debitAmountUSD: string;

            if (formdata.senderCurrency === Fiat.USD) {
                // USD payment - debit amount is same as beneficiary amount
                debitAmountUSD = getNumericValue(formdata.beneficiaryAmount || "0");
            } else if (
                formdata.senderCurrency === Fiat.EUR ||
                formdata.senderCurrency === Fiat.GBP
            ) {
                // EUR/GBP payment - calculate USD equivalent using exchange rate
                if (!exchangeRate || !exchangeRate.rate) {
                    throw new Error("Exchange rate not available");
                }
                const foreignAmount = parseFloat(
                    getNumericValue(formdata.beneficiaryAmount || "0")
                );
                const usdEquivalent = foreignAmount / exchangeRate.rate;
                debitAmountUSD = usdEquivalent.toFixed(2);
            } else {
                debitAmountUSD = getNumericValue(formdata.beneficiaryAmount || "0");
            }

            const phoneNumber: string = (formdata as any).beneficiaryPhone
                ? `+${(formdata as any).beneficiaryPhoneCode || ""}${(formdata as any).beneficiaryPhone
                }`
                : "";

            const domesticCountryPayment: boolean = isUSorUKSwift(formdata.swiftCode);
            // Check if beneficiary country is US or UK
            const domesticPayment: boolean =
                formdata.beneficiaryCountry?.trim().toLowerCase() === "united states" ||
                formdata.beneficiaryCountry?.trim().toLowerCase() === "united kingdom";

            const recipient: IExternalAccountsPayload = {
                customerId: storage.sender ? String(storage.sender.providerId) : "",
                name: formdata.beneficiaryAccountName,
                phone: phoneNumber,
                address: {
                    street1: formdata.beneficiaryAddress,
                    city: formdata.beneficiaryCity,
                    ...(domesticPayment === true
                        ? {
                            postalCode: formdata.beneficiaryPostalCode
                                ? formdata.beneficiaryPostalCode.replace(/\s+/g, "")
                                : null,
                        } : {}),
                    ...(domesticPayment === true ? {
                        state: formdata.beneficiaryState || null,
                    } : {}),
                    country: findCountryByName(formdata.beneficiaryCountry)?.iso2,
                },
                bankName:
                    swiftDetails?.bank_name ||
                    sortCodeDetails?.accountProperties?.institution ||
                    formdata.beneficiaryBankName,
                bankAddress: {
                    street1: swiftDetails?.address || sortCodeDetails?.branchProperties?.address,
                    city: swiftDetails?.city || sortCodeDetails?.branchProperties?.city,
                    ...(domesticCountryPayment
                        ? {
                            postalCode: swiftDetails?.postal_code
                                ? String(swiftDetails.postal_code).replace(/\s+/g, "")
                                : "",
                        }
                        : {}),
                    ...(domesticCountryPayment === true
                        ? {
                            state: swiftDetails?.state || "",
                        }
                        : {}),
                    country: swiftDetails?.country_code || "GB",
                },
                swift: {
                    accountNumber: formdata.beneficiaryIban
                        ? null
                        : formdata.beneficiaryAccountNumber || null,
                    iban: formdata.beneficiaryIban || null,
                    bic: formdata.swiftCode || null,
                },
            } as any;

            console.log("Recipient Data:", recipient);
            // return;

            const paymentData: Partial<ITransaction> & {
                walletId: string;
                creatorId: string;
            } = {
                ...formdata,
                sender: storage.sender ? storage.sender._id : "",
                senderWallet: selectedWallet._id,
                senderName: storage.sender ? storage.sender.businessName : "",
                status: TransactionStatus.PENDING,
                type: TransactionType.TRANSFER,
                beneficiaryAmount: getNumericValue(formdata.beneficiaryAmount || "0"),
                fees: [],
                rojifiId: storage.sender ? storage.sender.rojifiId : "",
                walletId: selectedWallet._id,
                creatorId: storage.user ? storage.user._id : "",
                phoneCode: (formdata as any).beneficiaryPhoneCode || "",
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
                        recipientCountry:
                            findCountryByName(formdata.beneficiaryCountry)?.iso2 || "", // beneficiaryCountry
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
                // Amount to debit from customer's USD wallet
                debitAmountUSD: debitAmountUSD,
                // Exchange rate information (for EUR/GBP payments)
                exchangeRate:
                    formdata.senderCurrency !== Fiat.USD
                        ? {
                            rate: exchangeRate?.rate || 0,
                            fromCurrency: Fiat.USD,
                            toCurrency: formdata.senderCurrency,
                            timestamp: exchangeRate?.lastUpdated || new Date(),
                        }
                        : null,
                action: "new-payment",
                txid: "",
                recipient: recipient,
            };

            // console.log("Submitting Payment Data:", payload);
            // return;

            const res = await fetch(`${Defaults.API_BASE_URL}/transaction/`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify(payload),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                await fetchSession();

                // Prepare success modal data
                const successTransactionData = {
                    amount: formdata.beneficiaryAmount || "0",
                    currency: formdata.senderCurrency || "",
                    currencySymbol: selectedWallet?.symbol || "",
                    beneficiaryName: formdata.beneficiaryAccountName || "",
                    beneficiaryAccount:
                        formdata.beneficiaryIban || formdata.beneficiaryAccountNumber || "",
                    bankName:
                        swiftDetails?.bank_name ||
                        sortCodeDetails?.accountProperties?.institution ||
                        formdata.beneficiaryBankName ||
                        "",
                    bankCountry:
                        swiftDetails?.country || formdata.beneficiaryCountry || "",
                    swiftCode: formdata.swiftCode || "",
                    isSwiftTransaction: !!formdata.swiftCode,
                };

                // Show success modal
                handleShowModal("success", undefined, successTransactionData);

                // toast.success('Payment created successfully and is pending approval.');
                // session.updateSession({ ...storage, draftPayment: { ...formdata } });
                // window.location.href = `/dashboard/NGN/transactions`;
            }
        } catch (error: any) {
            console.error("Failed to create payment:", error);
            // Show error modal instead of just setting upload error
            handleShowModal("error", error.message || "Failed to create payment");
        } finally {
            setPaymentLoading(false);
            setPaymentDetailsModal(false);
            // handleShowModal('success');
        }
    };

    // Simplified boolean conditions for rendering payment flows
    const isUSDFlowReady =
        formdata?.senderCurrency === Fiat.USD && swiftDetails !== null && !loading;

    const isEURFlowReady =
        formdata?.senderCurrency === Fiat.EUR &&
        swiftDetails !== null &&
        exchangeRate?.rate > 0 &&
        !exchangeRate.loading &&
        !loading;

    const isGBPFlowReady =
        formdata?.senderCurrency === Fiat.GBP &&
        swiftDetails !== null &&
        exchangeRate?.rate > 0 &&
        !exchangeRate.loading &&
        !loading;

    const showEURLoading =
        formdata?.senderCurrency === Fiat.EUR &&
        swiftDetails !== null &&
        exchangeRate?.loading &&
        !loading;

    const showEURError =
        formdata?.senderCurrency === Fiat.EUR &&
        swiftDetails !== null &&
        !exchangeRate?.loading &&
        (!exchangeRate || exchangeRate.rate <= 0) &&
        !loading;

    const showGBPLoading =
        formdata?.senderCurrency === Fiat.GBP &&
        swiftDetails !== null &&
        exchangeRate?.loading &&
        !loading;

    const showGBPError =
        formdata?.senderCurrency === Fiat.GBP &&
        swiftDetails !== null &&
        !exchangeRate?.loading &&
        (!exchangeRate || exchangeRate.rate <= 0) &&
        !loading &&
        exchangeRate.isLive !== false;

    // Safer way to reset specific form fields
    const resetFormFields = (fieldsToReset: (keyof IPayment)[]): void => {
        setSwiftDetails(null);
        if (!formdata) return;

        const resetValues: Partial<IPayment> = {};

        // Define default values for different field types
        const fieldDefaults: Record<string, any> = {
            // String fields default to empty string
            beneficiaryAccountName: "",
            beneficiaryAmount: "",
            beneficiaryCountry: "",
            beneficiaryCountryCode: "",
            fundsDestinationCountry: "",
            beneficiaryBankName: "",
            beneficiaryCurrency: "",
            beneficiaryAccountNumber: "",
            beneficiaryBankAddress: "",
            beneficiaryIban: "",
            beneficiaryAddress: "",
            beneficiaryCity: "",
            beneficiaryState: "",
            beneficiaryPostalCode: "",
            beneficiaryAbaRoutingNumber: "",
            beneficiaryBankStateBranch: "",
            beneficiaryIFSC: "",
            beneficiaryInstitutionNumber: "",
            beneficiaryTransitNumber: "",
            beneficiaryRoutingCode: "",
            beneficiarySortCode: "",
            swiftCode: "",
            purposeOfPayment: "",
            paymentFor: "",
            reference: "",
            reasonDescription: "",
            paymentInvoiceNumber: "",
            paymentInvoice: "",
            phoneCode: "",
            phoneNumber: "",
            beneficiaryPhone: "",
            beneficiaryPhoneCode: "",
            email: "",
            // Specific defaults for certain fields
            beneficiaryAccountType: "business",
            // Undefined for optional fields
            senderCurrency: undefined,
            paymentRail: undefined,
            reason: undefined,
            paymentInvoiceDate: undefined,
        };

        // Set reset values for specified fields
        fieldsToReset.forEach(field => {
            resetValues[field] = fieldDefaults[field] !== undefined ? fieldDefaults[field] : "";
        });

        // Update formdata with only the specified fields reset
        setFormdata(prev => ({
            ...prev,
            ...resetValues,
            // Preserve required fields that shouldn't be reset
            rojifiId: prev?.rojifiId ?? "",
            sender: prev?.sender ?? "",
            senderWallet: prev?.senderWallet ?? "",
            senderName: prev?.senderName ?? "",
            status: prev?.status ?? "pending",
        } as IPayment));
    };

    return (
        <div className="space-y-6 sm:px-[15px] lg:px-[20px]">
            {/* Validation Errors Display */}
            {uploadError && uploadError.includes("Please fix the following:") && (
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
                                {uploadError.replace("Please fix the following:\n", "")}
                            </div>
                        </div>
                        <button
                            onClick={() => setUploadError("")}
                            className="flex-shrink-0 text-red-400 hover:text-red-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Currency Selection */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-gray-300 transition-colors duration-200">
                <div className="mb-4">
                    <Label className="text-lg font-bold text-gray-800 mb-2 block">
                        Payment Currency <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-gray-600">
                        Choose the currency for your international transfer
                    </p>
                </div>

                <Select
                    value={formdata?.senderCurrency || ""}
                    onValueChange={(value): void => {
                        handleInputChange("senderCurrency", value);
                        resetFormFields([
                            'swiftCode',
                            'beneficiaryAmount',
                            'beneficiaryAccountNumber',
                            'beneficiaryIban',
                            'beneficiaryAccountName',
                            'beneficiaryCountry',
                            'beneficiaryCountryCode',
                            'beneficiaryAddress',
                            'beneficiaryPostalCode',
                            'beneficiaryCity',
                            'beneficiaryState',
                            'paymentInvoice',
                            'paymentInvoiceNumber',
                            'purposeOfPayment',
                            'reason',
                            'fundsDestinationCountry',
                            'reasonDescription',
                            'beneficiaryPhone',
                            'phoneNumber'
                        ]);
                        const selectedWalletData: IWallet | undefined = wallets.find(
                            (wallet) => wallet.currency === value
                        );
                        if (selectedWalletData) {
                            // get only wallet with currency === "USD"
                            const usdWallet = wallets.find(
                                (wallet) => wallet.currency === Fiat.USD
                            );
                            setSelectedWallet(usdWallet || selectedWalletData);
                        }
                        // All currencies now use SWIFT modal for validation
                        setSwiftModal(true);
                    }}
                >
                    <SelectTrigger className="w-full h-14 border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-colors font-medium text-base">
                        <SelectValue placeholder="Select your payment currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {wallets
                            .filter((wallet) => wallet.currency !== Fiat.NGN)
                            .sort((a, b) => {
                                const order = { USD: 1, EUR: 2, GBP: 3 };
                                return (
                                    (order[a.currency as keyof typeof order] || 99) -
                                    (order[b.currency as keyof typeof order] || 99)
                                );
                            })
                            .map((wallet, index) => (
                                <SelectItem key={index} value={wallet.currency}>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={wallet.icon}
                                            alt={`${wallet.currency} icon`}
                                            className="w-5 h-5 rounded-full"
                                        />
                                        <span className="font-medium">{wallet.currency}</span>
                                    </div>
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            </div>

            {formdata?.senderCurrency === "USD" && (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h3 className="text-lg font-bold text-gray-900">SWIFT Code</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Bank identification code for international USD transfers
                            </p>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-medium text-blue-700">
                                Required
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <div
                                className={`group flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 ${formdata.swiftCode
                                    ? "border-green-200 bg-green-50 hover:border-green-300"
                                    : "border-gray-200 bg-gray-50 hover:border-blue-300"
                                    }`}
                            >
                                <div className="flex-1">
                                    {formdata.swiftCode ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                                                    {formdata.swiftCode}
                                                </span>
                                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-3 h-3 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            {swiftDetails && (
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        {swiftDetails.bank_name}
                                                    </span>
                                                    {swiftDetails.country && (
                                                        <span className="text-gray-500">
                                                            {" "}
                                                            • {swiftDetails.country}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">
                                            <div className="font-medium text-gray-700">
                                                Enter SWIFT
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Click Enter to choose your beneficiary bank
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => {
                                        resetFormFields([
                                            'swiftCode',
                                            'beneficiaryAmount',
                                            'beneficiaryAccountNumber',
                                            'beneficiaryIban',
                                            'beneficiaryAccountName',
                                            'beneficiaryCountry',
                                            'beneficiaryCountryCode',
                                            'beneficiaryAddress',
                                            'beneficiaryPostalCode',
                                            'beneficiaryCity',
                                            'beneficiaryState',
                                            'paymentInvoice',
                                            'paymentInvoiceNumber',
                                            'purposeOfPayment',
                                            'reason',
                                            'fundsDestinationCountry',
                                            'reasonDescription',
                                            'beneficiaryPhone',
                                            'phoneNumber'
                                        ]);
                                        setSwiftModal(true);
                                    }}
                                    className={`px-6 py-2.5 font-medium transition-all duration-200 ${formdata.swiftCode
                                        ? "bg-white border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                                        : "bg-blue-600 border-2 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                                        }`}
                                >
                                    {formdata.swiftCode ? "Edit" : "Enter SWIFT"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SWIFT validation card for EUR - same display for all currencies */}
            {formdata?.senderCurrency === "EUR" && (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <h3 className="text-lg font-bold text-gray-900">SWIFT Code</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Bank identification code for international EUR transfers
                            </p>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 rounded-full">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                            <span className="text-xs font-medium text-purple-700">
                                Required
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <div
                                className={`group flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 ${formdata.swiftCode
                                    ? "border-green-200 bg-green-50 hover:border-green-300"
                                    : "border-gray-200 bg-gray-50 hover:border-purple-300"
                                    }`}
                            >
                                <div className="flex-1">
                                    {formdata.swiftCode ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                                                    {formdata.swiftCode}
                                                </span>
                                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-3 h-3 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            {swiftDetails && (
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        {swiftDetails.bank_name}
                                                    </span>
                                                    {swiftDetails.country && (
                                                        <span className="text-gray-500">
                                                            {" "}
                                                            • {swiftDetails.country}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">
                                            <div className="font-medium text-gray-700">
                                                Enter SWIFT
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Click Enter to choose your beneficiary bank
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => {
                                        resetFormFields([
                                            'swiftCode',
                                            'beneficiaryAmount',
                                            'beneficiaryAccountNumber',
                                            'beneficiaryIban',
                                            'beneficiaryAccountName',
                                            'beneficiaryCountry',
                                            'beneficiaryCountryCode',
                                            'beneficiaryAddress',
                                            'beneficiaryPostalCode',
                                            'beneficiaryCity',
                                            'beneficiaryState',
                                            'paymentInvoice',
                                            'paymentInvoiceNumber',
                                            'purposeOfPayment',
                                            'reason',
                                            'fundsDestinationCountry',
                                            'reasonDescription',
                                            'beneficiaryPhone',
                                            'phoneNumber',
                                        ]);
                                        setSwiftModal(true);
                                    }}
                                    className={`px-6 py-2.5 font-medium transition-all duration-200 ${formdata.swiftCode
                                        ? "bg-white border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                                        : "bg-purple-600 border-2 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700"
                                        }`}
                                >
                                    {formdata.swiftCode ? "Edit" : "Enter SWIFT"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SWIFT validation card for GBP - same display for all currencies */}
            {formdata?.senderCurrency === "GBP" && (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                <h3 className="text-lg font-bold text-gray-900">SWIFT Code</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Bank identification code for international GBP transfers
                            </p>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-indigo-50 rounded-full">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            <span className="text-xs font-medium text-indigo-700">
                                Required
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <div
                                className={`group flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 ${formdata.swiftCode
                                    ? "border-green-200 bg-green-50 hover:border-green-300"
                                    : "border-gray-200 bg-gray-50 hover:border-indigo-300"
                                    }`}
                            >
                                <div className="flex-1">
                                    {formdata.swiftCode ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                                                    {formdata.swiftCode}
                                                </span>
                                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-3 h-3 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            {swiftDetails && (
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        {swiftDetails.bank_name}
                                                    </span>
                                                    {swiftDetails.country && (
                                                        <span className="text-gray-500">
                                                            {" "}
                                                            • {swiftDetails.country}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">
                                            <div className="font-medium text-gray-700">
                                                Enter SWIFT
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Click Enter to choose your beneficiary bank
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => {
                                        resetFormFields([
                                            'swiftCode',
                                            'beneficiaryAmount',
                                            'beneficiaryAccountNumber',
                                            'beneficiaryIban',
                                            'beneficiaryAccountName',
                                            'beneficiaryCountry',
                                            'beneficiaryCountryCode',
                                            'beneficiaryAddress',
                                            'beneficiaryPostalCode',
                                            'beneficiaryCity',
                                            'beneficiaryState',
                                            'paymentInvoice',
                                            'paymentInvoiceNumber',
                                            'purposeOfPayment',
                                            'reason',
                                            'fundsDestinationCountry',
                                            'reasonDescription',
                                            'beneficiaryPhone',
                                            'phoneNumber'
                                        ]);
                                        setSwiftModal(true);
                                    }}
                                    className={`px-6 py-2.5 font-medium transition-all duration-200 ${formdata.swiftCode
                                        ? "bg-white border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                                        : "bg-indigo-600 border-2 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700"
                                        }`}
                                >
                                    {formdata.swiftCode ? "Edit" : "Enter SWIFT"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Render payment flow based on selected currency */}
            {isUSDFlowReady && (
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
                    isFormComplete={isFormComplete}
                    onClose={() => {
                        onClose?.();
                    }}
                    action="new-payment"
                />
            )}

            {/* EUR Market Closed Notice */}
            {formdata?.senderCurrency === Fiat.EUR &&
                swiftDetails !== null &&
                !exchangeRate?.loading &&
                exchangeRate?.isLive === false && <MarketClosedNotice currency="EUR" />}

            {isEURFlowReady && exchangeRate?.isLive !== false && (
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
                    onClose={() => onClose?.()} // ✅ Close main PaymentModal
                />
            )}

            {/* GBP Market Closed Notice */}
            {formdata?.senderCurrency === Fiat.GBP &&
                swiftDetails !== null &&
                !exchangeRate?.loading &&
                exchangeRate?.isLive === false && <MarketClosedNotice currency="GBP" />}

            {isGBPFlowReady && exchangeRate?.isLive !== false && (
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
                    onClose={() => onClose?.()} // ✅ Close main PaymentModal
                />
            )}

            {/* Exchange Rate Loading State for EUR */}
            {showEURLoading && (
                <div className="flex flex-col items-center justify-center w-full py-20 bg-gray-50 rounded-2xl border border-gray-200">
                    <Loading />
                    <p className="mt-4 text-sm text-gray-600">
                        Loading payment information...
                    </p>
                </div>
            )}

            {/* Exchange Rate Error State for EUR */}
            {showEURError && (
                <div className="flex items-center justify-between w-full p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3">
                        <X className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">
                            EUR payments are temporarily unavailable
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Exchange Rate Loading State for GBP */}
            {showGBPLoading && (
                <div className="flex flex-col items-center justify-center w-full py-20 bg-gray-50 rounded-2xl border border-gray-200">
                    <Loading />
                    <p className="mt-4 text-sm text-gray-600">
                        Loading payment information...
                    </p>
                </div>
            )}

            {/* Exchange Rate Error State for GBP */}
            {showGBPError && (
                <div className="flex items-center justify-between w-full p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3">
                        <X className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">
                            GBP payments are temporarily unavailable
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Cancel button - shows when actual form flows are not visible OR when market is closed */}
            {(!isUSDFlowReady &&
                !isEURFlowReady &&
                !isGBPFlowReady &&
                !showEURLoading &&
                !showEURError &&
                !showGBPLoading &&
                !showGBPError) ||
                (formdata?.senderCurrency === Fiat.EUR &&
                    swiftDetails !== null &&
                    !exchangeRate?.loading &&
                    exchangeRate?.isLive === false) ||
                (formdata?.senderCurrency === Fiat.GBP &&
                    swiftDetails !== null &&
                    !exchangeRate?.loading &&
                    exchangeRate?.isLive === false) ? (
                <div className="flex flex-col items-end justify-end w-full mt-8">
                    <Button
                        variant="destructive"
                        className="text-white bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                        onClick={() => onClose?.()}
                    >
                        Cancel
                    </Button>
                </div>
            ) : null}

            <BankDetailsModal
                open={swiftmodal}
                onOpenChange={(open: boolean): void => {
                    // This is called when "Continue" is clicked - just close the modal
                    setSwiftModal(open);
                }}
                onCancel={() => {
                    // This is called when "Cancel" is clicked - reset everything
                    setSwiftDetails(null);
                    // COMMENTED OUT - Now only using SWIFT validation for all currencies
                    // setIbanDetails(null);
                    // setSortCodeDetails(null);

                    // reset form input of swift
                    handleInputChange("swiftCode", "");
                    // COMMENTED OUT - IBAN and Sort Code now entered in the form itself
                    // handleInputChange("beneficiaryIban", "");
                    // handleInputChange("beneficiarySortCode", "");

                    setSwiftModal(false);
                }}
                formdata={formdata as IPayment}
                onChange={(field, value): void => handleInputChange(field, value)}
                onCodeEntered={(code: string): void => {
                    // Clear validation data if empty code is provided
                    if (code === "") {
                        setSwiftDetails(null);
                        // COMMENTED OUT - Now only using SWIFT validation
                        // setIbanDetails(null);
                        // setSortCodeDetails(null);
                        return;
                    }

                    // All currencies now use SWIFT validation
                    fetchBicDetails(code);

                    // COMMENTED OUT - IBAN and Sort Code validation moved to form flows
                    // if (formdata?.senderCurrency === Fiat.USD) {
                    //     fetchBicDetails(code);
                    // } else if (formdata?.senderCurrency === Fiat.EUR) {
                    //     fetchIbanDetails(code);
                    // } else if (formdata?.senderCurrency === Fiat.GBP) {
                    //     fetchSortCodeDetails(code);
                    // }
                }}
                loading={loading}
                type="swift"
                swiftDetails={swiftDetails}
                ibanDetails={ibanDetails}
                sortCodeDetails={sortCodeDetails}
            />

            {paymentDetailsModal && !successModal && !modalState && (
                <PaymentDetailsDrawer
                    open={paymentDetailsModal && !successModal && !modalState}
                    onClose={processPayment}
                    onEdit={() => setPaymentDetailsModal(false)}
                    details={{
                        ...(formdata as IPayment),
                        wallet: selectedWallet,
                        swiftDetails: swiftDetails,
                        ibanDetails: ibanDetails,
                    }}
                />
            )}

            {/* Wallet Activation Modal */}
            <Dialog
                open={walletActivationModal}
                onOpenChange={setWalletActivationModal}
            >
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
                                Your {selectedWallet?.currency} wallet needs to be activated
                                before you can make payments.
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
            {successModal && modalState && (
                <PaymentSuccessModal
                    open={successModal}
                    onClose={handleCloseModal}
                    transactionData={successData}
                    state={modalState}
                    onEdit={handleEditPayment}
                    errorMessage={modalErrorMessage}
                />
            )}
        </div>
    );
};
