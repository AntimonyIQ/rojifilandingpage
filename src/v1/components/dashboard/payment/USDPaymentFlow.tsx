import React from 'react';
import { RenderInput, RenderSelect } from './SharedFormComponents';
import { InvoiceSection } from './InvoiceSection';
import { Button } from "../../ui/button";
import { CheckIcon, ChevronsUpDownIcon, Globe, Loader } from "lucide-react";
import { Link, useParams } from "wouter";
import { Label } from '../../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/v1/components/ui/dialog";
import { cn } from '@/v1/lib/utils';
import countries from "../../../data/country_state.json";
import { session, SessionData } from '@/v1/session/session';
import { IIBannDetailsResponse, IPayment, IWallet } from '@/v1/interface/interface';

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
    validateForm: () => { isValid: boolean; errors: string[] };
    selectedWallet: IWallet | null;
    ibanDetails: IIBannDetailsResponse | null;
    ibanLoading: boolean;
}

// Countries where IBAN is NOT required (excluded list from docs)
const EXCLUDED_IBAN_COUNTRIES: string[] = [
    "AR", "CA", "AU", "NZ", "HK", "CO", "SG", "JP", "BR", "ZA", "TR", "MX", "NG", "IN", "US", "PR", "AS", "GU", "MP", "VI", "MY", "CX", "CC", "KM", "HM", "MO", "SC", "AI", "AW", "BM", "BT", "BQ", "BV", "IO", "FK", "KY", "CK", "CW", "FM", "MS", "NU", "NF", "PW", "PN", "SH", "KN", "TG", "SX", "GS", "SJ", "TC", "UM", "BW", "MA", "TD", "CL", "GY", "HN", "ID", "JM", "BZ", "BO", "SV", "AO", "FJ", "AG", "AM", "BS", "DJ", "BB", "KH", "DM", "EC", "GQ", "GM", "MN", "GD", "VC", "NR", "NP", "PA", "PG", "PY", "PE", "PH", "RW", "WS", "SL", "LK", "SB", "SR", "TJ", "TZ", "TH", "TO", "GH", "UG", "KE", "KI", "KG", "LS", "LR", "MV", "MW", "VN", "OM", "ST", "ZM", "TT", "TM", "TV", "UY", "UZ", "VU", "CG", "CN"
];

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
    ibanDetails,
    ibanLoading
}) => {
    const { wallet } = useParams();
    const [popOpen, setPopOpen] = React.useState(false);
    const [showInsufficientFundsModal, setShowInsufficientFundsModal] = React.useState<boolean>(false);

    const sd: SessionData = session.getUserData();

    const handleSubmit = () => {
        const amount = Number(formdata.beneficiaryAmount);
        const currentBalance = selectedWallet?.balance || 0;
        const hasInsufficientFunds = amount > currentBalance || currentBalance <= 0;

        if (hasInsufficientFunds) {
            setShowInsufficientFundsModal(true);
            return;
        }

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

    const getFundsDestinationCountry = (swiftCode: string): string => {
        if (!swiftCode || swiftCode.length < 6) {
            return "";
        }
        const iso = swiftCode.substring(4, 6).toUpperCase();
        return iso;
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full pb-20">

            <RenderInput
                fieldKey="destinationCountry"
                label="Beneficiary's Country"
                value={formdata.fundsDestinationCountry || ""}
                disabled={true}
                readOnly={true}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
                Image={formdata.fundsDestinationCountry ? (
                    <img
                        src={`https://flagcdn.com/w320/${getFundsDestinationCountry(formdata.swiftCode || "").toLowerCase()}.png`}
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
                value={formdata.senderName || ""}
                placeholder="Select Sender"
                required={true}
                options={[
                    { value: sd.sender.businessName, label: `${sd.sender.businessName} (My Sender)` }
                ]}
                onFieldChange={onFieldChange}
            />

            <RenderSelect
                fieldKey="senderName"
                label="Sender Name"
                value={formdata.senderName || ""}
                placeholder="Select Sender Name"
                required={true}
                options={[
                    { value: sd.sender.businessName, label: `${sd.sender.businessName}` }
                ]}
                onFieldChange={onFieldChange}
            />

            <div className="divide-gray-300 w-full h-[1px] bg-slate-300"></div>

            <RenderInput
                fieldKey="currency"
                label="Wallet (Balance)"
                placeholder="Wallet Balance"
                value={String(selectedWallet?.balance || "0.00")}
                disabled={true}
                readOnly={true}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
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

            {(() => {
                const countryIso = (getFundsDestinationCountry(String(formdata.swiftCode))).toUpperCase();
                const requiresIBAN = !EXCLUDED_IBAN_COUNTRIES.includes(countryIso);
                return requiresIBAN;
            })() ? (
                <div className='w-full'>
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
                        {ibanLoading ? (
                            <div className='flex flex-row items-center text-sm text-gray-500 mt-2'>
                                <Loader className="animate-spin mr-2 h-4 w-4 inline-block text-gray-500" /> validating IBAN Details
                            </div>
                        ) : (
                            <div>
                                {ibanDetails?.valid === true ? (
                                    <div className="mt-2 text-sm text-green-600">
                                        ✓ IBAN is valid.
                                    </div>
                                ) : (
                                    <div className="mt-2 text-sm text-red-600">
                                        ✗ IBAN is invalid. Please check the number and try again.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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

            {(() => {
                const countryIso = (getFundsDestinationCountry(String(formdata.swiftCode))).toUpperCase();
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

            {(() => {
                const countryIso = (getFundsDestinationCountry(String(formdata.swiftCode))).toUpperCase();
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
            )}

            {(() => {
                const countryIso = (getFundsDestinationCountry(String(formdata.swiftCode))).toUpperCase();
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
            )}

            {(() => {
                const countryIso = (getFundsDestinationCountry(String(formdata.swiftCode))).toUpperCase();
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
            )}

            {(() => {
                const countryIso = (getFundsDestinationCountry(String(formdata.swiftCode))).toUpperCase();
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
                        Beneficiary Country <span className="text-red-500">*</span>
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
                                        <img src={`https://flagcdn.com/w320/${countries.find(c => c.name === formdata.beneficiaryCountry)?.iso2?.toLowerCase() || ""}.png`} alt="" width={18} height={18} />
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
                    {paymentLoading && <Loader className="animate-spin mr-2 h-4 w-4 inline-block" />}
                    Create Payment
                </Button>
            </div>

            {/* Insufficient Funds Modal */}
            <Dialog open={showInsufficientFundsModal} onOpenChange={setShowInsufficientFundsModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Insufficient Funds</DialogTitle>
                        <DialogDescription>
                            You don't have enough balance to complete this payment. Your current balance is {selectedWallet?.symbol}{selectedWallet?.balance?.toFixed(2) || '0.00'}.
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