"use client";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useParams } from "wouter";
import { motion } from "framer-motion";

// Components
import { StepIndicator } from "./components/StepIndicator";
import { CountrySelection } from "./components/CountrySelection";
import { BusinessDetails } from "./components/BusinessDetails";
import { BusinessConfirmation } from "./components/BusinessConfirmation";
import { CompanyDetails } from "./components/CompanyDetails";
import { BusinessFinancials } from "./components/BusinessFinancials";
import { SenderProfile } from "./components/SenderProfile";
import { KycDocuments } from "./components/KycDocuments";

// Types and constants
import { FormStep } from "./types";
import { countries, formSteps } from "./constants";
import { ISender } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";

export default function AddSenderPage() {
    const { wallet } = useParams();
    const [, setLocation] = useLocation();
    const sd: SessionData = session.getUserData();

    // Form state management
    const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.COUNTRY_SELECTION);
    const [businessLoading, setBusinessLoading] = useState(false);

    // Form data state
    const [formData, setFormData] = useState<Partial<ISender> & {
        businessOptions?: any[];
        selectedBusiness?: string;
        volumeWeekly?: string;
    }>({});

    useEffect(() => {
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
        }
    };

    const goToPreviousStep = () => {
        const steps = Object.values(FormStep);
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
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
        updateFormData('countryOfIncorporation', countryCode);
        updateFormData('country', countries.find(c => c.code === countryCode)?.name || "");
    };

    const handleBusinessDetailsSubmit = () => {
        setBusinessLoading(true);
        // Simulate API call for business info
        setTimeout(() => {
            const businessOptions = [
                {
                    id: "1",
                    name: "Demo Business Ltd",
                    regNumber: formData.businessRegistrationNumber,
                    taxId: formData.taxIdentificationNumber,
                },
            ];
            updateFormData('businessOptions', businessOptions);
            setBusinessLoading(false);
            goToNextStep();
        }, 1500);
    };

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
                <StepIndicator steps={formSteps} currentStep={currentStep} />

                {/* Main Content */}
                <div className="min-h-[600px]">
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
                            onBusinessNumberChange={(value) => updateFormData('businessRegistrationNumber', value)}
                            onTaxIdChange={(value) => updateFormData('taxIdentificationNumber', value)}
                            onBack={goToPreviousStep}
                            onContinue={handleBusinessDetailsSubmit}
                        />
                    )}

                    {currentStep === FormStep.BUSINESS_CONFIRMATION && (
                        <BusinessConfirmation
                            businessOptions={formData.businessOptions || []}
                            selectedBusiness={formData.selectedBusiness || ""}
                            volumeWeekly={formData.volumeWeekly || ""}
                            onBusinessSelect={(businessId) => updateFormData('selectedBusiness', businessId)}
                            onVolumeChange={(volume) => updateFormData('volumeWeekly', volume)}
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
                        <SenderProfile
                            formData={formData}
                            onFieldChange={updateFormData}
                            onBack={goToPreviousStep}
                            onContinue={goToNextStep}
                        />
                    )}

                    {currentStep === FormStep.KYC_DOCUMENTS && (
                        <KycDocuments
                            documents={formData.documents ?
                                formData.documents.reduce((acc, doc) => {
                                    acc[doc.which] = null; // Convert ISenderDocument to File for compatibility
                                    return acc;
                                }, {} as Record<string, File | null>) :
                                {}
                            }
                            onDocumentChange={(field, file) => {
                                // Handle document changes appropriately
                                const existingDocs = formData.documents || [];
                                const updatedDocs = existingDocs.filter(doc => doc.which !== field);
                                if (file) {
                                    updatedDocs.push({
                                        which: field as any,
                                        name: file.name,
                                        type: file.type,
                                        url: "", // Will be set after upload
                                        uploadedAt: new Date(),
                                        kycVerified: false,
                                        kycVerifiedAt: null,
                                        smileIdStatus: "pending",
                                        smileIdVerifiedAt: null,
                                        smileIdJobId: null,
                                        smileIdUploadId: null,
                                        isRequired: true,
                                        issue: false,
                                        issueResolved: false,
                                        issueResolvedAt: null
                                    });
                                }
                                updateFormData('documents', updatedDocs);
                            }}
                            onBack={goToPreviousStep}
                            onSubmit={() => {
                                // Handle final submission
                                console.log("Final form data:", formData);
                                // You can navigate to success page or submit to API here
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}