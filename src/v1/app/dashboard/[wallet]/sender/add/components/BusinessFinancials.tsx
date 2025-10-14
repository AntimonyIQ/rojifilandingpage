import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Checkbox } from "@/v1/components/ui/checkbox";
import { ArrowLeft, ArrowUpRight, DollarSign, ChevronsUpDownIcon, CheckIcon, AlertCircle } from "lucide-react";
import { ISender } from "@/v1/interface/interface";
import { cn } from "@/v1/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/v1/components/ui/alert";
import { Country, ICountry } from "country-state-city";

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

interface BusinessFinancialsProps {
    formData: Partial<ISender>;
    onFieldChange: (field: string, value: any) => void;
    onBack: () => void;
    onContinue: () => void;
}

export function BusinessFinancials({
    formData,
    onFieldChange,
    onBack,
    onContinue
}: BusinessFinancialsProps) {
    const [regulatedServicesPopover, setRegulatedServicesPopover] = useState(false);
    const [pepPersonPopover, setPepPersonPopover] = useState(false);
    const countries: Array<ICountry> = Country.getAllCountries();

    const getCurrencyNameForCountry = (nameOrIso: string) => {
        let country;
        if (nameOrIso.length === 2) {
            country = countries.find(c => c.isoCode.toLowerCase() === nameOrIso.toLowerCase());
        } else {
            country = countries.find(c => c.name.toLowerCase() === nameOrIso.toLowerCase());
        }
        return country ? country.currency : "NGN";
    }

    const fiatCurrencyName = getCurrencyNameForCountry(formData?.countryOfIncorporation || "NG");
    const cryptoCurrencyName = "USD";

    // Format number helper
    const formatNumber = (val: string) => (val ? val.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : val);

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

        onFieldChange(field, sanitizedValue);
    };

    const handleMultiSelectChange = (field: string, value: string, checked: boolean) => {
        const currentArray = formData[field as keyof typeof formData] as string[] || [];
        if (checked) {
            onFieldChange(field, [...currentArray, value]);
        } else {
            onFieldChange(field, currentArray.filter((item) => item !== value));
        }
    };

    const handlePepPersonChange = (index: number, value: string) => {
        const currentNames = (formData as any).pepOrUsPerson || [];
        const updatedNames = [...currentNames];
        updatedNames[index] = value;
        onFieldChange('pepOrUsPerson', updatedNames);
    };

    const addPepPerson = () => {
        const currentNames = (formData as any).pepOrUsPerson || [];
        onFieldChange('pepOrUsPerson', [...currentNames, ""]);
    };

    const removePepPerson = (index: number) => {
        const currentNames = (formData as any).pepOrUsPerson || [];
        if (currentNames.length > 1) {
            onFieldChange('pepOrUsPerson', currentNames.filter((_: any, i: number) => i !== index));
        }
    };

    // Ensure at least one PEP input when the PEP question is set to true
    if (formData.directorOrBeneficialOwnerIsPEPOrUSPerson === true &&
        (!(formData as any).pepOrUsPerson || (formData as any).pepOrUsPerson.length === 0)) {
        onFieldChange('pepOrUsPerson', [""]);
    }

    const isFormValid = () => {
        return formData.shareCapital &&
            formData.sourceOfWealth && formData.sourceOfWealth.length > 0 &&
            formData.anticipatedSourceOfFundsOnDunamis && formData.anticipatedSourceOfFundsOnDunamis.length > 0 &&
            formData.companyProvideRegulatedFinancialServices !== null &&
            formData.directorOrBeneficialOwnerIsPEPOrUSPerson !== null &&
            formData.lastYearTurnover &&
            formData.expectedMonthlyInboundFiatPayments &&
            formData.expectedMonthlyOutboundFiatPayments &&
            (formData.directorOrBeneficialOwnerIsPEPOrUSPerson === true
                ? (formData as any).pepOrUsPerson && (formData as any).pepOrUsPerson.length > 0 &&
                (formData as any).pepOrUsPerson.some((n: any) => n && n.trim() !== "")
                : true) &&
            (!(formData as any).pepOrUsPerson || (formData as any).pepOrUsPerson.every((name: any) => !name || name.trim() !== ""));
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
                            <DollarSign className="h-12 w-12 text-primary mr-4" />
                            <h2 className="text-3xl font-bold">Business Financials</h2>
                        </div>
                        <p className="text-lg text-gray-600">
                            Provide financial information about your business operations and compliance details.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Financial Information */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">Financial Information</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="shareCapital" className="block text-lg font-medium text-gray-700 mb-3">
                                        Share Capital ({fiatCurrencyName}) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="shareCapital"
                                        name="shareCapital"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder={`Enter share capital (${fiatCurrencyName})`}
                                        value={formData.shareCapital ? formatNumber(formData.shareCapital.toString()) : ""}
                                        onChange={(e) => handleInputChange("shareCapital", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="lastYearTurnover" className="block text-lg font-medium text-gray-700 mb-3">
                                        Last Year Turnover ({fiatCurrencyName}) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="lastYearTurnover"
                                        name="lastYearTurnover"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder={`Enter last year turnover (${fiatCurrencyName})`}
                                        value={formData.lastYearTurnover ? formatNumber(formData.lastYearTurnover.toString()) : ""}
                                        onChange={(e) => handleInputChange("lastYearTurnover", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="companyAssets" className="block text-lg font-medium text-gray-700 mb-3">
                                        Company Assets ({fiatCurrencyName})
                                    </Label>
                                    <Input
                                        id="companyAssets"
                                        name="companyAssets"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder={`Enter company assets (${fiatCurrencyName})`}
                                        value={formData.companyAssets ? formatNumber(formData.companyAssets.toString()) : ""}
                                        onChange={(e) => handleInputChange("companyAssets", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="expectedMonthlyInboundFiatPayments" className="block text-lg font-medium text-gray-700 mb-3">
                                        Monthly Inbound Fiat Payments ({fiatCurrencyName}) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="expectedMonthlyInboundFiatPayments"
                                        name="expectedMonthlyInboundFiatPayments"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder={`Estimated expected amount (${fiatCurrencyName})`}
                                        value={formData.expectedMonthlyInboundFiatPayments ? formatNumber(formData.expectedMonthlyInboundFiatPayments.toString()) : ""}
                                        onChange={(e) => handleInputChange("expectedMonthlyInboundFiatPayments", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="expectedMonthlyOutboundFiatPayments" className="block text-lg font-medium text-gray-700 mb-3">
                                        Monthly Outbound Fiat Payments ({fiatCurrencyName}) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="expectedMonthlyOutboundFiatPayments"
                                        name="expectedMonthlyOutboundFiatPayments"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder={`Estimated expected amount (${fiatCurrencyName})`}
                                        value={formData.expectedMonthlyOutboundFiatPayments ? formatNumber(formData.expectedMonthlyOutboundFiatPayments.toString()) : ""}
                                        onChange={(e) => handleInputChange("expectedMonthlyOutboundFiatPayments", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="expectedMonthlyInboundCryptoPayments" className="block text-lg font-medium text-gray-700 mb-3">
                                        Monthly Inbound Crypto Payments ({cryptoCurrencyName})
                                    </Label>
                                    <Input
                                        id="expectedMonthlyInboundCryptoPayments"
                                        name="expectedMonthlyInboundCryptoPayments"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder={`Estimated expected amount (${cryptoCurrencyName})`}
                                        value={formData.expectedMonthlyInboundCryptoPayments ? formatNumber(formData.expectedMonthlyInboundCryptoPayments.toString()) : ""}
                                        onChange={(e) => handleInputChange("expectedMonthlyInboundCryptoPayments", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="expectedMonthlyOutboundCryptoPayments" className="block text-lg font-medium text-gray-700 mb-3">
                                        Monthly Outbound Crypto Payments ({cryptoCurrencyName})
                                    </Label>
                                    <Input
                                        id="expectedMonthlyOutboundCryptoPayments"
                                        name="expectedMonthlyOutboundCryptoPayments"
                                        type="text"
                                        className="h-16 text-lg"
                                        placeholder={`Estimated expected amount (${cryptoCurrencyName})`}
                                        value={formData.expectedMonthlyOutboundCryptoPayments ? formatNumber(formData.expectedMonthlyOutboundCryptoPayments.toString()) : ""}
                                        onChange={(e) => handleInputChange("expectedMonthlyOutboundCryptoPayments", e.target.value.replace(/,/g, ""))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Source of Wealth */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                                Source of Wealth <span className="text-red-500">*</span>
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {sourceOfWealthOptions.map((source) => (
                                    <div key={source.value} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={source.value}
                                            checked={formData.sourceOfWealth?.includes(source.value) || false}
                                            onCheckedChange={(checked) =>
                                                handleMultiSelectChange(
                                                    "sourceOfWealth",
                                                    source.value,
                                                    checked as boolean
                                                )
                                            }
                                            className="h-5 w-5"
                                        />
                                        <Label
                                            htmlFor={source.value}
                                            className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {source.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {formData.sourceOfWealth && formData.sourceOfWealth.length > 0 && (
                                <Alert variant="default" className="mt-4 bg-yellow-50 border-yellow-200 text-yellow-800">
                                    <AlertCircle className="w-5 h-5" />
                                    <AlertTitle className="text-sm">Notice</AlertTitle>
                                    <AlertDescription>
                                        We would require documents as proof of your selected source(s) of wealth for verification.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Anticipated Source of Funds */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                                Anticipated Source of Funds <span className="text-red-500">*</span>
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {anticipatedSourceOptions.map((source) => (
                                    <div key={source.value} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`anticipated-${source.value}`}
                                            checked={formData.anticipatedSourceOfFundsOnDunamis?.includes(source.value) || false}
                                            onCheckedChange={(checked) =>
                                                handleMultiSelectChange(
                                                    "anticipatedSourceOfFundsOnDunamis",
                                                    source.value,
                                                    checked as boolean
                                                )
                                            }
                                            className="h-5 w-5"
                                        />
                                        <Label
                                            htmlFor={`anticipated-${source.value}`}
                                            className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {source.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {formData.anticipatedSourceOfFundsOnDunamis && formData.anticipatedSourceOfFundsOnDunamis.length > 0 && (
                                <Alert variant="default" className="mt-4 bg-yellow-50 border-yellow-200 text-yellow-800">
                                    <AlertCircle className="w-5 h-5" />
                                    <AlertTitle className="text-sm">Notice</AlertTitle>
                                    <AlertDescription>
                                        You may be required to provide documents as proof of your selected anticipated source(s) of funds for verification.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Compliance Questions */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">Compliance</h3>

                            <div className="space-y-6">
                                <div>
                                    <Label className="block text-lg font-medium text-gray-700 mb-3">
                                        Does your company provide regulated financial services? <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover
                                        open={regulatedServicesPopover}
                                        onOpenChange={setRegulatedServicesPopover}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-16 justify-between text-lg"
                                            >
                                                {formData.companyProvideRegulatedFinancialServices !== null
                                                    ? yesNoOptions.find((option) => option.value === formData.companyProvideRegulatedFinancialServices)?.label
                                                    : "Select answer..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandList>
                                                    <CommandEmpty>No option found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {yesNoOptions.map((option) => (
                                                            <CommandItem
                                                                key={option.value.toString()}
                                                                value={option.label}
                                                                onSelect={() => {
                                                                    onFieldChange("companyProvideRegulatedFinancialServices", option.value);
                                                                    setRegulatedServicesPopover(false);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.companyProvideRegulatedFinancialServices === option.value
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
                                    <Label className="block text-lg font-medium text-gray-700 mb-3">
                                        Is any director or beneficial owner a PEP (Politically Exposed Person) or US person? <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover open={pepPersonPopover} onOpenChange={setPepPersonPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full h-16 justify-between text-lg"
                                            >
                                                {formData.directorOrBeneficialOwnerIsPEPOrUSPerson !== null
                                                    ? yesNoOptions.find((option) => option.value === formData.directorOrBeneficialOwnerIsPEPOrUSPerson)?.label
                                                    : "Select answer..."}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandList>
                                                    <CommandEmpty>No option found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {yesNoOptions.map((option) => (
                                                            <CommandItem
                                                                key={option.value.toString()}
                                                                value={option.label}
                                                                onSelect={() => {
                                                                    onFieldChange("directorOrBeneficialOwnerIsPEPOrUSPerson", option.value);
                                                                    setPepPersonPopover(false);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.directorOrBeneficialOwnerIsPEPOrUSPerson === option.value
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

                        {/* Names of PEP */}
                        {formData.directorOrBeneficialOwnerIsPEPOrUSPerson === true && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">
                                    Names of PEP or US persons <span className="text-red-500">*</span>
                                </h3>
                                <p className="text-base text-gray-600 mb-4">
                                    Provide the full names of any politically exposed persons (PEP) or US persons
                                    who are directors or beneficial owners.
                                </p>

                                {(formData.pepOrUsPerson || [""]).map((name, idx) => (
                                    <div key={`pep-${idx}`} className="flex items-center space-x-3">
                                        <Input
                                            id={`pep-${idx}`}
                                            type="text"
                                            className="h-16 text-lg flex-1"
                                            placeholder={`Person ${idx + 1} full name`}
                                            value={name}
                                            onChange={(e) => handlePepPersonChange(idx, e.target.value)}
                                        />
                                        {(formData.pepOrUsPerson?.length || 0) > 1 && (
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                onClick={() => removePepPerson(idx)}
                                                className="text-red-500 hover:text-red-700 h-16 px-6"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addPepPerson}
                                        className="h-12 px-6 text-lg"
                                    >
                                        Add Another Person
                                    </Button>
                                </div>
                            </div>
                        )}
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