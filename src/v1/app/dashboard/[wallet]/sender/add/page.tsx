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
import { IResponse, ISender, ISmileIdBusinessResponse } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
import Defaults from "@/v1/defaults/defaults";
import { Status } from "@/v1/enums/enums";
import { Country } from "country-state-city";

export default function AddSenderPage() {
    const { wallet } = useParams();
    const [, setLocation] = useLocation();
    const sd: SessionData = session.getUserData();

    // Form state management
    const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.COUNTRY_SELECTION);
    const [businessLoading, setBusinessLoading] = useState(false);
    const [businessDetails, setBusinessDetails] = useState<ISmileIdBusinessResponse | null>(null);

    // Form data state
    const [formData, setFormData] = useState<Partial<ISender> & {
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
                            businessDetails={businessDetails}
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
                                        smileIdStatus: "not_submitted",
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