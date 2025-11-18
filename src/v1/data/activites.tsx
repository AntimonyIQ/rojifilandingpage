/*
Allowed:

CorporateOrMerchant

FinancialInstitution

TechnologyServiceProvider

Other
*/
export type BusinessActivcities =
    | "CorporateOrMerchant"
    | "FinancialInstitution"
    | "TechnologyServiceProvider"
    | "Other";

export interface IBusinessActivities {
    value: BusinessActivcities;
    label: string;
}

const BusinessActivitiesOptions: IBusinessActivities[] = [
    { value: "CorporateOrMerchant", label: "Corporate or Merchant" },
    { value: "FinancialInstitution", label: "Financial Institution" },
    { value: "TechnologyServiceProvider", label: "Technology Service Provider" },
    { value: "Other", label: "Other" },
];

export default BusinessActivitiesOptions;