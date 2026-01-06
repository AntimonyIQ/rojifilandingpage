import React, { useEffect, useState } from "react";
import { RenderInput } from "./SharedFormComponents";
import { InvoiceSection } from "./InvoiceSection";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import {
    CheckIcon,
    ChevronsUpDownIcon,
    Globe,
    Loader,
    Check,
    Loader2,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../ui/command";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/v1/components/ui/dialog";
import { cn } from "@/v1/lib/utils";
import { toast } from "sonner";
import { session, SessionData } from "@/v1/session/session";
import {
    IIBanDetailsResponse,
    IPayment,
    IResponse,
    ISender,
    IWallet,
} from "@/v1/interface/interface";
import Defaults from "@/v1/defaults/defaults";
import { Status, PurposeOfPayment } from "@/v1/enums/enums";
import { State, Country, IState, ICountry } from "country-state-city";

interface USDPaymentFlowProps {
    formdata: Partial<IPayment>;
    onFieldChange: (field: string, value: string | boolean | File | Date) => void;
    loading: boolean;
    ibanlist: string[];
    onFileUpload: (file: File) => void;
    uploadError: string;
    uploading: boolean;
    onSubmit: () => void;
    paymentLoading: boolean;
    validateForm: () => Promise<{ isValid: boolean; errors: string[] }>;
    selectedWallet: IWallet | null;
    // Removed: ibanDetails, ibanLoading, fetchIbanDetails - now handled internally
    isFormComplete: () => boolean;
    onClose: () => void;
    action: "pay-again" | "new-payment" | "fixed-rejected";
}

// NOTE: EXCLUDED_IBAN_COUNTRIES removed - no longer using country-based logic for IBAN/Account Number

export const USDPaymentFlow: React.FC<USDPaymentFlowProps> = ({
    formdata,
    onFieldChange,
    loading,
    onFileUpload,
    uploadError,
    uploading,
    onSubmit,
    paymentLoading,
    validateForm,
    selectedWallet,
    isFormComplete,
    onClose,
    action,
}) => {
    const { wallet } = useParams();
    const [popOpen, setPopOpen] = React.useState(false);
    const [statePopOpen, setStatePopOpen] = React.useState(false);
    const [phoneCountryPopover, setPhoneCountryPopover] = React.useState(false);
    const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
    const statePopoverTriggerRef = React.useRef<HTMLButtonElement>(null);
    const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>(
        undefined
    );
    const [statePopoverWidth, setStatePopoverWidth] = React.useState<
        number | undefined
    >(undefined);
    // const [loadingSenders, setLoadingSenders] = useState<boolean>(true);
    // const [PrimarySender, setPrimarySender] = useState<ISender | null>(null);
    const [senders, setSenders] = useState<Array<ISender>>([]);
    const [showInsufficientFundsModal, setShowInsufficientFundsModal] =
        React.useState<boolean>(false);

    // NEW: State for IBAN/Account Number switcher
    const [accountInputType, setAccountInputType] = React.useState<
        "iban" | "account"
    >("iban");
    const [ibanValidating, setIbanValidating] = React.useState<boolean>(false);
    const [ibanValidationResult, setIbanValidationResult] =
        React.useState<IIBanDetailsResponse | null>(null);

    // Get countries and states from library
    const countries: ICountry[] = Country.getAllCountries();
    const [availableStates, setAvailableStates] = React.useState<IState[]>([]);

    const storage: SessionData = session.getUserData();

    useEffect(() => {
        // Load sender from session storage and prefill
        if (storage && storage.sender) {
            setSenders([storage.sender]);
            // Prefill sender name if not already set
            if (!formdata.senderName) {
                onFieldChange("senderName", storage.sender.businessName);
            }
        }
        // loadSenders(); // COMMENTED OUT - Now using sender from session storage

        // Set default phone code to US (+1) if not already set
        if (!(formdata as any).beneficiaryPhoneCode) {
            onFieldChange("beneficiaryPhoneCode", "1");
            onFieldChange("beneficiaryPhoneCountryIso", "US");
        }
    }, []);

    // Update available states when country changes
    useEffect(() => {
        if (formdata.beneficiaryCountry) {
            const selectedCountry = countries.find(
                (c) =>
                    c.name.trim().toLowerCase() ===
                    formdata.beneficiaryCountry?.trim().toLowerCase()
            );
            if (selectedCountry) {
                const states = State.getStatesOfCountry(selectedCountry.isoCode);
                setAvailableStates(states);
            } else {
                setAvailableStates([]);
            }
        } else {
            setAvailableStates([]);
        }
    }, [formdata.beneficiaryCountry]);

    /* OLD: Load senders from API - now loading from session storage
    const loadSenders = async () => {
        try {
            setLoadingSenders(true);

            const res = await fetch(`${Defaults.API_BASE_URL}/sender/payments`, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake)
                    throw new Error("Unable to process request, please try again.");
                const parseData: Array<ISender> = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );
                setSenders(parseData);
            }
        } catch (error: any) {
            console.error("error loading senders", error);
        } finally {
            setLoadingSenders(false);
        }
    };
    */

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
    // const amount = Number(formdata.beneficiaryAmount);
    // const currentBalance = selectedWallet?.balance || 0;
    // const hasInsufficientFunds = amount > currentBalance || currentBalance <= 0;

        /*
                    if (hasInsufficientFunds) {
                        setShowInsufficientFundsModal(true);
                        return;
                    }
                    */

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

    const getFundsDestinationCountry = (swiftCode: string): string => {
        if (!swiftCode || swiftCode.length < 6) {
            return "";
        }
        const iso = swiftCode.substring(4, 6).toUpperCase();
        return iso;
    };

    const senderSelectOptions = (): Array<{ value: string; label: string }> => {
        return senders.map((sender) => ({
            value: sender.businessName,
            label: sender.businessName,
        }));
    };

    // Effect to sync PopoverContent width with PopoverTrigger
    React.useEffect(() => {
        if (popOpen && popoverTriggerRef.current) {
            setPopoverWidth(popoverTriggerRef.current.offsetWidth);
        }
    }, [popOpen]);

    // Effect to sync State PopoverContent width with PopoverTrigger
    React.useEffect(() => {
        if (statePopOpen && statePopoverTriggerRef.current) {
            setStatePopoverWidth(statePopoverTriggerRef.current.offsetWidth);
        }
    }, [statePopOpen]);

    const onFileRemove = () => {
        // remove the uploaded file and the url
        onFieldChange("paymentInvoice", "");
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full pb-20 bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <RenderInput
                fieldKey="destinationCountry"
                label="Beneficiary's Country"
                value={
                    countries.find((c) => c.isoCode === formdata.fundsDestinationCountry)
                        ?.name || ""
                }
                readOnly={true}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
                Image={
                    formdata.fundsDestinationCountry ? (
                        <img
                            src={`https://flagcdn.com/w320/${getFundsDestinationCountry(
                                formdata.swiftCode || ""
                            ).toLowerCase()}.png`}
                            className="rounded-full h-5 w-5"
                        />
                    ) : (
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    )
                }
            />

            <RenderInput
                fieldKey="beneficiaryBankName"
                label="Bank Name"
                placeholder="Bank Name"
                value={formdata.beneficiaryBankName || ""}
                readOnly={true}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
            />

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4"></div>

            {/* Sender Information Section */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-gray-200">
                    Sender Information
                </h3>
                <div className="space-y-4">
                    {/* Create Payment For */}
                    {/* <div className="w-full">
                        <RenderInput
                            fieldKey="sender"
                            label="Create Payment For"
                            value="Primary Business"
                            readOnly={true}
                            type="text"
                            required={true}
                            placeholder="Create Payment For"
                            onFieldChange={onFieldChange}
                        />
                    </div> */}

                    {/* Sender Name */}
                    <div className="w-full">
                        <Label className="block text-sm font-semibold text-gray-800 mb-3">
                            Sender Name <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formdata.senderName || undefined}
                            onValueChange={(val: string) => {
                                // console.log("🔥 Sender Name selected:", val);
                                onFieldChange("senderName", val);
                            }}
                        >
                            <SelectTrigger className="w-full h-14 border-2 rounded-lg transition-all duration-200 text-base font-medium border-gray-300 bg-white hover:border-gray-400">
                                <SelectValue placeholder="Select Sender Name" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                                {senderSelectOptions().map((option, index) => (
                                    <SelectItem
                                        key={index}
                                        value={option.value}
                                        className="hover:bg-blue-50 cursor-pointer py-3 text-base font-medium"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

            {/* Payment Details Section */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-gray-200">
                    Payment Details
                </h3>
                <div className="space-y-4">
                    <div className="w-full">
                        <Label className="mb-2 block text-sm font-semibold text-gray-700">
                            Wallet
                        </Label>
                        <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm">
                            <div className="flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full w-10 h-10">
                                <img
                                    src={selectedWallet?.icon}
                                    alt=""
                                    className="w-7 h-7 rounded-full object-contain"
                                />
                            </div>
                            <div className="h-8 w-px bg-gray-200 mx-2" />
                            <div className="flex flex-row items-center gap-2">
                                <span className="font-semibold text-gray-800">
                                    {selectedWallet?.currency} Wallet
                                </span>
                                <span className="text-base font-semibold text-gray-700 mt-0.5">
                                    {selectedWallet?.symbol}
                                    {typeof selectedWallet?.balance === "number"
                                        ? selectedWallet.balance.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })
                                        : "0.00"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <RenderInput
                        fieldKey="beneficiaryAmount"
                        label="Amount ($)"
                        value={formdata.beneficiaryAmount || ""}
                        disabled={action === "fixed-rejected" ? true : loading}
                        readOnly={action === "fixed-rejected" ? true : loading}
                        type="text"
                        required={true}
                        placeholder="Enter Amount To Send"
                        onFieldChange={onFieldChange}
                    />

                    {/* Recipient Account - Hidden */}
                    <div className="w-full" style={{ display: "none" }}>
                        <Label className="block text-sm font-semibold text-gray-800 mb-3">
                            Recipient Account <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formdata.beneficiaryAccountType || "business"}
                            onValueChange={(val: string) => {
                                onFieldChange("beneficiaryAccountType", val);
                            }}
                        >
                            <SelectTrigger className="w-full h-14 border-2 rounded-lg transition-all duration-200 text-base font-medium border-gray-300 bg-white hover:border-gray-400">
                                <SelectValue placeholder="Select Account Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                                <SelectItem
                                    value="personal"
                                    className="hover:bg-blue-50 cursor-pointer py-3 text-base font-medium"
                                >
                                    Personal
                                </SelectItem>
                                <SelectItem
                                    value="business"
                                    className="hover:bg-blue-50 cursor-pointer py-3 text-base font-medium"
                                >
                                    Business
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                                                        key={`${country.isoCode}-${index}`}
                                                        value={country.name}
                                                        onSelect={() => {
                                                            onFieldChange(
                                                                "beneficiaryPhoneCode",
                                                                country.phonecode
                                                            );
                                                            onFieldChange(
                                                                "beneficiaryPhoneCountryIso",
                                                                country.isoCode
                                                            );
                                                            setPhoneCountryPopover(false);
                                                        }}
                                                    >
                                                        <CheckIcon
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                (formdata as any).beneficiaryPhoneCountryIso ===
                                                                    country.isoCode
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        <img
                                                            src={`https://flagcdn.com/w320/${country.isoCode.toLowerCase()}.png`}
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

                    <div>
                        {/* // Phone Number with Country Code
                    <div className="space-y-2">
                        <Label>Phone <span className="text-red-500">*</span></Label>
                        <div className="flex gap-2">
                            <FormField
                                control={form.control}
                                name="phoneCountryCode"
                                render={({ field }) => (
                                    <FormItem className="w-[180px]">
                                        <Popover open={phoneCountryPopover} onOpenChange={setPhoneCountryPopover}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <div className="flex flex-row items-center gap-2">
                                                            {field.value && selectedPhoneCountry && (
                                                                <>
                                                                    <img
                                                                        src={`https://flagcdn.com/w320/${selectedPhoneCountry.toLowerCase()}.png`}
                                                                        alt=""
                                                                        width={18}
                                                                        height={18}
                                                                    />
                                                                    <span>{field.value}</span>
                                                                </>
                                                            )}
                                                            {!field.value && "Code"}
                                                        </div>
                                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className=" p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search country..." />
                                                    <CommandList className="max-h-[200px] overflow-y-auto">
                                                        <CommandEmpty>No country found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {COUNTRIES.filter(country => country.phoneCode).map((country) => (
                                                                <CommandItem
                                                                    key={country.code}
                                                                    value={`${country.name} +${country.phoneCode}`}
                                                                    onSelect={() => {
                                                                        const phoneCode = `+${country.phoneCode}`;
                                                                        field.onChange(phoneCode);
                                                                        setSelectedPhoneCountry(country.code);
                                                                        setPhoneCountryPopover(false);

                                                                        // Update the combined phone field
                                                                        const phoneNum = form.getValues('phoneNumber');
                                                                        form.setValue('phone', `${phoneCode}${phoneNum}`);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            selectedPhoneCountry === country.code ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <img
                                                                        src={`https://flagcdn.com/w320/${country.code.toLowerCase()}.png`}
                                                                        alt=""
                                                                        width={18}
                                                                        height={18}
                                                                        className="mr-2"
                                                                    />
                                                                    <span className="flex-1">{country.name}</span>
                                                                    <span className="text-muted-foreground text-sm ml-2">+{country.phoneCode}</span>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input
                                                placeholder="Enter phone number"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    field.onChange(value);
                                                    const countryCode = form.getValues('phoneCountryCode');
                                                    form.setValue('phone', `${countryCode}${value}`);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Select country code and enter phone number (e.g., +1 3088726022)
                        </p>
                    </div>
                    */}
                    </div>

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
                                                            (c) => c.isoCode === ibanValidationResult.country
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

                    {(() => {
                        const countryIso = getFundsDestinationCountry(
                            String(formdata.swiftCode)
                        ).toUpperCase();
                        return countryIso === "IN";
                    })() && (
                            <RenderInput
                                fieldKey="beneficiaryIFSC"
                                label="Beneficiary IFSC Code"
                                placeholder="Enter IFSC Code"
                                value={formdata.beneficiaryIFSC || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                                onFieldChange={onFieldChange}
                            />
                        )}

                    {/* TEMPORARILY COMMENTED OUT - ABA/Routing Number Input */}
                    {/* {(() => {
                        const countryIso = getFundsDestinationCountry(
                            String(formdata.swiftCode)
                        ).toUpperCase();
                        return ["US", "PR", "AS", "GU", "MP", "VI"].includes(countryIso);
                    })() && (
                            <RenderInput
                                fieldKey="beneficiaryAbaRoutingNumber"
                                label="Beneficiary ABA / Routing number"
                                placeholder="Enter ABA / Routing number"
                                value={formdata.beneficiaryAbaRoutingNumber || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                                onFieldChange={onFieldChange}
                            />
                        )} */}

                    {/* TEMPORARILY COMMENTED OUT - Australia BSB Number Field */}
                    {/* {(() => {
                        const countryIso = getFundsDestinationCountry(
                            String(formdata.swiftCode)
                        ).toUpperCase();
                        return countryIso === "AU";
                    })() && (
                            <RenderInput
                                fieldKey="beneficiaryBankStateBranch"
                                label="Beneficiary Bank-State-Branch (BSB) number"
                                placeholder="Enter Bank-State-Branch (BSB) number"
                                value={formdata.beneficiaryBankStateBranch || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                                onFieldChange={onFieldChange}
                            />
                        )} */}

                    {/* TEMPORARILY COMMENTED OUT - Canada Institution/Transit Number Fields */}
                    {/* {(() => {
                        const countryIso = getFundsDestinationCountry(
                            String(formdata.swiftCode)
                        ).toUpperCase();
                        return countryIso === "CA";
                    })() && (
                            <>
                                <RenderInput
                                    fieldKey="beneficiaryInstitutionNumber"
                                    label="Institution number (Bank code)"
                                    placeholder="Enter Institution number (Bank code)"
                                    value={formdata.beneficiaryInstitutionNumber || ""}
                                    disabled={loading}
                                    readOnly={loading}
                                    type="text"
                                    required={true}
                                    onFieldChange={onFieldChange}
                                />
                                <RenderInput
                                    fieldKey="beneficiaryTransitNumber"
                                    label="Transit number (Branch code)"
                                    placeholder="Enter Transit number (Branch code)"
                                    value={formdata.beneficiaryTransitNumber || ""}
                                    disabled={loading}
                                    readOnly={loading}
                                    type="text"
                                    required={true}
                                    onFieldChange={onFieldChange}
                                />
                            </>
                        )} */}

                    {(() => {
                        const countryIso = getFundsDestinationCountry(
                            String(formdata.swiftCode)
                        ).toUpperCase();
                        return countryIso === "ZA";
                    })() && (
                            <RenderInput
                                fieldKey="beneficiaryRoutingCode"
                                label="Beneficiary Routing code."
                                placeholder="Enter Routing number"
                                value={formdata.beneficiaryRoutingCode || ""}
                                disabled={loading}
                                readOnly={loading}
                                type="text"
                                required={true}
                                onFieldChange={onFieldChange}
                            />
                        )}

                    <div className="w-full">
                        <Label
                            htmlFor="beneficiary_country"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Beneficiary Country <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                                <PopoverTrigger asChild>
                                    <Button
                                        ref={popoverTriggerRef}
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
                                                                c.name.trim().toLowerCase() ===
                                                                formdata.beneficiaryCountry
                                                                    ?.trim()
                                                                    .toLowerCase()
                                                        )
                                                        ?.isoCode?.toLowerCase() || ""
                                                        }.png`}
                                                    alt=""
                                                    width={18}
                                                    height={18}
                                                />
                                            )}
                                            {formdata.beneficiaryCountry
                                                ? countries.find(
                                                    (country) =>
                                                        country.name.trim().toLowerCase() ===
                                                        formdata.beneficiaryCountry?.trim().toLowerCase()
                                                )?.name
                                                : "Select country..."}
                                        </div>
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="p-0"
                                    style={popoverWidth ? { width: popoverWidth } : {}}
                                >
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
                                                            ].includes(country.isoCode)
                                                    )
                                                    .map((country, index) => (
                                                        <CommandItem
                                                            key={`${country.isoCode}-${index}`}
                                                            value={country.name}
                                                            onSelect={(currentValue) => {
                                                                onFieldChange(
                                                                    "beneficiaryCountry",
                                                                    currentValue
                                                                );
                                                                onFieldChange(
                                                                    "beneficiaryCountryCode",
                                                                    country?.isoCode || ""
                                                                );
                                                                setPopOpen(false);
                                                            }}
                                                        >
                                                            <CheckIcon
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formdata.beneficiaryCountry
                                                                        ?.trim()
                                                                        .toLowerCase() ===
                                                                        country.name.trim().toLowerCase()
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <img
                                                                src={`https://flagcdn.com/w320/${country.isoCode.toLowerCase()}.png`}
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

                        {/* State Selection - Show for US or UK beneficiary countries */}
                        {(formdata.beneficiaryCountry?.trim().toLowerCase() === "united states" ||
                            formdata.beneficiaryCountry?.trim().toLowerCase() === "united kingdom") && (
                            <div className="w-full">
                                <Label
                                    htmlFor="beneficiary_state"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Select State/Province
                                </Label>
                                <div className="relative">
                                    <Popover
                                        open={statePopOpen}
                                        onOpenChange={() => setStatePopOpen(!statePopOpen)}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                ref={statePopoverTriggerRef}
                                                variant="outline"
                                                role="combobox"
                                                size="md"
                                                aria-expanded={statePopOpen}
                                                className="w-full justify-between h-14"
                                                disabled={
                                                    !formdata.beneficiaryCountry ||
                                                    availableStates.length === 0
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    {formdata.beneficiaryState
                                                        ? availableStates.find(
                                                            (state) =>
                                                                state.isoCode.trim().toLowerCase() ===
                                                                formdata.beneficiaryState
                                                                    ?.trim()
                                                                    .toLowerCase()
                                                        )?.name || formdata.beneficiaryState
                                                        : availableStates.length === 0
                                                            ? "No states available"
                                                            : "Select state..."}
                                                </div>
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="p-0"
                                            style={
                                                statePopoverWidth ? { width: statePopoverWidth } : {}
                                            }
                                        >
                                            <Command>
                                                <CommandInput placeholder="Search state..." />
                                                <CommandList>
                                                    <CommandEmpty>No state found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {availableStates.map((state, index) => (
                                                            <CommandItem
                                                                key={`${state.isoCode}-${index}`}
                                                                value={state.name}
                                                                onSelect={() => {
                                                                    onFieldChange(
                                                                        "beneficiaryState",
                                                                        state.isoCode
                                                                    );
                                                                    setStatePopOpen(false);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formdata.beneficiaryState
                                                                            ?.trim()
                                                                            .toLowerCase() ===
                                                                            state.isoCode.trim().toLowerCase()
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {state.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {formdata.beneficiaryCountry &&
                                    availableStates.length === 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            No states/provinces available for this country
                                        </p>
                                    )}
                            </div>
                        )}
                    </div>
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
                    {/* Reason for Transfer */}
                    <div className="w-full">
                        <Label className="block text-sm font-semibold text-gray-800 mb-3">
                            Reason for Transfer <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formdata.reason || undefined}
                            onValueChange={(val: string) => {
                                onFieldChange("reason", val);
                            }}
                        >
                            <SelectTrigger className="w-full h-14 border-2 rounded-lg transition-all duration-200 text-base font-medium border-gray-300 bg-white hover:border-gray-400">
                                <SelectValue placeholder="Select reason for transfer" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                                <SelectItem
                                    value={PurposeOfPayment.PAYMENT_FOR_GOODS}
                                    className="hover:bg-blue-50 cursor-pointer py-3 text-base font-medium"
                                >
                                    Payment For Goods
                                </SelectItem>
                                <SelectItem
                                    value={PurposeOfPayment.PAYMENT_FOR_BUSINESS_SERVICES}
                                    className="hover:bg-blue-50 cursor-pointer py-3 text-base font-medium"
                                >
                                    Payment For Business Services
                                </SelectItem>
                                <SelectItem
                                    value={PurposeOfPayment.CAPITAL_INVESTMENT_OR_ITEM}
                                    className="hover:bg-blue-50 cursor-pointer py-3 text-base font-medium"
                                >
                                    Capital Investment Or Item
                                </SelectItem>
                                <SelectItem
                                    value={PurposeOfPayment.OTHER}
                                    className="hover:bg-blue-50 cursor-pointer py-3 text-base font-medium"
                                >
                                    Other
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-800 font-medium border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 py-3 inline-block text-center w-full sm:w-auto min-w-[140px] transition-all duration-200"
                >
                    Cancel
                </button>
                <Button
                    className={`
                        w-full sm:w-auto min-w-[160px] h-12 rounded-xl font-semibold text-base transition-all duration-200
                        ${!isFormComplete() || paymentLoading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }
                    `}
                    variant="default"
                    size="lg"
                    disabled={!isFormComplete() || paymentLoading}
                    onClick={handleSubmit}
                >
                    {paymentLoading && (
                        <Loader className="animate-spin mr-2 h-4 w-4 inline-block" />
                    )}
                    {paymentLoading
                        ? "Processing..."
                        : action === "fixed-rejected"
                            ? "Resubmit"
                            : "Continue"}
                </Button>
            </div>

            {/* Insufficient Funds Modal */}
            <Dialog
                open={showInsufficientFundsModal}
                onOpenChange={setShowInsufficientFundsModal}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            Insufficient Funds
                        </DialogTitle>
                        <DialogDescription>
                            You don't have enough balance to complete this payment. Your
                            current balance is {selectedWallet?.symbol}
                            {selectedWallet?.balance?.toFixed(2) || "0.00"}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-4">
                        <Link href={`/dashboard/${wallet}/deposit`}>
                            <Button className="w-full" variant="default">
                                Deposit Funds
                            </Button>
                        </Link>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => setShowInsufficientFundsModal(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
