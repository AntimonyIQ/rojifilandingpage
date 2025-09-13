import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { ArrowLeft, ChevronsUpDownIcon, CheckIcon, CalendarIcon, AlertCircle, ArrowUpRight, Check } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { session, SessionData } from "@/v1/session/session"
import { toast } from "sonner"
import Defaults from "@/v1/defaults/defaults"
import { IRequestAccess, IResponse } from "@/v1/interface/interface"
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
import {
    Calendar,
} from "@/v1/components/ui/calendar"
import { Status } from "@/v1/enums/enums"
import { Link, useParams } from "wouter"
import GlobeWrapper from "../globe"
import { Carousel, carouselItems } from "../carousel"
import { motion, Variants } from "framer-motion"
import { format } from "date-fns"
import countries from "../../data/country_state.json";
import { Checkbox } from "../ui/checkbox"

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
}

const companyActivityOptions = [
    { value: "financial_and_insurance_activities", label: "Financial and Insurance Activities" },
    { value: "cryptocurrencies_and_cryptoassets", label: "Cryptocurrencies and Cryptoassets" },
    { value: "agriculture_forestry_and_fishing", label: "Agriculture, Forestry and Fishing" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "electricity_gas_steam_and_air_conditioning_supply", label: "Electricity, Gas, Steam and Air Conditioning Supply" },
    { value: "water_supply_sewerage_waste_management_and_remediation_activities", label: "Water Supply, Sewerage, Waste Management and Remediation Activities" },
    { value: "construction", label: "Construction" },
    { value: "wholesale_and_retail_trade_repair_of_motor_vehicles_and_motorcycles", label: "Wholesale and Retail Trade; Repair of Motor Vehicles and Motorcycles" },
    { value: "transportation_and_storage", label: "Transportation and Storage" },
    { value: "accommodation_and_food_service_activities", label: "Accommodation and Food Service Activities" },
    { value: "information_and_communication", label: "Information and Communication" },
    { value: "real_estate_activities", label: "Real Estate Activities" },
    { value: "professional_scientific_and_technical_activities", label: "Professional, Scientific and Technical Activities" },
    { value: "administrative_and_support_service_activities", label: "Administrative and Support Service Activities" },
    { value: "public_administration_and_defense_compulsory_social_security", label: "Public Administration and Defense; Compulsory Social Security" },
    { value: "education", label: "Education" },
    { value: "human_health_and_social_work_activities", label: "Human Health and Social Work Activities" },
    { value: "arts_entrainment_and_recreation", label: "Arts, Entertainment and Recreation" },
    { value: "other_service_activities", label: "Other Service Activities" },
    { value: "households_as_employers_undifferentiated_goods_services_producing_activities_of_households_use", label: "Households as Employers; Undifferentiated Goods- and Services-Producing Activities of Households for Own Use" },
    { value: "activities_of_extraterritorial_organizations_and_bodies", label: "Activities of Extraterritorial Organizations and Bodies" },
]

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
]

