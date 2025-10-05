import React, { useEffect, useState } from 'react';
import { RenderInput, RenderSelect } from './SharedFormComponents';
import { InvoiceSection } from './InvoiceSection';
import { Button } from "../../ui/button";
import { Reason } from "@/v1/enums/enums";
import { CheckIcon, ChevronsUpDownIcon, Globe, Loader } from "lucide-react";
import { Link, useParams } from "wouter";
import { Label } from '../../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/v1/components/ui/dialog";
import { cn } from '@/v1/lib/utils';
import countries from "../../../data/country_state.json";
import { session, SessionData } from '@/v1/session/session';
import { IIBanDetailsResponse, IPayment, IResponse, ISender, IWallet } from '@/v1/interface/interface';
import Defaults from '@/v1/defaults/defaults';
import { Status } from '@/v1/enums/enums';

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
    ibanDetails: IIBanDetailsResponse | null;
    ibanLoading: boolean;
    isFormComplete: () => boolean;
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
    ibanLoading,
    isFormComplete
}) => {
    const { wallet } = useParams();
    const [popOpen, setPopOpen] = React.useState(false);
    const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
    const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>(undefined);
    const [_loadingSenders, setLoadingSenders] = useState<boolean>(true);
    const [senders, setSenders] = useState<Array<ISender>>([]);
    const [showInsufficientFundsModal, setShowInsufficientFundsModal] = React.useState<boolean>(false);

    const sd: SessionData = session.getUserData();

    useEffect(() => {
        loadSenders();
    }, []);

    const loadSenders = async () => {
        try {
            setLoadingSenders(true);

            const res = await fetch(`${Defaults.API_BASE_URL}/sender/payments`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process request, please try again.');
                const parseData: Array<ISender> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setSenders(parseData);
            }
        } catch (error: any) {
            console.error("error loading senders", error);
        } finally {
            setLoadingSenders(false);
        }
    }

    const handleSubmit = () => {
        // const amount = Number(formdata.beneficiaryAmount);
        // const currentBalance = selectedWallet?.balance || 0;
        // const hasInsufficientFunds = amount > currentBalance || currentBalance <= 0;

        /*
        if (hasInsufficientFunds) {
            setShowInsufficientFundsModal(true);
            return;
        }
        */

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

    const senderSelectOptions = (): Array<{ value: string, label: string }> => {
        return senders.map(sender => ({
            value: sender.businessName,
            label: sender.businessName
        }));
    }

    // Effect to sync PopoverContent width with PopoverTrigger
    React.useEffect(() => {
        if (popOpen && popoverTriggerRef.current) {
            setPopoverWidth(popoverTriggerRef.current.offsetWidth);
        }
    }, [popOpen]);

    return (
        <div className="flex flex-col items-center gap-6 w-full pb-20 bg-gray-50 rounded-2xl p-6 border border-gray-200">

            <RenderInput
                fieldKey="destinationCountry"
                label="Beneficiary's Country"
                value={countries.find(c => c.iso2 === formdata.fundsDestinationCountry)?.name || ""}
                disabled={true}
                readOnly={true}
                type="text"
                required={true}
                onFieldChange={onFieldChange}
                Image={formdata.fundsDestinationCountry ? (
                    <img
                        src={`https://flagcdn.com/w320/${getFundsDestinationCountry(formdata.swiftCode || "").toLowerCase()}.png`}
                        className="rounded-full h-5 w-5"
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

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4"></div>

            {/* Sender Information Section */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-gray-200">Sender Information</h3>
                <div className="space-y-4">
                    <RenderSelect
                        fieldKey="sender"
                        label="Create Payment For"
                        value={formdata.senderName || ""}
                        placeholder="Select Sender"
                        required={true}
                        options={[
                            { value: sd.sender.businessName, label: `${sd.sender.businessName} (Primary Business)` }
                        ]}
                        onFieldChange={onFieldChange}
                    />

                    <RenderSelect
                        fieldKey="senderName"
                        label="Sender Name"
                        value={formdata.senderName || ""}
                        placeholder="Select Sender Name"
                        required={true}
                        options={senderSelectOptions()}
                        onFieldChange={onFieldChange}
                    />
                </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

            {/* Payment Details Section */}
            <div className="w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Payment Details</h3>
                <div className="space-y-4">

            <div className="w-full">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">Wallet</Label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm">
                    <div className="flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full w-10 h-10">
                        <img src={selectedWallet?.icon} alt="" className="w-7 h-7 rounded-full object-contain" />
                    </div>
                    <div className="h-8 w-px bg-gray-200 mx-2" />
                    <div className="flex flex-row items-center gap-2">
                        <span className="font-semibold text-gray-800">
                            {selectedWallet?.currency} Wallet
                        </span>
                        <span className="text-base font-semibold text-gray-700 mt-0.5">
                            {selectedWallet?.symbol}
                            {typeof selectedWallet?.balance === "number"
                                ? selectedWallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : "0.00"}
                        </span>
                    </div>
                </div>
            </div>

            <RenderInput
                fieldKey="beneficiaryAmount"
                label="Amount ($)"
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
                hidden={true}
                value={formdata.beneficiaryAccountType || "business"}
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
                                formdata.beneficiaryIban && (
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
                                )
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
                        Select Country <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                            <PopoverTrigger asChild>
                                <Button
                                    ref={popoverTriggerRef}
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
                            <PopoverContent className="p-0" style={popoverWidth ? { width: popoverWidth } : {}}>
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
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-gray-200">Transfer Details</h3>
                <div className="space-y-4">

            {/*
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
            */}

            <RenderSelect
                fieldKey="reason"
                label="Reason for Transfer"
                value={formdata.reason || ""}
                placeholder="Select reason for transfer"
                required={true}
                options={[
                    { value: Reason.GOODS_SERVICES, label: "Goods & Services" },
                    { value: Reason.PAYROLL_SALARIES, label: "Payroll & Salaries" },
                    { value: Reason.INVESTMENTS_DIVIDENDS, label: "Investments & Dividends" },
                    { value: Reason.LOANS_CREDIT, label: "Loans & Credit" },
                    { value: Reason.TAXES_GOVERNMENT, label: "Taxes & Government" },
                    { value: Reason.PROFESSIONAL_FEES, label: "Professional Fees" },
                    { value: Reason.TRANSFERS_REFUNDS, label: "Transfers & Refunds" },
                    { value: Reason.OTHER, label: "Other" }
                ]}
                onFieldChange={onFieldChange}
            />

                    {formdata.reason === Reason.OTHER && (
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
                <Link
                    href="/dashboard/NGN"
                    className="text-gray-600 hover:text-gray-800 font-medium border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 py-3 inline-block text-center w-full sm:w-auto min-w-[140px] transition-all duration-200"
                >
                    Cancel
                </Link>
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
                    {paymentLoading && <Loader className="animate-spin mr-2 h-4 w-4 inline-block" />}
                    {paymentLoading ? "Processing..." : "Continue"}
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