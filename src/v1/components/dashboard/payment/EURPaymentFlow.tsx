import React from 'react';
import { RenderInput, RenderSelect, ExchangeRateDisplay } from './SharedFormComponents';
import { InvoiceSection } from './InvoiceSection';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { PurposeOfPayment } from "@/v1/enums/enums";
import { Label } from '../../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { cn } from '@/v1/lib/utils';
import { toast } from 'sonner';
import countries from "../../../data/country_state.json";
import { IPayment } from '@/v1/interface/interface';

interface EURPaymentFlowProps {
    formdata: Partial<IPayment>;
    onFieldChange: (field: string, value: string | boolean | File | Date) => void;
    loading: boolean;
    onSubmit: () => void;
    paymentLoading: boolean;
    validateForm: () => { isValid: boolean; errors: string[] };
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
    
}

export const EURPaymentFlow: React.FC<EURPaymentFlowProps> = ({
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
}) => {
    const [popOpen, setPopOpen] = React.useState<boolean>(false);
    const [phoneCountryPopover, setPhoneCountryPopover] = React.useState<boolean>(false);

    React.useEffect(() => {
        // Set default phone code to US (+1) if not already set
        if (!(formdata as any).beneficiaryPhoneCode) {
            onFieldChange("beneficiaryPhoneCode", "1");
            onFieldChange("beneficiaryPhoneCountryIso", "US");
        }
    }, []);

    const handleSubmit = () => {

        /*
        if (!walletActivated) {
            onActivateWallet();
            return;
        }
        */

        const validation = validateForm();
        if (!validation.isValid) {
            // Show validation errors as toast
            validation.errors.forEach((error: string) => {
                toast.error(error, {
                    duration: 4000,
                    position: 'top-center',
                });
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        onSubmit();
    };

    const calculateRequiredUSD = (eurAmount: string): string => {
        if (!exchangeRate || !eurAmount) return '';
        const numericAmount = parseFloat(eurAmount.replace(/,/g, ''));
        if (isNaN(numericAmount)) return '';
        return (numericAmount / exchangeRate.rate).toFixed(2);
    };

    const requiredUSD = calculateRequiredUSD(formdata.beneficiaryAmount || '');
    const isInsufficientBalance = exchangeRate && requiredUSD ?
        parseFloat(requiredUSD) > exchangeRate.walletBalance : false;

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
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Payment Details</h3>
                <div className="space-y-4">
                    <RenderInput
                        fieldKey="beneficiaryAmount"
                        label="Amount (EUR)"
                        value={formdata.beneficiaryAmount || ""}
                        disabled={loading}
                        readOnly={loading}
                        type="text"
                        required={true}
                        placeholder="Enter Amount To Send in EUR"
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
                            <Popover open={phoneCountryPopover} onOpenChange={setPhoneCountryPopover}>
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
                                                src={`https://flagcdn.com/w320/${((formdata as any).beneficiaryPhoneCountryIso || "us").toLowerCase()}.png`}
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
                                                            onFieldChange("beneficiaryPhoneCode", country.phonecode);
                                                            onFieldChange("beneficiaryPhoneCountryIso", country.iso2);
                                                            setPhoneCountryPopover(false);
                                                        }}
                                                    >
                                                        <CheckIcon
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                (formdata as any).beneficiaryPhoneCountryIso === country.iso2 ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <img
                                                            src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                                            alt=""
                                                            width={18}
                                                            height={18}
                                                        />
                                                        <span className="ml-2">+{country.phonecode} {country.name}</span>
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
                                onChange={(e) => onFieldChange("beneficiaryPhone", e.target.value.replace(/\D/g, ""))}
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
                    onFieldChange={onFieldChange}
                />

                <div className="w-full">
                    <Label
                        htmlFor="beneficiary_country"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Select Country <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox" size="md"
                                    aria-expanded={popOpen}
                                            className="w-full justify-between h-14"
                                >
                                    <div className='flex items-center gap-2'>
                                        {formdata.beneficiaryCountry && (
                                            <img src={`https://flagcdn.com/w320/${countries.find(c => c.name === formdata.beneficiaryCountry)?.iso2?.toLowerCase() || ""}.png`} alt="" width={18} height={18} />
                                        )}
                                        {formdata.beneficiaryCountry
                                            ? countries.find((country) => country.name === formdata.beneficiaryCountry)?.name
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
                                            {countries.map((country, index) => (
                                                <CommandItem
                                                    key={index}
                                                    value={country.name}
                                                    onSelect={(currentValue) => {
                                                        onFieldChange("beneficiaryCountry", currentValue);
                                                        onFieldChange("beneficiaryCountryCode", country?.iso2 || "");
                                                        setPopOpen(false);
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formdata.beneficiaryCountry === country.name ? "opacity-100" : "opacity-0"
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

            <RenderSelect
                fieldKey="beneficiaryAccountType"
                label="Account Type"
                value={formdata.beneficiaryAccountType || ""}
                placeholder="Select Account Type"
                required={true}
                options={[
                    { value: "personal", label: "Personal" },
                    { value: "business", label: "Business" }
                ]}
                onFieldChange={onFieldChange}
            />

                    <RenderInput
                        fieldKey="beneficiaryIban"
                        label="IBAN"
                        placeholder="Enter IBAN"
                        value={formdata.beneficiaryIban || ""}
                        disabled={true}
                        readOnly={loading}
                        type="text"
                        required={true}
                        onFieldChange={onFieldChange}
                    />
                </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

            {/* Invoice & Documentation Section */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-gray-200">Invoice & Documentation</h3>
                <InvoiceSection
                    formdata={formdata}
                    onFieldChange={onFieldChange}
                    loading={loading}
                    uploading={uploading}
                    uploadError={uploadError}
                    onFileUpload={onFileUpload}
                />
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

            {/* Transfer Reason Section */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Transfer Details</h3>
                <div className="space-y-4">
                    <RenderSelect
                        fieldKey="reason"
                        label="Reason for Transfer"
                value={formdata.reason || ""}
                placeholder="Select reason for transfer"
                required={true}
                options={[
                    { value: PurposeOfPayment.PAYMENT_FOR_GOODS, label: "Payment For Goods" },
                    { value: PurposeOfPayment.PAYMENT_FOR_BUSINESS_SERVICES, label: "Payment For Business Services" },
                    { value: PurposeOfPayment.CAPITAL_INVESTMENT_OR_ITEM, label: "Capital Investment Or Item" },
                    { value: PurposeOfPayment.OTHER, label: "Other" }
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
  className="font-medium border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 py-3 inline-block text-center w-full sm:w-auto min-w-[140px] transition-all duration-200"
>
  Cancel
</Button>
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
                    {paymentLoading ? "Processing..." : "Continue"}
                </Button>
            </div>

            {/*
            {isInsufficientBalance && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-700">
                        You need at least {requiredUSD} USD in your wallet to send {formdata.beneficiaryAmount} EUR.
                        Please top up your USD wallet first.
                    </p>
                </div>
            )}
            */}
        </div>
    );
};