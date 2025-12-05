// This is the types for the server application.
// Copyright © 2023 Rojifi. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export type TransactionCountRange =
    | 'Range1To10'
    | 'Range10To20'
    | 'Range20To50'
    | 'Range50To100'
    | 'Range100Plus';

// USD Value Ranges
export type UsdValueRange =
    | 'Usd15kTo50k'
    | 'Usd50kTo100k'
    | 'Usd100kTo500k'
    | 'Usd500kTo1m'
    | 'Usd1mPlus';

// Monthly Volume Ranges
export type MonthlyVolumeRange =
    | 'Usd500kTo1m'
    | 'Usd1mTo5m'
    | 'Usd5mTo10m'
    | 'Usd10mTo20m'
    | 'Usd20mTo50m'
    | 'Usd50mPlus';

// Settlement Currencies
export type SettlementCurrency =
    | 'AUD'
    | 'CHF'
    | 'CNY'
    | 'EUR'
    | 'USD'
    | 'GBP'
    | 'JPY'
    | 'HKD'
    | 'NZD'
    | 'SGD';

export type TransactionType =
    | 'AchTransactions'
    | 'DomesticWireTransactions'
    | 'InternationalWireTransactions'
    | 'StablecoinTransactions';

export type CustomerBaseBreakdown =
    | 'Retail'
    | 'Corporate'
    | 'Retail75'
    | 'Retail50'
    | 'Retail25';

export type BusinessIndustryType =
    | 'CorporateOrMerchant'
    | 'FinancialInstitution'
    | 'TechnologyServiceProvider'
    | 'Other';

export type BusinessIndustry =
    | 'AdultEntertainment'
    | 'AffiliateMarketing'
    | 'ArmsAmmunition'
    | 'BailLegalServices'
    | 'BankruptcyServices'
    | 'CannabisProducts'
    | 'DebtCollection'
    | 'CreditRepair'
    | 'DatingServices'
    | 'DebtConsolidation'
    | 'CounselingServices'
    | 'DigitalGames'
    | 'EscortServices'
    | 'FantasyGaming'
    | 'FinancialInvestments'
    | 'FirearmsAccessories'
    | 'FxCurrencyExchange'
    | 'GamblingOnlineCasinos'
    | 'GunsFirearms'
    | 'HoroscopesFortuneTelling'
    | 'LoanFinancingServices'
    | 'MedicalMarijuana'
    | 'MlmPyramidSchemes'
    | 'NuclearEnergy'
    | 'OnlineDating'
    | 'OnlineGamingVr'
    | 'OnlinePharmacies'
    | 'PaydayLoans'
    | 'PersonalFinanceAdvice'
    | 'QuasiCash'
    | 'SeoOnlineMarketing'
    | 'TaxisLimousines'
    | 'VirtualDigitalGoods'
    | 'AccountFunding'
    | 'AlcoholTobaccoProducts'
    | 'AlcoholWholesalers'
    | 'BabysittingServices'
    | 'BitcoinCrypto'
    | 'BusLines'
    | 'HomeBasedBusinesses'
    | 'LuxuryGoods'
    | 'LegalServices'
    | 'None'
    | 'NutritionalSupplements'
    | 'OilGas'
    | 'Pharmaceuticals'
    | 'StampCoinStores'
    | 'TaxAccountingServices'
    | 'Timeshares'
    | 'TobaccoProducts'
    | 'WeightLossProducts'
    | 'WineSpirits'
    | 'WorkFromHome'
    | 'AgricultureFarming'
    | 'CloudNetworkServices'
    | 'DocumentPreparation'
    | 'EducationTutoring'
    | 'ElectronicsHardware'
    | 'EnergyUtilities'
    | 'HealthcareServices'
    | 'IndustrialProducts'
    | 'InsuranceBenefits'
    | 'InsurancePremiums'
    | 'IpTrademarkServices'
    | 'RealEstate'
    | 'VehicleSalesFinancing'
    | 'WebDesign'
    | 'WebHostingServices'
    | 'WindFarms'
    | 'Aviation'
    | 'AirlinesOther'
    | 'AutoSalesRepair'
    | 'ConstructionContracting'
    | 'CruiseLines'
    | 'DirectMarketingOther'
    | 'DirectMarketingOutbound'
    | 'DirectMarketingSubscription'
    | 'ECigarettesVaping'
    | 'EventPlanning'
    | 'FurnitureStores'
    | 'HospitalityTravel'
    | 'ImportExport'
    | 'JetCharter'
    | 'ProfessionalServices'
    | 'SoftwareTechnology'
    | 'SportsRecreation'
    | 'TelecomWireless'
    | 'TicketSalesEvent'
    | 'TravelAgencies'
    | 'SecuritiesCustody'
    | 'VirtualAssetServiceProvider'
    | 'BrokerDealer'
    | 'CommercialBanking'
    | 'InvestmentBanking'
    | 'LiquidityProvider'
    | 'PrivateBanking'
    | 'RetailBanking'
    | 'MsbMtlEmi'
    | 'Otc'
    | 'WealthManagement'
    | 'BaasNoLicense'
    | 'ProgramManager'
    | 'SaasNoLicense'
    | 'BaasWithLicense'
    | 'SaasWithLicense';

