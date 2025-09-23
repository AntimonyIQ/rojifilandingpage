import React from 'react';
import { RenderInput, RenderSelect, ExchangeRateDisplay } from './SharedFormComponents';
import { InvoiceSection } from './InvoiceSection';
import { Button } from "../../ui/button";
import { Link } from "wouter";
import { Label } from '../../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { cn } from '@/v1/lib/utils';
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
}) => {
    const [popOpen, setPopOpen] = React.useState<boolean>(false);

    const handleSubmit = () => {

        /*
        if (!walletActivated) {
            onActivateWallet();
            return;
        }
        */

        const validation = validateForm();
        if (!validation.isValid) {
            const errorMessage = `Please fix the following:\n• ${validation.errors.join('\n• ')}`;
            console.error(errorMessage);
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
        <div className="flex flex-col items-center gap-4 w-full pb-20">
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

            <div className="divide-gray-300 w-full h-[1px] bg-slate-300"></div>

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
                    required={true}
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
                                    className="w-full justify-between"
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

            <InvoiceSection
                formdata={formdata}
                onFieldChange={onFieldChange}
                loading={loading}
                uploading={uploading}
                uploadError={uploadError}
                onFileUpload={onFileUpload}
            />

            <RenderInput
                fieldKey="purposeOfPayment"
                label="Purpose of Payment"
                placeholder="State Purpose of Payment"
                value={formdata.purposeOfPayment || ""}
                disabled={loading}
                readOnly={loading}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
            />

            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                    href="/dashboard/NGN"
                    className="text-primary hover:underline border-[2px] border-primary rounded-md px-4 py-2 inline-block text-center w-full sm:w-auto min-w-[120px]"
                >
                    Cancel
                </Link>
                <Button
                    className="text-white w-full sm:w-auto min-w-[160px]"
                    variant="default"
                    size="lg"
                    disabled={paymentLoading}
                    onClick={handleSubmit}
                >
                    {paymentLoading
                        ? "Processing..."
                        // : !walletActivated
                        // ? "Activate EUR Wallet"
                        // : isInsufficientBalance
                        // ? "Insufficient Balance"
                        : "Continue"
                    }
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