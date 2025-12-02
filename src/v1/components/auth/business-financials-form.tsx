import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Checkbox } from "@/v1/components/ui/checkbox";
import {
    AlertCircle,
    ArrowUpRight,
    ChevronDownIcon,
    CheckIcon,
    Check,
    ArrowLeft,
    ChevronsUpDownIcon,
} from "lucide-react";
import { Logo } from "@/v1/components/logo";
import { session, SessionData } from "@/v1/session/session";
import { toast } from "sonner";
import Defaults from "@/v1/defaults/defaults";
import { IRequestAccess, IResponse, ISender } from "@/v1/interface/interface";
import { Status } from "@/v1/enums/enums";
import { Link, useParams } from "wouter";
import GlobeWrapper from "../globe";
import { Carousel, carouselItems } from "../carousel";
import { motion, Variants } from "framer-motion";
import { cn } from "@/v1/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/v1/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import countries from "../../data/country_state.json";
import sourceOfWealthOptions from "@/v1/data/wealth";

const logoVariants: Variants = {
    animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.7, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

const anticipatedSourceOptions = [
    { value: "sales_revenue_business_earnings", label: "Sales Revenue/Business Earnings" },
    { value: "customer_funds", label: "Customer Funds" },
    { value: "investors_funds", label: "Investors Funds" },
    { value: "company_treasury", label: "Company Treasury" },
    { value: "crowdfunding", label: "Crowdfunding" },
    { value: "investment_returns", label: "Investment Returns" },
    { value: "loan_debt_financing", label: "Loan/Debt Financing" },
    { value: "ico", label: "ICO (Initial Coin Offering)" },
    { value: "grant", label: "Grant" },
    { value: "other", label: "Other" },
];

const yesNoOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
];

const transactionTypeOptions = [
    { value: "AchTransactions", label: "ACH Transactions" },
    { value: "DomesticWireTransactions", label: "Domestic Wire Transactions" },
    { value: "InternationalWireTransactions", label: "International Wire Transactions" },
    { value: "StablecoinTransactions", label: "Stablecoin Transactions" },
];

const txCountRangeOptions = [
    { value: "Range1To10", label: "1-10 transactions" },
    { value: "Range10To20", label: "10-20 transactions" },
    { value: "Range20To50", label: "20-50 transactions" },
    { value: "Range50To100", label: "50-100 transactions" },
    { value: "Range100Plus", label: "100+ transactions" },
];

const avgUsdValueOptions = [
    { value: "Usd15kTo50k", label: "$15k - $50k" },
    { value: "Usd50kTo100k", label: "$50k - $100k" },
    { value: "Usd100kTo500k", label: "$100k - $500k" },
    { value: "Usd500kTo1m", label: "$500k - $1M" },
    { value: "Usd1mPlus", label: "$1M+" },
];

const settlementCurrencyOptions = [
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "CHF", label: "CHF - Swiss Franc" },
    { value: "CNY", label: "CNY - Chinese Yuan" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "HKD", label: "HKD - Hong Kong Dollar" },
    { value: "NZD", label: "NZD - New Zealand Dollar" },
    { value: "SGD", label: "SGD - Singapore Dollar" },
];

const monthlyVolumeOptions = [
    { value: "Usd500kTo1m", label: "$500k - $1M" },
    { value: "Usd1mTo5m", label: "$1M - $5M" },
    { value: "Usd5mTo10m", label: "$5M - $10M" },
    { value: "Usd10mTo20m", label: "$10M - $20M" },
    { value: "Usd20mTo50m", label: "$20M - $50M" },
    { value: "Usd50mPlus", label: "$50M+" },
];