export function BusinessDetailsForm() {
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isNotApprove, setIsNotApprove] = useState(false)
    const errorRef = useRef<HTMLDivElement>(null)

    const [countryPopover, setCountryPopover] = useState(false)
    const [actualCountryPopover, setActualCountryPopover] = useState(false)
    const [activityPopover, setActivityPopover] = useState(false)
    const [countriesOfOperationPopover, setCountriesOfOperationPopover] = useState(false)
    const [legalFormPopover, setLegalFormPopover] = useState(false)
    const [registrationDatePopover, setRegistrationDatePopover] = useState(false)

    const [formData, setFormData] = useState({
        // Company basic info
        name: "",
        country: "Nigeria",
        registrationNumber: "",
        website: "",
        legalForm: "",
        companyActivity: "",
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
    })

    const { id } = useParams()
    const sd: SessionData = session.getUserData()

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/requestaccess/approved/${id}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                // User is authorized, continue
                const parseData: IRequestAccess = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setCompleted(parseData.completed);
                setFormData((prev) => ({
                    ...prev,
                    name: parseData.businessName || "",
                    tradingName: parseData.businessName || "",
                    country: parseData.country || "",
                    website: parseData.businessWebsite || "",
                }));
            }
        } catch (error: any) {
            setError(error.message || "Failed to verify authorization");
            setIsNotApprove(true);
        } finally {
            setIsLoading(false);
        }
    }

    const isFormValid = () => {
        return (
            formData.name.trim() !== "" &&
            formData.country.trim() !== "" &&
            formData.registrationNumber.trim() !== "" &&
            formData.legalForm.trim() !== "" &&
            formData.companyActivity.trim() !== "" &&
            formData.countriesOfOperation.length > 0 &&
            formData.streetAddress.trim() !== "" &&
            formData.city.trim() !== "" &&
            formData.state.trim() !== "" &&
            formData.postalCode.trim() !== "" &&
            // If actual operations address does not match, require its fields
            (formData.actualOperationsAndRegisteredAddressesMatch || (
                formData.actualOperationsAddress.streetAddress.trim() !== "" &&
                formData.actualOperationsAddress.city.trim() !== "" &&
                formData.actualOperationsAddress.state.trim() !== "" &&
                formData.actualOperationsAddress.postalCode.trim() !== "" &&
                formData.actualOperationsAddress.country.trim() !== ""
            )) &&
            // formData.tradingName.trim() !== "" &&
            formData.registrationDate !== undefined
        )
    }

    const sanitizeValue = (field: string, value: string | boolean | Date | string[]) => {
        if (typeof value !== 'string') return value
        switch (field) {
            case "name":
            case "tradingName":
                return value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "")
            case "registrationNumber":
                return value
                    .replace(/[^a-zA-Z0-9\-\/_\s]/g, "")
                    .replace(/\s+/g, " ")
            case "website":
                return value.replace(/[^a-zA-Z0-9\.\-_/:?=&%#]/g, "").toLowerCase()
            case "streetAddress":
            case "streetAddress2":
            case "city":
            case "state":
            case "region":
            case "country":
                return value.replace(/[^a-zA-Z0-9\s\-_,.]/g, "")
            case "postalCode":
                return value.replace(/[^a-zA-Z0-9]/g, "")
            default:
                return value
        }
    }

    const handleInputChange = (field: string, value: string | boolean | Date | string[]) => {
        const sanitizedValue = sanitizeValue(field, value)
        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))
        setError(null)
    }

    const handleNestedInputChange = (parent: string, field: string, value: string | boolean | Date | string[]) => {
        const sanitizedValue = sanitizeValue(field, value)
        setFormData((prev: any) => ({
            ...prev,
            [parent]: {
                ...(prev as any)[parent],
                [field]: sanitizedValue
            }
        }))
        setError(null)
    }

    const handleCountriesOfOperationChange = (countryName: string) => {
        setFormData((prev) => {
            const currentCountries = prev.countriesOfOperation
            const isSelected = currentCountries.includes(countryName)

            if (isSelected) {
                // Remove country
                return {
                    ...prev,
                    countriesOfOperation: currentCountries.filter(c => c !== countryName)
                }
            } else {
                // Add country
                return {
                    ...prev,
                    countriesOfOperation: [...currentCountries, countryName]
                }
            }
        })
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setError(null)

        if (!isFormValid()) {
            setError("Please fill in all required fields")
            // Auto-scroll to error message
            setTimeout(() => {
                errorRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 100)
            return
        }

        setLoading(true)

        try {
            const businessData = {
                mainCompany: {
                    name: formData.name,
                    country: formData.country,
                    registrationNumber: formData.registrationNumber,
                    website: formData.website,
                    legalForm: formData.legalForm,
                    companyActivity: formData.companyActivity,
                    registrationDate: formData.registrationDate ? format(formData.registrationDate, 'yyyy-MM-dd') : "",
                    onboardingDate: format(new Date(), 'yyyy-MM-dd'), // Set to current date
                    registeredAddress: {
                        streetAddress: formData.streetAddress,
                        streetAddress2: formData.streetAddress2,
                        city: formData.city,
                        state: formData.state,
                        region: formData.region,
                        country: formData.country,
                        postalCode: formData.postalCode
                    },
                    actualOperationsAndRegisteredAddressesMatch: formData.actualOperationsAndRegisteredAddressesMatch,
                    countriesOfOperation: formData.countriesOfOperation,
                    actualOperationsAddress: formData.actualOperationsAndRegisteredAddressesMatch ? undefined : {
                        streetAddress: formData.actualOperationsAddress.streetAddress,
                        streetAddress2: formData.actualOperationsAddress.streetAddress2,
                        city: formData.actualOperationsAddress.city,
                        state: formData.actualOperationsAddress.state,
                        region: formData.actualOperationsAddress.region,
                        country: formData.actualOperationsAddress.country,
                        postalCode: formData.actualOperationsAddress.postalCode
                    }
                },
                tradingName: formData.tradingName
            }

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/business`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: id,
                    businessData
                })
            })

            const data: IResponse = await res.json()
            if (data.status === Status.ERROR) throw new Error(data.message || data.error)
            if (data.status === Status.SUCCESS) {
                toast.success("Business details saved successfully!")
                window.location.href = `/signup/${id}/business-financials`;
            }
        } catch (err: any) {
            setError(err.message || "Failed to save business details")
            // Auto-scroll to error message
            setTimeout(() => {
                errorRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 100)
        } finally {
            setLoading(false)
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
        )
    }

    if (isNotApprove) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-center max-w-lg px-6">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900">Request access required</h2>
                    <p className="mt-2 text-gray-600">You currently don't have access to this page. Please request access to continue.</p>
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
        )
    }

    if (completed) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                <div className="p-6 max-w-md mx-auto text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Submission Received</h2>
                    <p className="text-gray-600 mb-4">You have successfully submitted your documents. They are under review — you will be notified once the review is complete.</p>
                    <div className="space-y-3">
                        <Button
                            onClick={() => window.location.href = '/login'}
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="w-full"
                        >
                            Back to Homepage
                        </Button>
                    </div>
                </div>
            </div>
        )
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
                                onClick={() => window.history.back()}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <ArrowLeft className="h-4 w-4" />
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
                                <div ref={errorRef} className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-md border border-red-200">
                                    {error}
                                </div>
                            )}

                            {/* Company Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Company Information</h3>

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
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tradingName" className="block text-sm font-medium text-gray-700 mb-2">
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
                                        onChange={(e) => handleInputChange("tradingName", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
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
                                        onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                                        Website <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        type="text"
                                        className="h-12"
                                        placeholder="https://www.company.com"
                                        value={formData.website}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("website", e.target.value)}
                                    />
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
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search legal form..." />
                                                <CommandList>
                                                    <CommandEmpty>No legal form found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {legalForms
                                                            .filter(form => ['Partnership', 'Sole_Proprietorship', 'LTD', 'PLC', 'OTHERS'].includes(form.value))
                                                            .map((form) => (
                                                                <CommandItem
                                                                    key={form.value}
                                                                    value={form.label}
                                                                    onSelect={() => {
                                                                        handleInputChange("legalForm", form.value)
                                                                        setLegalFormPopover(false)
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.legalForm === form.value ? "opacity-100" : "opacity-0"
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

                                {/* Company Status Selection */}
                                {/*
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Status <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={statusPopover} onOpenChange={setStatusPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.status
                                                    ? companyStatuses.find((status) => status.value === formData.status)?.label
                                                    : "Select status..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search status..." />
                                                <CommandList>
                                                    <CommandEmpty>No status found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {companyStatuses.map((status) => (
                                                            <CommandItem
                                                                key={status.value}
                                                                value={status.label}
                                                                onSelect={() => {
                                                                    handleInputChange("status", status.value)
                                                                    setStatusPopover(false)
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.status === status.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {status.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                */}

                                {/* Company Activity Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Activity <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={activityPopover} onOpenChange={setActivityPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-12 justify-between"
                                                disabled={loading}
                                            >
                                                {formData.companyActivity
                                                    ? companyActivityOptions.find((activity) => activity.value === formData.companyActivity)?.label
                                                    : "Select company activity..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
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
                                                                    handleInputChange("companyActivity", activity.value)
                                                                    setActivityPopover(false)
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.companyActivity === activity.value ? "opacity-100" : "opacity-0"
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

                                {/* Countries of Operation Selection */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Countries of Operation <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={countriesOfOperationPopover} onOpenChange={setCountriesOfOperationPopover}>
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
                                                                src={`https://flagcdn.com/w320/${countries.find((country) => country.name === formData.countriesOfOperation[0])?.iso2?.toLowerCase()}.png`}
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
                                        <PopoverContent className="w-full p-0">
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
                                                                    handleCountriesOfOperationChange(country.name)
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.countriesOfOperation.includes(country.name) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <img src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
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
                                                        src={`https://flagcdn.com/w320/${countries.find((country) => country.name === countryName)?.iso2?.toLowerCase()}.png`}
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
                                        <Popover open={registrationDatePopover} onOpenChange={setRegistrationDatePopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-12 justify-start text-left font-normal"
                                                    disabled={loading}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.registrationDate ? format(formData.registrationDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown"
                                                    selected={formData.registrationDate}
                                                    onSelect={(date) => {
                                                        handleInputChange("registrationDate", date!)
                                                        setRegistrationDatePopover(false)
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
                                    <Label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
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
                                        onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="streetAddress2" className="block text-sm font-medium text-gray-700 mb-2">
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
                                            onChange={(e) => handleInputChange("state", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
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
                                            onChange={(e) => handleInputChange("region", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
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
                                            onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                        Country <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Popover open={countryPopover} onOpenChange={() => setCountryPopover(!countryPopover)}>
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
                                                        <img src={`https://flagcdn.com/w320/${countries.find((country) => country.name === formData.country)?.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
                                                        {formData.country
                                                            ? countries.find((country) => country.name === formData.country)?.name
                                                            : "Select country..."}
                                                    </div>
                                                    <ChevronsUpDownIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
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
                                                                        handleInputChange("country", currentValue)
                                                                        setCountryPopover(false)
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.country === country.name ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <img src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
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
                                        onCheckedChange={(checked) => handleInputChange('actualOperationsAndRegisteredAddressesMatch', !!checked)}
                                        className="h-4 w-4"
                                        id="actualOperationsAndRegisteredAddressesMatch"
                                    />
                                    <span >Actual operations address matches registered address</span>
                                </label>
                            </div>

                            {/* Conditional actual operations address fields */}
                            {!formData.actualOperationsAndRegisteredAddressesMatch && (
                                <div className="space-y-4 px-0 md:px-0 max-w-md mx-auto">
                                    <h3 className="text-lg font-medium text-gray-900">Actual Operations Address</h3>

                                    <div>
                                        <Label htmlFor="actual_streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
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
                                            onChange={(e) => handleNestedInputChange('actualOperationsAddress', 'streetAddress', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="actual_streetAddress2" className="block text-sm font-medium text-gray-700 mb-2">
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
                                            onChange={(e) => handleNestedInputChange('actualOperationsAddress', 'streetAddress2', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="actual_city" className="block text-sm font-medium text-gray-700 mb-2">
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
                                                onChange={(e) => handleNestedInputChange('actualOperationsAddress', 'city', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="actual_state" className="block text-sm font-medium text-gray-700 mb-2">
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
                                                onChange={(e) => handleNestedInputChange('actualOperationsAddress', 'state', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="actual_region" className="block text-sm font-medium text-gray-700 mb-2">
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
                                                onChange={(e) => handleNestedInputChange('actualOperationsAddress', 'region', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="actual_postalCode" className="block text-sm font-medium text-gray-700 mb-2">
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
                                                onChange={(e) => handleNestedInputChange('actualOperationsAddress', 'postalCode', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                            Country <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex gap-2">
                                            <Popover open={actualCountryPopover} onOpenChange={() => setActualCountryPopover(!actualCountryPopover)}>
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
                                                            <img src={`https://flagcdn.com/w320/${countries.find((country) => country.name === formData.actualOperationsAddress.country)?.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
                                                            {formData.actualOperationsAddress.country
                                                                ? countries.find((country) => country.name === formData.actualOperationsAddress.country)?.name
                                                                : "Select country..."}
                                                        </div>
                                                        <ChevronsUpDownIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
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
                                                                            handleNestedInputChange("actualOperationsAddress", "country", currentValue)
                                                                            setActualCountryPopover(false)
                                                                        }}
                                                                    >
                                                                        <CheckIcon
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                formData.actualOperationsAddress.country === country.name ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <img src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`} alt="" width={18} height={18} />
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
                                Need help? <Link href="/help" className="text-primary hover:underline">Contact support</Link>
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
    )
}

export default BusinessDetailsForm
