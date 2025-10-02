import type React from "react";
import { useState, useEffect } from "react";
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
import { Command, CommandGroup, CommandItem, CommandList } from "@/v1/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import countries from "../../data/country_state.json";

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

const sourceOfWealthOptions = [
    { value: "sales_revenue_business_earnings", label: "Sales Revenue/Business Earnings" },
    { value: "investors_funds", label: "Investors Funds" },
    { value: "company_treasury", label: "Company Treasury" },
    { value: "crowdfunding", label: "Crowdfunding" },
    { value: "investment_returns", label: "Investment Returns" },
    { value: "loan_debt_financing", label: "Loan/Debt Financing" },
    { value: "ico", label: "ICO (Initial Coin Offering)" },
    { value: "grant", label: "Grant" },
    { value: "other", label: "Other" },
];

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

export function BusinessFinancialsForm() {
    const [completed, _setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotApprove, setIsNotApprove] = useState(false);
    const [countryInfo, setCountryInfo] = useState<any | null>(null);

    // Popover states
    const [regulatedServicesPopover, setRegulatedServicesPopover] = useState(false);
    const [pepPersonPopover, setPepPersonPopover] = useState(false);
    const [offRampService, setOffRampService] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        // Financial info
        shareCapital: "",
        lastYearTurnover: "",
        companyAssets: "",
        expectedMonthlyInboundCryptoPayments: "",
        expectedMonthlyOutboundCryptoPayments: "",
        expectedMonthlyInboundFiatPayments: "",
        expectedMonthlyOutboundFiatPayments: "",

        // Multi-select arrays
        sourceOfWealth: [] as string[],
        anticipatedSourceOfFundsOnDunamis: [] as string[],

        // Boolean fields
        companyProvideRegulatedFinancialServices: null as boolean | null,
        directorOrBeneficialOwnerIsPEPOrUSPerson: null as boolean | null,
        pepOrUsPerson: [] as string[], // New field for names of PEP or US persons
    });

    const { id } = useParams();
    const sd: SessionData = session.getUserData();

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
                    "x-rojifi-handshake": sd.client.publicKey,
                    "x-rojifi-deviceid": sd.deviceid,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Unable to process response right now, please try again.");

                const parseData: IRequestAccess & { sender: ISender } = Defaults.PARSE_DATA(
                    data.data,
                    sd.client.privateKey,
                    data.handshake
                );

                setOffRampService(!!parseData.offRampService);
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
                    expectedMonthlyInboundCryptoPayments: parseData.sender.expectedMonthlyInboundCryptoPayments !== undefined && parseData.sender.expectedMonthlyInboundCryptoPayments !== null ? String(parseData.sender.expectedMonthlyInboundCryptoPayments) : "",
                    expectedMonthlyOutboundCryptoPayments: parseData.sender.expectedMonthlyOutboundCryptoPayments !== undefined && parseData.sender.expectedMonthlyOutboundCryptoPayments !== null ? String(parseData.sender.expectedMonthlyOutboundCryptoPayments) : "",
                    expectedMonthlyInboundFiatPayments: parseData.sender.expectedMonthlyInboundFiatPayments !== undefined && parseData.sender.expectedMonthlyInboundFiatPayments !== null ? String(parseData.sender.expectedMonthlyInboundFiatPayments) : "",
                    expectedMonthlyOutboundFiatPayments: parseData.sender.expectedMonthlyOutboundFiatPayments !== undefined && parseData.sender.expectedMonthlyOutboundFiatPayments !== null ? String(parseData.sender.expectedMonthlyOutboundFiatPayments) : "",
                    sourceOfWealth: parseData.sender.sourceOfWealth || [],
                    anticipatedSourceOfFundsOnDunamis: parseData.sender.anticipatedSourceOfFundsOnDunamis || [],
                    companyProvideRegulatedFinancialServices: parseData.sender.companyProvideRegulatedFinancialServices ?? false,
                    directorOrBeneficialOwnerIsPEPOrUSPerson: parseData.sender.directorOrBeneficialOwnerIsPEPOrUSPerson ?? false,
                    pepOrUsPerson: parseData.sender.pepOrUsPerson || [],
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
            // if PEP question answered Yes, require at least one name
            (formData.directorOrBeneficialOwnerIsPEPOrUSPerson === true
                ? formData.pepOrUsPerson.length > 0 && formData.pepOrUsPerson.some((n) => n.trim() !== "")
                : true) &&
            formData.lastYearTurnover.trim() !== "" &&
            formData.expectedMonthlyInboundFiatPayments.trim() !== "" &&
            formData.expectedMonthlyOutboundFiatPayments.trim() !== "" &&
            (offRampService
                ? formData.expectedMonthlyInboundCryptoPayments.trim() !== "" &&
                formData.expectedMonthlyOutboundCryptoPayments.trim() !== ""
                : true) &&
            formData.pepOrUsPerson.every((name) => name.trim() !== "")
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
                    expectedMonthlyInboundCryptoPayments:
                        parseInt(formData.expectedMonthlyInboundCryptoPayments) || 0,
                    expectedMonthlyOutboundCryptoPayments:
                        parseInt(formData.expectedMonthlyOutboundCryptoPayments) || 0,
                    expectedMonthlyInboundFiatPayments:
                        parseInt(formData.expectedMonthlyInboundFiatPayments) || 0,
                    expectedMonthlyOutboundFiatPayments:
                        parseInt(formData.expectedMonthlyOutboundFiatPayments) || 0,
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
            };

            // API call to save financial details
            const res = await fetch(`${Defaults.API_BASE_URL}/auth/business`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    "x-rojifi-handshake": sd.client.publicKey,
                    "x-rojifi-deviceid": sd.deviceid,
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
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            {/* Financial Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>

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

                                {offRampService && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                htmlFor="expectedMonthlyInboundCryptoPayments"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Monthly Inbound Crypto {"($)"} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="expectedMonthlyInboundCryptoPayments"
                                                name="expectedMonthlyInboundCryptoPayments"
                                                type="text"
                                                className="h-12"
                                                placeholder="Estimated expected amount"
                                                value={formatNumber(formData.expectedMonthlyInboundCryptoPayments)}
                                                disabled={loading}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "expectedMonthlyInboundCryptoPayments",
                                                        e.target.value.replace(/,/g, "")
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="expectedMonthlyOutboundCryptoPayments"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Monthly Outbound Crypto {"($)"} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="expectedMonthlyOutboundCryptoPayments"
                                                name="expectedMonthlyOutboundCryptoPayments"
                                                type="text"
                                                className="h-12"
                                                placeholder="Estimated expected amount"
                                                value={formatNumber(formData.expectedMonthlyOutboundCryptoPayments)}
                                                disabled={loading}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "expectedMonthlyOutboundCryptoPayments",
                                                        e.target.value.replace(/,/g, "")
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label
                                            htmlFor="expectedMonthlyInboundFiatPayments"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Monthly Inbound Fiat {`(${countryInfo?.currency_symbol || "₦"})`}{" "}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="expectedMonthlyInboundFiatPayments"
                                            name="expectedMonthlyInboundFiatPayments"
                                            type="text"
                                            className="h-12"
                                            placeholder="Estimated expected amount"
                                            value={formatNumber(formData.expectedMonthlyInboundFiatPayments)}
                                            disabled={loading}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "expectedMonthlyInboundFiatPayments",
                                                    e.target.value.replace(/,/g, "")
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="expectedMonthlyOutboundFiatPayments"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Monthly Outbound Fiat {`(${countryInfo?.currency_symbol || "₦"})`}{" "}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="expectedMonthlyOutboundFiatPayments"
                                            name="expectedMonthlyOutboundFiatPayments"
                                            type="text"
                                            className="h-12"
                                            placeholder="Estimated expected amount"
                                            value={formatNumber(formData.expectedMonthlyOutboundFiatPayments)}
                                            disabled={loading}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "expectedMonthlyOutboundFiatPayments",
                                                    e.target.value.replace(/,/g, "")
                                                )
                                            }
                                        />
                                    </div>
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
                                            Does your company provide regulated financial services?
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
