import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import {
    ChevronsUpDownIcon,
    CheckIcon,
    CalendarIcon,
    AlertCircle,
    ArrowUpRight,
    Check,
    Loader,
} from "lucide-react";
import { Logo } from "@/v1/components/logo";
import { session, SessionData } from "@/v1/session/session";
import { toast } from "sonner";
import Defaults from "@/v1/defaults/defaults";
import { IRequestAccess, IResponse, ISender, ISmileIdBusinessResponse } from "@/v1/interface/interface";
import { cn } from "@/v1/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import { Calendar } from "@/v1/components/ui/calendar";
import { Status } from "@/v1/enums/enums";
import { Link, useParams } from "wouter";
import GlobeWrapper from "../globe";
import { Carousel, carouselItems } from "../carousel";
import { motion, Variants } from "framer-motion";
import { format } from "date-fns";
import countries from "../../data/country_state.json";
import { Checkbox } from "../ui/checkbox";
import { Country } from "country-state-city";
import { industryOptions } from "@/v1/data/industries";
import BusinessActivitiesOptions from "@/v1/data/activites";

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

const companyActivityOptions = [
    ...industryOptions,
];

const legalForms = [
    { value: "SARL", label: "SARL (Limited Liability Company)" },
    { value: "SA", label: "SA (Public Limited Company)" },
    { value: "SAS", label: "SAS (Simplified Joint Stock Company)" },
    { value: "SASU", label: "SASU (Single Shareholder SAS)" },
    { value: "EURL", label: "EURL (Single Member SARL)" },
    { value: "SNC", label: "SNC (General Partnership)" },
    { value: "LLC", label: "LLC (Limited Liability Company)" },
    { value: "Corporation", label: "Corporation" },
    { value: "Partnership", label: "Partnership, Business Name" },
    { value: "Sole_Proprietorship", label: "Sole Proprietorship, Business Name" },
    { value: "LTD", label: "LTD (Private Limited Company)" },
    { value: "PLC", label: "PLC (Public Limited Company)" },
    { value: "OTHERS", label: "Others" },
];

const customerBaseBreakdownOptions = [
    { value: "Retail", label: "100% Retail Customers" },
    { value: "Corporate", label: "100% Corporate/Business Customers" },
    { value: "Retail75", label: "Mostly Retail (75% Retail, 25% Corporate)" },
    { value: "Retail50", label: "Equal Mix (50% Retail, 50% Corporate)" },
    { value: "Retail25", label: "Mostly Corporate (25% Retail, 75% Corporate)" },
];

