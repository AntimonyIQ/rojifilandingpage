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

export interface IndustryOption {
    label: string;
    value: BusinessIndustry;
}

export const industryOptions: Array<IndustryOption> = [
    { label: 'Adult Entertainment', value: 'AdultEntertainment' },
    { label: 'Affiliate Marketing', value: 'AffiliateMarketing' },
    { label: 'Arms & Ammunition', value: 'ArmsAmmunition' },
    { label: 'Bail & Legal Services', value: 'BailLegalServices' },
    { label: 'Bankruptcy Services', value: 'BankruptcyServices' },
    { label: 'Cannabis Products', value: 'CannabisProducts' },
    { label: 'Debt Collection', value: 'DebtCollection' },
    { label: 'Credit Repair', value: 'CreditRepair' },
    { label: 'Dating Services', value: 'DatingServices' },
    { label: 'Debt Consolidation', value: 'DebtConsolidation' },
    { label: 'Counseling Services', value: 'CounselingServices' },
    { label: 'Digital Games', value: 'DigitalGames' },
    { label: 'Escort Services', value: 'EscortServices' },
    { label: 'Fantasy Gaming', value: 'FantasyGaming' },
    { label: 'Financial Investments', value: 'FinancialInvestments' },
    { label: 'Firearms & Accessories', value: 'FirearmsAccessories' },
    { label: 'FX Currency Exchange', value: 'FxCurrencyExchange' },
    { label: 'Gambling & Online Casinos', value: 'GamblingOnlineCasinos' },
    { label: 'Guns & Firearms', value: 'GunsFirearms' },
    { label: 'Horoscopes & Fortune Telling', value: 'HoroscopesFortuneTelling' },
    { label: 'Loan & Financing Services', value: 'LoanFinancingServices' },
    { label: 'Medical Marijuana', value: 'MedicalMarijuana' },
    { label: 'MLM & Pyramid Schemes', value: 'MlmPyramidSchemes' },
    { label: 'Nuclear Energy', value: 'NuclearEnergy' },
    { label: 'Online Dating', value: 'OnlineDating' },
    { label: 'Online Gaming & VR', value: 'OnlineGamingVr' },
    { label: 'Online Pharmacies', value: 'OnlinePharmacies' },
    { label: 'Payday Loans', value: 'PaydayLoans' },
    { label: 'Personal Finance Advice', value: 'PersonalFinanceAdvice' },
    { label: 'Quasi-Cash', value: 'QuasiCash' },
    { label: 'SEO & Online Marketing', value: 'SeoOnlineMarketing' },
    { label: 'Taxis & Limousines', value: 'TaxisLimousines' },
    { label: 'Virtual & Digital Goods', value: 'VirtualDigitalGoods' },
    { label: 'Account Funding', value: 'AccountFunding' },
    { label: 'Alcohol & Tobacco Products', value: 'AlcoholTobaccoProducts' },
    { label: 'Alcohol Wholesalers', value: 'AlcoholWholesalers' },
    { label: 'Babysitting Services', value: 'BabysittingServices' },
    { label: 'Bitcoin & Crypto', value: 'BitcoinCrypto' },
    { label: 'Bus Lines', value: 'BusLines' },
    { label: 'Home Based Businesses', value: 'HomeBasedBusinesses' },
    { label: 'Luxury Goods', value: 'LuxuryGoods' },
    { label: 'Legal Services', value: 'LegalServices' },
    { label: 'Nutritional Supplements', value: 'NutritionalSupplements' },
    { label: 'Oil & Gas', value: 'OilGas' },
    { label: 'Pharmaceuticals', value: 'Pharmaceuticals' },
    { label: 'Stamp & Coin Stores', value: 'StampCoinStores' },
    { label: 'Tax & Accounting Services', value: 'TaxAccountingServices' },
    { label: 'Timeshares', value: 'Timeshares' },
    { label: 'Tobacco Products', value: 'TobaccoProducts' },
    { label: 'Weight Loss Products', value: 'WeightLossProducts' },
    { label: 'Wine & Spirits', value: 'WineSpirits' },
    { label: 'Work From Home', value: 'WorkFromHome' },
    { label: 'Agriculture & Farming', value: 'AgricultureFarming' },
    { label: 'Cloud & Network Services', value: 'CloudNetworkServices' },
    { label: 'Document Preparation', value: 'DocumentPreparation' },
    { label: 'Education & Tutoring', value: 'EducationTutoring' },
    { label: 'Electronics & Hardware', value: 'ElectronicsHardware' },
    { label: 'Energy & Utilities', value: 'EnergyUtilities' },
    { label: 'Healthcare Services', value: 'HealthcareServices' },
    { label: 'Industrial Products', value: 'IndustrialProducts' },
    { label: 'Insurance & Benefits', value: 'InsuranceBenefits' },
    { label: 'Insurance Premiums', value: 'InsurancePremiums' },
    { label: 'IP & Trademark Services', value: 'IpTrademarkServices' },
    { label: 'Real Estate', value: 'RealEstate' },
    { label: 'Vehicle Sales & Financing', value: 'VehicleSalesFinancing' },
    { label: 'Web Design', value: 'WebDesign' },
    { label: 'Web Hosting Services', value: 'WebHostingServices' },
    { label: 'Wind Farms', value: 'WindFarms' },
    { label: 'Aviation', value: 'Aviation' },
    { label: 'Airlines & Other', value: 'AirlinesOther' },
    { label: 'Auto Sales & Repair', value: 'AutoSalesRepair' },
    { label: 'Construction & Contracting', value: 'ConstructionContracting' },
    { label: 'Cruise Lines', value: 'CruiseLines' },
    { label: 'Direct Marketing & Other', value: 'DirectMarketingOther' },
    { label: 'Direct Marketing & Outbound', value: 'DirectMarketingOutbound' },
    { label: 'Direct Marketing & Subscription', value: 'DirectMarketingSubscription' },
    { label: 'E-Cigarettes & Vaping', value: 'ECigarettesVaping' },
    { label: 'Event Planning', value: 'EventPlanning' },
    { label: 'Furniture Stores', value: 'FurnitureStores' },
    { label: 'Hospitality & Travel', value: 'HospitalityTravel' },
    { label: 'Import & Export', value: 'ImportExport' },
    { label: 'Jet Charter', value: 'JetCharter' },
    { label: 'Professional Services', value: 'ProfessionalServices' },
    { label: 'Software & Technology', value: 'SoftwareTechnology' },
    { label: 'Sports & Recreation', value: 'SportsRecreation' },
    { label: 'Telecom & Wireless', value: 'TelecomWireless' },
    { label: 'Ticket Sales & Event', value: 'TicketSalesEvent' },
    { label: 'Travel Agencies', value: 'TravelAgencies' },
    { label: 'Securities & Custody', value: 'SecuritiesCustody' },
    { label: 'Virtual Asset Service Provider', value: 'VirtualAssetServiceProvider' },
    { label: 'Broker Dealer', value: 'BrokerDealer' },
    { label: 'Commercial Banking', value: 'CommercialBanking' },
    { label: 'Investment Banking', value: 'InvestmentBanking' },
    { label: 'Liquidity Provider', value: 'LiquidityProvider' },
    { label: 'Private Banking', value: 'PrivateBanking' },
    { label: 'Retail Banking', value: 'RetailBanking' },
    { label: 'MSB, MTL & EMI', value: 'MsbMtlEmi' },
    { label: 'OTC', value: 'Otc' },
    { label: 'Wealth Management', value: 'WealthManagement' },
    { label: 'BaaS - No License', value: 'BaasNoLicense' },
    { label: 'Program Manager', value: 'ProgramManager' },
    { label: 'SaaS - No License', value: 'SaasNoLicense' },
    { label: 'BaaS - With License', value: 'BaasWithLicense' },
    { label: 'SaaS - With License', value: 'SaasWithLicense' },
];

