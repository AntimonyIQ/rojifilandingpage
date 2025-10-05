import { Country, FormStep, StepConfig } from './types';

// Custom country list
export const countries: Country[] = [
    { code: "NG", name: "Nigeria", icon: "https://flagcdn.com/w320/ng.png", phoneCode: "+234" },
    { code: "BJ", name: "Benin", icon: "https://flagcdn.com/w320/bj.png", phoneCode: "+229" },
    { code: "KE", name: "Kenya", icon: "https://flagcdn.com/w320/ke.png", phoneCode: "+254" },
    { code: "CM", name: "Cameroon", icon: "https://flagcdn.com/w320/cm.png", phoneCode: "+237" },
    { code: "CI", name: "Cote d'Ivoire", icon: "https://flagcdn.com/w320/ci.png", phoneCode: "+225" },
    { code: "SN", name: "Senegal", icon: "https://flagcdn.com/w320/sn.png", phoneCode: "+221" },
    { code: "TG", name: "Togo", icon: "https://flagcdn.com/w320/tg.png", phoneCode: "+228" },
];

// Form steps configuration
export const formSteps: StepConfig[] = [
    { key: FormStep.COUNTRY_SELECTION, label: "Country", number: 1 },
    { key: FormStep.BUSINESS_DETAILS, label: "Business", number: 2 },
    { key: FormStep.BUSINESS_CONFIRMATION, label: "Confirm", number: 3 },
    { key: FormStep.COMPANY_DETAILS, label: "Company", number: 4 },
    { key: FormStep.BUSINESS_FINANCIALS, label: "Financials", number: 5 },
    { key: FormStep.SENDER_PROFILE, label: "Business Documents", number: 6 },
    { key: FormStep.KYC_DOCUMENTS, label: "Directors & Shareholders", number: 7 }
];

// Initial form data
export const initialFormData = {
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
};