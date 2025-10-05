import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { ArrowLeft, ArrowUpRight, Building2, ChevronsUpDownIcon, CheckIcon, CalendarIcon } from "lucide-react";
import { ISender } from "@/v1/interface/interface";
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
import { format } from "date-fns";
import countries from "@/v1/data/country_state.json";
import { Checkbox } from "@/v1/components/ui/checkbox";

const companyActivityOptions = [
    { value: "financial_and_insurance_activities", label: "Financial and Insurance Activities" },
    { value: "cryptocurrencies_and_cryptoassets", label: "Cryptocurrencies and Cryptoassets" },
    { value: "agriculture_forestry_and_fishing", label: "Agriculture, Forestry and Fishing" },
    { value: "manufacturing", label: "Manufacturing" },
    {
        value: "electricity_gas_steam_and_air_conditioning_supply",
        label: "Electricity, Gas, Steam and Air Conditioning Supply",
    },
    {
        value: "water_supply_sewerage_waste_management_and_remediation_activities",
        label: "Water Supply, Sewerage, Waste Management and Remediation Activities",
    },
    { value: "construction", label: "Construction" },
    {
        value: "wholesale_and_retail_trade_repair_of_motor_vehicles_and_motorcycles",
        label: "Wholesale and Retail Trade; Repair of Motor Vehicles and Motorcycles",
    },
    { value: "transportation_and_storage", label: "Transportation and Storage" },
    {
        value: "accommodation_and_food_service_activities",
        label: "Accommodation and Food Service Activities",
    },
    { value: "information_and_communication", label: "Information and Communication" },
    { value: "real_estate_activities", label: "Real Estate Activities" },
    {
        value: "professional_scientific_and_technical_activities",
        label: "Professional, Scientific and Technical Activities",
    },
    {
        value: "administrative_and_support_service_activities",
        label: "Administrative and Support Service Activities",
    },
    {
        value: "public_administration_and_defense_compulsory_social_security",
        label: "Public Administration and Defense; Compulsory Social Security",
    },
    { value: "education", label: "Education" },
    {
        value: "human_health_and_social_work_activities",
        label: "Human Health and Social Work Activities",
    },
    { value: "arts_entrainment_and_recreation", label: "Arts, Entertainment and Recreation" },
    { value: "other_service_activities", label: "Other Service Activities" },
    {
        value:
            "households_as_employers_undifferentiated_goods_services_producing_activities_of_households_use",
        label:
            "Households as Employers; Undifferentiated Goods- and Services-Producing Activities of Households for Own Use",
    },
    {
        value: "activities_of_extraterritorial_organizations_and_bodies",
        label: "Activities of Extraterritorial Organizations and Bodies",
    },
];

const legalForms = [
    { value: "Partnership", label: "Partnership, Business Name" },
    { value: "Sole_Proprietorship", label: "Sole Proprietorship, Business Name" },
    { value: "LTD", label: "LTD (Private Limited Company)" },
    { value: "PLC", label: "PLC (Public Limited Company)" },
    { value: "OTHERS", label: "Others" },
];

interface CompanyDetailsProps {
    formData: Partial<ISender>;
    onFieldChange: (field: string, value: any) => void;
    onBack: () => void;
    onContinue: () => void;
}