export function BusinessFinancialsForm() {
    const [completed, _setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotApprove, setIsNotApprove] = useState(false);
    const [countryInfo, setCountryInfo] = useState<any | null>(null);
    const errorRef = useRef<HTMLDivElement>(null);

    // Popover states
    const [regulatedServicesPopover, setRegulatedServicesPopover] = useState(false);
    const [pepPersonPopover, setPepPersonPopover] = useState(false);
    const [transactionTypesPopover, setTransactionTypesPopover] = useState(false);
    const [settlementCurrenciesPopover, setSettlementCurrenciesPopover] = useState(false);
    const [stablecoinTxCountPopover, setStablecoinTxCountPopover] = useState(false);
    const [incomingStablecoinAvgPopover, setIncomingStablecoinAvgPopover] = useState(false);
    const [outgoingStablecoinTxCountPopover, setOutgoingStablecoinTxCountPopover] = useState(false);
    const [outgoingStablecoinAvgPopover, setOutgoingStablecoinAvgPopover] = useState(false);
    const [incomingAchTxCountPopover, setIncomingAchTxCountPopover] = useState(false);
    const [incomingAchAvgPopover, setIncomingAchAvgPopover] = useState(false);
    const [outgoingAchTxCountPopover, setOutgoingAchTxCountPopover] = useState(false);
    const [outgoingAchAvgPopover, setOutgoingAchAvgPopover] = useState(false);
    const [incomingDomesticWireTxCountPopover, setIncomingDomesticWireTxCountPopover] = useState(false);
    const [incomingDomesticWireAvgPopover, setIncomingDomesticWireAvgPopover] = useState(false);
    const [outgoingDomesticWireTxCountPopover, setOutgoingDomesticWireTxCountPopover] = useState(false);
    const [outgoingDomesticWireAvgPopover, setOutgoingDomesticWireAvgPopover] = useState(false);
    const [incomingIntlWireTxCountPopover, setIncomingIntlWireTxCountPopover] = useState(false);
    const [incomingIntlWireAvgPopover, setIncomingIntlWireAvgPopover] = useState(false);
    const [outgoingIntlWireTxCountPopover, setOutgoingIntlWireTxCountPopover] = useState(false);
    const [outgoingIntlWireAvgPopover, setOutgoingIntlWireAvgPopover] = useState(false);
    const [estimatedMonthlyVolumePopover, setEstimatedMonthlyVolumePopover] = useState(false);
    const [transactionOriginCountriesPopover, setTransactionOriginCountriesPopover] = useState(false);
    const [transactionDestinationCountriesPopover, setTransactionDestinationCountriesPopover] = useState(false);

    const [formData, setFormData] = useState({
        // Financial info
        shareCapital: "",
        lastYearTurnover: "",
        companyAssets: "",

        // Multi-select arrays
        sourceOfWealth: [] as string[],
        anticipatedSourceOfFundsOnDunamis: [] as string[],
        transactionOriginCountries: [] as string[],
        transactionDestinationCountries: [] as string[],

        // Boolean fields
        companyProvideRegulatedFinancialServices: null as boolean | null,
        regulatedEntity: "",
        notRegulatedReason: "",
        accountPurpose: "",
        directorOrBeneficialOwnerIsPEPOrUSPerson: null as boolean | null,
        pepOrUsPerson: [] as string[], // New field for names of PEP or US persons

        // Transaction Breakdown
        transactionTypes: [] as string[],
        stablecoinTxCountMonthly: "",
        incomingStablecoinAvgUsdValue: "",
        outgoingStablecoinTxCountMonthly: "",
        outgoingStablecoinAvgUsdValue: "",
        incomingAchTxCountMonthly: "",
        incomingAchAvgUsdValue: "",
        outgoingAchTxCountMonthly: "",
        outgoingAchAvgUsdValue: "",
        incomingDomesticWireTxCountMonthly: "",
        incomingDomesticWireAvgUsdValue: "",
        outgoingDomesticWireTxCountMonthly: "",
        outgoingDomesticWireAvgUsdValue: "",
        incomingInternationalWireTxCountMonthly: "",
        incomingInternationalWireAvgUsdValue: "",
        outgoingInternationalWireTxCountMonthly: "",
        outgoingInternationalWireAvgUsdValue: "",
        preferredSettlementCurrencies: [] as string[],
        estimatedMonthlyVolumeUsd: "",
    });

    const { id } = useParams();
    const storage: SessionData = session.getUserData();

    // Load and verify user authorization
    useEffect(() => {
        loadData();
    }, []);

    // Ensure at least one PEP input when the PEP question is set to true
    useEffect(() => {
        if (
            formData.directorOrBeneficialOwnerIsPEPOrUSPerson === true &&
            formData.pepOrUsPerson.length === 0
        ) {
            setFormData((prev) => ({ ...prev, pepOrUsPerson: [""] }));
        }
    }, [formData.directorOrBeneficialOwnerIsPEPOrUSPerson]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/requestaccess/approved/sender/${id}`, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Unable to process response right now, please try again.");

                const parseData: IRequestAccess & { sender: ISender } = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );

                // setCompleted(parseData.completed);
                const info = countries.find(
                    (c: any) => c.name.toLowerCase() === parseData.country.toLowerCase()
                );
                setCountryInfo(info || null);

                setFormData((prev) => ({
                    ...prev,
                    shareCapital: parseData.sender.shareCapital !== undefined && parseData.sender.shareCapital !== null ? String(parseData.sender.shareCapital) : "",
                    lastYearTurnover: parseData.sender.lastYearTurnover !== undefined && parseData.sender.lastYearTurnover !== null ? String(parseData.sender.lastYearTurnover) : "",
                    companyAssets: parseData.sender.companyAssets !== undefined && parseData.sender.companyAssets !== null ? String(parseData.sender.companyAssets) : "",
                    sourceOfWealth: parseData.sender.sourceOfWealth || [],
                    anticipatedSourceOfFundsOnDunamis: parseData.sender.anticipatedSourceOfFundsOnDunamis || [],
                    transactionOriginCountries: parseData.sender.transactionOriginCountries || [],
                    transactionDestinationCountries: parseData.sender.transactionDestinationCountries || [],
                    companyProvideRegulatedFinancialServices: parseData.sender.companyProvideRegulatedFinancialServices ?? false,
                    regulatedEntity: parseData.sender.regulatedEntity || "",
                    notRegulatedReason: parseData.sender.notRegulatedReason || "",
                    accountPurpose: parseData.sender.accountPurpose || "",
                    directorOrBeneficialOwnerIsPEPOrUSPerson: parseData.sender.directorOrBeneficialOwnerIsPEPOrUSPerson ?? false,
                    pepOrUsPerson: parseData.sender.pepOrUsPerson || [],
                    // others
                    transactionTypes: parseData.sender.transactionTypes || [],
                    stablecoinTxCountMonthly: parseData.sender.stablecoinTxCountMonthly !== undefined && parseData.sender.stablecoinTxCountMonthly !== null ? String(parseData.sender.stablecoinTxCountMonthly) : "",
                    incomingStablecoinAvgUsdValue: parseData.sender.incomingStablecoinAvgUsdValue !== undefined && parseData.sender.incomingStablecoinAvgUsdValue !== null ? String(parseData.sender.incomingStablecoinAvgUsdValue) : "",
                    outgoingStablecoinTxCountMonthly: parseData.sender.outgoingStablecoinTxCountMonthly !== undefined && parseData.sender.outgoingStablecoinTxCountMonthly !== null ? String(parseData.sender.outgoingStablecoinTxCountMonthly) : "",
                    outgoingStablecoinAvgUsdValue: parseData.sender.outgoingStablecoinAvgUsdValue !== undefined && parseData.sender.outgoingStablecoinAvgUsdValue !== null ? String(parseData.sender.outgoingStablecoinAvgUsdValue) : "",
                    incomingAchTxCountMonthly: parseData.sender.incomingAchTxCountMonthly !== undefined && parseData.sender.incomingAchTxCountMonthly !== null ? String(parseData.sender.incomingAchTxCountMonthly) : "",
                    incomingAchAvgUsdValue: parseData.sender.incomingAchAvgUsdValue !== undefined && parseData.sender.incomingAchAvgUsdValue !== null ? String(parseData.sender.incomingAchAvgUsdValue) : "",
                    outgoingAchTxCountMonthly: parseData.sender.outgoingAchTxCountMonthly !== undefined && parseData.sender.outgoingAchTxCountMonthly !== null ? String(parseData.sender.outgoingAchTxCountMonthly) : "",
                    outgoingAchAvgUsdValue: parseData.sender.outgoingAchAvgUsdValue !== undefined && parseData.sender.outgoingAchAvgUsdValue !== null ? String(parseData.sender.outgoingAchAvgUsdValue) : "",
                    incomingDomesticWireTxCountMonthly: parseData.sender.incomingDomesticWireTxCountMonthly !== undefined && parseData.sender.incomingDomesticWireTxCountMonthly !== null ? String(parseData.sender.incomingDomesticWireTxCountMonthly) : "",
                    incomingDomesticWireAvgUsdValue: parseData.sender.incomingDomesticWireAvgUsdValue !== undefined && parseData.sender.incomingDomesticWireAvgUsdValue !== null ? String(parseData.sender.incomingDomesticWireAvgUsdValue) : "",
                    outgoingDomesticWireTxCountMonthly: parseData.sender.outgoingDomesticWireTxCountMonthly !== undefined && parseData.sender.outgoingDomesticWireTxCountMonthly !== null ? String(parseData.sender.outgoingDomesticWireTxCountMonthly) : "",
                    outgoingDomesticWireAvgUsdValue: parseData.sender.outgoingDomesticWireAvgUsdValue !== undefined && parseData.sender.outgoingDomesticWireAvgUsdValue !== null ? String(parseData.sender.outgoingDomesticWireAvgUsdValue) : "",
                    incomingInternationalWireTxCountMonthly: parseData.sender.incomingInternationalWireTxCountMonthly !== undefined && parseData.sender.incomingInternationalWireTxCountMonthly !== null ? String(parseData.sender.incomingInternationalWireTxCountMonthly) : "",
                    incomingInternationalWireAvgUsdValue: parseData.sender.incomingInternationalWireAvgUsdValue !== undefined && parseData.sender.incomingInternationalWireAvgUsdValue !== null ? String(parseData.sender.incomingInternationalWireAvgUsdValue) : "",
                    outgoingInternationalWireTxCountMonthly: parseData.sender.outgoingInternationalWireTxCountMonthly !== undefined && parseData.sender.outgoingInternationalWireTxCountMonthly !== null ? String(parseData.sender.outgoingInternationalWireTxCountMonthly) : "",
                    outgoingInternationalWireAvgUsdValue: parseData.sender.outgoingInternationalWireAvgUsdValue !== undefined && parseData.sender.outgoingInternationalWireAvgUsdValue !== null ? String(parseData.sender.outgoingInternationalWireAvgUsdValue) : "",
                    preferredSettlementCurrencies: parseData.sender.preferredSettlementCurrencies || [],
                    estimatedMonthlyVolumeUsd: parseData.sender.estimatedMonthlyVolumeUsd !== undefined && parseData.sender.estimatedMonthlyVolumeUsd !== null ? String(parseData.sender.estimatedMonthlyVolumeUsd) : "",
                }));
            }
        } catch (error: any) {
            setError(error.message || "Failed to verify authorization");
            setIsNotApprove(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Format number helper
    const formatNumber = (val: string) => (val ? val.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : val);

    // Check if all required fields are filled
    const isFormValid = () => {
        return (
            formData.shareCapital.trim() !== "" &&
            formData.sourceOfWealth.length > 0 &&
            formData.anticipatedSourceOfFundsOnDunamis.length > 0 &&
            formData.companyProvideRegulatedFinancialServices !== null &&
            formData.directorOrBeneficialOwnerIsPEPOrUSPerson !== null &&
            formData.companyAssets.trim() !== "" &&
            (formData.directorOrBeneficialOwnerIsPEPOrUSPerson === true
                ? formData.pepOrUsPerson.length > 0 && formData.pepOrUsPerson.some((n) => n.trim() !== "")
                : true) &&
            formData.lastYearTurnover.trim() !== "" &&
            formData.pepOrUsPerson.every((name) => name.trim() !== "") &&
            // Transaction Breakdown validations
            formData.transactionTypes.length > 0 &&
            formData.stablecoinTxCountMonthly.trim() !== "" &&
            formData.incomingStablecoinAvgUsdValue.trim() !== "" &&
            formData.outgoingStablecoinTxCountMonthly.trim() !== "" &&
            formData.outgoingStablecoinAvgUsdValue.trim() !== "" &&
            formData.incomingAchTxCountMonthly.trim() !== "" &&
            formData.incomingAchAvgUsdValue.trim() !== "" &&
            formData.outgoingAchTxCountMonthly.trim() !== "" &&
            formData.outgoingAchAvgUsdValue.trim() !== "" &&
            formData.incomingDomesticWireTxCountMonthly.trim() !== "" &&
            formData.incomingDomesticWireAvgUsdValue.trim() !== "" &&
            formData.outgoingDomesticWireTxCountMonthly.trim() !== "" &&
            formData.outgoingDomesticWireAvgUsdValue.trim() !== "" &&
            formData.incomingInternationalWireTxCountMonthly.trim() !== "" &&
            formData.incomingInternationalWireAvgUsdValue.trim() !== "" &&
            formData.outgoingInternationalWireTxCountMonthly.trim() !== "" &&
            formData.outgoingInternationalWireAvgUsdValue.trim() !== "" &&
            formData.preferredSettlementCurrencies.length > 0 &&
            formData.estimatedMonthlyVolumeUsd.trim() !== "" &&
            // New required fields
            formData.accountPurpose.trim() !== "" &&
            formData.transactionOriginCountries.length > 0 &&
            formData.transactionDestinationCountries.length > 0 &&
            (formData.companyProvideRegulatedFinancialServices === true
                ? formData.regulatedEntity.trim() !== ""
                : formData.notRegulatedReason.trim() !== "")
        );
    };

    const handleInputChange = (field: string, value: string | boolean | string[]) => {
        let sanitizedValue = value;

        if (typeof value === "string") {
            switch (field) {
                case "shareCapital":
                case "lastYearTurnover":
                case "companyAssets":
                case "expectedMonthlyInboundCryptoPayments":
                case "expectedMonthlyOutboundCryptoPayments":
                case "expectedMonthlyInboundFiatPayments":
                case "expectedMonthlyOutboundFiatPayments":
                    // Allow only numbers and remove any non-digit characters
                    sanitizedValue = value.replace(/[^0-9]/g, "");
                    break;
            }
        }

        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
        setError(null);
    };

    const handleMultiSelectChange = (field: string, value: string, checked: boolean) => {
        setFormData((prev) => {
            const currentArray = prev[field as keyof typeof prev] as string[];
            if (checked) {
                return { ...prev, [field]: [...currentArray, value] };
            } else {
                return { ...prev, [field]: currentArray.filter((item) => item !== value) };
            }
        });
    };

    const handleTransactionTypeChange = (typeName: string) => {
        setFormData((prev) => {
            const currentTypes = prev.transactionTypes;
            const isSelected = currentTypes.includes(typeName);

            if (isSelected) {
                return {
                    ...prev,
                    transactionTypes: currentTypes.filter((t) => t !== typeName),
                };
            } else {
                return {
                    ...prev,
                    transactionTypes: [...currentTypes, typeName],
                };
            }
        });
        setError(null);
    };

    const handleSettlementCurrencyChange = (currencyValue: string) => {
        setFormData((prev) => {
            const currentCurrencies = prev.preferredSettlementCurrencies;
            const isSelected = currentCurrencies.includes(currencyValue);

            if (isSelected) {
                return {
                    ...prev,
                    preferredSettlementCurrencies: currentCurrencies.filter((c) => c !== currencyValue),
                };
            } else {
                return {
                    ...prev,
                    preferredSettlementCurrencies: [...currentCurrencies, currencyValue],
                };
            }
        });
        setError(null);
    };

    const handleTransactionOriginCountriesChange = (countryName: string) => {
        setFormData((prev) => {
            const currentCountries = prev.transactionOriginCountries;
            const isSelected = currentCountries.includes(countryName);

            if (isSelected) {
                return {
                    ...prev,
                    transactionOriginCountries: currentCountries.filter((c) => c !== countryName),
                };
            } else {
                return {
                    ...prev,
                    transactionOriginCountries: [...currentCountries, countryName],
                };
            }
        });
        setError(null);
    };

    const handleTransactionDestinationCountriesChange = (countryName: string) => {
        setFormData((prev) => {
            const currentCountries = prev.transactionDestinationCountries;
            const isSelected = currentCountries.includes(countryName);

            if (isSelected) {
                return {
                    ...prev,
                    transactionDestinationCountries: currentCountries.filter((c) => c !== countryName),
                };
            } else {
                return {
                    ...prev,
                    transactionDestinationCountries: [...currentCountries, countryName],
                };
            }
        });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isFormValid()) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const businessData = {
                mainCompany: {
                    shareCapital: parseInt(formData.shareCapital) || 0,
                    lastYearTurnover: parseInt(formData.lastYearTurnover) || 0,
                    companyAssets: parseInt(formData.companyAssets) || 0,
                    sourceOfWealth: formData.sourceOfWealth || [],
                    anticipatedSourceOfFundsOnDunamis: formData.anticipatedSourceOfFundsOnDunamis || [],
                    companyProvideRegulatedFinancialServices:
                        formData.companyProvideRegulatedFinancialServices ?? false,
                    directorOrBeneficialOwnerIsPEPOrUSPerson:
                        formData.directorOrBeneficialOwnerIsPEPOrUSPerson ?? false,
                    pepOrUsPerson: (formData.pepOrUsPerson || [])
                        .map((n: string) => n.trim())
                        .filter((n: string) => n !== ""),
                },
                transactionBreakdown: {
                    transactionTypes: formData.transactionTypes,
                    stablecoinTxCountMonthly: formData.stablecoinTxCountMonthly,
                    incomingStablecoinAvgUsdValue: formData.incomingStablecoinAvgUsdValue,
                    outgoingStablecoinTxCountMonthly: formData.outgoingStablecoinTxCountMonthly,
                    outgoingStablecoinAvgUsdValue: formData.outgoingStablecoinAvgUsdValue,
                    incomingAchTxCountMonthly: formData.incomingAchTxCountMonthly,
                    incomingAchAvgUsdValue: formData.incomingAchAvgUsdValue,
                    outgoingAchTxCountMonthly: formData.outgoingAchTxCountMonthly,
                    outgoingAchAvgUsdValue: formData.outgoingAchAvgUsdValue,
                    incomingDomesticWireTxCountMonthly: formData.incomingDomesticWireTxCountMonthly,
                    incomingDomesticWireAvgUsdValue: formData.incomingDomesticWireAvgUsdValue,
                    outgoingDomesticWireTxCountMonthly: formData.outgoingDomesticWireTxCountMonthly,
                    outgoingDomesticWireAvgUsdValue: formData.outgoingDomesticWireAvgUsdValue,
                    incomingInternationalWireTxCountMonthly: formData.incomingInternationalWireTxCountMonthly,
                    incomingInternationalWireAvgUsdValue: formData.incomingInternationalWireAvgUsdValue,
                    outgoingInternationalWireTxCountMonthly: formData.outgoingInternationalWireTxCountMonthly,
                    outgoingInternationalWireAvgUsdValue: formData.outgoingInternationalWireAvgUsdValue,
                    preferredSettlementCurrencies: formData.preferredSettlementCurrencies,
                    estimatedMonthlyVolumeUsd: formData.estimatedMonthlyVolumeUsd,
                },
                transactionOriginCountries: formData.transactionOriginCountries,
                transactionDestinationCountries: formData.transactionDestinationCountries,
                isBusinessRegulated: formData.companyProvideRegulatedFinancialServices ?? false,
                regulatedEntity: formData.companyProvideRegulatedFinancialServices
                    ? formData.regulatedEntity
                    : null,
                notRegulatedReason: formData.companyProvideRegulatedFinancialServices
                    ? null
                    : formData.notRegulatedReason,
                accountPurpose: formData.accountPurpose,
            };

            // console.log("Submitting business data:", businessData);
            // return;

            // API call to save financial details
            const res = await fetch(`${Defaults.API_BASE_URL}/auth/business`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: id,
                    businessData: businessData,
                }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success("Financial details saved successfully!");
                window.location.href = `/signup/${id}/verification`;
            }
        } catch (err: any) {
            setError(err.message || "Failed to save financial details");

            setTimeout(() => {
                errorRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-white">
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <motion.div variants={logoVariants} animate="animate">
                        <Logo className="h-16 w-auto" />
                    </motion.div>
                </div>
            </div>
        );
    }

    if (isNotApprove) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-center max-w-lg px-6">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900">Request access required</h2>
                    <p className="mt-2 text-gray-600">
                        You currently don't have access to this page. Please request access to continue.
                    </p>
                    <div className="mt-6">
                        <Link href="/request-access" className="inline-flex">
                            <Button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white">
                                <ArrowUpRight size={18} />
                                Request Access
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                <div className="p-6 max-w-md mx-auto text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Submission Received</h2>
                    <p className="text-gray-600 mb-4">
                        You have successfully submitted your documents. They are under review — you will be
                        notified once the review is complete.
                    </p>
                    <div className="space-y-3">
                        <Button
                            onClick={() => (window.location.href = "/login")}
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => (window.location.href = "/")}
                            className="w-full"
                        >
                            Back to Homepage
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-md mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <button
                                type="button"
                                onClick={() => window.location.href = `/signup/${id}/business-details`}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <Logo className="h-8 w-auto" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Information</h1>
                            <p className="text-gray-600">Complete your financial details</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div
                                    ref={errorRef}
                                    className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-md border border-red-200"
                                >
                                    {error}
                                </div>
                            )}

                            {/* Financial Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>

                                {/* Transaction Origin Countries */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction Origin Countries <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover
                                        open={transactionOriginCountriesPopover}
                                        onOpenChange={setTransactionOriginCountriesPopover}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                <div className="flex items-center gap-2 flex-1 text-left">
                                                    {formData.transactionOriginCountries.length === 0 ? (
                                                        "Select origin countries..."
                                                    ) : formData.transactionOriginCountries.length === 1 ? (
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={`https://flagcdn.com/w320/${countries
                                                                    .find(
                                                                        (country) => country.name === formData.transactionOriginCountries[0]
                                                                    )
                                                                    ?.iso2?.toLowerCase()}.png`}
                                                                alt=""
                                                                width={18}
                                                                height={18}
                                                            />
                                                            {formData.transactionOriginCountries[0]}
                                                        </div>
                                                    ) : (
                                                        `${formData.transactionOriginCountries.length} countries selected`
                                                    )}
                                                </div>
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search countries..." />
                                                <CommandList>
                                                    <CommandEmpty>No country found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {countries.map((country, index) => (
                                                            <CommandItem
                                                                key={`origin-${country.name}-${index}`}
                                                                value={country.name}
                                                                onSelect={() => {
                                                                    handleTransactionOriginCountriesChange(country.name);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.transactionOriginCountries.includes(country.name)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <img
                                                                    src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                                                    alt=""
                                                                    width={18}
                                                                    height={18}
                                                                />
                                                                {country.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {formData.transactionOriginCountries.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {formData.transactionOriginCountries.map((countryName) => (
                                                <div
                                                    key={countryName}
                                                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                                                >
                                                    <img
                                                        src={`https://flagcdn.com/w320/${countries
                                                            .find((country) => country.name === countryName)
                                                            ?.iso2?.toLowerCase()}.png`}
                                                        alt=""
                                                        width={12}
                                                        height={12}
                                                    />
                                                    {countryName}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTransactionOriginCountriesChange(countryName)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Transaction Destination Countries */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction Destination Countries <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover
                                        open={transactionDestinationCountriesPopover}
                                        onOpenChange={setTransactionDestinationCountriesPopover}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                <div className="flex items-center gap-2 flex-1 text-left">
                                                    {formData.transactionDestinationCountries.length === 0 ? (
                                                        "Select destination countries..."
                                                    ) : formData.transactionDestinationCountries.length === 1 ? (
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={`https://flagcdn.com/w320/${countries
                                                                    .find(
                                                                        (country) => country.name === formData.transactionDestinationCountries[0]
                                                                    )
                                                                    ?.iso2?.toLowerCase()}.png`}
                                                                alt=""
                                                                width={18}
                                                                height={18}
                                                            />
                                                            {formData.transactionDestinationCountries[0]}
                                                        </div>
                                                    ) : (
                                                        `${formData.transactionDestinationCountries.length} countries selected`
                                                    )}
                                                </div>
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search countries..." />
                                                <CommandList>
                                                    <CommandEmpty>No country found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {countries.map((country, index) => (
                                                            <CommandItem
                                                                key={`destination-${country.name}-${index}`}
                                                                value={country.name}
                                                                onSelect={() => {
                                                                    handleTransactionDestinationCountriesChange(country.name);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.transactionDestinationCountries.includes(country.name)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <img
                                                                    src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                                                    alt=""
                                                                    width={18}
                                                                    height={18}
                                                                />
                                                                {country.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {formData.transactionDestinationCountries.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {formData.transactionDestinationCountries.map((countryName) => (
                                                <div
                                                    key={countryName}
                                                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                                                >
                                                    <img
                                                        src={`https://flagcdn.com/w320/${countries
                                                            .find((country) => country.name === countryName)
                                                            ?.iso2?.toLowerCase()}.png`}
                                                        alt=""
                                                        width={12}
                                                        height={12}
                                                    />
                                                    {countryName}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTransactionDestinationCountriesChange(countryName)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label
                                        htmlFor="shareCapital"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Share Capital {`(${countryInfo?.currency_symbol || "₦"})`}{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="shareCapital"
                                        name="shareCapital"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter share capital of your company"
                                        value={formatNumber(formData.shareCapital)}
                                        disabled={loading}
                                        onChange={(e) =>
                                            handleInputChange("shareCapital", e.target.value.replace(/,/g, ""))
                                        }
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="lastYearTurnover"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Last Year Turnover {`(${countryInfo?.currency_symbol || "₦"})`}{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="lastYearTurnover"
                                        name="lastYearTurnover"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter last year turnover"
                                        value={formatNumber(formData.lastYearTurnover)}
                                        disabled={loading}
                                        onChange={(e) =>
                                            handleInputChange("lastYearTurnover", e.target.value.replace(/,/g, ""))
                                        }
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="companyAssets"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Company Assets {`(${countryInfo?.currency_symbol || "₦"})`}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="companyAssets"
                                        name="companyAssets"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter company assets"
                                        value={formatNumber(formData.companyAssets)}
                                        disabled={loading}
                                        onChange={(e) =>
                                            handleInputChange("companyAssets", e.target.value.replace(/,/g, ""))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Transaction Breakdown */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Transaction Breakdown</h3>

                                {/* Transaction Types - Multi Select */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction Types <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover
                                        open={transactionTypesPopover}
                                        onOpenChange={setTransactionTypesPopover}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                <div className="flex items-center gap-2 flex-1 text-left">
                                                    {formData.transactionTypes.length === 0
                                                        ? "Select transaction types..."
                                                        : `${formData.transactionTypes.length} type${formData.transactionTypes.length > 1 ? 's' : ''} selected`}
                                                </div>
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {transactionTypeOptions.map((type) => (
                                                            <CommandItem
                                                                key={type.value}
                                                                value={type.label}
                                                                onSelect={() => {
                                                                    handleTransactionTypeChange(type.value);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.transactionTypes.includes(type.value)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {type.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {formData.transactionTypes.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {formData.transactionTypes.map((typeName) => (
                                                <div
                                                    key={typeName}
                                                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                                                >
                                                    {transactionTypeOptions.find((t) => t.value === typeName)?.label}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTransactionTypeChange(typeName)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Stablecoin Transaction Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Incoming Stablecoin Tx Count (Monthly) <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={stablecoinTxCountPopover} onOpenChange={setStablecoinTxCountPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.stablecoinTxCountMonthly
                                                        ? txCountRangeOptions.find((o) => o.value === formData.stablecoinTxCountMonthly)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {txCountRangeOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("stablecoinTxCountMonthly", option.value);
                                                                        setStablecoinTxCountPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.stablecoinTxCountMonthly === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Incoming Stablecoin Avg Value <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={incomingStablecoinAvgPopover} onOpenChange={setIncomingStablecoinAvgPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.incomingStablecoinAvgUsdValue
                                                        ? avgUsdValueOptions.find((o) => o.value === formData.incomingStablecoinAvgUsdValue)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {avgUsdValueOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("incomingStablecoinAvgUsdValue", option.value);
                                                                        setIncomingStablecoinAvgPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.incomingStablecoinAvgUsdValue === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Outgoing Stablecoin Tx Count (Monthly) <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={outgoingStablecoinTxCountPopover} onOpenChange={setOutgoingStablecoinTxCountPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.outgoingStablecoinTxCountMonthly
                                                        ? txCountRangeOptions.find((o) => o.value === formData.outgoingStablecoinTxCountMonthly)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {txCountRangeOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("outgoingStablecoinTxCountMonthly", option.value);
                                                                        setOutgoingStablecoinTxCountPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.outgoingStablecoinTxCountMonthly === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Outgoing Stablecoin Avg Value <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={outgoingStablecoinAvgPopover} onOpenChange={setOutgoingStablecoinAvgPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.outgoingStablecoinAvgUsdValue
                                                        ? avgUsdValueOptions.find((o) => o.value === formData.outgoingStablecoinAvgUsdValue)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {avgUsdValueOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("outgoingStablecoinAvgUsdValue", option.value);
                                                                        setOutgoingStablecoinAvgPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.outgoingStablecoinAvgUsdValue === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* ACH Transaction Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Incoming ACH Tx Count (Monthly) <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={incomingAchTxCountPopover} onOpenChange={setIncomingAchTxCountPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.incomingAchTxCountMonthly
                                                        ? txCountRangeOptions.find((o) => o.value === formData.incomingAchTxCountMonthly)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {txCountRangeOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("incomingAchTxCountMonthly", option.value);
                                                                        setIncomingAchTxCountPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.incomingAchTxCountMonthly === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Incoming ACH Avg Value <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={incomingAchAvgPopover} onOpenChange={setIncomingAchAvgPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.incomingAchAvgUsdValue
                                                        ? avgUsdValueOptions.find((o) => o.value === formData.incomingAchAvgUsdValue)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {avgUsdValueOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("incomingAchAvgUsdValue", option.value);
                                                                        setIncomingAchAvgPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.incomingAchAvgUsdValue === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Outgoing ACH Tx Count (Monthly) <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={outgoingAchTxCountPopover} onOpenChange={setOutgoingAchTxCountPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.outgoingAchTxCountMonthly
                                                        ? txCountRangeOptions.find((o) => o.value === formData.outgoingAchTxCountMonthly)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {txCountRangeOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("outgoingAchTxCountMonthly", option.value);
                                                                        setOutgoingAchTxCountPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.outgoingAchTxCountMonthly === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Outgoing ACH Avg Value <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={outgoingAchAvgPopover} onOpenChange={setOutgoingAchAvgPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.outgoingAchAvgUsdValue
                                                        ? avgUsdValueOptions.find((o) => o.value === formData.outgoingAchAvgUsdValue)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {avgUsdValueOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("outgoingAchAvgUsdValue", option.value);
                                                                        setOutgoingAchAvgPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.outgoingAchAvgUsdValue === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Domestic Wire Transaction Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Incoming Domestic Wire Tx Count (Monthly) <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={incomingDomesticWireTxCountPopover} onOpenChange={setIncomingDomesticWireTxCountPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.incomingDomesticWireTxCountMonthly
                                                        ? txCountRangeOptions.find((o) => o.value === formData.incomingDomesticWireTxCountMonthly)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {txCountRangeOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("incomingDomesticWireTxCountMonthly", option.value);
                                                                        setIncomingDomesticWireTxCountPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.incomingDomesticWireTxCountMonthly === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Incoming Domestic Wire Avg Value <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={incomingDomesticWireAvgPopover} onOpenChange={setIncomingDomesticWireAvgPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.incomingDomesticWireAvgUsdValue
                                                        ? avgUsdValueOptions.find((o) => o.value === formData.incomingDomesticWireAvgUsdValue)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {avgUsdValueOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("incomingDomesticWireAvgUsdValue", option.value);
                                                                        setIncomingDomesticWireAvgPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.incomingDomesticWireAvgUsdValue === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Outgoing Domestic Wire Tx Count (Monthly) <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={outgoingDomesticWireTxCountPopover} onOpenChange={setOutgoingDomesticWireTxCountPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.outgoingDomesticWireTxCountMonthly
                                                        ? txCountRangeOptions.find((o) => o.value === formData.outgoingDomesticWireTxCountMonthly)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {txCountRangeOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("outgoingDomesticWireTxCountMonthly", option.value);
                                                                        setOutgoingDomesticWireTxCountPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.outgoingDomesticWireTxCountMonthly === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Outgoing Domestic Wire Avg Value <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={outgoingDomesticWireAvgPopover} onOpenChange={setOutgoingDomesticWireAvgPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.outgoingDomesticWireAvgUsdValue
                                                        ? avgUsdValueOptions.find((o) => o.value === formData.outgoingDomesticWireAvgUsdValue)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {avgUsdValueOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("outgoingDomesticWireAvgUsdValue", option.value);
                                                                        setOutgoingDomesticWireAvgPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.outgoingDomesticWireAvgUsdValue === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* International Wire Transaction Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Incoming International Wire Tx Count (Monthly) <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={incomingIntlWireTxCountPopover} onOpenChange={setIncomingIntlWireTxCountPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.incomingInternationalWireTxCountMonthly
                                                        ? txCountRangeOptions.find((o) => o.value === formData.incomingInternationalWireTxCountMonthly)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {txCountRangeOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("incomingInternationalWireTxCountMonthly", option.value);
                                                                        setIncomingIntlWireTxCountPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.incomingInternationalWireTxCountMonthly === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Incoming International Wire Avg Value <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={incomingIntlWireAvgPopover} onOpenChange={setIncomingIntlWireAvgPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.incomingInternationalWireAvgUsdValue
                                                        ? avgUsdValueOptions.find((o) => o.value === formData.incomingInternationalWireAvgUsdValue)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {avgUsdValueOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("incomingInternationalWireAvgUsdValue", option.value);
                                                                        setIncomingIntlWireAvgPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.incomingInternationalWireAvgUsdValue === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Outgoing International Wire Tx Count (Monthly) <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={outgoingIntlWireTxCountPopover} onOpenChange={setOutgoingIntlWireTxCountPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.outgoingInternationalWireTxCountMonthly
                                                        ? txCountRangeOptions.find((o) => o.value === formData.outgoingInternationalWireTxCountMonthly)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {txCountRangeOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("outgoingInternationalWireTxCountMonthly", option.value);
                                                                        setOutgoingIntlWireTxCountPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.outgoingInternationalWireTxCountMonthly === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Outgoing International Wire Avg Value <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={outgoingIntlWireAvgPopover} onOpenChange={setOutgoingIntlWireAvgPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.outgoingInternationalWireAvgUsdValue
                                                        ? avgUsdValueOptions.find((o) => o.value === formData.outgoingInternationalWireAvgUsdValue)?.label
                                                        : "Select range..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {avgUsdValueOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("outgoingInternationalWireAvgUsdValue", option.value);
                                                                        setOutgoingIntlWireAvgPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.outgoingInternationalWireAvgUsdValue === option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Preferred Settlement Currencies - Multi Select */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Settlement Currencies <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover
                                        open={settlementCurrenciesPopover}
                                        onOpenChange={setSettlementCurrenciesPopover}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                <div className="flex items-center gap-2 flex-1 text-left">
                                                    {formData.preferredSettlementCurrencies.length === 0
                                                        ? "Select settlement currencies..."
                                                        : `${formData.preferredSettlementCurrencies.length} currenc${formData.preferredSettlementCurrencies.length > 1 ? 'ies' : 'y'} selected`}
                                                </div>
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {settlementCurrencyOptions.map((currency) => (
                                                            <CommandItem
                                                                key={currency.value}
                                                                value={currency.label}
                                                                onSelect={() => {
                                                                    handleSettlementCurrencyChange(currency.value);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.preferredSettlementCurrencies.includes(currency.value)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {currency.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {formData.preferredSettlementCurrencies.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {formData.preferredSettlementCurrencies.map((currencyValue) => (
                                                <div
                                                    key={currencyValue}
                                                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                                                >
                                                    {settlementCurrencyOptions.find((c) => c.value === currencyValue)?.label}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSettlementCurrencyChange(currencyValue)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Estimated Monthly Volume */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimated Monthly Volume (USD) <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={estimatedMonthlyVolumePopover} onOpenChange={setEstimatedMonthlyVolumePopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.estimatedMonthlyVolumeUsd
                                                    ? monthlyVolumeOptions.find((o) => o.value === formData.estimatedMonthlyVolumeUsd)?.label
                                                    : "Select volume range..."}
                                                <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {monthlyVolumeOptions.map((option) => (
                                                            <CommandItem
                                                                key={option.value}
                                                                value={option.label}
                                                                onSelect={() => {
                                                                    handleInputChange("estimatedMonthlyVolumeUsd", option.value);
                                                                    setEstimatedMonthlyVolumePopover(false);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.estimatedMonthlyVolumeUsd === option.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {option.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Source of Wealth */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Source of Wealth <span className="text-red-500">*</span>
                                </h3>
                                <div className="space-y-3">
                                    {sourceOfWealthOptions.map((source) => (
                                        <div key={source.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={source.value}
                                                checked={formData.sourceOfWealth.includes(source.value)}
                                                onCheckedChange={(checked) =>
                                                    handleMultiSelectChange(
                                                        "sourceOfWealth",
                                                        source.value,
                                                        checked as boolean
                                                    )
                                                }
                                                disabled={loading}
                                            />
                                            <Label
                                                htmlFor={source.value}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {source.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formData.sourceOfWealth.length > 0 && (
                                <Alert
                                    variant="default"
                                    className="mt-2 bg-yellow-50 border-yellow-200 text-yellow-800"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    <AlertTitle className="text-sm">Notice</AlertTitle>
                                    <AlertDescription>
                                        We would require documents as proof of your selected source(s) of wealth for
                                        verification.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Anticipated Source of Funds */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Anticipated Source of Funds <span className="text-red-500">*</span>
                                </h3>
                                <div className="space-y-3">
                                    {anticipatedSourceOptions.map((source) => (
                                        <div key={source.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`anticipated-${source.value}`}
                                                checked={formData.anticipatedSourceOfFundsOnDunamis.includes(source.value)}
                                                onCheckedChange={(checked) =>
                                                    handleMultiSelectChange(
                                                        "anticipatedSourceOfFundsOnDunamis",
                                                        source.value,
                                                        checked as boolean
                                                    )
                                                }
                                                disabled={loading}
                                            />
                                            <Label
                                                htmlFor={`anticipated-${source.value}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {source.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formData.anticipatedSourceOfFundsOnDunamis.length > 0 && (
                                <Alert
                                    variant="default"
                                    className="mt-2 bg-yellow-50 border-yellow-200 text-yellow-800"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    <AlertTitle className="text-sm">Notice</AlertTitle>
                                    <AlertDescription>
                                        You may be required to provide documents as proof of your selected anticipated
                                        source(s) of funds for verification.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Compliance Questions */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Compliance</h3>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Does your company provide regulated services?
                                        </Label>
                                        <Popover
                                            open={regulatedServicesPopover}
                                            onOpenChange={setRegulatedServicesPopover}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.companyProvideRegulatedFinancialServices !== null
                                                        ? yesNoOptions.find(
                                                            (option) =>
                                                                option.value === formData.companyProvideRegulatedFinancialServices
                                                        )?.label
                                                        : "Select answer..."
                                                    }
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {yesNoOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value.toString()}
                                                                    className="w-full"
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange(
                                                                            "companyProvideRegulatedFinancialServices",
                                                                            option.value
                                                                        );
                                                                        setRegulatedServicesPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.companyProvideRegulatedFinancialServices ===
                                                                                option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Regulated Entity - Shows when company provides regulated services */}
                                    {formData.companyProvideRegulatedFinancialServices === true && (
                                        <div>
                                            <Label
                                                htmlFor="regulatedEntity"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Please provide the name of the regulating entity and the regulatory registration number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="regulatedEntity"
                                                name="regulatedEntity"
                                                type="text"
                                                className="h-12"
                                                placeholder="Enter the name of the regulating entity"
                                                value={formData.regulatedEntity}
                                                disabled={loading}
                                                onChange={(e) => handleInputChange("regulatedEntity", e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {/* Not Regulated Reason - Shows when company does NOT provide regulated services */}
                                    {formData.companyProvideRegulatedFinancialServices === false && (
                                        <div>
                                            <Label
                                                htmlFor="notRegulatedReason"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Reason for Not Being Regulated <span className="text-red-500">*</span>
                                            </Label>
                                            <textarea
                                                id="notRegulatedReason"
                                                name="notRegulatedReason"
                                                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-vertical"
                                                placeholder="Please explain why your company is not regulated..."
                                                value={formData.notRegulatedReason}
                                                disabled={loading}
                                                onChange={(e) => handleInputChange("notRegulatedReason", e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {/* Account Purpose - Always Required */}
                                    <div>
                                        <Label
                                            htmlFor="accountPurpose"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Account Purpose <span className="text-red-500">*</span>
                                        </Label>
                                        <textarea
                                            id="accountPurpose"
                                            name="accountPurpose"
                                            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-vertical"
                                            placeholder="Describe the primary purpose for opening this account..."
                                            value={formData.accountPurpose}
                                            disabled={loading}
                                            onChange={(e) => handleInputChange("accountPurpose", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Is any director or beneficial owner a PEP (Politically Exposed Person) or US
                                            person?
                                        </Label>
                                        <Popover open={pepPersonPopover} onOpenChange={setPepPersonPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    {formData.directorOrBeneficialOwnerIsPEPOrUSPerson !== null
                                                        ? yesNoOptions.find(
                                                            (option) =>
                                                                option.value === formData.directorOrBeneficialOwnerIsPEPOrUSPerson
                                                        )?.label
                                                        : "Select answer..."}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {yesNoOptions.map((option) => (
                                                                <CommandItem
                                                                    key={option.value.toString()}
                                                                    value={option.label}
                                                                    onSelect={() => {
                                                                        handleInputChange(
                                                                            "directorOrBeneficialOwnerIsPEPOrUSPerson",
                                                                            option.value
                                                                        );
                                                                        setPepPersonPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.directorOrBeneficialOwnerIsPEPOrUSPerson ===
                                                                                option.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {option.label}
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

                            {/** Names of PEP */}
                            {formData.directorOrBeneficialOwnerIsPEPOrUSPerson === true && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        Names of PEP or US persons <span className="text-red-500">*</span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Provide the full names of any politically exposed persons (PEP) or US persons
                                        who are directors or beneficial owners.
                                    </p>

                                    {formData.pepOrUsPerson.map((name, idx) => (
                                        <div key={`pep-${idx}`} className="flex items-center space-x-2">
                                            <Input
                                                id={`pep-${idx}`}
                                                type="text"
                                                placeholder={`Person ${idx + 1} full name`}
                                                value={name}
                                                disabled={loading}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setFormData((prev) => {
                                                        const arr = [...prev.pepOrUsPerson];
                                                        arr[idx] = val;
                                                        return { ...prev, pepOrUsPerson: arr };
                                                    });
                                                }}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setFormData((prev) => {
                                                        const arr = prev.pepOrUsPerson.filter((_, i) => i !== idx);
                                                        return { ...prev, pepOrUsPerson: arr };
                                                    });
                                                }}
                                                className="text-red-500"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}

                                    <div>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    pepOrUsPerson: [...prev.pepOrUsPerson, ""],
                                                }))
                                            }
                                            className="inline-flex items-center space-x-2"
                                        >
                                            <span className="text-lg">+</span>
                                            <span>Add another person</span>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary text-white hover:bg-primary/90"
                                disabled={loading || !isFormValid()}
                            >
                                {loading ? "Saving..." : "Continue"}
                            </Button>

                            <div className="text-center text-sm text-gray-600">
                                Need help?{" "}
                                <a
                                    href="/help"
                                    className="text-primary hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Contact support
                                </a>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="w-[60%] hidden md:block h-full px-10 py-1 bg-primary relative">
                    <div className="mt-12">
                        <Carousel data={carouselItems} interval={4000} />
                    </div>
                    <div className="absolute bottom-5 left-5 px-5 right-0 flex justify-start items-center mt-6 text-white text-lg z-10">
                        &copy; {new Date().getFullYear()} Rojifi. All rights reserved.
                    </div>
                    <div className="absolute -bottom-40 -right-40 flex justify-center items-center mt-6">
                        <GlobeWrapper />
                    </div>
                </div>
            </div>
        </div>
    );
}