export type CountryCode =
    | 'AL' | 'DZ' | 'AX' | 'AS' | 'AD' | 'AO' | 'AI' | 'AG' | 'AR' | 'AM'
    | 'AW' | 'AU' | 'AT' | 'AZ' | 'BS' | 'BH' | 'BD' | 'BB' | 'BE' | 'BZ'
    | 'BJ' | 'BM' | 'BO' | 'BW' | 'BR' | 'IO' | 'BN' | 'BG' | 'BF' | 'CM'
    | 'CA' | 'CV' | 'KY' | 'TD' | 'CL' | 'CN' | 'KM' | 'CG' | 'CK' | 'CR'
    | 'HR' | 'CW' | 'CZ' | 'DK' | 'DJ' | 'DM' | 'DO' | 'EC' | 'EG' | 'SV'
    | 'GQ' | 'EE' | 'FK' | 'FO' | 'FJ' | 'FI' | 'FR' | 'GF' | 'PF' | 'GA'
    | 'GM' | 'GE' | 'DE' | 'GH' | 'GI' | 'GR' | 'GL' | 'GD' | 'GP' | 'GU'
    | 'GT' | 'GY' | 'HN' | 'HK' | 'HU' | 'IS' | 'IN' | 'IE' | 'IL' | 'IT'
    | 'JM' | 'JP' | 'JO' | 'KE' | 'KI' | 'KW' | 'LV' | 'LS' | 'LI' | 'LT'
    | 'LU' | 'MK' | 'MG' | 'MW' | 'MY' | 'MT' | 'MH' | 'MQ' | 'MU' | 'YT'
    | 'MX' | 'FM' | 'MC' | 'MN' | 'MS' | 'MA' | 'MZ' | 'NA' | 'NL' | 'NC'
    | 'NZ' | 'NE' | 'NG' | 'NU' | 'NF' | 'MP' | 'NO' | 'OM' | 'PW' | 'PA'
    | 'PG' | 'PY' | 'PE' | 'PH' | 'PL' | 'PT' | 'PR' | 'QA' | 'RE' | 'RO'
    | 'KN' | 'LC' | 'PM' | 'VC' | 'WS' | 'SM' | 'ST' | 'SA' | 'SN' | 'RS'
    | 'SC' | 'SL' | 'SG' | 'SX' | 'SK' | 'SI' | 'SB' | 'ZA' | 'KR' | 'ES'
    | 'LK' | 'SR' | 'SZ' | 'SE' | 'CH' | 'TW' | 'TJ' | 'TZ' | 'TH' | 'TG'
    | 'TO' | 'TT' | 'TN' | 'TR' | 'TM' | 'TC' | 'TV' | 'UG' | 'AE' | 'GB'
    | 'US' | 'UY' | 'UZ' | 'VU' | 'VN' | 'VG' | 'VI' | 'EH' | 'ZM' | 'RW'
    | 'ML' | 'CI' | 'CD';

export type IdentityDocumentType =
    | 'Passport'
    | 'DriverLicense'
    | 'NationalId'
    | 'PanCard'
    | 'IdCard'
    | 'VoterIdCard'
    | 'ResidentCard'
    | 'GhanaCard'
    | 'GhanaSsnitCard'
    | 'KenyaAlienCard'
    | 'ColombiaPpt';

export type DocumentFileType =
    | 'OrganizationChart'
    | 'ShareholdersProofOfAddress'
    | 'DirectorsProofOfAddress'
    | 'OwnershipChart'
    | 'ShareholdersRegistry'
    | 'DirectorsRegistry'
    | 'CompanyProofOfAddress'
    | 'BusinessRegistrationDocument'
    | 'ArticlesOfAssociationOrMemorandum'
    | 'Other'
    | 'ParentCompanyBusinessRegistrationDocument'
    | 'ParentCompanyShareholdersRegistry'
    | 'ParentCompanyDirectorsRegistry'
    | 'ParentCompanyShareholdersProofOfAddress'
    | 'ParentCompanyDirectorsProofOfAddress'
    | 'ParentCompanyShareholdersId'
    | 'ParentCompanyDirectorId'
    | 'ComplianceOfficerCV'
    | 'IndependentAmlAudit'
    | 'AmlPolicy'
    | 'RegulatoryLicenses'
    | 'DirectorsLivenessCheck'
    | 'ShareHoldersLivenessCheck';

