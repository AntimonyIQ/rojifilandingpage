import React, { useEffect } from "react";
import {
    RenderInput,
    RenderSelect,
    ExchangeRateDisplay,
} from "./SharedFormComponents";
import { InvoiceSection } from "./InvoiceSection";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { PurposeOfPayment } from "@/v1/enums/enums";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { CheckIcon, ChevronsUpDownIcon, Check, Loader2 } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../ui/command";
import { cn } from "@/v1/lib/utils";
import { toast } from "sonner";
import countries from "../../../data/country_state.json";
import {
    IPayment,
    IResponse,
    IIBanDetailsResponse,
} from "@/v1/interface/interface";
import Defaults from "@/v1/defaults/defaults";
import { session, SessionData } from "@/v1/session/session";
import { Status } from "@/v1/enums/enums";

interface GBPPaymentFlowProps {
    formdata: Partial<IPayment>;
    onFieldChange: (field: string, value: string | boolean | File | Date) => void;
    loading: boolean;
    onSubmit: () => void;
    paymentLoading: boolean;
    validateForm: () => Promise<{ isValid: boolean; errors: string[] }>;
    walletActivated: boolean;
    onActivateWallet: () => void;
    exchangeRate?: {
        fromCurrency: string;
        toCurrency: string;
        rate: number;
        lastUpdated: Date;
        walletBalance: number;
        loading: boolean;
    };
    // Invoice-related props
    uploading?: boolean;
    uploadError?: string;
    onFileUpload?: (file: File) => Promise<void>;
    isFormComplete: () => boolean;
    onClose: () => void;
    action?: "pay-again" | "new-payment" | "fixed-rejected";
}