export function CompanyDetails({
    formData,
    onFieldChange,
    onBack,
    onContinue
}: CompanyDetailsProps) {
    const [countryPopover, setCountryPopover] = useState(false);
    const [actualOperationsCountryPopover, setActualOperationsCountryPopover] = useState(false);
    const [activityPopover, setActivityPopover] = useState(false);
    const [countriesOfOperationPopover, setCountriesOfOperationPopover] = useState(false);
    const [legalFormPopover, setLegalFormPopover] = useState(false);
    const [_registrationDatePopover, setRegistrationDatePopover] = useState(false);
    const [isWebsiteValid, setIsWebsiteValid] = useState(true);

    const handleFieldChange = (field: string, value: any) => {
        onFieldChange(field, value);
        // Validate website in real-time
        if (field === "website") {
            setIsWebsiteValid(isValidWebsite(String(value)));
        }
    };

    const handleCountriesOfOperationChange = (countryName: string) => {
        const currentCountries = formData.countriesOfOperations || [];
        const isSelected = currentCountries.includes(countryName);

        if (isSelected) {
            // Remove country
            onFieldChange('countriesOfOperations', currentCountries.filter((c: string) => c !== countryName));
        } else {
            // Add country
            onFieldChange('countriesOfOperations', [...currentCountries, countryName]);
        }
    };

    const isValidWebsite = (website: string) => {
        if (!website.trim()) return true; // Empty is valid since it's optional

        const cleanWebsite = website.replace(/^https?:\/\//, '').trim();
        const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/;

        // Allow www. prefix
        const withWwwPattern = /^www\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/;

        return domainPattern.test(cleanWebsite) || withWwwPattern.test(cleanWebsite);
    };

    const isFormValid = () => {
        const basicValidation = formData.businessName &&
            formData.country &&
            formData.businessRegistrationNumber &&
            formData.legalForm &&
            formData.companyActivity &&
            formData.countriesOfOperations &&
            formData.countriesOfOperations.length > 0 &&
            formData.streetAddress &&
            formData.city &&
            formData.state &&
            formData.postalCode &&
            formData.registrationDate;

        // If actual operations address is different, validate those fields too
        if (!formData.actualOperationsAndRegisteredAddressesMatch) {
            return basicValidation &&
                formData.actualOperationsAddress?.streetAddress &&
                formData.actualOperationsAddress?.city &&
                formData.actualOperationsAddress?.state &&
                formData.actualOperationsAddress?.postalCode &&
                formData.actualOperationsAddress?.country;
        }

        return basicValidation;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardContent className="p-12">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-6">
                            <Building2 className="h-12 w-12 text-primary mr-4" />
                            <h2 className="text-3xl font-bold">Business Details</h2>
                        </div>
                        <p className="text-lg text-gray-600">
                            Please provide detailed information about your Business and business operations.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Business Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">Business Information</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="businessName" className="block text-lg font-medium text-gray-700 mb-3">
                                        Business Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder="Enter Business name"
                                        value={formData.businessName || ""}
                                        disabled={true}
                                        onChange={(e) => onFieldChange('businessName', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tradingName" className="block text-lg font-medium text-gray-700 mb-3">
                                        Trading Name (If different from Business)
                                    </Label>
                                    <Input
                                        id="tradingName"
                                        name="tradingName"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder="Enter Trading Name"
                                        value={formData.tradingName || ""}
                                        onChange={(e) => onFieldChange('tradingName', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="businessRegistrationNumber" className="block text-lg font-medium text-gray-700 mb-3">
                                        Business Registration Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="businessRegistrationNumber"
                                        name="businessRegistrationNumber"
                                        type="text"
                                        disabled={true}
                                        className="h-16 text-lg"
                                        placeholder="Enter registration number"
                                        value={formData.businessRegistrationNumber || ""}
                                        onChange={(e) => onFieldChange('businessRegistrationNumber', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="website" className="block text-lg font-medium text-gray-700 mb-3">
                                        Website <span className="text-gray-400">(Optional)</span>
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
                                                    "h-16 pl-28 pr-4 text-gray-900 placeholder-gray-400 border-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg",
                                                    formData.website && !isWebsiteValid
                                                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 bg-red-50"
                                                        : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white hover:border-gray-300"
                                                )}
                                                placeholder="www.businessname.com"
                                                value={formData.website || ""}
                                                onChange={(e) => handleFieldChange('website', e.target.value)}
                                            />
                                            {formData.website && isWebsiteValid && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        {formData.website && !isWebsiteValid && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Please enter a valid website URL
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Legal Form Selection */}
                            <div>
                                <Label className="block text-lg font-medium text-gray-700 mb-3">
                                    Legal Form <span className="text-red-500">*</span>
                                </Label>
                                <Popover open={legalFormPopover} onOpenChange={setLegalFormPopover}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full h-16 justify-between text-lg"
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
                                                    {legalForms.map((form) => (
                                                        <CommandItem
                                                            key={form.value}
                                                            value={form.label}
                                                            onSelect={() => {
                                                                onFieldChange("legalForm", form.value);
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

                            {/* Business Activity Selection */}
                            <div>
                                <Label className="block text-lg font-medium text-gray-700 mb-3">
                                    Business Activity <span className="text-red-500">*</span>
                                </Label>
                                <Popover open={activityPopover} onOpenChange={setActivityPopover}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full h-16 justify-between text-lg"
                                        >
                                            {formData.companyActivity
                                                ? companyActivityOptions.find(
                                                    (activity) => activity.value === formData.companyActivity
                                                )?.label
                                                : "Select Business activity..."}
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
                                                                onFieldChange("companyActivity", activity.value);
                                                                setActivityPopover(false);
                                                            }}
                                                        >
                                                            <CheckIcon
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formData.companyActivity === activity.value
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

                            {/* Countries of Operation Selection */}
                            <div>
                                <Label className="block text-lg font-medium text-gray-700 mb-3">
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
                                            className="w-full h-16 justify-between text-lg"
                                        >
                                            <div className="flex items-center gap-2 flex-1 text-left">
                                                {!formData.countriesOfOperations || formData.countriesOfOperations.length === 0 ? (
                                                    "Select countries of operation..."
                                                ) : formData.countriesOfOperations.length === 1 ? (
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={`https://flagcdn.com/w320/${countries
                                                                .find(
                                                                    (country) => country.name === formData.countriesOfOperations![0]
                                                                )
                                                                ?.iso2?.toLowerCase()}.png`}
                                                            alt=""
                                                            width={18}
                                                            height={18}
                                                        />
                                                        {formData.countriesOfOperations[0]}
                                                    </div>
                                                ) : (
                                                    `${formData.countriesOfOperations.length} countries selected`
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
                                                                    formData.countriesOfOperations?.includes(country.name)
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
                                {formData.countriesOfOperations && formData.countriesOfOperations.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formData.countriesOfOperations.map((countryName) => (
                                            <div
                                                key={countryName}
                                                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm"
                                            >
                                                <img
                                                    src={`https://flagcdn.com/w320/${countries
                                                        .find((country) => country.name === countryName)
                                                        ?.iso2?.toLowerCase()}.png`}
                                                    alt=""
                                                    width={14}
                                                    height={14}
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
                            <div>
                                <Label className="block text-lg font-medium text-gray-700 mb-3">
                                    Business Registration Date <span className="text-red-500">*</span>
                                </Label>
                                <Popover
                                    open={false}
                                    onOpenChange={setRegistrationDatePopover}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            disabled={true}
                                            className="w-full h-16 justify-start text-left font-normal text-lg"
                                        >
                                            <CalendarIcon className="mr-3 h-5 w-5" />
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
                                                onFieldChange("registrationDate", date!);
                                                setRegistrationDatePopover(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">Business Registered Address</h3>

                            <div>
                                <Label htmlFor="streetAddress" className="block text-lg font-medium text-gray-700 mb-3">
                                    Street Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="streetAddress"
                                    name="streetAddress"
                                    type="text"
                                    className="h-16 text-lg"
                                    placeholder="Enter street address"
                                    value={formData.streetAddress || ""}
                                    onChange={(e) => onFieldChange('streetAddress', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="streetAddress2" className="block text-lg font-medium text-gray-700 mb-3">
                                    Street Address 2 <span className="text-gray-400">(Optional)</span>
                                </Label>
                                <Input
                                    id="streetAddress2"
                                    name="streetAddress2"
                                    type="text"
                                    className="h-16 text-lg"
                                    placeholder="Apartment, suite, unit, etc."
                                    value={formData.streetAddress2 || ""}
                                    onChange={(e) => onFieldChange('streetAddress2', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="city" className="block text-lg font-medium text-gray-700 mb-3">
                                        City <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder="Enter city"
                                        value={formData.city || ""}
                                        onChange={(e) => onFieldChange('city', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="state" className="block text-lg font-medium text-gray-700 mb-3">
                                        State/Province <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder="Enter state"
                                        value={formData.state || ""}
                                        onChange={(e) => onFieldChange('state', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="region" className="block text-lg font-medium text-gray-700 mb-3">
                                        Region <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="region"
                                        name="region"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder="Enter region"
                                        value={formData.region || ""}
                                        onChange={(e) => onFieldChange('region', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="postalCode" className="block text-lg font-medium text-gray-700 mb-3">
                                        Postal Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="postalCode"
                                        name="postalCode"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder="Enter postal code"
                                        value={formData.postalCode || ""}
                                        onChange={(e) => onFieldChange('postalCode', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="country" className="block text-lg font-medium text-gray-700 mb-3">
                                    Country <span className="text-red-500">*</span>
                                </Label>
                                <Popover
                                    open={countryPopover}
                                    onOpenChange={setCountryPopover}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            size="md"
                                            aria-expanded={countryPopover}
                                            className="w-full h-16 justify-between text-lg"
                                        >
                                            <div className="flex flex-row items-center gap-3">
                                                {formData.country && (
                                                    <img
                                                        src={`https://flagcdn.com/w320/${countries
                                                            .find((country) => country.name === formData.country)
                                                            ?.iso2.toLowerCase()}.png`}
                                                        alt=""
                                                        width={20}
                                                        height={20}
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
                                                                onFieldChange("country", currentValue);
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

                        {/* Actual Operations Address Section */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="actualOperationsAndRegisteredAddressesMatch"
                                    checked={formData.actualOperationsAndRegisteredAddressesMatch || false}
                                    onCheckedChange={(checked) =>
                                        onFieldChange('actualOperationsAndRegisteredAddressesMatch', !!checked)
                                    }
                                    className="h-5 w-5 text-primary border-gray-300 rounded"
                                />
                                <Label htmlFor="actualOperationsAndRegisteredAddressesMatch" className="text-lg font-medium text-gray-700">
                                    Actual operations address is the same as registered address
                                </Label>
                            </div>

                            {!formData.actualOperationsAndRegisteredAddressesMatch && (
                                <div className="space-y-6 border-l-4 border-primary pl-6 ml-3">
                                    <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">Actual Operations Address</h3>

                                    <div>
                                        <Label htmlFor="actualOperationsStreetAddress" className="block text-lg font-medium text-gray-700 mb-3">
                                            Street Address <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="actualOperationsStreetAddress"
                                            name="actualOperationsStreetAddress"
                                            type="text"
                                            className="h-16 text-lg"
                                            placeholder="Enter street address"
                                            value={formData.actualOperationsAddress?.streetAddress || ""}
                                            onChange={(e) => onFieldChange('actualOperationsAddress', {
                                                ...formData.actualOperationsAddress,
                                                streetAddress: e.target.value
                                            })}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="actualOperationsStreetAddress2" className="block text-lg font-medium text-gray-700 mb-3">
                                            Street Address 2 <span className="text-gray-400">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="actualOperationsStreetAddress2"
                                            name="actualOperationsStreetAddress2"
                                            type="text"
                                            className="h-16 text-lg"
                                            placeholder="Apartment, suite, unit, etc."
                                            value={formData.actualOperationsAddress?.streetAddress2 || ""}
                                            onChange={(e) => onFieldChange('actualOperationsAddress', {
                                                ...formData.actualOperationsAddress,
                                                streetAddress2: e.target.value
                                            })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="actualOperationsCity" className="block text-lg font-medium text-gray-700 mb-3">
                                                City <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="actualOperationsCity"
                                                name="actualOperationsCity"
                                                type="text"
                                                className="h-16 text-lg"
                                                placeholder="Enter city"
                                                value={formData.actualOperationsAddress?.city || ""}
                                                onChange={(e) => onFieldChange('actualOperationsAddress', {
                                                    ...formData.actualOperationsAddress,
                                                    city: e.target.value
                                                })}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="actualOperationsState" className="block text-lg font-medium text-gray-700 mb-3">
                                                State/Province <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="actualOperationsState"
                                                name="actualOperationsState"
                                                type="text"
                                                className="h-16 text-lg"
                                                placeholder="Enter state"
                                                value={formData.actualOperationsAddress?.state || ""}
                                                onChange={(e) => onFieldChange('actualOperationsAddress', {
                                                    ...formData.actualOperationsAddress,
                                                    state: e.target.value
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="actualOperationsRegion" className="block text-lg font-medium text-gray-700 mb-3">
                                                Region <span className="text-gray-400">(Optional)</span>
                                            </Label>
                                            <Input
                                                id="actualOperationsRegion"
                                                name="actualOperationsRegion"
                                                type="text"
                                                className="h-16 text-lg"
                                                placeholder="Enter region"
                                                value={formData.actualOperationsAddress?.region || ""}
                                                onChange={(e) => onFieldChange('actualOperationsAddress', {
                                                    ...formData.actualOperationsAddress,
                                                    region: e.target.value
                                                })}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="actualOperationsPostalCode" className="block text-lg font-medium text-gray-700 mb-3">
                                                Postal Code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="actualOperationsPostalCode"
                                                name="actualOperationsPostalCode"
                                                type="text"
                                                className="h-16 text-lg"
                                                placeholder="Enter postal code"
                                                value={formData.actualOperationsAddress?.postalCode || ""}
                                                onChange={(e) => onFieldChange('actualOperationsAddress', {
                                                    ...formData.actualOperationsAddress,
                                                    postalCode: e.target.value
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="actualOperationsCountry" className="block text-lg font-medium text-gray-700 mb-3">
                                            Country <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover
                                            open={actualOperationsCountryPopover}
                                            onOpenChange={setActualOperationsCountryPopover}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    size="md"
                                                    aria-expanded={countryPopover}
                                                    className="w-full h-16 justify-between text-lg"
                                                >
                                                    <div className="flex flex-row items-center gap-3">
                                                        {formData.actualOperationsAddress?.country && (
                                                            <img
                                                                src={`https://flagcdn.com/w320/${countries
                                                                    .find((country) => country.name === formData.actualOperationsAddress?.country)
                                                                    ?.iso2.toLowerCase()}.png`}
                                                                alt=""
                                                                width={20}
                                                                height={20}
                                                            />
                                                        )}
                                                        {formData.actualOperationsAddress?.country
                                                            ? countries.find((country) => country.name === formData.actualOperationsAddress?.country)?.name
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
                                                                        onFieldChange('actualOperationsAddress', {
                                                                            ...formData.actualOperationsAddress,
                                                                            country: currentValue
                                                                        });
                                                                        setActualOperationsCountryPopover(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.actualOperationsAddress?.country === country.name
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
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-12">
                        <Button variant="outline" onClick={onBack} className="h-12 px-8 text-lg">
                            <ArrowLeft className="h-5 w-5 mr-3" />
                            Go Back
                        </Button>
                        <Button
                            variant="default"
                            className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-lg"
                            disabled={!isFormValid()}
                            onClick={onContinue}
                        >
                            Continue
                            <ArrowUpRight className="h-5 w-5 ml-3" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}