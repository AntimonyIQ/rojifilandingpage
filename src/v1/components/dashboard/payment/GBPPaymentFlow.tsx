import React from 'react';
import { RenderInput, RenderSelect, ExchangeRateDisplay } from './SharedFormComponents';
import { InvoiceSection } from './InvoiceSection';
import { Button } from "../../ui/button";
import { Link } from "wouter";

interface GBPPaymentFlowProps {
    formdata: any;
    onFieldChange: (field: string, value: string | boolean | File | Date) => void;
    loading: boolean;
    countries: any[];
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

export const GBPPaymentFlow: React.FC<GBPPaymentFlowProps> = ({
    formdata,
    onFieldChange,
    loading,
    countries,
    onSubmit,
    paymentLoading,
    validateForm,
    walletActivated,
    onActivateWallet,
    exchangeRate,
    uploading = false,
    uploadError = "",
    onFileUpload,
}) => {
    const handleSubmit = () => {
        if (!walletActivated) {
            onActivateWallet();
            return;
        }

        const validation = validateForm();
        if (!validation.isValid) {
            const errorMessage = `Please fix the following:\n• ${validation.errors.join('\n• ')}`;
            console.error(errorMessage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        onSubmit();
    };

    const calculateRequiredUSD = (gbpAmount: string): string => {
        if (!exchangeRate || !gbpAmount) return '';
        const numericAmount = parseFloat(gbpAmount.replace(/,/g, ''));
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
                    toAmount={formdata.beneficiaryAmount}
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
                fieldKey="recipientName"
                label="Recipient Name"
                placeholder="Enter Recipient Name"
                value={formdata.recipientName || ""}
                disabled={loading}
                readOnly={loading}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
            />

            <RenderInput
                fieldKey="recipientAddress"
                label="Recipient Address"
                placeholder="Enter Recipient Address"
                value={formdata.recipientAddress || ""}
                disabled={loading}
                readOnly={loading}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
            />

            <RenderSelect
                fieldKey="recipientCountry"
                label="Recipient Country"
                value={formdata.recipientCountry || undefined}
                placeholder="Select Recipient Country"
                required={true}
                options={countries.map(country => ({
                    value: country.isoCode,
                    label: country.name
                }))}
                onFieldChange={(_field, value) => {
                    const selectedCountry = countries.find(c => c.isoCode === value);
                    if (selectedCountry) {
                        onFieldChange("recipientCountry", selectedCountry.isoCode);
                        onFieldChange("recipientCountryName", selectedCountry.name);
                    }
                }}
            />

            <RenderSelect
                fieldKey="fundsDestinationCountry"
                label="Funds Destination Country"
                value={formdata.fundsDestinationCountry || undefined}
                placeholder="Select Funds Destination Country (Optional)"
                required={false}
                options={countries.map(country => ({
                    value: country.isoCode,
                    label: country.name
                }))}
                onFieldChange={onFieldChange}
            />

            <RenderSelect
                fieldKey="accountType"
                label="Account Type"
                value={formdata.accountType || undefined}
                placeholder="Select Account Type"
                required={true}
                options={[
                    { value: "personal", label: "Personal" },
                    { value: "business", label: "Business" }
                ]}
                onFieldChange={onFieldChange}
            />

            <RenderInput
                fieldKey="sortCode"
                label="Sort Code"
                placeholder="Enter Sort Code (e.g., 12-34-56)"
                value={formdata.sortCode || ""}
                disabled={loading}
                readOnly={loading}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
            />

            <RenderInput
                fieldKey="accountNumber"
                label="Account Number"
                placeholder="Enter Account Number"
                value={formdata.accountNumber || ""}
                disabled={loading}
                readOnly={loading}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
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

            <InvoiceSection
                formdata={formdata}
                onFieldChange={onFieldChange}
                loading={loading}
                uploading={uploading}
                uploadError={uploadError}
                onFileUpload={onFileUpload}
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
                    disabled={paymentLoading || (exchangeRate && isInsufficientBalance)}
                    onClick={handleSubmit}
                >
                    {paymentLoading
                        ? "Processing..."
                        : !walletActivated
                            ? "Activate GBP Wallet"
                            : isInsufficientBalance
                                ? "Insufficient Balance"
                                : "Create Payment"
                    }
                </Button>
            </div>

            {isInsufficientBalance && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-700">
                        You need at least {requiredUSD} USD in your wallet to send {formdata.beneficiaryAmount} GBP.
                        Please top up your USD wallet first.
                    </p>
                </div>
            )}
        </div>
    );
};