export function BusinessDetailsForm() {
    const [completed, _setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotApprove, setIsNotApprove] = useState(false);
    const errorRef = useRef<HTMLDivElement>(null);

    const [countryPopover, setCountryPopover] = useState(false);
    const [actualCountryPopover, setActualCountryPopover] = useState(false);
    const [activityPopover, setActivityPopover] = useState(false);
    const [businessActivityPopover, setBusinessActivityPopover] = useState(false);
    const [countriesOfOperationPopover, setCountriesOfOperationPopover] = useState(false);
    const [customerBaseBreakdownPopover, setCustomerBaseBreakdownPopover] = useState(false);
    const [legalFormPopover, setLegalFormPopover] = useState(false);
    const [registrationDatePopover, setRegistrationDatePopover] = useState(false);
    const [isWebsiteValid, setIsWebsiteValid] = useState(true);
    const [businessLoading, setBusinessLoading] = useState(false);
    const [_businessDetails, setBusinessDetails] = useState<ISmileIdBusinessResponse | null>(null);
    const [_taxDetails, setTaxDetails] = useState<any>(null);
    const [taxLoading, setTaxLoading] = useState(false);
    const [taxVerified, setTaxVerified] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        // Company basic info
        name: "",
        country: "Nigeria",
        registrationNumber: "",
        website: "",
        legalForm: "",
        companyActivity: [] as string[],
        status: "",
        registrationDate: undefined as Date | undefined,
        onboardingDate: undefined as Date | undefined,
        tradingName: "",
        countriesOfOperation: [] as string[],

        // Address
        streetAddress: "",
        streetAddress2: "",
        city: "",
        state: "",
        region: "",
        postalCode: "",
        // Whether actual operations address matches registered address
        actualOperationsAndRegisteredAddressesMatch: true,
        // Actual operations address (required if match === false)
        actualOperationsAddress: {
            streetAddress: "",
            streetAddress2: "",
            city: "",
            state: "",
            region: "",
            postalCode: "",
            country: "",
        },
        taxId: "",
        businessIndustryType: "",
        businessModel: "",
        customerBaseBreakdown: "",
    });

    const { id } = useParams();
    const storage: SessionData = session.getUserData();

    const isValidWebsite = (website: string) => {
        if (!website.trim()) return true; // Empty is valid since it's optional

        const cleanWebsite = website.replace(/^https?:\/\//, '').trim();
        const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/;

        // Allow www. prefix
        const withWwwPattern = /^www\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/;

        return domainPattern.test(cleanWebsite) || withWwwPattern.test(cleanWebsite);
    };

    const formatWebsiteForSubmission = (website: string) => {
        if (!website.trim()) return '';

        // Clean the input
        let cleanWebsite = website.replace(/^https?:\/\//, '').trim();

        // Remove trailing slash if present
        cleanWebsite = cleanWebsite.replace(/\/$/, '');

        return `https://${cleanWebsite}`;
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/requestaccess/approved/sender/${id}`, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
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

                // console.log("Parsed request access data:", parseData);
                // setCompleted(parseData.completed);
                setFormData((prev) => ({
                    ...prev,
                    name: parseData.sender.businessName || "",
                    tradingName: parseData.sender.tradingName || "",
                    country: parseData.sender.country || "",
                    website: parseData.sender.website
                        ? parseData.sender.website.replace(/^https?:\/\//, "")
                        : "",
                    city: parseData.sender.city || "",
                    state: parseData.sender.state || "",
                    streetAddress: parseData.sender.streetAddress || "",
                    streetAddress2: parseData.sender.streetAddress2 || "",
                    postalCode: parseData.sender.postalCode || "",
                    region: parseData.sender.region || "",
                    registrationNumber: parseData.sender.businessRegistrationNumber || "",
                    companyActivity: Array.isArray(parseData.sender.companyActivity)
                        ? parseData.sender.companyActivity
                        : parseData.sender.companyActivity
                            ? [parseData.sender.companyActivity]
                            : [],
                    registrationDate: parseData.sender.dateOfIncorporation || "",
                    countriesOfOperation: parseData.sender.countriesOfOperations || [],
                    actualOperationsAndRegisteredAddressesMatch: parseData.sender.actualOperationsAndRegisteredAddressesMatch ?? true,
                    actualOperationsAddress: {
                        streetAddress: parseData.sender.actualOperationsAddress?.streetAddress || "",
                        streetAddress2: parseData.sender.actualOperationsAddress?.streetAddress2 || "",
                        city: parseData.sender.actualOperationsAddress?.city || "",
                        state: parseData.sender.actualOperationsAddress?.state || "",
                        region: parseData.sender.actualOperationsAddress?.region || "",
                        postalCode: parseData.sender.actualOperationsAddress?.postalCode || "",
                        country: parseData.sender.actualOperationsAddress?.country || "",
                    },
                    legalForm: parseData.sender.legalForm || "",
                    taxId: parseData.sender.taxIdentificationNumber || "",
                    businessIndustryType: parseData.sender.businessIndustryType || "",
                    businessModel: parseData.sender.businessModel || "",
                    customerBaseBreakdown: parseData.sender.customerBaseBreakdown || "",
                }));
            }
        } catch (error: any) {
            setError(error.message || "Failed to verify authorization");
            setIsNotApprove(true);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        return (
            formData.name.trim() !== "" &&
            formData.country.trim() !== "" &&
            formData.registrationNumber.trim() !== "" &&
            formData.legalForm.trim() !== "" &&
            formData.businessIndustryType.trim() !== "" &&
            formData.businessModel?.trim() !== "" &&
            formData.customerBaseBreakdown.trim() !== "" &&
            // formData.companyActivity.trim() !== "" &&
            formData.countriesOfOperation.length > 0 &&
            formData.streetAddress.trim() !== "" &&
            formData.city.trim() !== "" &&
            formData.state.trim() !== "" &&
            formData.postalCode.trim() !== "" &&
            // If actual operations address does not match, require its fields
            (formData.actualOperationsAndRegisteredAddressesMatch ||
                (formData.actualOperationsAddress.streetAddress.trim() !== "" &&
                    formData.actualOperationsAddress.city.trim() !== "" &&
                    formData.actualOperationsAddress.state.trim() !== "" &&
                    formData.actualOperationsAddress.postalCode.trim() !== "" &&
                    formData.actualOperationsAddress.country.trim() !== "")) &&
            // formData.tradingName.trim() !== "" &&
            formData.registrationDate !== undefined
        );
    };

    const sanitizeValue = (field: string, value: string | boolean | Date | string[]) => {
        if (typeof value !== "string") return value;
        switch (field) {
            case "name":
            case "tradingName":
                return value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "");
            case "registrationNumber":
                return value.replace(/[^a-zA-Z0-9\-\/_\s]/g, "").replace(/\s+/g, " ");
            case "website":
                return value.replace(/[^a-zA-Z0-9\.\-_/:?=&%#]/g, "").toLowerCase();
            case "streetAddress":
            case "streetAddress2":
            case "city":
            case "state":
            case "region":
            case "country":
                return value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "");
            case "postalCode":
                return value.replace(/[^a-zA-Z0-9]/g, "");
            default:
                return value;
        }
    };

    const handleInputChange = (field: string, value: string | boolean | Date | string[]) => {
        const sanitizedValue = sanitizeValue(field, value);
        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
        if (field === "website") {
            setIsWebsiteValid(isValidWebsite(String(sanitizedValue)));
        }
        setError(null);
    };

    const handleNestedInputChange = (
        parent: string,
        field: string,
        value: string | boolean | Date | string[]
    ) => {
        const sanitizedValue = sanitizeValue(field, value);
        setFormData((prev: any) => ({
            ...prev,
            [parent]: {
                ...(prev as any)[parent],
                [field]: sanitizedValue,
            },
        }));
        setError(null);
    };

    const handleCountriesOfOperationChange = (countryName: string) => {
        setFormData((prev) => {
            const currentCountries = prev.countriesOfOperation;
            const isSelected = currentCountries.includes(countryName);

            if (isSelected) {
                // Remove country
                return {
                    ...prev,
                    countriesOfOperation: currentCountries.filter((c) => c !== countryName),
                };
            } else {
                // Add country
                return {
                    ...prev,
                    countriesOfOperation: [...currentCountries, countryName],
                };
            }
        });
        setError(null);
    };

    const handleCompanyActivityChange = (activityValue: string) => {
        setFormData((prev) => {
            const currentActivities = prev.companyActivity;
            const isSelected = currentActivities.includes(activityValue);

            if (isSelected) {
                // Remove activity
                return {
                    ...prev,
                    companyActivity: currentActivities.filter((a) => a !== activityValue),
                };
            } else {
                // Add activity
                return {
                    ...prev,
                    companyActivity: [...currentActivities, activityValue],
                };
            }
        });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();
        setError(null);

        if (!isFormValid()) {
            setError("Please fill in all required fields");
            // Auto-scroll to error message
            setTimeout(() => {
                errorRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
            return;
        }

        setLoading(true);

        try {
            const businessData = {
                mainCompany: {
                    name: formData.name,
                    country: formData.country,
                    registrationNumber: formData.registrationNumber,
                    website: formatWebsiteForSubmission(formData.website),
                    legalForm: formData.legalForm,
                    companyActivity: formData.companyActivity,
                    registrationDate: formData.registrationDate
                        ? format(formData.registrationDate, "yyyy-MM-dd")
                        : "",
                    onboardingDate: format(new Date(), "yyyy-MM-dd"), // Set to current date
                    registeredAddress: {
                        streetAddress: formData.streetAddress,
                        streetAddress2: formData.streetAddress2,
                        city: formData.city,
                        state: formData.state,
                        region: formData.region,
                        country: formData.country,
                        postalCode: formData.postalCode,
                    },
                    actualOperationsAndRegisteredAddressesMatch:
                        formData.actualOperationsAndRegisteredAddressesMatch,
                    countriesOfOperation: formData.countriesOfOperation,
                    actualOperationsAddress: formData.actualOperationsAndRegisteredAddressesMatch
                        ? undefined
                        : {
                            streetAddress: formData.actualOperationsAddress.streetAddress,
                            streetAddress2: formData.actualOperationsAddress.streetAddress2,
                            city: formData.actualOperationsAddress.city,
                            state: formData.actualOperationsAddress.state,
                            region: formData.actualOperationsAddress.region,
                            country: formData.actualOperationsAddress.country,
                            postalCode: formData.actualOperationsAddress.postalCode,
                        },
                },
                tradingName: formData.tradingName,
                taxId: formData.taxId,
                taxVerified: taxVerified,
                businessIndustryType: formData.businessIndustryType,
                businessModel: formData.businessModel,
                customerBaseBreakdown: formData.customerBaseBreakdown,
                businessIndustries: formData.companyActivity,
            };

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
                    businessData,
                }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success("Business details saved successfully!");
                window.location.href = `/signup/${id}/business-financials`;
            }
        } catch (err: any) {
            setError(err.message || "Failed to save business details");
            // Auto-scroll to error message
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

    const fetchBusinessDetails = async (businessRegNum: string) => {
        try {
            setBusinessLoading(true);
            const countryCode = Country.getAllCountries().find(c => c.name === formData.country)?.isoCode;
            if (!countryCode) throw new Error('Invalid country selected.');
            if (!businessRegNum) throw new Error('Business registration number is required.');

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/verify/business`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': storage.client.publicKey,
                    'x-rojifi-deviceid': storage.deviceid,
                },
                body: JSON.stringify({
                    countryCode: countryCode,
                    registrationNumber: businessRegNum,
                    businessType: 'bn',
                    rojifiId: id,
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Invalid response');
                const parseData: ISmileIdBusinessResponse = Defaults.PARSE_DATA(data.data, storage.client.privateKey, data.handshake);

                // Validate that we have valid company information before using it
                if (!parseData || !parseData.company_information) {
                    console.warn("No valid business data received from SmileID");
                    return;
                }

                // console.log("Fetched business details:", parseData);
                setBusinessDetails(parseData);
                session.login({
                    ...storage,
                    smileid_business_response: parseData,
                    smileid_business_lastChecked: new Date()
                });

                // Only update form fields if we have valid data
                setFormData((prev) => ({
                    ...prev,
                    name: parseData.company_information?.legal_name || prev.name,
                    registrationNumber: businessRegNum,
                    registrationDate: parseData.company_information?.registration_date ? new Date(parseData.company_information.registration_date) : prev.registrationDate,
                    // leave empty if tax_id: "Not Available"
                    taxId: parseData.company_information?.tax_id && parseData.company_information.tax_id !== "Not Available" ? parseData.company_information.tax_id : prev.taxId,
                }));
            }
        } catch (error: any) {
            console.error("Error fetching business details:", error);
            // Silently fail - let user fill the form manually
        } finally {
            setBusinessLoading(false);
        }
    }

    const fetchTaxDetails = async (taxId: string) => {
        try {
            setTaxLoading(true);
            const countryCode = Country.getAllCountries().find(c => c.name === formData.country)?.isoCode;
            if (!countryCode) throw new Error('Invalid country selected.');
            if (!taxId) throw new Error('Tax ID is required.');

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/verify/taxid`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': storage.client.publicKey,
                    'x-rojifi-deviceid': storage.deviceid,
                },
                body: JSON.stringify({
                    countryCode: countryCode,
                    taxId: taxId,
                    rojifiId: id,
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Invalid response');
                const parseData: ISmileIdBusinessResponse = Defaults.PARSE_DATA(data.data, storage.client.privateKey, data.handshake);

                // Validate that we have valid tax data before using it
                if (!parseData || !parseData.company_information) {
                    console.warn("No valid tax data received from SmileID");
                    return;
                }

                console.log("Fetched tax details:", parseData);
                setTaxDetails(parseData);
                setTaxVerified(true);
            }
        } catch (error: any) {
            console.error("Error fetching tax details:", error);
            // Silently fail - let user fill the form manually
        } finally {
            setTaxLoading(false);
        }
    }

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
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <Logo className="h-8 w-auto" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h1>
                            <p className="text-gray-600">Complete your business information</p>
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

                            {/* Company Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Company Information</h3>

                                <div>
                                    <Label
                                        htmlFor="registrationNumber"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Company Registration Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="registrationNumber"
                                        name="registrationNumber"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter registration number"
                                        value={formData.registrationNumber}
                                        disabled={loading}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            handleInputChange("registrationNumber", e.target.value);
                                            const businessRegNum = e.target.value;
                                            if (businessRegNum.length >= 7) {
                                                fetchBusinessDetails(businessRegNum);
                                            }
                                        }}
                                    />
                                    <div className={`items-center gap-2 text-gray-500 text-xs mt-1 ${businessLoading ? "flex" : "hidden"}`}>
                                        <Loader size={16} className={cn("animate-spin")} />
                                        Validating...
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter company name"
                                        value={formData.name}
                                        disabled={businessLoading || loading}
                                        autoComplete="off"
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="tradingName"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Trading Name (If different from company name)
                                    </Label>
                                    <Input
                                        id="tradingName"
                                        name="tradingName"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter Trading Name"
                                        value={formData.tradingName}
                                        disabled={loading}
                                        autoComplete="off"
                                        onChange={(e) => handleInputChange("tradingName", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="taxId"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Tax Identification Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="taxId"
                                        name="taxId"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter Tax Identification Number"
                                        value={formData.taxId}
                                        disabled={loading}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            handleInputChange("taxId", e.target.value);
                                            const taxId = e.target.value;
                                            if (taxId.length >= 10) {
                                                fetchTaxDetails(taxId);
                                            }
                                        }}
                                    />
                                    <div className={`items-center gap-2 text-gray-500 text-xs mt-1 ${taxLoading ? "flex" : "hidden"}`}>
                                        <Loader size={16} className={cn("animate-spin")} />
                                        Validating...
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-3">
                                        Website <span className="text-gray-400 font-normal">(Optional)</span>
                                    </Label>
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                                <div className="flex items-center bg-gray-50 rounded-md px-2 py-1 border-r border-gray-200">
                                                    <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-gray-600 text-sm font-medium select-none">https://</span>
                                                </div>
                                            </div>
                                            <Input
                                                id="website"
                                                name="website"
                                                type="text"
                                                className={cn(
                                                    "h-12 pl-28 pr-4 text-gray-900 placeholder-gray-400 border-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg",
                                                    formData.website && !isWebsiteValid
                                                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 bg-red-50"
                                                        : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white hover:border-gray-300",
                                                    loading && "opacity-75 cursor-not-allowed"
                                                )}
                                                placeholder="www.yourcompany.com"
                                                value={formData.website}
                                                disabled={loading}
                                                autoComplete="off"
                                                onChange={(e) => handleInputChange("website", e.target.value)}
                                            />
                                            {formData.website && isWebsiteValid && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {formData.website && !isWebsiteValid ? (
                                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <p className="text-red-700 text-sm font-medium">Invalid website format</p>
                                                    <p className="text-red-600 text-xs mt-1">Please enter a valid domain like <code className="bg-red-100 px-1 rounded">example.com</code> or <code className="bg-red-100 px-1 rounded">www.example.com</code></p>
                                                </div>
                                            </div>
                                        ) : formData.website && isWebsiteValid ? (
                                            <div className="flex items-center gap-2 text-green-600 text-xs">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span>Valid website format</span>
                                            </div>
                                        ) : null}

                                        {!formData.website && (
                                            <p className="text-gray-500 text-xs flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                We'll automatically add "https://" to your website
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Legal Form Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Legal Form <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={legalFormPopover} onOpenChange={setLegalFormPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.legalForm
                                                    ? legalForms.find((form) => form.value === formData.legalForm)?.label
                                                    : "Select legal form..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search legal form..." />
                                                <CommandList>
                                                    <CommandEmpty>No legal form found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {legalForms
                                                            .filter((form) =>
                                                                [
                                                                    "Partnership",
                                                                    "Sole_Proprietorship",
                                                                    "LTD",
                                                                    "PLC",
                                                                    "OTHERS",
                                                                ].includes(form.value)
                                                            )
                                                            .map((form) => (
                                                                <CommandItem
                                                                    key={form.value}
                                                                    value={form.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("legalForm", form.value);
                                                                        setLegalFormPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.legalForm === form.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {form.label}
                                                                </CommandItem>
                                                            ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Business Industry Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Business Industry <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={businessActivityPopover} onOpenChange={setBusinessActivityPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.businessIndustryType
                                                    ? BusinessActivitiesOptions.find(
                                                        (activity) => activity.value === formData.businessIndustryType
                                                    )?.label
                                                    : "Select business industry..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search activity..." />
                                                <CommandList>
                                                    <CommandEmpty>No activity found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {BusinessActivitiesOptions.map((activity) => (
                                                            <CommandItem
                                                                key={activity.value}
                                                                value={activity.label}
                                                                onSelect={() => {
                                                                    handleInputChange("businessIndustryType", activity.value);
                                                                    setBusinessActivityPopover(false);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.businessIndustryType === activity.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {activity.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Business Industry Type */}
                                {formData.businessIndustryType === "Other" && (
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Industry Type <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover open={activityPopover} onOpenChange={setActivityPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    <div className="flex items-center gap-2 flex-1 text-left">
                                                        {formData.companyActivity.length === 0
                                                            ? "Select Business Industry Type..."
                                                            : formData.companyActivity.length === 1
                                                                ? companyActivityOptions.find(
                                                                    (activity) => activity.value === formData.companyActivity[0]
                                                                )?.label
                                                                : `${formData.companyActivity.length} industries selected`}
                                                    </div>
                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search activity..." />
                                                    <CommandList>
                                                        <CommandEmpty>No activity found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {companyActivityOptions.map((activity) => (
                                                                <CommandItem
                                                                    key={activity.value}
                                                                    value={activity.label}
                                                                    onSelect={() => {
                                                                        handleCompanyActivityChange(activity.value);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.companyActivity.includes(activity.value)
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {activity.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {formData.companyActivity.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {formData.companyActivity.map((activityValue) => (
                                                    <div
                                                        key={activityValue}
                                                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                                                    >
                                                        {companyActivityOptions.find(
                                                            (activity) => activity.value === activityValue
                                                        )?.label}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCompanyActivityChange(activityValue)}
                                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* businessModel string | null */}
                                <div>
                                    <Label
                                        htmlFor="businessModel"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Please describe your business model in details <span className="text-red-500">*</span>
                                    </Label>
                                    <textarea
                                        id="businessModel"
                                        name="businessModel"
                                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-vertical"
                                        placeholder="Describe your business model in detail..."
                                        value={formData.businessModel || ""}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("businessModel", e.target.value)}
                                    />
                                </div>

                                {/* Customer Base Breakdown */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Customer Base Breakdown <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={customerBaseBreakdownPopover} onOpenChange={setCustomerBaseBreakdownPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.customerBaseBreakdown
                                                    ? customerBaseBreakdownOptions.find(
                                                        (option) => option.value === formData.customerBaseBreakdown
                                                    )?.label
                                                    : "Select customer base breakdown..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search customer base..." />
                                                <CommandList>
                                                    <CommandEmpty>No option found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {customerBaseBreakdownOptions.map((option) => (
                                                            <CommandItem
                                                                key={option.value}
                                                                value={option.label}
                                                                onSelect={() => {
                                                                    handleInputChange("customerBaseBreakdown", option.value);
                                                                    setCustomerBaseBreakdownPopover(false);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.customerBaseBreakdown === option.value
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

                                {/* Countries of Operation Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Countries of Operation <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover
                                        open={countriesOfOperationPopover}
                                        onOpenChange={setCountriesOfOperationPopover}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                <div className="flex items-center gap-2 flex-1 text-left">
                                                    {formData.countriesOfOperation.length === 0 ? (
                                                        "Select countries of operation..."
                                                    ) : formData.countriesOfOperation.length === 1 ? (
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={`https://flagcdn.com/w320/${countries
                                                                    .find(
                                                                        (country) => country.name === formData.countriesOfOperation[0]
                                                                    )
                                                                    ?.iso2?.toLowerCase()}.png`}
                                                                alt=""
                                                                width={18}
                                                                height={18}
                                                            />
                                                            {formData.countriesOfOperation[0]}
                                                        </div>
                                                    ) : (
                                                        `${formData.countriesOfOperation.length} countries selected`
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
                                                                key={`operation-${country.name}-${index}`}
                                                                value={country.name}
                                                                onSelect={() => {
                                                                    handleCountriesOfOperationChange(country.name);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.countriesOfOperation.includes(country.name)
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
                                    {formData.countriesOfOperation.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {formData.countriesOfOperation.map((countryName) => (
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
                                                        onClick={() => handleCountriesOfOperationChange(countryName)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Date Fields */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company Registration Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover
                                            open={registrationDatePopover}
                                            onOpenChange={setRegistrationDatePopover}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-12 justify-start text-left font-normal"
                                                    disabled={loading}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.registrationDate
                                                        ? format(formData.registrationDate, "PPP")
                                                        : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown"
                                                    selected={formData.registrationDate}
                                                    onSelect={(date) => {
                                                        handleInputChange("registrationDate", date!);
                                                        setRegistrationDatePopover(false);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Business Registered Address</h3>

                                <div>
                                    <Label
                                        htmlFor="streetAddress"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Street Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="streetAddress"
                                        name="streetAddress"
                                        type="text"
                                        className="h-12"
                                        placeholder="Enter street address"
                                        value={formData.streetAddress}
                                        disabled={loading}
                                        autoComplete="off"
                                        onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="streetAddress2"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Street Address 2 <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="streetAddress2"
                                        name="streetAddress2"
                                        type="text"
                                        className="h-12"
                                        placeholder="Apartment, suite, unit, etc."
                                        value={formData.streetAddress2}
                                        disabled={loading}
                                        autoComplete="off"
                                        onChange={(e) => handleInputChange("streetAddress2", e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                            City <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            type="text"
                                            className="h-12"
                                            placeholder="Enter city"
                                            value={formData.city}
                                            disabled={loading}
                                            autoComplete="off"
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                            State/Province <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            type="text"
                                            className="h-12"
                                            placeholder="Enter state"
                                            value={formData.state}
                                            disabled={loading}
                                            autoComplete="off"
                                            onChange={(e) => handleInputChange("state", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label
                                            htmlFor="region"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Region <span className="text-gray-400">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="region"
                                            name="region"
                                            type="text"
                                            className="h-12"
                                            placeholder="Enter region"
                                            value={formData.region}
                                            disabled={loading}
                                            autoComplete="off"
                                            onChange={(e) => handleInputChange("region", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="postalCode"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Postal Code <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="postalCode"
                                            name="postalCode"
                                            type="text"
                                            className="h-12"
                                            placeholder="Enter postal code"
                                            value={formData.postalCode}
                                            disabled={loading}
                                            autoComplete="off"
                                            onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                        Country <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Popover
                                            open={countryPopover}
                                            onOpenChange={() => setCountryPopover(!countryPopover)}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    size="md"
                                                    aria-expanded={countryPopover}
                                                    className="w-full h-12 justify-between"
                                                    disabled={loading}
                                                >
                                                    <div className="flex flex-row items-center gap-2">
                                                        {formData.country && (
                                                            <img
                                                                src={`https://flagcdn.com/w320/${countries
                                                                    .find((country) => country.name === formData.country)
                                                                    ?.iso2.toLowerCase()}.png`}
                                                                alt=""
                                                                width={18}
                                                                height={18}
                                                            />
                                                        )}
                                                        {formData.country
                                                            ? countries.find((country) => country.name === formData.country)?.name
                                                            : "Select country..."}
                                                    </div>
                                                    <ChevronsUpDownIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search country..." />
                                                    <CommandList>
                                                        <CommandEmpty>No country found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {countries.map((country, index) => (
                                                                <CommandItem
                                                                    key={`${country.name}-${index}`}
                                                                    value={country.name}
                                                                    onSelect={(currentValue) => {
                                                                        handleInputChange("country", currentValue);
                                                                        setCountryPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.country === country.name
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
                                    </div>
                                </div>
                            </div>

                            {/* Actual operations address match checkbox */}
                            <div className="pt-2 px-0 md:px-0 max-w-md mx-auto">
                                <label className="flex items-center space-x-3 text-sm text-gray-700">
                                    <Checkbox
                                        checked={formData.actualOperationsAndRegisteredAddressesMatch}
                                        onCheckedChange={(checked) =>
                                            handleInputChange("actualOperationsAndRegisteredAddressesMatch", !!checked)
                                        }
                                        className="h-4 w-4"
                                        id="actualOperationsAndRegisteredAddressesMatch"
                                    />
                                    <span>Actual operations address matches registered address</span>
                                </label>
                            </div>

                            {/* Conditional actual operations address fields */}
                            {!formData.actualOperationsAndRegisteredAddressesMatch && (
                                <div className="space-y-4 px-0 md:px-0 max-w-md mx-auto">
                                    <h3 className="text-lg font-medium text-gray-900">Actual Operations Address</h3>

                                    <div>
                                        <Label
                                            htmlFor="actual_streetAddress"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Street Address <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="actual_streetAddress"
                                            name="actual_streetAddress"
                                            type="text"
                                            className="h-12"
                                            placeholder="Enter street address"
                                            value={formData.actualOperationsAddress.streetAddress}
                                            disabled={loading}
                                            autoComplete="off"
                                            onChange={(e) =>
                                                handleNestedInputChange(
                                                    "actualOperationsAddress",
                                                    "streetAddress",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="actual_streetAddress2"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Street Address 2 <span className="text-gray-400">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="actual_streetAddress2"
                                            name="actual_streetAddress2"
                                            type="text"
                                            className="h-12"
                                            placeholder="Apartment, suite, unit, etc."
                                            value={formData.actualOperationsAddress.streetAddress2}
                                            disabled={loading}
                                            autoComplete="off"
                                            onChange={(e) =>
                                                handleNestedInputChange(
                                                    "actualOperationsAddress",
                                                    "streetAddress2",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                htmlFor="actual_city"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                City <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="actual_city"
                                                name="actual_city"
                                                type="text"
                                                className="h-12"
                                                placeholder="Enter city"
                                                value={formData.actualOperationsAddress.city}
                                                disabled={loading}
                                                autoComplete="off"
                                                onChange={(e) =>
                                                    handleNestedInputChange("actualOperationsAddress", "city", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="actual_state"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                State/Province <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="actual_state"
                                                name="actual_state"
                                                type="text"
                                                className="h-12"
                                                placeholder="Enter state"
                                                value={formData.actualOperationsAddress.state}
                                                disabled={loading}
                                                autoComplete="off"
                                                onChange={(e) =>
                                                    handleNestedInputChange(
                                                        "actualOperationsAddress",
                                                        "state",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                htmlFor="actual_region"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Region <span className="text-gray-400">(Optional)</span>
                                            </Label>
                                            <Input
                                                id="actual_region"
                                                name="actual_region"
                                                type="text"
                                                className="h-12"
                                                placeholder="Enter region"
                                                value={formData.actualOperationsAddress.region}
                                                disabled={loading}
                                                autoComplete="off"
                                                onChange={(e) =>
                                                    handleNestedInputChange(
                                                        "actualOperationsAddress",
                                                        "region",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="actual_postalCode"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Postal Code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="actual_postalCode"
                                                name="actual_postalCode"
                                                type="text"
                                                className="h-12"
                                                placeholder="Enter postal code"
                                                value={formData.actualOperationsAddress.postalCode}
                                                disabled={loading}
                                                autoComplete="off"
                                                onChange={(e) =>
                                                    handleNestedInputChange(
                                                        "actualOperationsAddress",
                                                        "postalCode",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="country"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Country <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex gap-2">
                                            <Popover
                                                open={actualCountryPopover}
                                                onOpenChange={() => setActualCountryPopover(!actualCountryPopover)}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        size="md"
                                                        aria-expanded={countryPopover}
                                                        className="w-full h-12 justify-between"
                                                        disabled={loading}
                                                    >
                                                        <div className="flex flex-row items-center gap-2">
                                                            {formData.actualOperationsAddress.country && (
                                                                <img
                                                                    src={`https://flagcdn.com/w320/${countries
                                                                        .find(
                                                                            (country) =>
                                                                                country.name === formData.actualOperationsAddress.country
                                                                        )
                                                                        ?.iso2.toLowerCase()}.png`}
                                                                    alt=""
                                                                    width={18}
                                                                    height={18}
                                                                />
                                                            )}
                                                            {formData.actualOperationsAddress.country
                                                                ? countries.find(
                                                                    (country) =>
                                                                        country.name === formData.actualOperationsAddress.country
                                                                )?.name
                                                                : "Select country..."}
                                                        </div>
                                                        <ChevronsUpDownIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search country..." />
                                                        <CommandList>
                                                            <CommandEmpty>No country found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {countries.map((country, index) => (
                                                                    <CommandItem
                                                                        key={`actual-${country.name}-${index}`}
                                                                        value={country.name}
                                                                        onSelect={(currentValue) => {
                                                                            handleNestedInputChange(
                                                                                "actualOperationsAddress",
                                                                                "country",
                                                                                currentValue
                                                                            );
                                                                            setActualCountryPopover(false);
                                                                        }}
                                                                    >
                                                                        <CheckIcon
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                formData.actualOperationsAddress.country === country.name
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
                                        </div>
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
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
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

export default BusinessDetailsForm;
