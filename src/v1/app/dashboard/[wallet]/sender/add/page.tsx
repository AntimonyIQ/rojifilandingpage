"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";

// Components
import { StepIndicator } from "./components/StepIndicator";
import { CountrySelection } from "./components/CountrySelection";
import { BusinessDetails } from "./components/BusinessDetails";
import { BusinessConfirmation } from "./components/BusinessConfirmation";
import { CompanyDetails } from "./components/CompanyDetails";
import { BusinessFinancials } from "./components/BusinessFinancials";
import BusinessDocuments from "./components/BusinessDocuments";
import DirectorShareholder from "./components/DirectorShareholder";

// Types and constants
import { FormStep } from "./types";
import { formSteps } from "./constants";
import { IResponse, ISender, ISmileIdBusinessResponse } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
import Defaults from "@/v1/defaults/defaults";
import { Status } from "@/v1/enums/enums";
import { Country } from "country-state-city";

export default function AddSenderPage() {
    const { wallet } = useParams();
    const [, setLocation] = useLocation();
    const sd: SessionData = session.getUserData();
    const mainContentRef = useRef<HTMLDivElement>(null);

    // Form state management
    const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.COUNTRY_SELECTION);
    const [businessLoading, setBusinessLoading] = useState(false);
    const [businessDetails, setBusinessDetails] = useState<ISmileIdBusinessResponse | null>(null);
    // Form data state
    const [formData, setFormData] = useState<Partial<ISender> & {
        selectedBusiness?: string;
        volumeWeekly?: string;
    }>({});
    // Submission states
    const [submissionState, setSubmissionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        // If user opened add page to resume a draft, restore saved progress from session
        try {
            const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
            if (params?.get("resume") === "true" && sd?.addSender?.formData) {
                setFormData(sd.addSender.formData);
                setCurrentStep(sd.addSender.currentStep ?? FormStep.COUNTRY_SELECTION);
            }
        } catch (e) {
            // ignore on server
        }

        if (sd.addSender) {
            const { formData, currentStep } = sd.addSender;
            setFormData(formData);
            setCurrentStep(currentStep);
        }
    }, [wallet]);

    useEffect(() => {
        const dataToSave = {
            formData,
            currentStep,
            timestamp: Date.now()
        };
        session.updateSession({ ...sd, addSender: dataToSave });
    }, [formData, currentStep, wallet]);

    // Helper functions
    const updateFormData = (field: string, value: any) => {
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
            // Auto scroll to top of main content when moving to next step
            setTimeout(() => {
                if (mainContentRef.current) {
                    mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // Also scroll window as fallback
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }
    };

    const goToPreviousStep = () => {
        const steps = Object.values(FormStep);
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
            // Auto scroll to top of main content when moving to previous step
            setTimeout(() => {
                if (mainContentRef.current) {
                    mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // Also scroll window as fallback
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }
    };

    const handleGoBack = () => {
        // Clear saved progress
        session.updateSession({
            ...sd,
            addSender: {
                formData: {},
                currentStep: FormStep.COUNTRY_SELECTION,
                timestamp: 0
            }
        });
        // Navigate back to sender list
        setLocation(`/dashboard/${wallet}/sender`);
    };

    const handleCountrySelection = (countryCode: string) => {

        // const countryObj = countries.find(c => c.code === countryCode);
        // const countryName = countryObj?.name || "";

        // Only Nigeria is supported for now
        if (countryCode !== "Nigeria") {
            // Inform the user and do not set the country
            // return ("Selected country is not available yet. Only Nigeria is supported at the moment.");
            // clear any previous selection
            setFormData(prev => ({
                ...prev,
                countryOfIncorporation: undefined,
                country: ""
            }));
            return;

        }

        updateFormData('countryOfIncorporation', countryCode);
        updateFormData('country', countryCode);
    };

    const handleBusinessDetailsSubmit = () => {
        const smileid_business_lastChecked = sd.smileid_business_lastChecked ? new Date(sd.smileid_business_lastChecked) : null;
        const smileid_business_response = sd.smileid_business_response;

        if (
            smileid_business_response &&
            smileid_business_lastChecked &&
            formData.businessRegistrationNumber === smileid_business_response.company_information?.registration_number
        ) {
            console.log("Using Local data");
            const diffTime = Math.abs(new Date().getTime() - smileid_business_lastChecked.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 30) {
                console.log("SmileID Business Response: ", smileid_business_response);
                setBusinessDetails(smileid_business_response);

                setFormData(prev => ({
                    ...prev,
                    businessName: smileid_business_response.company_information?.legal_name || prev.businessName || "",
                    businessRegistrationNumber: smileid_business_response.company_information?.registration_number || prev.businessRegistrationNumber || "",
                    dateOfIncorporation: new Date(smileid_business_response.company_information?.registration_date) || prev.dateOfIncorporation || "",
                    registrationDate: new Date(smileid_business_response.company_information?.registration_date) || prev.registrationDate || "",
                    actualOperationsAndRegisteredAddressesMatch: true,
                    companyProvideRegulatedFinancialServices: false,
                    directorOrBeneficialOwnerIsPEPOrUSPerson: false,

                }));

                goToNextStep();
                return;
            }
        } else {
            fetchBusinessDetails();
        }
    };

    const fetchBusinessDetails = async () => {
        try {
            setBusinessLoading(true);
            const countryCode = Country.getAllCountries().find(c => c.name === formData.countryOfIncorporation)?.isoCode;
            if (!countryCode) throw new Error('Invalid country selected.');
            if (!formData.businessRegistrationNumber) throw new Error('Business registration number is required.');

            console.log("Fetching business details for country:", countryCode, "and registration number:", formData.businessRegistrationNumber);

            const res = await fetch(`${Defaults.API_BASE_URL}/sender/verify/business`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
                body: JSON.stringify({
                    countryCode: countryCode,
                    registrationNumber: formData.businessRegistrationNumber,
                    businessType: 'bn'
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData: ISmileIdBusinessResponse = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                session.updateSession({
                    ...sd,
                    smileid_business_response: parseData,
                    smileid_business_lastChecked: new Date()
                });
                setBusinessDetails(parseData);


                // format(formData.registrationDate, "PPP")

                setFormData(prev => ({
                    ...prev,
                    businessName: parseData.company_information?.legal_name || prev.businessName || "",
                    businessRegistrationNumber: parseData.company_information?.registration_number || prev.businessRegistrationNumber || "",
                    dateOfIncorporation: new Date(parseData.company_information?.registration_date) || prev.dateOfIncorporation || "",
                    registrationDate: new Date(parseData.company_information?.registration_date) || prev.registrationDate || "",
                    actualOperationsAndRegisteredAddressesMatch: true,
                    companyProvideRegulatedFinancialServices: false,
                    directorOrBeneficialOwnerIsPEPOrUSPerson: false,
                }));

                goToNextStep();
            }
        } catch (error: any) {
            console.error("Error fetching business details:", error);
        } finally {
            setBusinessLoading(false);
        }
    }

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Add New Sender
                    </h1>
                    <p className="text-gray-600">
                        Complete the sender onboarding process step by step.
                    </p>
                </motion.div>

                {/* Step Indicator */}
                <StepIndicator steps={formSteps} currentStep={currentStep} />

                {/* Main Content */}
                <div
                    ref={mainContentRef}
                    className="min-h-[600px] max-h-[80vh] overflow-y-auto"
                >
                    {currentStep === FormStep.COUNTRY_SELECTION && (
                        <CountrySelection
                            selectedCountry={formData.countryOfIncorporation || ""}
                            onCountrySelect={handleCountrySelection}
                            onBack={handleGoBack}
                            onContinue={() => goToNextStep()}
                        />
                    )}

                    {currentStep === FormStep.BUSINESS_DETAILS && (
                        <BusinessDetails
                            businessNumber={formData.businessRegistrationNumber || ""}
                            taxId={formData.taxIdentificationNumber || ""}
                            isLoading={businessLoading}
                            onBusinessNumberChange={(value) =>
                                updateFormData("businessRegistrationNumber", value)
                            }
                            onTaxIdChange={(value) =>
                                updateFormData("taxIdentificationNumber", value)
                            }
                            onBack={goToPreviousStep}
                            onContinue={handleBusinessDetailsSubmit}
                        />
                    )}

                    {currentStep === FormStep.BUSINESS_CONFIRMATION && (
                        <BusinessConfirmation
                            businessDetails={businessDetails}
                            selectedBusiness={formData.selectedBusiness || ""}
                            volumeWeekly={formData.volumeWeekly || ""}
                            onBusinessSelect={(businessId) =>
                                updateFormData("selectedBusiness", businessId)
                            }
                            onVolumeChange={(volume) =>
                                updateFormData("volumeWeekly", volume)
                            }
                            onBack={goToPreviousStep}
                            onContinue={goToNextStep}
                        />
                    )}

                    {currentStep === FormStep.COMPANY_DETAILS && (
                        <CompanyDetails
                            formData={formData}
                            onFieldChange={updateFormData}
                            onBack={goToPreviousStep}
                            onContinue={goToNextStep}
                        />
                    )}

                    {currentStep === FormStep.BUSINESS_FINANCIALS && (
                        <BusinessFinancials
                            formData={formData}
                            onFieldChange={updateFormData}
                            onBack={goToPreviousStep}
                            onContinue={goToNextStep}
                        />
                    )}

                    {currentStep === FormStep.SENDER_PROFILE && (
                        <BusinessDocuments
                            formData={formData}
                            onFieldChange={updateFormData}
                            onBack={goToPreviousStep}
                            onContinue={goToNextStep}
                        />
                    )}

                    {currentStep === FormStep.KYC_DOCUMENTS && (
                        <DirectorShareholder
                            formData={formData}
                            onFieldChange={updateFormData}
                            onBack={goToPreviousStep}
                            onContinue={async () => {
                                const handleSubmission = async () => {
                                    // clear previous errors and start loading
                                    setSubmissionError(null);
                                    setSubmissionState('loading');
                                    try {
                                        // Auto scroll to top for final submission
                                        setTimeout(() => {
                                            if (mainContentRef.current) {
                                                mainContentRef.current.scrollTo({
                                                    top: 0,
                                                    behavior: "smooth",
                                                });
                                            }
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }, 50);

                                        // sanitize formData: remove File objects and convert Dates
                                        function sanitize<T extends Record<string, unknown>>(obj: T): Partial<T> {
                                            const out: Partial<T> = {};
                                            for (const [k, v] of Object.entries(obj || {})) {
                                                if (v instanceof File) continue; // upload files separately
                                                if (v instanceof Date) (out as any)[k] = v.toISOString();
                                                else (out as any)[k] = v;
                                            }
                                            return out;
                                        }
                                        const sanitized = sanitize(formData);
                                        // Toggle this according to your backend (true if API expects { sender: {...} })
                                        const WRAP_WITH_SENDER = true;
                                        const payload = WRAP_WITH_SENDER
                                            ? { sender: sanitized }
                                            : sanitized;

                                        // console.log("Submitting payload:", payload);

                                        // Submit to backend
                                        // Note: files need to be uploaded separately after this step
                                        // as they cannot be sent in JSON. This can be handled in backend
                                        // by creating a "draft" sender first, then uploading files to it.
                                        // For simplicity, we are not handling file uploads here.
                                        // Ensure your backend can handle missing files initially.
                                        // You may need to implement a separate file upload step after this.
                                        // Here we just submit the non-file data.
                                        // return; // Remove this line when ready to submit

                                        const response = await fetch(`${Defaults.API_BASE_URL}/sender/add`, {
                                            method: "POST",
                                            headers: {
                                                ...Defaults.HEADERS,
                                                "x-rojifi-handshake": sd.client.publicKey,
                                                "x-rojifi-deviceid": sd.deviceid,
                                                Authorization: `Bearer ${sd.authorization}`,
                                            },
                                            body: JSON.stringify(payload),
                                        });

                                        const data: IResponse = await response.json();
                                        if (data.status === Status.ERROR) throw new Error(data.message || data.error);
                                        if (data.status === Status.SUCCESS) {
                                            setSubmissionState('success');
                                        }
                                    } catch (err) {
                                        console.error("Submit error:", err);
                                        setSubmissionError((err as Error).message || "Network error. Please try again.");
                                        setSubmissionState('error');
                                    }
                                };

                                await handleSubmission();
                            }}
                        />
                    )}
                </div>
            </div>
            {/* Enhanced Submission Modal */}
            {submissionState !== 'idle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
                        {/* Loading State */}
                        {submissionState === 'loading' && (
                            <div className="text-center">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 mx-auto">
                                        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Sender Profile</h3>
                                <p className="text-gray-600">Please wait while we process your information...</p>
                                <div className="mt-4 flex justify-center">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {submissionState === 'error' && (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Submission Failed</h3>
                                <p className="text-gray-600 mb-6">{submissionError || "An unexpected error occurred"}</p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={async () => {
                                            const handleSubmission = async () => {
                                                setSubmissionError(null);
                                                setSubmissionState('loading');
                                                try {
                                                    function sanitize<T extends Record<string, unknown>>(obj: T): Partial<T> {
                                                        const out: Partial<T> = {};
                                                        for (const [k, v] of Object.entries(obj || {})) {
                                                            if (v instanceof File) continue;
                                                            if (v instanceof Date) (out as any)[k] = v.toISOString();
                                                            else (out as any)[k] = v;
                                                        }
                                                        return out;
                                                    }
                                                    const sanitized = sanitize(formData);
                                                    const WRAP_WITH_SENDER = true;
                                                    const payload = WRAP_WITH_SENDER ? { sender: sanitized } : sanitized;

                                                    const response = await fetch(`${Defaults.API_BASE_URL}/sender/add`, {
                                                        method: "POST",
                                                        headers: {
                                                            ...Defaults.HEADERS,
                                                            "x-rojifi-handshake": sd.client.publicKey,
                                                            "x-rojifi-deviceid": sd.deviceid,
                                                            Authorization: `Bearer ${sd.authorization}`,
                                                        },
                                                        body: JSON.stringify(payload),
                                                    });

                                                    const data: IResponse = await response.json();
                                                    if (data.status === Status.ERROR) throw new Error(data.message || data.error);
                                                    if (data.status === Status.SUCCESS) {
                                                        setSubmissionState('success');
                                                    }
                                                } catch (err) {
                                                    console.error("Submit error:", err);
                                                    setSubmissionError((err as Error).message || "Network error. Please try again.");
                                                    setSubmissionState('error');
                                                }
                                            };
                                            await handleSubmission();
                                        }}
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => setSubmissionState('idle')}
                                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Success State */}
                        {submissionState === 'success' && (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sender Profile Created!</h3>
                                <p className="text-gray-600 mb-6">Your sender profile has been successfully created and is ready to use.</p>
                                <button
                                    onClick={() => {
                                        // Clear saved progress
                                        session.updateSession({
                                            ...sd,
                                            addSender: {
                                                formData: {},
                                                currentStep: FormStep.COUNTRY_SELECTION,
                                                timestamp: 0
                                            }
                                        });
                                        setLocation(`/dashboard/${wallet}/sender`);
                                    }}
                                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                >
                                    View Senders
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}