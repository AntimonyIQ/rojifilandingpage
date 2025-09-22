import { ISender } from "@/v1/interface/interface";

// Form steps enum
export enum FormStep {
    COUNTRY_SELECTION = 'country-selection',
    BUSINESS_DETAILS = 'business-details',
    BUSINESS_CONFIRMATION = 'business-confirmation',
    COMPANY_DETAILS = 'company-details',
    SENDER_PROFILE = 'sender-profile',
    KYC_DOCUMENTS = 'kyc-documents'
}

// Country interface
export interface Country {
    code: string;
    name: string;
    icon: string;
    phoneCode: string;
}

// Business option interface
export interface BusinessOption {
    id: string;
    name: string;
    regNumber: string;
    taxId: string;
}

// Extend ISender for form data - this ensures type compatibility
export interface FormData extends Partial<ISender> {
    // Additional form-specific fields that might not be in ISender
    selectedCountry?: string;
    businessOptions?: BusinessOption[];
    volumeWeekly?: string;
    selectedBusiness?: string;
}

// Step interface for indicator
export interface Step {
    key: FormStep;
    label: string;
    number: number;
}