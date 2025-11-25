
/*
const sourceOfWealthOptions = [
    { value: "sales_revenue_business_earnings", label: "Sales Revenue/Business Earnings" },
    { value: "investors_funds", label: "Investors Funds" },
    { value: "company_treasury", label: "Company Treasury" },
    { value: "crowdfunding", label: "Crowdfunding" },
    { value: "investment_returns", label: "Investment Returns" },
    { value: "loan_debt_financing", label: "Loan/Debt Financing" },
    { value: "ico", label: "ICO (Initial Coin Offering)" },
    { value: "grant", label: "Grant" },
    { value: "other", label: "Other" },
];
*/

export type SourceOfWealth =
    | "sales_revenue_business_earnings"
    | "investors_funds"
    | "company_treasury"
    | "crowdfunding"
    | "investment_returns"
    | "loan_debt_financing"
    | "ico"
    | "grant"
    | "other";

export interface ISourceOfWealth {
    value: SourceOfWealth;
    label: string;
}

const sourceOfWealthOptions: ISourceOfWealth[] = [
    { value: "sales_revenue_business_earnings", label: "Sales Revenue/Business Earnings" },
    { value: "investors_funds", label: "Investors Funds" },
    { value: "company_treasury", label: "Company Treasury" },
    { value: "crowdfunding", label: "Crowdfunding" },
    { value: "investment_returns", label: "Investment Returns" },
    { value: "loan_debt_financing", label: "Loan/Debt Financing" },
    { value: "ico", label: "ICO (Initial Coin Offering)" },
    { value: "grant", label: "Grant" },
    { value: "other", label: "Other" },
];

export default sourceOfWealthOptions;