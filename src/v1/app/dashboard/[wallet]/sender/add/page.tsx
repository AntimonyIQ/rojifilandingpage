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
    const [submissionLoading, setSubmissionLoading] = useState<boolean>(false);
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
            return
            
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
                  // clear previous errors and start loading
                  setSubmissionError(null);
                  setSubmissionLoading(true);
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

                    // submit
                    // ensure we have an auth token
                    if (!sd?.authorization) {
                      setSubmissionError(
                        "Not authenticated. Please sign in and try again."
                      );
                      setSubmissionLoading(false);
                      return;
                    }

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

                    const response = await fetch(
                      `${Defaults.API_BASE_URL}/sender/add`,
                      {
                        method: "POST",
                        headers: {
                          ...Defaults.HEADERS,
                          "Content-Type": "application/json",
                          "x-rojifi-handshake": sd.client.publicKey,
                          "x-rojifi-deviceid": sd.deviceid,
                          Authorization: `Bearer ${sd.authorization}`,
                        },
                        body: JSON.stringify(payload),
                      }
                    );

                    // handle HTTP-level auth failure explicitly
                    if (response.status === 401) {
                      setSubmissionError(
                        "Authentication failed. Please sign in again."
                      );
                      setSubmissionLoading(false);
                      return;
                    }

                    const result = await response.json();
                    if (result.status === Status.SUCCESS) {
                      // success - navigate back to sender list
                      setLocation(`/dashboard/${wallet}/sender`);
                    } else {
                      // show simple error message
                      setSubmissionError(
                        result.message ||
                          "An error occurred while creating the sender."
                      );
                    }
                  } catch (err) {
                    console.error("Submit error:", err);
                    setSubmissionError("Network error. Please try again.");
                  } finally {
                    setSubmissionLoading(false);
                  }
                }}
              />
            )}
          </div>
        </div>
        {/* Submission error alert */}
        {submissionError && (
          <div className="max-w-3xl mx-auto mt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
              {submissionError}
            </div>
          </div>
        )}

        {/* Submission spinner overlay */}
        {submissionLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white p-4 rounded shadow flex items-center gap-3">
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 3,
                  borderStyle: "solid",
                  borderColor: "#e5e7eb",
                  borderTopColor: "#3b82f6",
                  borderRadius: 9999,
                  animation: "rs-spin 1s linear infinite",
                }}
              />
              <div>Submitting...</div>
            </div>
            <style>{`@keyframes rs-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    );
 }