export type CustomerRequiredDocument =
    | 'organizationChart'
    | 'shareholdersProofOfAddress'
    | 'directorsProofOfAddress'
    | 'ownershipChart'
    | 'shareholdersRegistry'
    | 'directorsRegistry'
    | 'companyProofOfAddress'
    | 'businessRegistrationDocument'
    | 'articlesOfAssociationOrMemorandum';

export type WalletCurrency =
    | 'NGN'
    | 'USD'
    | 'USDC'
    | 'USDT'
    | 'ETH'
    | 'CNY'
    | 'KES'
    | 'BWP'
    | 'XAF'
    | 'MWK'
    | 'RWF'
    | 'TZS'
    | 'UGX'
    | 'ZMW'
    | 'ZAR'
    | 'XOF'
    | 'CDF'
    | 'AED'
    | 'EUR'
    | 'GBP'
    | 'CHF'
    | 'CAD'
    | 'SGD'
    | 'HKD'
    | 'KRW'
    | 'JPY'
    | 'TWD'
    | 'PHP'
    | 'BRL'
    | 'MXN'
    | 'COP'
    | 'ARS'
    | 'UYU'
    | 'AUD'
    | 'NZD'
    | 'INR'
    | 'IDR'
    | 'TRY';

export type ComplianceStatus =
    | 'UnderReview'
    | 'Approved'
    | 'Rejected'
    | 'NotStarted'
    | 'Incomplete';

export type TransferSourceCurrency =
    | 'USDC'
    | 'USDT';

export type TransferNetwork =
    | 'Ethereum'
    | 'Sepolia';

export type TransferDestinationCurrency =
    | 'USD'
    | 'USDC'
    | 'USDT'
    | 'CNY'
    | 'EUR'
    | 'GBP'
    | 'AUD'
    | 'NZD'
    | 'SGD'
    | 'HKD'
    | 'JPY'
    | 'CHF';

export type PurposeOfPayment =
    | 'PaymentForGoods'
    | 'PaymentForBusinessServices'
    | 'CapitalInvestmentOrItem'
    | 'Other';

export type TransferType =
    | 'Internal'
    | 'External';

export type TransferStatus =
    | 'New'
    | 'Pending'
    | 'Completed'
    | 'Failed'
    | 'Cancelled';

export type TransferReason =
    | 'Gift'
    | 'Payment'
    | 'Investment'
    | 'Business'
    | 'Other';

export type QuoteSourceCurrency =
    | 'USDC'
    | 'USDT';

export type QuoteDestinationCurrency =
    | 'USD'
    | 'CNY'
    | 'EUR'
    | 'GBP'
    | 'AED'
    | 'CHF'
    | 'CAD'
    | 'SGD'
    | 'HKD'
    | 'KRW'
    | 'JPY'
    | 'TWD'
    | 'PHP'
    | 'BRL'
    | 'MXN'
    | 'COP'
    | 'ARS'
    | 'UYU'
    | 'AUD'
    | 'NZD'
    | 'INR'
    | 'IDR'
    | 'TRY';

export type AccountLevel =
    | 'Tenant'
    | 'Client';

export type AccountType =
    | 'Ach'
    | 'Wire'
    | 'ChinaConnect'
    | 'InternationalWire'
    | 'GlobalConnect';

export type PaymentType =
    | 'AchDeposit'
    | 'AchWithdrawal'
    | 'WireDeposit'
    | 'WireWithdrawal'
    | 'DepositCrypto'
    | 'WithdrawalCrypto'
    | 'AchDepositUsdc'
    | 'WireDepositUsdc'
    | 'SwiftUsdc'
    | 'SwiftUsdt'
    | 'Refund';

export type TransactionStatus =
    | 'Processing'
    | 'Completed'
    | 'Failed'
    | 'Canceled';

export type TenantStatus =
    | 'Active'
    | 'Inactive'
    | 'InactivationStarted'
    | 'Suspended'
    | 'Closed';


export type WebhookConfigType =
    | "Payment"
    | "Transaction"
    | "Kyc"
    | "Document"
    | "CustodialAccount"
    | "ExternalAccount"
    | "Identity";

export type ExchangeRateDestinationCurrency =
    | 'EUR'
    | 'GBP'
    | 'AUD'
    | 'NZD'
    | 'SGD'
    | 'HKD'
    | 'JPY'
    | 'CHF'
    | 'CNY'