export const GBPPaymentFlow: React.FC<GBPPaymentFlowProps> = ({
    formdata,
    onFieldChange,
    loading,
    onSubmit,
    paymentLoading,
    validateForm,
    // walletActivated,
    // onActivateWallet,
    exchangeRate,
    uploading = false,
    uploadError = "",
    onFileUpload,
    isFormComplete,
    onClose,
    action,
}) => {
    const [popOpen, setPopOpen] = React.useState<boolean>(false);
    const [phoneCountryPopover, setPhoneCountryPopover] =
        React.useState<boolean>(false);

    // NEW: State for IBAN/Account Number switcher
    const [accountInputType, setAccountInputType] = React.useState<
        "iban" | "account"
    >("iban");
    const [ibanValidating, setIbanValidating] = React.useState<boolean>(false);
    const [ibanValidationResult, setIbanValidationResult] =
        React.useState<IIBanDetailsResponse | null>(null);

    const storage: SessionData = session.getUserData();

    useEffect(() => {
        // console.log("Sender currency changed to GBP, setting fundsDestinationCountry to UK", formdata.senderCurrency);
        onFieldChange("fundsDestinationCountry", "UK");

        // Set default phone code to US (+1) if not already set
        if (!(formdata as any).beneficiaryPhoneCode) {
            onFieldChange("beneficiaryPhoneCode", "1");
            onFieldChange("beneficiaryPhoneCountryIso", "US");
        }
    }, [formdata.senderCurrency]);

    // Auto-set account input type for fixed-rejected and pay-again actions
    useEffect(() => {
        if (action === "fixed-rejected" || action === "pay-again") {
            if (formdata.beneficiaryIban && formdata.beneficiaryIban.trim() !== "") {
                setAccountInputType("iban");
            } else if (formdata.beneficiaryAccountNumber && formdata.beneficiaryAccountNumber.trim() !== "") {
                setAccountInputType("account");
            }
            // If neither has a value, keep default "iban"
        }
    }, [action, formdata.beneficiaryIban, formdata.beneficiaryAccountNumber]);

    // NEW: IBAN validation function
    const validateIban = async (iban: string): Promise<void> => {
        if (!iban || iban.length < 15) {
            setIbanValidationResult(null);
            return;
        }

        try {
            setIbanValidating(true);
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
            if (data.status === Status.ERROR) {
                setIbanValidationResult(null);
            }
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Handshake missing");
                const parseData: IIBanDetailsResponse = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );
                setIbanValidationResult(parseData);
            }
        } catch (error: any) {
            console.error("Failed to validate IBAN:", error);
            setIbanValidationResult(null);
        } finally {
            setIbanValidating(false);
        }
    };

    // NEW: Handle IBAN input change with validation
    const handleIbanChange = (value: string) => {
        const sanitized = value
            .replace(/[^A-Za-z0-9]/g, "")
            .toUpperCase()
            .slice(0, 34);
        onFieldChange("beneficiaryIban", sanitized);

        // Trigger validation when minimum length is reached
        if (sanitized.length >= 15) {
            validateIban(sanitized);
        } else {
            setIbanValidationResult(null);
        }
    };

    // NEW: Handle account type switch
    const handleAccountTypeSwitch = (type: "iban" | "account") => {
        setAccountInputType(type);
        setIbanValidationResult(null);

        // Clear the other field when switching ONLY for new payments
        // For pay-again or fixed-rejected, preserve both values
        if (action !== "pay-again" && action !== "fixed-rejected") {
            if (type === "iban") {
                onFieldChange("beneficiaryAccountNumber", "");
            } else {
                onFieldChange("beneficiaryIban", "");
            }
        }
    };

    const handleSubmit = async () => {
        const validation = await validateForm();
        if (!validation.isValid) {
            // Show validation errors as toast
            validation.errors.forEach((error: string) => {
                toast.error(error, {
                    duration: 4000,
                    position: "top-center",
                });
            });
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        onSubmit();
    };

    const calculateRequiredUSD = (gbpAmount: string | number): string => {
        if (!exchangeRate || !gbpAmount) return "";
        // Convert to string if it's a number, then remove commas
        const amountStr =
            typeof gbpAmount === "number" ? gbpAmount.toString() : gbpAmount;
        const numericAmount = parseFloat(amountStr.replace(/,/g, ""));
        if (isNaN(numericAmount)) return "";
        const res: string = (numericAmount / exchangeRate.rate).toFixed(2);
        return res;
    };

    const requiredUSD = calculateRequiredUSD(formdata.beneficiaryAmount || "");
    const isInsufficientBalance =
        exchangeRate && requiredUSD
            ? parseFloat(requiredUSD) > exchangeRate.walletBalance
            : false;

    const onFileRemove = () => {
        // remove the uploaded file and the url
        onFieldChange("paymentInvoice", "");
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full pb-20 bg-gray-50 rounded-2xl p-6 border border-gray-200">
            {/* Exchange Rate Display */}
            {exchangeRate && (
                <ExchangeRateDisplay
                    fromCurrency={exchangeRate.fromCurrency}
                    toCurrency={exchangeRate.toCurrency}
                    fromAmount={requiredUSD}
                    toAmount={formdata.beneficiaryAmount || ""}
                    rate={exchangeRate.rate}
                    loading={exchangeRate.loading}
                    lastUpdated={exchangeRate.lastUpdated}
                    walletBalance={exchangeRate.walletBalance}
                    insufficient={isInsufficientBalance}
                />
            )}

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4"></div>

            {/* Payment Details Section */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Payment Details
                </h3>
                <div className="space-y-4">
                    <RenderInput
                        fieldKey="beneficiaryAmount"
                        label="Amount (GBP)"
                        value={formdata.beneficiaryAmount || ""}
                        disabled={loading}
                        readOnly={loading}
                        type="text"
                        required={true}
                        placeholder="Enter Amount To Send in GBP"
                        onFieldChange={onFieldChange}
                    />

                    <RenderInput
                        fieldKey="beneficiaryAccountName"
                        label="Beneficiary Name"
                        placeholder="Enter Beneficiary Name"
                        value={formdata.beneficiaryAccountName || ""}
                        disabled={loading}
                        readOnly={loading}
                        type="text"
                        required={true}
                        onFieldChange={onFieldChange}
                    />

                    {/* Phone Number with Country Code */}
                    <div className="w-full">
                        <Label className="block text-sm font-semibold text-gray-800 mb-3">
                            Beneficiary Phone <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Popover
                                open={phoneCountryPopover}
                                onOpenChange={setPhoneCountryPopover}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        size="md"
                                        aria-expanded={phoneCountryPopover}
                                        disabled={loading}
                                        className="w-32 justify-between h-12 border-2 rounded-lg transition-all duration-200 hover:border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-1">
                                            <img
                                                src={`https://flagcdn.com/w320/${(
                                                    (formdata as any).beneficiaryPhoneCountryIso || "us"
                                                ).toLowerCase()}.png`}
                                                alt=""
                                                width={20}
                                                height={20}
                                                className=""
                                            />
                                            <span className="text-gray-900 font-medium text-sm">
                                                {(formdata as any).beneficiaryPhoneCode
                                                    ? `+${(formdata as any).beneficiaryPhoneCode}`
                                                    : "+1"}
                                            </span>
                                        </div>
                                        <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-60 p-0">
                                    <Command>
                                        <CommandInput placeholder="Search country..." />
                                        <CommandList>
                                            <CommandEmpty>No country found.</CommandEmpty>
                                            <CommandGroup>
                                                {countries.map((country, index) => (
                                                    <CommandItem
                                                        key={`${country.iso2}-${index}`}
                                                        value={country.name}
                                                        onSelect={() => {
                                                            onFieldChange(
                                                                "beneficiaryPhoneCode",
                                                                country.phonecode
                                                            );
                                                            onFieldChange(
                                                                "beneficiaryPhoneCountryIso",
                                                                country.iso2
                                                            );
                                                            setPhoneCountryPopover(false);
                                                        }}
                                                    >
                                                        <CheckIcon
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                (formdata as any).beneficiaryPhoneCountryIso ===
                                                                    country.iso2
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
                                                        <span className="ml-2">
                                                            +{country.phonecode} {country.name}
                                                        </span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <Input
                                className="flex-1 h-12 border-2 rounded-lg transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300"
                                value={(formdata as any).beneficiaryPhone || ""}
                                onChange={(e) =>
                                    onFieldChange(
                                        "beneficiaryPhone",
                                        e.target.value.replace(/\D/g, "")
                                    )
                                }
                                placeholder="Enter Phone Number"
                                required
                                type="text"
                                disabled={loading}
                            />
                        </div>
                    </div>

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
                            onFieldChange={onFieldChange}
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
                            onFieldChange={onFieldChange}
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
                            required={false}
                            onFieldChange={(field, value) => {
                                // Trim spaces from postal code
                                const trimmedValue = typeof value === 'string' ? value.replace(/\s+/g, '') : value;
                                onFieldChange(field, trimmedValue);
                            }}
                        />

                        <div className="w-full">
                            <Label
                                htmlFor="beneficiary_country"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Beneficiary Country <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Popover
                                    open={popOpen}
                                    onOpenChange={() => setPopOpen(!popOpen)}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            size="md"
                                            aria-expanded={popOpen}
                                            className="w-full justify-between h-14"
                                        >
                                            <div className="flex items-center gap-2">
                                                {formdata.beneficiaryCountry && (
                                                    <img
                                                        src={`https://flagcdn.com/w320/${countries
                                                            .find(
                                                                (c) =>
                                                                    c.name.trim() ===
                                                                    formdata.beneficiaryCountry
                                                            )
                                                            ?.iso2?.toLowerCase() || ""
                                                            }.png`}
                                                        alt=""
                                                        width={18}
                                                        height={18}
                                                    />
                                                )}
                                                {formdata.beneficiaryCountry
                                                    ? countries.find(
                                                        (country) =>
                                                            country.name.trim() ===
                                                            formdata.beneficiaryCountry
                                                    )?.name
                                                    : "Select country..."}
                                            </div>
                                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search country..." />
                                            <CommandList>
                                                <CommandEmpty>No country found.</CommandEmpty>
                                                <CommandGroup>
                                                    {countries
                                                        .filter(
                                                            (country) =>
                                                                ![
                                                                    "AQ",
                                                                    "BV",
                                                                    "CX",
                                                                    "TF",
                                                                    "HM",
                                                                    "KP",
                                                                    "YT",
                                                                    "RE",
                                                                    "BL",
                                                                    "GS",
                                                                    "UM",
                                                                ].includes(country.iso2)
                                                        )
                                                        .map((country, index) => (
                                                            <CommandItem
                                                                key={index}
                                                                value={country.name}
                                                                onSelect={(currentValue) => {
                                                                    onFieldChange(
                                                                        "beneficiaryCountry",
                                                                        currentValue.trim()
                                                                    );
                                                                    onFieldChange(
                                                                        "beneficiaryCountryCode",
                                                                        country?.iso2 || ""
                                                                    );
                                                                    setPopOpen(false);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formdata.beneficiaryCountry ===
                                                                            country.name.trim()
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

                    {/* ⚠️ SORT CODE FIELD TEMPORARILY DISABLED - REMOVE THIS COMMENT BLOCK TO RE-ENABLE */}
                    {/* <RenderInput
                        fieldKey="beneficiarySortCode"
                        label="Sort Code"
                        placeholder="Enter Sort Code (e.g., 12-34-56)"
                        value={formdata.beneficiarySortCode || ""}
                        disabled={loading}
                        readOnly={loading}
                        type="text"
                        required={true}
                        onFieldChange={onFieldChange}
                    /> */}
                    {/* ⚠️ END SORT CODE FIELD - UNCOMMENT ABOVE TO RE-ENABLE */}

                    {/* NEW: IBAN / Account Number Switcher Section */}
                    <div className="w-full space-y-4">
                        {/* Switcher Toggle */}
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-gray-800">
                                Account Details <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => handleAccountTypeSwitch("iban")}
                                    className={cn(
                                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                                        accountInputType === "iban"
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    )}
                                >
                                    IBAN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAccountTypeSwitch("account")}
                                    className={cn(
                                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                                        accountInputType === "account"
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    )}
                                >
                                    Account Number
                                </button>
                            </div>
                        </div>

                        {/* IBAN Input (with validation) */}
                        {accountInputType === "iban" && (
                            <div className="space-y-2">
                                <div className="relative">
                                    <Input
                                        className={cn(
                                            "h-12 border-2 rounded-lg transition-all duration-200 font-mono text-sm",
                                            ibanValidationResult?.valid
                                                ? "border-green-500 bg-green-50 pr-10 focus:border-green-600"
                                                : ibanValidating
                                                    ? "border-blue-400 bg-blue-50"
                                                    : "border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        )}
                                        value={formdata.beneficiaryIban || ""}
                                        onChange={(e) => handleIbanChange(e.target.value)}
                                        placeholder="Enter Beneficiary IBAN"
                                        required={accountInputType === "iban"}
                                        type="text"
                                        disabled={loading}
                                        maxLength={34}
                                    />
                                    {/* Validation Icons */}
                                    {ibanValidating && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        </div>
                                    )}
                                    {ibanValidationResult?.valid && !ibanValidating && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* IBAN Validation Details */}
                                {ibanValidationResult?.valid && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium text-green-900">
                                                    IBAN Validated
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                                                    <div>
                                                        <span className="font-medium">Bank:</span>{" "}
                                                        {ibanValidationResult.bank_name}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Country:</span>{" "}
                                                        {countries.find(
                                                            (c) => c.iso2 === ibanValidationResult.country
                                                        )?.name || ibanValidationResult.country}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500">
                                    Enter the beneficiary's IBAN. Validation will occur
                                    automatically.
                                </p>
                            </div>
                        )}

                        {/* Account Number Input (no validation needed) */}
                        {accountInputType === "account" && (
                            <div className="space-y-2">
                                <Input
                                    className="h-12 border-2 border-gray-300 rounded-lg transition-all duration-200 hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    value={formdata.beneficiaryAccountNumber || ""}
                                    onChange={(e) =>
                                        onFieldChange("beneficiaryAccountNumber", e.target.value)
                                    }
                                    placeholder="Enter Account Number"
                                    required={accountInputType === "account"}
                                    type="text"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500">
                                    Enter the beneficiary's account number.
                                </p>
                            </div>
                        )}
                    </div>
                    {/* END NEW SECTION */}
                </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

            {/* Invoice & Documentation Section */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-gray-200">
                    Invoice & Documentation
                </h3>
                <InvoiceSection
                    formdata={formdata}
                    onFieldChange={onFieldChange}
                    loading={loading}
                    uploading={uploading}
                    uploadError={uploadError}
                    onFileUpload={onFileUpload}
                    onFileRemove={onFileRemove}
                />
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

            {/* Transfer Reason Section */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-gray-200">
                    Transfer Details
                </h3>
                <div className="space-y-4">
                    <RenderSelect
                        fieldKey="reason"
                        label="Reason for Transfer"
                        value={formdata.reason || ""}
                        placeholder="Select reason for transfer"
                        required={true}
                        options={[
                            {
                                value: PurposeOfPayment.PAYMENT_FOR_GOODS,
                                label: "Payment For Goods",
                            },
                            {
                                value: PurposeOfPayment.PAYMENT_FOR_BUSINESS_SERVICES,
                                label: "Payment For Business Services",
                            },
                            {
                                value: PurposeOfPayment.CAPITAL_INVESTMENT_OR_ITEM,
                                label: "Capital Investment Or Item",
                            },
                            { value: PurposeOfPayment.OTHER, label: "Other" },
                        ]}
                        onFieldChange={onFieldChange}
                    />

                    {formdata.reason === PurposeOfPayment.OTHER && (
                        <RenderInput
                            fieldKey="reasonDescription"
                            label="Reason Description"
                            placeholder="Please describe the reason for this transfer"
                            value={formdata.reasonDescription || ""}
                            disabled={loading}
                            readOnly={loading}
                            type="text"
                            required={true}
                            onFieldChange={onFieldChange}
                        />
                    )}
                </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                <Button
                    variant="outline"
                    type="button"
                    onClick={onClose} // ✅ now this works
                    className="font-medium border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 h-12 inline-block text-center w-full sm:w-auto min-w-[140px] transition-all duration-200"
                >
                    Cancel
                </Button>
                <Button
                    className={`
                        w-full sm:w-auto min-w-[160px] h-12 rounded-xl font-semibold text-base transition-all duration-200
                        ${!isFormComplete() || paymentLoading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                            : isInsufficientBalance
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }
                    `}
                    variant="default"
                    size="lg"
                    disabled={!isFormComplete() || paymentLoading}
                    onClick={handleSubmit}
                >
                    {paymentLoading
                        ? "Processing..."
                        : isInsufficientBalance
                            ? "Insufficient Balance"
                            : "Create Payment"}
                </Button>
            </div>
        </div>
    );
};
