"use client";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { ArrowUpRight, Building2, User, Mail, Phone, MapPin, Calendar, FileText, Shield, CheckCircle, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import { Label } from "@/v1/components/ui/label";
import { Input } from "@/v1/components/ui/input";
import Loading from "@/v1/components/loading";
import { useParams } from "wouter";

// Custom country list
const countries = [
    { code: "NG", name: "Nigeria", icon: "https://flagcdn.com/w320/ng.png", phoneCode: "+234" },
    { code: "BJ", name: "Benin", icon: "https://flagcdn.com/w320/bj.png", phoneCode: "+229" },
    { code: "KE", name: "Kenya", icon: "https://flagcdn.com/w320/ke.png", phoneCode: "+254" },
    { code: "CM", name: "Cameroon", icon: "https://flagcdn.com/w320/cm.png", phoneCode: "+237" },
    { code: "CI", name: "Cote d'Ivoire", icon: "https://flagcdn.com/w320/ci.png", phoneCode: "+225" },
    { code: "SN", name: "Senegal", icon: "https://flagcdn.com/w320/sn.png", phoneCode: "+221" },
    { code: "TG", name: "Togo", icon: "https://flagcdn.com/w320/tg.png", phoneCode: "+228" },
];

// Form steps enum
enum FormStep {
    COUNTRY_SELECTION = 'country-selection',
    BUSINESS_DETAILS = 'business-details',
    BUSINESS_CONFIRMATION = 'business-confirmation',
    COMPANY_DETAILS = 'company-details',
    SENDER_PROFILE = 'sender-profile',
    KYC_DOCUMENTS = 'kyc-documents'
}

// Types for form data
interface BusinessOption {
    id: string;
    name: string;
    regNumber: string;
    taxId: string;
}

interface FormData {
    // Country selection
    selectedCountry: string;

    // Business details
    businessNumber: string;
    taxId: string;

    // Business confirmation
    selectedBusiness: string;
    volumeWeekly: string;
    businessOptions: BusinessOption[];

    // Company details
    senderEmail: string;
    senderPhone: string;
    companyName: string;
    percentageOwnership: string;
    dateOfInc: string;
    affiliatedBusiness: string;
    addressCountry: string;
    addressState: string;
    addressCity: string;
    addressPostal: string;
    addressStreet: string;

    // Sender profile
    firstName: string;
    middleName: string;
    lastName: string;
    birthDate: string;
    position: string;
    birthCountry: string;
    isUBO: string;
    ownershipPercentage: string;
    roles: string;
    votingRightsPercentage: string;
    isBusinessContact: string;
    email: string;
    personalTaxId: string;
    ssn: string;

    // KYC documents
    kycDocuments: Record<string, File | null>;
}

export default function AddSenderPage() {
    const { wallet } = useParams();
    const [, setLocation] = useLocation();

    // Form state management
    const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.COUNTRY_SELECTION);
    const [isLoading, _setIsLoading] = useState(false);
    const [businessLoading, setBusinessLoading] = useState(false);

    // Form data state
    const [formData, setFormData] = useState<FormData>({
        selectedCountry: "",
        businessNumber: "",
        taxId: "",
        selectedBusiness: "",
        volumeWeekly: "",
        businessOptions: [],
        senderEmail: "",
        senderPhone: "",
        companyName: "",
        percentageOwnership: "",
        dateOfInc: "",
        affiliatedBusiness: "",
        addressCountry: "",
        addressState: "",
        addressCity: "",
        addressPostal: "",
        addressStreet: "",
        firstName: "",
        middleName: "",
        lastName: "",
        birthDate: "",
        position: "",
        birthCountry: "",
        isUBO: "",
        ownershipPercentage: "",
        roles: "",
        votingRightsPercentage: "",
        isBusinessContact: "",
        email: "",
        personalTaxId: "",
        ssn: "",
        kycDocuments: {
            cacCertOfIncoporation: null,
            memorandumArticlesOfAssociation: null,
            cacStatusReport: null,
            proofOfAddress: null,
        }
    });

    // File upload state
    const [dragActive, setDragActive] = useState(false);

    // Load saved progress from localStorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem(`add-sender-${wallet}`);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setFormData(parsed.formData);
            setCurrentStep(parsed.currentStep);
        }
    }, [wallet]);

    // Save progress to localStorage whenever form data or step changes
    useEffect(() => {
        const dataToSave = {
            formData,
            currentStep,
            timestamp: Date.now()
        };
        localStorage.setItem(`add-sender-${wallet}`, JSON.stringify(dataToSave));
    }, [formData, currentStep, wallet]);

    // Helper functions
    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const goToNextStep = () => {
        const steps = Object.values(FormStep);
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const goToPreviousStep = () => {
        const steps = Object.values(FormStep);
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    /*
    const goToStep = (step: FormStep) => {
        setCurrentStep(step);
    };
    */

    const handleCountrySelection = (countryCode: string) => {
        updateFormData('selectedCountry', countryCode);
        updateFormData('addressCountry', countries.find(c => c.code === countryCode)?.name || "");
    };

    const handleBusinessDetailsSubmit = () => {
        setBusinessLoading(true);
        // Simulate API call for business info
        setTimeout(() => {
            const businessOptions: BusinessOption[] = [
                {
                    id: "1",
                    name: "Demo Business Ltd",
                    regNumber: formData.businessNumber,
                    taxId: formData.taxId,
                },
            ];
            updateFormData('businessOptions', businessOptions);
            setBusinessLoading(false);
            goToNextStep();
        }, 1500);
    };

    // File upload handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            updateFormData('kycDocuments', {
                ...formData.kycDocuments,
                [field]: file
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            updateFormData('kycDocuments', {
                ...formData.kycDocuments,
                [field]: file
            });
        }
    };

    const handleGoBack = () => {
        // Clear saved progress
        localStorage.removeItem(`add-sender-${wallet}`);
        // Navigate back to sender list
        setLocation(`/dashboard/${wallet}/sender`);
    };

    const renderStepIndicator = () => {
        const steps = [
            { key: FormStep.COUNTRY_SELECTION, label: "Country", number: 1 },
            { key: FormStep.BUSINESS_DETAILS, label: "Business", number: 2 },
            { key: FormStep.BUSINESS_CONFIRMATION, label: "Confirm", number: 3 },
            { key: FormStep.COMPANY_DETAILS, label: "Company", number: 4 },
            { key: FormStep.SENDER_PROFILE, label: "Profile", number: 5 },
            { key: FormStep.KYC_DOCUMENTS, label: "Documents", number: 6 }
        ];

        const currentStepIndex = steps.findIndex(step => step.key === currentStep);

        return (
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.key} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${index <= currentStepIndex
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {step.number}
                            </div>
                            <span className={`ml-2 text-sm ${index <= currentStepIndex ? 'text-primary font-medium' : 'text-gray-500'
                                }`}>
                                {step.label}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`w-8 h-0.5 mx-4 ${index < currentStepIndex ? 'bg-primary' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderCountrySelection = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Select Country</h2>
                        <p className="text-gray-600">Choose the sender's country of incorporation to continue onboarding.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {countries.map((country) => (
                            <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelection(country.code)}
                                className={`flex items-center justify-between w-full gap-3 p-4 rounded-lg border-2 transition-all ${formData.selectedCountry === country.code
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <img src={country.icon} alt={`${country.name} flag`} className="w-8 h-8 rounded" />
                                    <div className="text-left">
                                        <div className="font-medium text-gray-900">{country.name}</div>
                                        <div className="text-sm text-gray-500">{country.phoneCode}</div>
                                    </div>
                                </div>
                                {formData.selectedCountry === country.code && (
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={handleGoBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Senders
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white"
                            disabled={!formData.selectedCountry}
                            onClick={() => goToNextStep()}
                        >
                            Continue
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const renderBusinessDetails = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Enter Sender's Business Details</h2>
                        <p className="text-gray-600">
                            Please provide the sender's business registration number and tax identification number for verification and compliance purposes.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Business Registration Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="businessNumber"
                                type="text"
                                placeholder="Enter registration number"
                                value={formData.businessNumber}
                                onChange={e => {
                                    const val = e.target.value;
                                    // Allow only alphanumeric and selected symbols: - . / &
                                    if (/^[a-zA-Z0-9\-\.\/&]*$/.test(val) || val === "") {
                                        updateFormData('businessNumber', val);
                                    }
                                }}
                                className="border-2 focus:border-primary"
                            />
                        </div>

                        <div>
                            <Label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                                Tax Identification Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="taxId"
                                type="text"
                                placeholder="Enter tax identification number"
                                value={formData.taxId}
                                onChange={e => {
                                    const val = e.target.value;
                                    // Allow only alphanumeric and selected symbols: - . / &
                                    if (/^[a-zA-Z0-9\-\.\/&]*$/.test(val) || val === "") {
                                        updateFormData('taxId', val);
                                    }
                                }}
                                className="border-2 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={goToPreviousStep}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button
                            variant="default"
                            className="bg-primary hover:bg-primary/90 text-white"
                            disabled={!formData.businessNumber || !formData.taxId}
                            onClick={handleBusinessDetailsSubmit}
                        >
                            Continue
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const renderBusinessConfirmation = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                                <Building2 className="w-6 h-6 text-blue-500" />
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Select & Confirm Business</h2>
                        <p className="text-gray-600">
                            Tap on a business to select, then enter weekly volume.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Business Selection */}
                        <div>
                            {businessLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loading />
                                </div>
                            ) : (
                                formData.businessOptions.length > 0 ? (
                                    <div className="space-y-3">
                                        {formData.businessOptions.map((biz) => (
                                            <div
                                                key={biz.id}
                                                className={`flex items-center justify-between border-2 rounded-lg px-4 py-3 cursor-pointer transition-all ${formData.selectedBusiness === biz.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-gray-200 bg-white hover:border-gray-300"
                                                    }`}
                                                onClick={() => updateFormData('selectedBusiness', biz.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full ${formData.selectedBusiness === biz.id ? "bg-primary" : "bg-gray-300"
                                                        }`}>
                                                        {formData.selectedBusiness === biz.id ? (
                                                            <CheckCircle className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <div className="w-3 h-3 rounded-full bg-white" />
                                                        )}
                                                    </span>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{biz.name}</div>
                                                        <div className="text-sm text-gray-500">Reg No: {biz.regNumber}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">No business found.</div>
                                )
                            )}
                        </div>

                        {/* Volume Weekly Input */}
                        <div>
                            <Label htmlFor="volumeWeekly" className="block text-sm font-medium text-gray-700 mb-2">
                                Volume Processed Weekly ($) <span className="text-red-500">*</span>
                                <span className="block text-xs text-gray-500 font-normal">
                                    (please enter an accurate total volume processed to enable us serve your business better)
                                </span>
                            </Label>
                            <Input
                                id="volumeWeekly"
                                type="text"
                                placeholder="Enter volume (e.g. 10,000.50)"
                                value={formData.volumeWeekly.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                onChange={e => {
                                    // Remove commas for processing
                                    const rawVal = e.target.value.replace(/,/g, "");
                                    // Only allow numbers and decimal
                                    if (/^\d*\.?\d*$/.test(rawVal) || rawVal === "") {
                                        updateFormData('volumeWeekly', rawVal);
                                    }
                                }}
                                inputMode="decimal"
                                className="border-2 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={goToPreviousStep}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button
                            variant="default"
                            className="bg-primary hover:bg-primary/90 text-white"
                            disabled={!formData.selectedBusiness || !formData.volumeWeekly}
                            onClick={() => goToNextStep()}
                        >
                            Continue
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const renderCompanyDetails = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Business Details</h2>
                        <p className="text-gray-600">
                            Provide comprehensive business information for compliance and verification
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Mail className="h-5 w-5 text-emerald-600" />
                                Contact Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="senderEmail" className="text-sm font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-emerald-600" />
                                        Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="senderEmail"
                                        type="email"
                                        placeholder="sender@company.com"
                                        value={formData.senderEmail}
                                        onChange={e => updateFormData('senderEmail', e.target.value)}
                                        className="border-2 focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="senderPhone" className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-emerald-600" />
                                        Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Select defaultValue={formData.selectedCountry}>
                                            <SelectTrigger className="w-32 border-2 focus:border-emerald-500">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map((country) => (
                                                    <SelectItem key={country.code} value={country.code}>
                                                        <span className="inline-flex items-center gap-2">
                                                            <img src={country.icon} alt={`${country.name} flag`} className="w-4 h-4 rounded-sm" />
                                                            <span>{country.phoneCode}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            id="senderPhone"
                                            type="tel"
                                            placeholder="Phone number"
                                            value={formData.senderPhone}
                                            onChange={e => updateFormData('senderPhone', e.target.value)}
                                            className="flex-1 border-2 focus:border-emerald-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                Business Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                        Company Name
                                    </Label>
                                    <Input
                                        id="companyName"
                                        type="text"
                                        placeholder="Company name"
                                        value={formData.companyName}
                                        onChange={e => updateFormData('companyName', e.target.value)}
                                        className="border-2 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="countryOfInc" className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        Country of Incorporation <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="countryOfInc"
                                        type="text"
                                        value={countries.find(c => c.code === formData.selectedCountry)?.name || ""}
                                        readOnly
                                        className="bg-gray-50 border-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="percentageOwnership" className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        Ownership Percentage <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="percentageOwnership"
                                        type="number"
                                        placeholder="e.g., 25"
                                        min="0"
                                        max="100"
                                        value={formData.percentageOwnership}
                                        onChange={e => updateFormData('percentageOwnership', e.target.value)}
                                        className="border-2 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dateOfInc" className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        Date of Incorporation
                                    </Label>
                                    <Input
                                        id="dateOfInc"
                                        type="date"
                                        value={formData.dateOfInc}
                                        onChange={e => updateFormData('dateOfInc', e.target.value)}
                                        className="border-2 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="affiliatedBusiness" className="text-sm font-medium flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        Affiliated Status
                                    </Label>
                                    <Select
                                        value={formData.affiliatedBusiness}
                                        onValueChange={(value) => updateFormData('affiliatedBusiness', value)}
                                    >
                                        <SelectTrigger className="border-2 focus:border-blue-500">
                                            <SelectValue placeholder="Select affiliated status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="not_reported">Not Reported</SelectItem>
                                            <SelectItem value="live">Live</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-purple-600" />
                                Business Address
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-900">Country</Label>
                                    <Input
                                        id="addressCountry"
                                        type="text"
                                        placeholder="Country"
                                        value={formData.addressCountry}
                                        readOnly
                                        className="bg-gray-50 border-2"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-900">State/Province</Label>
                                    <Input
                                        id="addressState"
                                        type="text"
                                        placeholder="State or Province"
                                        value={formData.addressState}
                                        onChange={e => updateFormData('addressState', e.target.value)}
                                        className="border-2 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-900">City</Label>
                                    <Input
                                        id="addressCity"
                                        type="text"
                                        placeholder="City"
                                        value={formData.addressCity}
                                        onChange={e => updateFormData('addressCity', e.target.value)}
                                        className="border-2 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-900">Postal Code</Label>
                                    <Input
                                        id="addressPostal"
                                        type="text"
                                        placeholder="Postal Code"
                                        value={formData.addressPostal}
                                        onChange={e => updateFormData('addressPostal', e.target.value)}
                                        className="border-2 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-sm font-medium text-gray-900">Street Address</Label>
                                    <Input
                                        id="addressStreet"
                                        type="text"
                                        placeholder="Complete street address"
                                        value={formData.addressStreet}
                                        onChange={e => updateFormData('addressStreet', e.target.value)}
                                        className="border-2 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={goToPreviousStep}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white"
                            onClick={() => goToNextStep()}
                        >
                            Continue
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const renderSenderProfile = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Sender Profile Details</h2>
                        <p className="text-gray-600">
                            Complete personal profile information for compliance verification
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="firstName" className="text-sm font-medium">
                                        First Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        placeholder="Enter first name"
                                        value={formData.firstName}
                                        onChange={e => updateFormData('firstName', e.target.value)}
                                        className="border-2 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="middleName" className="text-sm font-medium">
                                        Middle Name
                                    </Label>
                                    <Input
                                        id="middleName"
                                        type="text"
                                        placeholder="Enter middle name"
                                        value={formData.middleName}
                                        onChange={e => updateFormData('middleName', e.target.value)}
                                        className="border-2 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName" className="text-sm font-medium">
                                        Last Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder="Enter last name"
                                        value={formData.lastName}
                                        onChange={e => updateFormData('lastName', e.target.value)}
                                        className="border-2 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="birthDate" className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        Date of Birth
                                    </Label>
                                    <Input
                                        id="birthDate"
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={e => updateFormData('birthDate', e.target.value)}
                                        className="border-2 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="position" className="text-sm font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                        Position <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="position"
                                        type="text"
                                        placeholder="e.g., CEO, Director"
                                        value={formData.position}
                                        onChange={e => updateFormData('position', e.target.value)}
                                        className="border-2 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="birthCountry" className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        Birth Country
                                    </Label>
                                    <Select
                                        value={formData.birthCountry}
                                        onValueChange={(value) => updateFormData('birthCountry', value)}
                                    >
                                        <SelectTrigger className="border-2 focus:border-blue-500">
                                            <SelectValue placeholder="Select birth country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((country) => (
                                                <SelectItem key={country.code} value={country.code}>
                                                    <span className="inline-flex items-center gap-2">
                                                        <img src={country.icon} alt={`${country.name} flag`} className="w-4 h-4 rounded-sm" />
                                                        <span>{country.name}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Business Role & Ownership */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Business Role & Ownership
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="isUBO" className="text-sm font-medium flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-purple-600" />
                                        Is Beneficial Owner?
                                    </Label>
                                    <Select
                                        value={formData.isUBO}
                                        onValueChange={(value) => updateFormData('isUBO', value)}
                                    >
                                        <SelectTrigger className="border-2 focus:border-purple-500">
                                            <SelectValue placeholder="Select option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="ownershipPercentage" className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-purple-600" />
                                        Ownership Percentage <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="ownershipPercentage"
                                        type="number"
                                        placeholder="Enter percentage"
                                        min="0"
                                        max="100"
                                        value={formData.ownershipPercentage}
                                        onChange={e => updateFormData('ownershipPercentage', e.target.value)}
                                        className="border-2 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="roles" className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-purple-600" />
                                        Role
                                    </Label>
                                    <Select
                                        value={formData.roles}
                                        onValueChange={(value) => updateFormData('roles', value)}
                                    >
                                        <SelectTrigger className="border-2 focus:border-purple-500">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="shareholder">Shareholder</SelectItem>
                                            <SelectItem value="legal_representative">Legal Representative</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="votingRightsPercentage" className="text-sm font-medium flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-600" />
                                        Voting Rights %
                                    </Label>
                                    <Input
                                        id="votingRightsPercentage"
                                        type="number"
                                        placeholder="Enter voting rights %"
                                        min="0"
                                        max="100"
                                        value={formData.votingRightsPercentage}
                                        onChange={e => updateFormData('votingRightsPercentage', e.target.value)}
                                        className="border-2 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="isBusinessContact" className="text-sm font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-purple-600" />
                                        Is Business Contact?
                                    </Label>
                                    <Select
                                        value={formData.isBusinessContact}
                                        onValueChange={(value) => updateFormData('isBusinessContact', value)}
                                    >
                                        <SelectTrigger className="border-2 focus:border-purple-500">
                                            <SelectValue placeholder="Select option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Address */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Contact & Address Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-orange-600" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="personal@email.com"
                                        value={formData.email}
                                        onChange={e => updateFormData('email', e.target.value)}
                                        className="border-2 focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tax & Identity */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Tax & Identity Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="personalTaxId" className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-green-600" />
                                        Tax Identification Number
                                    </Label>
                                    <Input
                                        id="personalTaxId"
                                        type="text"
                                        placeholder="Enter tax ID"
                                        value={formData.personalTaxId}
                                        onChange={e => updateFormData('personalTaxId', e.target.value)}
                                        className="border-2 focus:border-green-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ssn" className="text-sm font-medium flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-green-600" />
                                        Social Security Number
                                    </Label>
                                    <Input
                                        id="ssn"
                                        type="text"
                                        placeholder="XXX-XX-XXXX"
                                        value={formData.ssn}
                                        onChange={e => updateFormData('ssn', e.target.value)}
                                        className="border-2 focus:border-green-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={goToPreviousStep}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white"
                            onClick={() => goToNextStep()}
                        >
                            Continue to Documents
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const renderUploadField = (fieldKey: string, label: string) => (
        <div key={fieldKey} className="space-y-2">
            <Label className="block text-lg font-bold text-gray-700">{label}</Label>
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${dragActive ? "border-primary bg-primary/5" : "border-gray-300"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, fieldKey)}
                tabIndex={0}
            >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">Drag & drop or click to choose files</p>
                <p className="text-sm text-gray-500 mb-2">JPEG, PNG, and PDF formats</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                    Max file size: 2 MB
                </div>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, fieldKey)}
                />
                {formData.kycDocuments[fieldKey] && (
                    <div className="mt-2 text-sm text-green-600">
                        ✓ {formData.kycDocuments[fieldKey]?.name}
                    </div>
                )}
            </div>
        </div>
    );

    const renderKycDocuments = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">KYC Information</h2>
                        <p className="text-gray-600">
                            Please provide your KYC information and upload required documents.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {renderUploadField("cacCertOfIncoporation", "CAC Certificate of Incorporation")}
                        {renderUploadField("memorandumArticlesOfAssociation", "Memorandum & Articles of Association (Memart)")}
                        {renderUploadField("cacStatusReport", "CAC Status Report")}
                        {renderUploadField("proofOfAddress", "Proof of Address (Recent Utility Bill)")}
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={goToPreviousStep}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white"
                            onClick={() => {
                                // Clear saved progress since we're done
                                localStorage.removeItem(`add-sender-${wallet}`);
                                // Navigate back to sender list
                                setLocation(`/dashboard/${wallet}/sender`);
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loading />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Complete & Save
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Sender</h1>
                    <p className="text-gray-600">Complete the sender onboarding process step by step.</p>
                </motion.div>

                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* Main Content */}
                <div className="min-h-[600px]">
                    {currentStep === FormStep.COUNTRY_SELECTION && renderCountrySelection()}
                    {currentStep === FormStep.BUSINESS_DETAILS && renderBusinessDetails()}
                    {currentStep === FormStep.BUSINESS_CONFIRMATION && renderBusinessConfirmation()}
                    {currentStep === FormStep.COMPANY_DETAILS && renderCompanyDetails()}
                    {currentStep === FormStep.SENDER_PROFILE && renderSenderProfile()}
                    {currentStep === FormStep.KYC_DOCUMENTS && renderKycDocuments()}
                </div>
            </div>
        </div>
    );
}