export const industryOptionOlds: Array<{ value: string; label: string }> = [
    { value: "financial_and_insurance_activities", label: "Financial and Insurance Activities" },
    { value: "cryptocurrencies_and_cryptoassets", label: "Cryptocurrencies and Cryptoassets" },
    { value: "agriculture_forestry_and_fishing", label: "Agriculture, Forestry and Fishing" },
    { value: "manufacturing", label: "Manufacturing" },
    {
        value: "electricity_gas_steam_and_air_conditioning_supply",
        label: "Electricity, Gas, Steam and Air Conditioning Supply",
    },
    {
        value: "water_supply_sewerage_waste_management_and_remediation_activities",
        label: "Water Supply, Sewerage, Waste Management and Remediation Activities",
    },
    { value: "construction", label: "Construction" },
    {
        value: "wholesale_and_retail_trade_repair_of_motor_vehicles_and_motorcycles",
        label: "Wholesale and Retail Trade; Repair of Motor Vehicles and Motorcycles",
    },
    { value: "transportation_and_storage", label: "Transportation and Storage" },
    {
        value: "accommodation_and_food_service_activities",
        label: "Accommodation and Food Service Activities",
    },
    { value: "information_and_communication", label: "Information and Communication" },
    { value: "real_estate_activities", label: "Real Estate Activities" },
    {
        value: "professional_scientific_and_technical_activities",
        label: "Professional, Scientific and Technical Activities",
    },
    {
        value: "administrative_and_support_service_activities",
        label: "Administrative and Support Service Activities",
    },
    {
        value: "public_administration_and_defense_compulsory_social_security",
        label: "Public Administration and Defense; Compulsory Social Security",
    },
    { value: "education", label: "Education" },
    {
        value: "human_health_and_social_work_activities",
        label: "Human Health and Social Work Activities",
    },
    { value: "arts_entrainment_and_recreation", label: "Arts, Entertainment and Recreation" },
    { value: "other_service_activities", label: "Other Service Activities" },
    {
        value:
            "households_as_employers_undifferentiated_goods_services_producing_activities_of_households_use",
        label:
            "Households as Employers; Undifferentiated Goods- and Services-Producing Activities of Households for Own Use",
    },
    {
        value: "activities_of_extraterritorial_organizations_and_bodies",
        label: "Activities of Extraterritorial Organizations and Bodies",
    },
];