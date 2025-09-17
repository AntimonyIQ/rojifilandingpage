import React from 'react';
import { RenderInput, RenderSelect } from './SharedFormComponents';
import { InvoiceSection } from './InvoiceSection';
import { Button } from "../../ui/button";
import { Globe } from "lucide-react";
import { Link } from "wouter";

interface USDPaymentFlowProps {
    formdata: any;
    onFieldChange: (field: string, value: string | boolean | File | Date) => void;
    loading: boolean;
    countries: any[];
    ibanlist: string[];
    onFileUpload: (file: File) => void;
    uploadError: string;
    uploading: boolean;
    onSubmit: () => void;
    paymentLoading: boolean;
    validateForm: () => { isValid: boolean; errors: string[] };
}

export const USDPaymentFlow: React.FC<USDPaymentFlowProps> = ({
    formdata,
    onFieldChange,
    loading,
    countries,
    ibanlist,
    onFileUpload,
    uploadError,
    uploading,
    onSubmit,
    paymentLoading,
    validateForm,
}) => {
    const handleSubmit = () => {
        const validation = validateForm();
        if (!validation.isValid) {
            // Show validation errors
            const errorMessage = `Please fix the following:\n• ${validation.errors.join('\n• ')}`;
            // You might want to pass this up to the parent or handle it differently
            console.error(errorMessage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        onSubmit();
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full pb-20">
            <RenderInput
                fieldKey="destinationCountry"
                label="Beneficiary's Country"
                value={formdata.beneficiaryCountry || ""}
                disabled={true}
                readOnly={true}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
                Image={formdata.beneficiaryCountryCode ? (
                    <img
                        src={`https://flagsapi.com/${formdata.beneficiaryCountryCode}/flat/64.png`}
                        className="rounded-full absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                    />
                ) : (
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                )}
            />

            <RenderInput
                fieldKey="beneficiaryBankName"
                label="Bank Name"
                placeholder="Bank Name"
                value={formdata.beneficiaryBankName || ""}
                disabled={true}
                readOnly={true}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
            />

            <div className="divide-gray-300 w-full h-[1px] bg-slate-300"></div>

            <RenderSelect
                fieldKey="sender"
                label="Create Payment For"
                value={formdata.sender || undefined}
                placeholder="Select Sender"
                required={true}
                options={[
                    { value: formdata.sender || "default-sender", label: `${formdata.senderName || "My Business"} (My Sender)` }
                ]}
                onFieldChange={onFieldChange}
            />

            <RenderSelect
                fieldKey="senderName"
                label="Sender Name"
                value={formdata.senderName || undefined}
                placeholder="Select Sender Name"
                required={true}
                options={[
                    { value: formdata.senderName || "default-name", label: formdata.senderName || "My Business" }
                ]}
                onFieldChange={onFieldChange}
            />

            <div className="divide-gray-300 w-full h-[1px] bg-slate-300"></div>

            <RenderInput
                fieldKey="currency"
                label="Wallet (Balance)"
                placeholder="Wallet Balance"
                value={formdata.walletBalance || ""}
                disabled={true}
                readOnly={true}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
            />

            <RenderInput
                fieldKey="beneficiaryCountry"
                label="Beneficiary Country"
                placeholder="Enter Beneficiary Country"
                value={formdata.beneficiaryCountry || ""}
                disabled={true}
                readOnly={true}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
                Image={<img
                    src={`https://flagsapi.com/${formdata.beneficiaryCountryCode}/flat/64.png`}
                    className="rounded-full absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                />}
            />

            <RenderInput
                fieldKey="beneficiaryAmount"
                label="Amount"
                value={formdata.beneficiaryAmount || ""}
                disabled={loading}
                readOnly={loading}
                type="text"
                required={true}
                placeholder="Enter Amount To Send"
                onFieldChange={onFieldChange}
            />

            <RenderSelect
                fieldKey="beneficiaryAccountType"
                label="Recipient Account"
                value={formdata.beneficiaryAccountType || undefined}
                placeholder="Select Account Type"
                required={true}
                options={[
                    { value: "personal", label: "Personal" },
                    { value: "business", label: "Business" }
                ]}
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

            {ibanlist.includes(formdata.beneficiaryCountryCode || "") ? (
                <RenderInput
                    fieldKey="beneficiaryIban"
                    label="IBAN"
                    placeholder="Enter IBAN"
                    value={formdata.beneficiaryIban || ""}
                    disabled={loading}
                    readOnly={loading}
                    type="text"
                    required={true}
                    onFieldChange={onFieldChange}
                />
            ) : (
                <RenderInput
                    fieldKey="beneficiaryAccountNumber"
                    label="Beneficiary Account Number"
                    placeholder="Enter Beneficiary Account Number"
                    value={formdata.beneficiaryAccountNumber || ""}
                    disabled={loading}
                    readOnly={loading}
                    type="text"
                    required={true}
                    onFieldChange={onFieldChange}
                />
            )}

            {formdata.beneficiaryCountryCode === "IN" && (
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

            {["US", "PR", "AS", "GU", "MP", "VI"].includes(formdata.beneficiaryCountryCode || "") && (
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
            )}

            {formdata.beneficiaryCountryCode === "AU" && (
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
            )}

            {formdata.beneficiaryCountryCode === "CA" && (
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
            )}

            {formdata.beneficiaryCountryCode === "ZA" && (
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

                <RenderSelect
                    fieldKey="beneficiaryCountrySelect"
                    label="Beneficiary Country"
                    value={formdata.beneficiaryCountryCode || undefined}
                    placeholder="Select Country"
                    required={true}
                    options={countries.map(country => ({
                        value: country.isoCode,
                        label: country.name
                    }))}
                    onFieldChange={(_field, value) => {
                        const selectedCountry = countries.find(c => c.isoCode === value);
                        if (selectedCountry) {
                            onFieldChange("beneficiaryCountry", selectedCountry.name);
                            onFieldChange("beneficiaryCountryCode", selectedCountry.isoCode);
                        }
                    }}
                />
            </div>

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
                    {paymentLoading ? "Sending..." : "Create Payment"}
                </Button>
            </div>
        </div>
    );
};