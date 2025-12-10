import {
    AccountTier,
    AffiliationStatus,
    BiometricType,
    BlockchainNetwork,
    BooleanString,
    Coin,
    Fiat,
    PaymentRail,
    RequestStatus,
    Role,
    SenderStatus,
    Status,
    TeamRole,
    TeamStatus,
    TransactionStatus,
    TransactionType,
    UserType,
    WalletStatus,
    WalletType,
    WhichDocument,
} from "@/v1/enums/enums";
import {
    CustomerBaseBreakdown,
    MonthlyVolumeRange,
    SettlementCurrency,
    TransactionCountRange,
    UsdValueRange,
    TransactionType as CustomerTransactionType,
    BusinessIndustry,
    WebhookConfigType,
    ComplianceStatus,
    TenantStatus,
    PaymentType,
    TransferReason,
    QuoteSourceCurrency,
    QuoteDestinationCurrency,
    TransferType,
    TransferStatus,
    TransferSourceCurrency,
    TransferNetwork,
    PurposeOfPayment,
    IdentityDocumentType,
    CountryCode,
    BusinessIndustryType,
    CustomerRequiredDocument,
    DocumentFileType,
    WalletCurrency,
    TransferDestinationCurrency,
    ExchangeRateDestinationCurrency,
    AccountLevel,
    AccountType,
    TransactionStatus as PaymentTransactionStatus,
} from "@/v1/types/types";

export interface IHandshakeClient {
    publicKey: string;
    privateKey: string;
}

export interface IRequestAccess {
    _id: string;
    rojifiId: string;
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    businessName: string;
    businessWebsite: string;
    message: string;
    weeklyVolume: number;
    phoneCode: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    agreement: boolean;
    approved: boolean;
    deleted: boolean;
    archived: boolean;
    approvedAt: Date | null;
    deletedAt: Date | null;
    archivedAt: Date | null;
    offRampService: boolean;
    fiatService: boolean;
    virtualCardService: boolean;
    otcdeskService: boolean;
    apiIntegrationService: boolean;
    metadata: Record<string, any>;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IResponse<Data = any, Error = any> {
    code: number;
    status: Status;
    message: string;
    data?: Data;
    error?: Error;
    pagination?: IPagination;
    timestamp: string;
    requestId: string;
    copyright: ICopyright;
    help: Array<string>;
    docs: string;
    version: string;
    handshake?: string;
}

export interface IPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ICopyright {
    year: string;
    holder: string;
    license: string;
    licenseUrl: string;
}

export interface IWallet {
    _id: string;
    currency: Fiat | Coin;
    userId: IUser;
    type: WalletType;
    walletId: string; // Unique wallet identifier
    balance: number; // Current available balance
    pending_payment_balance: number; // Pending payments
    status: WalletStatus; // Wallet status
    isPrimary: boolean; // Is this the user's primary wallet?
    icon: string; // Icon representing the wallet
    symbol: "₦" | "$" | "€" | "£";
    activated: boolean;
    name: string;
    fee: number;
    lastFundingRail: PaymentRail;
    deposit: Array<{
        currency: Coin | Fiat;
        providerId: string;
        icon: string;
        timestamp: Date;
        active: boolean;
        address: string;
        privateKey?: string;
        publicKey?: string;
        accountNumber: string; // Optional account number
        institution: string; // Optional financial institution name
        network: PaymentRail;
    }>;
    requested: Array<{
        currency: Fiat;
        status: RequestStatus;
        senderId: IUser;
        userId: IUser;
    }>;
    uniqueFee: number;
    uniqueSwapRate: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IContactUs {
    firstname: string;
    lastname: string;
    email: string;
    businessName: string;
    businessWebsite: string;
    phoneCode: string;
    phoneNumber: string;
    message: string;
    agreement: boolean;
    responded: boolean;
    responseMessage: string;
    deleted: boolean;
    archived: boolean;
    respondedAt: Date | null;
    deletedAt: Date | null;
    ArchivedAt: Date | null;
    metadata: Record<string, any>;
}

export interface IRequestAccess {
    _id: string;
    rojifiId: string;
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    businessName: string;
    businessWebsite: string;
    message: string;
    weeklyVolume: number;
    phoneCode: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    agreement: boolean;
    approved: boolean;
    deleted: boolean;
    archived: boolean;
    approvedAt: Date | null;
    deletedAt: Date | null;
    archivedAt: Date | null;
    metadata: Record<string, any>;
}

export interface IUser {
    _id: string;
    requestAccessId: IUser | null;
    rojifiId: string;
    username: string;
    firstname: string;
    lastname: string;
    middlename: string;
    phoneCode: string;
    phoneNumber: string;
    deleted: boolean;
    deletedAt: Date | null;
    deletedBy: IUser | null;
    email: string;
    fullName: string;
    isEmailVerified: boolean;
    key: string;
    phoneNumberHash: string;
    isPhoneNumberVerified: boolean;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    agreement: boolean;
    weeklyVolume: number;
    dateOfBirth: string;
    pin: string;
    archived: boolean;
    archivedAt: Date | null;
    mnemonic: string;
    referralCode: string;
    password: string;
    imageURL: string;

    requested: {
        otcdesk: RequestStatus;
        virtualCard: RequestStatus;
    };

    offrampEnabled: boolean;
    onrampEnabled: boolean;
    payoutEnabled: boolean;

    //////////////////////////////////
    biometricType: BiometricType;
    biometric: string;
    biometricVerified: boolean;
    biometricVerifiedAt: Date;
    biometricEnabled: boolean;
    isVerificationComplete: boolean;
    loginCount: number;
    loginLastAt: Date;
    loginLastIp: string;
    loginLastDevice: string;
    twoFactorSecret: string;
    twoFactorURL: string;
    twoFactorEnabled: boolean;
    twoFactorVerified: boolean;
    twoFactorVerifiedAt: Date;
    isSuspecious: boolean;
    isActive: boolean;
    isSuspended: boolean;
    isBanned: boolean;
    userType: UserType;
    refreshToken: string;
    deviceToken: string;
    createdAt: Date;
    updatedAt: Date;
    passkey: string;
    passkeyEnabled: boolean;
    passkeyVerified: boolean;
    passkeyVerifiedAt: Date;
    tier: AccountTier;
    firstDepositConfirmed: boolean;
    comparePassword(password: string): Promise<boolean>;
    comparePin(pin: string): Promise<boolean>;
    comparePasskey(passkey: string): Promise<boolean>;
    compareBiometric(biometric: string): Promise<boolean>;
    compareDeviceToken(deviceToken: string): Promise<boolean>;
}

export interface IDeposit {
    userId: string;
    type: "crypto" | "fiat";
    account: string;
    bankName: string;
    accountName: string;
    routingNumber: string;
    blockchainNetwork: BlockchainNetwork;
    currency: Coin | Fiat;
    privateKey: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IbankWallet {
    userId: string;
    balance: number;

    deposit: IDeposit;
    currency: Fiat;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBank {
    _id: string;
    userId: IUser;
    accountNumber: string;
    bankName: string;
    accountName: string;
    bankCode: string;
    recipientCode: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBankList {
    name: string;
    code: string;
    slug: string;
    icon: string;
}

export interface ITeamMember {
    rojifiId: string;
    userId?: string;
    email: string;
    fullName?: string;
    role: TeamRole;
    status: TeamStatus;
    joined: boolean;
    accepted: boolean;
    joinedAt: Date | null;
    invitedAt: Date | null;
    acceptedAt: Date | null;
    archived: boolean;
    archivedAt: Date | null;
    deleted: boolean;
    deletedAt: Date | null;
}

export interface ITeams {
    creator: string;
    sender: string;
    description: string;
    members: Array<ITeamMember>;
    deleted: boolean;
    deletedAt: Date | null;
    archived: boolean;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    rojifiId: string;
}

export interface IDirectorAndShareholder {
    _id?: string;
    senderId: string;
    creatorId: string;
    providerId?: string; // ID from business verification provider (e.g., Dunamis)
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    jobTitle?: string;
    role: string;
    isDirector: boolean;
    isShareholder: boolean;
    shareholderPercentage?: number;
    dateOfBirth: Date;
    nationality: string;
    phoneCode: string;
    phoneNumber: string;
    idType: "passport" | "drivers_license";
    idNumber: string;
    issuedCountry: string;
    issueDate: Date;
    expiryDate: Date;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isVerificationComplete: boolean;
    idDocument: {
        name: string;
        type: string; // file type (pdf, jpg, png, etc.)
        url: string;
        size?: number;
        uploadedAt: Date;
        // SmileID verification with tracking IDs
        smileIdStatus: "verified" | "rejected" | "under_review" | "not_submitted";
        smileIdVerifiedAt: Date | null;
        smileIdJobId: string | null;
        smileIdUploadId: string | null;

        issue: boolean;
        issueMessage?: string;
        issuedBy?: IUser;
        issuedAt?: Date;
        issueResolved: boolean;
        issueResolvedAt: Date | null;
    };
    proofOfAddress: {
        name: string;
        type: string; // file type (pdf, jpg, png, etc.)
        url: string;
        size?: number;
        uploadedAt: Date;
        // SmileID verification with tracking IDs
        smileIdStatus: "verified" | "rejected" | "under_review" | "not_submitted";
        smileIdVerifiedAt: Date | null;
        smileIdJobId: string | null;
        smileIdUploadId: string | null;

        issue: boolean;
        issueMessage?: string;
        issuedBy?: IUser;
        issuedAt?: Date;
        issueResolved: boolean;
        issueResolvedAt: Date | null;
    };
    // New fields for shareholder/director wealth verification
    shareholdersSourceOfWealthExplanation?: string[];
    shareholdersSourceOfWealthEvidence?: {
        name: string;
        type: string;
        url: string;
        size?: number;
        uploadedAt: Date;
    };
    directorsRegistry?: {
        name: string;
        type: string;
        url: string;
        size?: number;
        uploadedAt: Date;
    };
    shareholdersRegistry?: {
        name: string;
        type: string;
        url: string;
        size?: number;
        uploadedAt: Date;
    };
    idDocumentVerified?: boolean;
    proofOfAddressVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISenderDocument {
    _id?: string;
    which: WhichDocument;
    name: string;
    type: string; // file type (pdf, jpg, png, etc.)
    url: string;
    size?: number;
    uploadedAt: Date;

    // KYC verification
    kycVerified: boolean;
    kycVerifiedAt: Date | null;

    // SmileID verification with tracking IDs
    smileIdStatus: "verified" | "rejected" | "under_review" | "not_submitted";
    smileIdVerifiedAt: Date | null;
    smileIdJobId: string | null;
    smileIdUploadId: string | null;

    // Additional metadata
    description?: string;
    expiresAt?: Date;
    isRequired: boolean;

    issue: boolean;
    issueMessage?: string;
    issuedBy?: IUser;
    issuedAt?: Date;
    issueResolved: boolean;
    issueResolvedAt: Date | null;
}

/*
type actualOperationsAddressI = {
    streetAddress: string;
    streetAddress2: string;
    city: string;
    state: string;
    region: string;
    postalCode: string;
    country: string;
};
*/

export interface ISender {
    _id: string;
    isVerificationComplete: boolean;
    primarySenderId?: string; // For non-primary senders, link to primary sender
    providerId?: string; // ID from business verification provider (e.g., Dunamis)
    rojifiId: string;
    creator: string;
    teams: string;
    country: string;
    countryflag: string;
    businessRegistrationNumber: string;
    businessVerificationCompleted: boolean;
    businessVerificationCompletedAt: Date | null;
    businessName: string;
    taxIdentificationNumber: string;
    taxIdentificationNumberVerified: boolean;
    taxIdentificationNumberVerifiedAt: Date | null;
    volume: number;
    email: string;
    phoneNumber: string;
    phoneCountryCode: string;
    countryOfIncorporation: string;
    percentageOwnership: number;
    affiliationStatus: AffiliationStatus;
    actualOperationsAddress?: {
        city: string;
        state?: string;
        region?: string;
        country: string;
        postalCode: string;
        streetAddress: string;
        streetAddress2?: string;
    };
    // actualOperationsAddress: actualOperationsAddressI;
    dateOfIncorporation: Date;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessPostalCode: string;
    creatorFirstName: string;
    creatorLastName: string;
    creatorMiddleName: string;
    creatorDateOfBirth: Date;
    creatorPosition: string;
    creatorBirthCountry: string;
    isBeneficialOwner: BooleanString;
    creatorRole: Role;
    creatorAddress: string;
    creatorCity: string;
    creatorState: string;
    creatorPostalCode: string;
    creatorPercentageOwnership: number;
    creatorEmail: string;
    creatorIsBusinessContact: BooleanString;
    creatorVotingRightPercentage: number;
    creatorTaxIdentificationNumber: string;
    creatorTaxIdentificationNumberVerified: boolean;
    creatorTaxIdentificationNumberVerifiedAt: Date | null;
    creatorSocialSecurityNumber: string;
    creatorSocialSecurityNumberVerified: boolean;
    creatorSocialSecurityNumberVerifiedAt: Date | null;
    countriesOfOperations: string[];
    deleted: boolean;
    deletedAt: Date | null;
    archived: boolean;
    archivedAt: Date | null;

    documents: Array<ISenderDocument>;

    // Dunamis integration
    dunamisStatus: "pending" | "approved" | "rejected" | "under_review";
    dunamisId: string | null;
    dunamisApprovedAt: Date | null;
    dunamisRejectedAt: Date | null;

    status: SenderStatus;

    // Additional fields from business details form
    // Company basic info
    name?: string; // Company name (might be same as businessName)
    website?: string;
    legalForm?: string;
    companyActivity: Array<BusinessIndustry>;
    businessIndustryType: string;
    registrationDate?: Date;
    onboardingDate?: Date;
    tradingName?: string;

    // Detailed address fields (in addition to existing businessAddress)
    streetAddress?: string;
    streetAddress2?: string;
    city?: string; // More specific than businessCity
    state?: string; // More specific than businessState
    region?: string;
    postalCode?: string; // More specific than businessPostalCode

    // Financial information
    shareCapital?: number;
    lastYearTurnover?: number;
    companyAssets?: number;
    expectedMonthlyInboundCryptoPayments?: number;
    expectedMonthlyOutboundCryptoPayments?: number;
    expectedMonthlyInboundFiatPayments?: number;
    expectedMonthlyOutboundFiatPayments?: number;

    pepOrUsPerson: Array<string>;

    // Risk and compliance
    riskLevel?: string;
    additionalDueDiligenceConducted?: string;

    // Multi-select arrays
    requestedDunamisServices?: string[];
    sourceOfWealth?: string[];
    anticipatedSourceOfFundsOnDunamis?: string[];

    // Boolean compliance fields
    actualOperationsAndRegisteredAddressesMatch?: boolean;
    companyProvideRegulatedFinancialServices?: boolean;
    directorOrBeneficialOwnerIsPEPOrUSPerson?: boolean;
    immediateApprove?: boolean;

    directors: Array<IDirectorAndShareholder>;
    metadata: Record<string, any>;
    primary: boolean;

    createdAt: Date;
    updatedAt: Date;

    // suspended status
    suspended: boolean;
    suspendedAt: Date | null;
    suspendedBy: string | null;
    suspensionReason: string;

    // reinstatement after suspension
    reinstated: boolean;
    reinstatedAt: Date | null;
    reinstatedBy: string | null;
    reinstatementReason: string;

    // Tracking who verified the sender
    verifiedBy: string | null;
    verifiedAt: Date | null;

    // Tracking who suspended the sender
    verifiedSuspensionBy: string | null;
    verifiedSuspensionAt: Date | null;

    // Tracking who reinstated the sender
    verifiedReinstatementBy: string | null;
    verifiedReinstatementAt: Date | null;

    hideFromPayments: boolean;
    hideFromPaymentsAt: Date | null;
    hideFromPaymentsBy: string | null;

    hideFromStaff: boolean;
    hideFromStaffAt: Date | null;
    hideFromStaffBy: string | null;

    nonPrimarySenders: Array<{
        senderId: string;
        addedAt: Date;
    }>;

    customerBaseBreakdown: CustomerBaseBreakdown;
    customerJurisdictions: string[];
    isBusinessRegulated: boolean;
    regulatedEntity: string;
    notRegulatedReason: string;
    accountPurpose: string;

    hasFinancialCrimeHistoryLast5Years: boolean;
    financialCrimeProceedingsDescription: string;
    isNegativeNewsAndSanctionsScreeningPerformed: boolean;
    negativeNewsAndSanctionsVendor: string;
    isTransactionMonitoringOrBlockchainAnalyticsPerformed: boolean;
    transactionMonitoringOrBlockchainAnalyticsVendor: string;
    isKYCPerformed: boolean;
    kycVendor: string;

    transactionTypes: Array<CustomerTransactionType>;
    stablecoinTxCountMonthly: TransactionCountRange;
    incomingStablecoinAvgUsdValue: UsdValueRange;
    outgoingStablecoinTxCountMonthly: TransactionCountRange;
    outgoingStablecoinAvgUsdValue: UsdValueRange;
    incomingAchTxCountMonthly: TransactionCountRange;
    incomingAchAvgUsdValue: UsdValueRange;
    outgoingAchTxCountMonthly: TransactionCountRange;
    outgoingAchAvgUsdValue: UsdValueRange;
    incomingDomesticWireTxCountMonthly: TransactionCountRange;
    incomingDomesticWireAvgUsdValue: UsdValueRange;
    outgoingDomesticWireTxCountMonthly: TransactionCountRange;
    outgoingDomesticWireAvgUsdValue: UsdValueRange;
    incomingInternationalWireTxCountMonthly: TransactionCountRange;
    incomingInternationalWireAvgUsdValue: UsdValueRange;
    outgoingInternationalWireTxCountMonthly: TransactionCountRange;
    outgoingInternationalWireAvgUsdValue: UsdValueRange;
    preferredSettlementCurrencies: Array<SettlementCurrency>;
    estimatedMonthlyVolumeUsd: MonthlyVolumeRange;

    businessIndustries: Array<BusinessIndustry>;
    businessModel: string;
    transactionOriginCountries: Array<string>;
    transactionDestinationCountries: Array<string>;
}

export interface IPayment {
    _id: string;
    rojifiId: string;
    sender: string | ISender;
    senderWallet: IWallet | string;
    senderName: string;
    senderCurrency: Fiat;
    status: TransactionStatus;
    swiftCode: string;
    beneficiaryAccountName: string;
    beneficiaryCountry: string;
    beneficiaryCountryCode: string;
    fundsDestinationCountry: string;
    beneficiaryBankName: string;
    beneficiaryCurrency: string;
    beneficiaryAccountNumber: string;
    beneficiaryBankAddress: string;
    beneficiaryAmount: string;
    beneficiaryAccountType: "business" | "personal";
    beneficiaryIban: string;
    beneficiaryAddress: string;
    beneficiaryCity: string;
    beneficiaryState: string;
    beneficiaryPostalCode: string;
    beneficiaryAbaRoutingNumber: string;
    beneficiaryBankStateBranch: string;
    beneficiaryIFSC: string;
    beneficiaryInstitutionNumber: string;
    beneficiaryTransitNumber: string;
    beneficiaryRoutingCode: string;
    beneficiarySortCode: string;
    paymentInvoice: string;
    paymentInvoiceNumber: string;
    paymentInvoiceDate: Date;
    purposeOfPayment: string;
    paymentFor: string;
    paymentRail: PaymentRail;
    reference: string;
    reason: PurposeOfPayment;
    reasonDescription: string;
    phoneCode: string;
    phoneNumber: string;
    email: string;
    beneficiaryPhone: string;
    beneficiaryPhoneCode: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface INewsLetter {
    email: string;
    canceled: boolean;
    canceledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILocation {
    ip: string;
    city: string;
    region: string;
    country: string;
    timezone: string;
    org: string;
    network: string;
    version: string;
    region_code: string;
    country_name: string;
    country_code: string;
    country_code_iso3: string;
    country_capital: string;
    country_tld: string;
    continent_code: string;
    in_eu: boolean;
    postal: any;
    latitude: number;
    longitude: number;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    currency_name: string;
    languages: string;
    country_area: number;
    country_population: number;
    asn: string;
}

export interface ITransaction extends IPayment {
    from: string;
    to: string;
    providerId: string;
    fromCurrency: Coin | Fiat;
    toCurrency: Coin | Fiat;
    initialBalance: number;
    finalBalance: number;
    userId: IUser;
    swapToAmount: number;
    hash: string;
    sendHash: string;
    nonce: string;
    confirmations: string;
    blockNumber: string;
    timestamp: string;
    network: PaymentRail;
    depositAmount: number;
    location: ILocation;
    createdAt: Date;
    updatedAt: Date;
    txId: string;
    type: TransactionType;
    amount: number;
    wallet: Fiat;
    receipt?: string;
    mt103?: string;
    fees: {
        amount: string;
        currency: string;
    }[];
    issue: {
        customerhide: boolean;
        staff: Array<IUser>;
        description: string;
        adjustedDescriptionForAllStaff: boolean;
        adjustedDescriptionForCustomer: string;
        status: "open" | "in_progress" | "resolved";
        createdAt: Date;
        updatedAt: Date;
    }
};

export interface ISwiftDetailsResponse {
    country: string;
    country_code: string;
    swift_code: string;
    bank_name: string;
    city: string;
    region: string;
    address: string;
}

export interface IIBanDetailsResponse {
    iban: string;
    bank_name: string;
    account_number: string;
    bank_code: string;
    country: string;
    checksum: string;
    valid: boolean;
    bban: string;
}

export interface ISortCodeDetailsResponse {
    resultCode: string;
    resultDescription: string;
    accountProperties: {
        institution: string;
        branch: string;
        fast_payment: boolean;
        bacs_credit: boolean;
        bacs_direct_debit: boolean;
        chaps: boolean;
        cheque: boolean;
    };
    branchProperties: {
        address: string;
        address_line1: string;
        address_line2: string;
        address_line3: string;
        address_line4: string;
        address_line5: string;
        address_line6: string;
        address_line7: string;
        city: string;
        country: string;
        postcode: string;
        latitude: string;      // kept as string because the API returns it as string (with many decimals)
        longitude: string;     // same here
        phone: string;
    };
}

export interface ITransactionsStat {
    total: number,
    successful: number,
    pending: number,
    failed: number,
    processing: number,
    totalbeneficiary: number,
    recent: Array<ITransaction>,
    chart: {
        weekly: Array<ChartData>,
        monthly: Array<ChartData>,
    }
};

export interface ChartData {
    day: string;
    value: number;
    amount: string;
    totalAmount: number; // Add this for Y-axis calculations
};

export interface ISmileIdBusinessResponse {
    signature?: string; // Present in real response
    timestamp?: string; // ISO timestamp string
    SmileJobID: string;
    PartnerParams: {
        job_id: string;
        user_id: string;
        job_type: number;
    };
    ResultText: string;
    ResultCode: string;
    ResultType?: string; // e.g. "Business Verification"
    Actions: {
        Return_Business_Info: string;
        Verify_Business: string;
        [key: string]: string; // extra actions if added
    };
    IsFinalResult?: string | boolean; // API sends "true" as string sometimes
    success?: boolean;
    message?: string;
    kyb_receipt?: string;

    company_information: {
        company_type: string;
        country: string;
        address: string;
        registration_number: string;
        search_number: string;
        authorized_shared_capital: number | string; // number in real, string in mock
        authorized_shared_capital_breakdown?: any[]; // array in real, absent in mock
        industry: string;
        tax_id: string;
        registration_date: string; // ISO timestamp
        phone: string;
        legal_name: string;
        state: string;
        email: string;
        status: string;
    };

    fiduciaries: Array<{
        name?: string;
        fiduciary_type?: string;
        address?: string;
        registration_number?: string;
        status?: string;
    }>;

    proprietors: Array<{
        name: string;
        fiduciary_type?: string; // not in proprietors, but safe for future
        address: string;
        registration_number?: string;
        status?: string;
        id_number?: string;
        id_type?: string;
        phone_number?: string;
        occupation?: string;
        gender?: string;
        nationality?: string;
        date_of_birth?: string;
    }>;

    beneficial_owners?: Array<any>; // explicitly returned but empty in real example

    directors: Array<{
        name: string;
        shareholdings?: string;
        id_number?: string;
        id_type?: string;
        address: string;
        occupation?: string;
        phone_number?: string;
        gender?: string;
        nationality?: string;
        date_of_birth?: string;
    }>;

    documents: {
        search_certificate: string;
        [key: string]: string; // extra doc types if added
    };
}

export interface InvoiceData {
    invoiceId: string;
    invoiceDate: string;
    totalAmount: number;
    paidAmount: number;
    currency: string;
    status: 'active' | 'exhausted';
    items: Array<{
        description: string;
        amount: number;
    }>;
    customerInfo: {
        name?: string;
        email?: string;
    };
}

export interface ISession {
    _id: string;
    userId: string | IUser;
    userAgent: string;
    ipAddress: string;
    lastAccessedAt: Date;
    deviceType: string;
    browser: string;
    os: string;
    fingerprint: string;
    revoked: boolean;
    revokedAt: Date | null;
    geoLocation: {
        country: string;
        region: string;
        city: string;
    };
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
};

export interface IPGeolocation {
    ip: string;
    network: string;
    version: "IPv6" | "IPv4";
    city: string;
    region: string;
    region_code: string;
    country: string;
    country_name: string;
    country_code: string;
    country_code_iso3: string;
    country_capital: string;
    country_tld: string;
    continent_code: string;
    in_eu: boolean;
    postal: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    currency_name: string;
    languages: string;
    country_area: number;
    country_population: number;
    asn: string;
    org: string;
}


////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// provider core interfaces
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

export interface IOnboardingLinkPayload {
    businessLegalName: string;
    email: string;
    withLivenessCheck: boolean;
    redirectUri: string;
}

export interface IOnboardingLinkResponse {
    id: string;
    verificationUrl: string;
}

export interface IProviderResponse<T = any> {
    status: number;
    data: T;
    error?: string[];
}

export interface IAddress {
    street1: string;
    street2?: string;
    postalCode?: string;
    city: string;
    state?: string;
    country: string;
}

export interface IContactPerson {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
}

export interface ITermsOfServiceAcceptance {
    date: string; // ISO 8601
    ipAddress: string;
}

export interface ICompliance {
    hasFinancialCrimeHistoryLast5Years: boolean;
    financialCrimeProceedingsDescription: string;
    isNegativeNewsAndSanctionsScreeningPerformed: boolean;
    negativeNewsAndSanctionsVendor: string;
    isTransactionMonitoringOrBlockchainAnalyticsPerformed: boolean;
    transactionMonitoringOrBlockchainAnalyticsVendor: string;
    isKYCPerformed: boolean;
    kycVendor?: string;
}

export interface ITransactionBreakdown {
    transactionTypes: Array<CustomerTransactionType>;
    stablecoinTxCountMonthly: TransactionCountRange;
    incomingStablecoinAvgUsdValue: UsdValueRange;
    outgoingStablecoinTxCountMonthly: TransactionCountRange;
    outgoingStablecoinAvgUsdValue: UsdValueRange;
    incomingAchTxCountMonthly: TransactionCountRange;
    incomingAchAvgUsdValue: UsdValueRange;
    outgoingAchTxCountMonthly: TransactionCountRange;
    outgoingAchAvgUsdValue: UsdValueRange;
    incomingDomesticWireTxCountMonthly: TransactionCountRange;
    incomingDomesticWireAvgUsdValue: UsdValueRange;
    outgoingDomesticWireTxCountMonthly: TransactionCountRange;
    outgoingDomesticWireAvgUsdValue: UsdValueRange;
    incomingInternationalWireTxCountMonthly: TransactionCountRange;
    incomingInternationalWireAvgUsdValue: UsdValueRange;
    outgoingInternationalWireTxCountMonthly: TransactionCountRange;
    outgoingInternationalWireAvgUsdValue: UsdValueRange;
    preferredSettlementCurrencies: Array<SettlementCurrency>;
    estimatedMonthlyVolumeUsd: MonthlyVolumeRange;
}

export interface ICreateCustomerPayload {
    businessLegalName: string;
    businessTradeName: string;
    taxIdentificationNumber: string;
    website: string;
    incorporationDate: string; // ISO 8601 date-time string (e.g., "2025-11-16T13:06:17.614Z")
    countryOfIncorporation: CountryCode;
    companyRegistrationNumber: string;
    registeredAddress: IAddress;
    operationalAddress: IAddress;
    contactPerson: IContactPerson;
    businessIndustryType: BusinessIndustryType;
    businessIndustries: Array<BusinessIndustry>;
    businessIndustryOther?: string;
    withLivenessCheck: boolean;
    businessModel: string;
    termsOfServiceAcceptance: ITermsOfServiceAcceptance;
    customerBaseBreakdown: CustomerBaseBreakdown;
    customerJurisdictions: string[];
    isBusinessRegulated: boolean;
    regulatedEntity: string;
    notRegulatedReason: string;
    sourceOfFunds: string;
    accountPurpose: string;
    email: string;
    externalWalletAddress: string;
    externalWalletOwnershipProof?: string;
    transactionOriginCountries: string[];
    transactionDestinationCountries: string[];
    compliance: ICompliance;
    transactionBreakdown: ITransactionBreakdown;
    companySourceOfWealthExplanation: string;
    companySourceOfWealthEvidence: string;
    shareholdersSourceOfWealthExplanation: string;
    shareholdersSourceOfWealthEvidence: string;
    fundingSourceExplanation: string;
    fundingSourceEvidence: string;
}

export interface ICreateCustomerResponse {
    customerId: string;
    verificationUrl: string;
}

export interface IGetCustomerResponse {
    id: string;
    type: string;
    status: string;
    businessLegalName: string;
    businessTradeName: string;
    taxIdentificationNumber: string;
    website: string;
    incorporationDate: string; // ISO 8601
    countryOfIncorporation: string;
    companyRegistrationNumber: string;
    registeredAddress: {
        street1: string;
        street2: string;
        postalCode: string;
        city: string;
        state: string;
        country: string;
    };
    businessModel: string;
    termsOfServiceAcceptance: {
        date: string; // ISO 8601
        ipAddress: string;
    };
    email: string;
    "associated-entities": Array<{
        id: string;
        entityLegalName: string;
        countryOfRegistration: string;
        shareHolderPercentage: number;
        registeredAddress: {
            street1: string;
            street2: string;
            postalCode: string;
            city: string;
            state: string;
            country: string;
        };
        businessTradeName: string;
        incorporationNumber: string;
        relationshipEstablishedAt: string; // ISO 8601
    }>;
    "associated-persons": Array<{
        firstName: string;
        id: string;
        middleName: string;
        lastName: string;
        email: string;
        dateOfBirth: string; // ISO 8601
        shareHolderPercentage: number;
        phone: string;
        verificationUrl: string;
        address: {
            street1: string;
            street2: string;
            postalCode: string;
            city: string;
            state: string;
            country: string;
        };
    }>;
}

export interface IAssociatedPersonPayload {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    shareHolderPercentage: number;
    phone: string;
    address: IAddress;
    identity: {
        type: IdentityDocumentType;
        countryCode: CountryCode;
        identityNumber: string;
        identityDocumentFront: string;
        identityDocumentBack?: string;
    }
}

export interface IAssociatedPersonResponse {
    id: string;
    verificationUrl: string;
}

export interface IAssociatedPersonData {
    firstName: string;
    id: string;
    middleName: string;
    lastName: string;
    email: string;
    dateOfBirth: string; // ISO 8601
    shareHolderPercentage: number;
    phone: string;
    verificationUrl: string;
    address: {
        street1: string;
        city: string;
        state: string;
        country: string;
    }
}

export interface ICustomerDocumentFile {
    fileType: CustomerRequiredDocument;
    fileName: string;
    fileBlob: string;
}

export interface ICustomerDocumentPayload {
    files: Array<ICustomerDocumentFile>;
}

export interface IAdditionalCustomerDocumentPayload {
    fileType: DocumentFileType;
    fileName: string;
    fileBlob: string;
}

export interface ICustomerDocumentResponse {
    id: string;
}

export interface ICreateWalletPayload {
    customerId: string;
    network: TransferNetwork
}

export interface ICreateWalletResponse {
    id: string;
    createdAtUtc: string;
    status: string;
    customerId: string;
    cryptoDepositInstructions: Array<{
        network: string;
        address: string;
    }>;
}

export interface IWalletQuery {
    customerId?: string; // UUID
    currency?: WalletCurrency;
    ComplianceStatus?: ComplianceStatus;
    HasWallet?: boolean;
    excludeSuspended?: boolean;
    page?: number; // int32, default 1
    pageSize?: number; // int32, default 100
}

export interface IWalletBalanceResponse {
    currency: string;
    network: string;
    total: number;
}

export interface ITransferFundsPayload {
    source: {
        currency: TransferSourceCurrency;
        network: TransferNetwork;
        walletId: string; // UUID
    };
    destination: {
        currency: TransferDestinationCurrency;
        externalAccountId: string | null;
        network: TransferNetwork | null;
        toAddress: string | null;
        receiver: {
            name: string;
            phone: string;
            address: IAddress;
        };
        bank: {
            name: string;
            address: IAddress;
            accountNumber: string;
            iban: string;
            bic: string;
            routingNumber: string;
        };
    };
    amount: number | null;
    receiverAmount: number | null;
    memo: string | null;
    externalId: string | null;
    customerId: string | null; // UUID
    purposeOfPayment: PurposeOfPayment;
    documents: string[] | null;
    comment: string | null;
}

export interface ITransferInternalFundsPayload {
    source: {
        currency: TransferSourceCurrency;
        network: TransferNetwork;
        walletId: string; // UUID
    };
    destination: {
        currency: TransferSourceCurrency;
        network: TransferNetwork;
        walletId: string; // UUID
    };
    amount: number | null;
    externalId: string | null;
    comment: string | null;
}

export interface IBankData {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: string;
}

export interface IOriginator {
    name: string;
    addressRaw: string[];
    address: IAddress;
    bankData: IBankData;
}

export interface IImad {
    raw: string;
    parsed: {
        cycleDate: string; // ISO 8601
        inputSource: string;
        inputSequenceNumber: string;
    };
}

export interface ITransferAccount {
    accountId: string; // UUID
    externalAccountId: string; // UUID
    incomingTransferOrigin: string;
    comment: string;
    description: string;
    depositMessage: string;
    cryptoAddress: string;
    walletTag: string;
    originator: IOriginator;
    imad: IImad;
    clientId: string; // UUID
    clientType: string;
    bankName: string;
    accountName: string;
    senderName: string;
    senderCountry: string;
    accountNumber: string;
    referenceCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    networkName: string;
    networkId: string; // UUID
    email: string;
    address: string;
    country: string;
    dateOfBirth: string; // ISO 8601
    idNumber: string;
    idType: string;
    additionalIdNumber: string;
    additionalIdType: string;
    businessId: string;
    businessName: string;
    customerId: string;
}

export interface ITransferFundsResponse {
    id: string; // UUID
    transactionId: string; // UUID
    type: TransferType;
    status: TransferStatus;
    source: ITransferAccount;
    destination: ITransferAccount;
    onBehalfOfClientId: string; // UUID
    currency: string;
    sourceCurrency: string;
    destinationCurrency: string;
    network: string;
    comment: string;
    amount: number;
    cryptoAmount: number;
    appliedFee: number;
    memo: string;
    purposeOfPayment: string;
    transactionHash: string;
    reason: TransferReason;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

export interface IQuotePayload {
    source: {
        currency: QuoteSourceCurrency;
    };
    amount: number | null; // double, default 0
    receiverAmount: number | null; // double, range 0.01 to 100000000, default 0
    currency: QuoteDestinationCurrency;
}

export interface IQuoteResponse {
    transactionFee: {
        asset: string;
        network: string;
        amount: number;
    };
    paymentAmount: number;
    totalAmount: number;
};

export interface ITransferFundInternalPayload {
    source: {
        currency: TransferSourceCurrency;
        network: "Mainnet" | "Sepolia";
        walletId: string; // UUID
    };
    destination: {
        currency: TransferSourceCurrency;
        network: "Mainnet" | "Sepolia";
        walletId: string;
    };
    amount: number;
    externalId?: string;
    comment?: string;
}

export interface ITransferFundInternalResponse {
    transactionId: string; // UUID
}

export interface IExchangeRatePayload {
    sourceCurrency: QuoteSourceCurrency;
    destinationCurrency: ExchangeRateDestinationCurrency;
}

export interface IExchangeRateResponse {
    rate: number;
    data: [
        {
            currency: string;
            exchangeRate: number;
        }
    ]
}

export interface ICountriesResponse {
    code: string;
    name: string;
}

export interface IExternalAccountsPayload {
    customerId: string; // UUID
    name: string;
    phone: string;
    address: IAddress;
    bankName: string;
    bankAddress: IAddress;
    swift: {
        accountNumber: string;
        iban: string;
        bic: string
    };
    domesticUsd: {
        accountNumber: string;
        routingNumber: string
    };
}

export interface IExternalAccountsResponse {
    id: string; // UUID
    type: string;
    accountNumberLast4: string;
    receiverName: string;
    accountName: string;
    swiftCode: string;
    iban: string;
    createdAtUtc: string;
}

export interface IExternalAccountQueryPayload {
    Level?: AccountLevel;
    ClientId?: string;
    Type?: AccountType;
    ComplianceStatus?: ComplianceStatus;
    HasWallet: boolean;
    excludeSuspended: boolean;
    page: number;
    pageSize: number;
}

export interface IExternalAccountListResponse {
    data: Array<IExternalAccountsResponse>;
    meta: {
        pageCount: number;
        resourceCount: number;
    };
}

export interface ItransactionQuotePayload {
    WalletId?: string;
    CustomerId?: string;
    PaymentType?: PaymentType;
    Status?: PaymentTransactionStatus;
    page: number;
    pageSize: number;
}

export interface ITransactionQuoteResponse {
    id: string;
    type: PaymentType;
    status: PaymentTransactionStatus;
    paymentId: string;
    transactionId: string;
    source: {
        walletId: string;
        externalAccountId: string;
        incomingTransferOrigin: string;
        comment: string;
        description: string;
        depositMessage: string;
        cryptoAddress: string;
        walletTag: string;
        originator: {
            name: string;
            addressRaw: Array<string>;
            address: IAddress;
            bankData: {
                bankName: string;
                accountNumber: string;
                routingNumber: string;
                accountType: string;
            }
        },
        imad: {
            raw: string;
            parsed: {
                cycleDate: string;
                inputSource: string;
                inputSequenceNumber: string;
            }
        },
        clientId: string;
        clientType: string;
        bankName: string;
        accountName: string;
        senderName: string;
        senderCountry: string;
        accountNumber: string;
        referenceCode: string;
        firstName: string;
        lastName: string;
        phone: string;
        networkName: string;
        networkId: string;
        email: string;
        address: string;
        country: string;
        dateOfBirth: string;
        idNumber: string;
        idType: string;
        additionalIdNumber: string;
        additionalIdType: string;
        businessId: string;
        businessName: string;
        customerId: string;
    },
    destination: {
        accountId: string;
        externalAccountId: string;
        incomingTransferOrigin: string;
        comment: string;
        description: string;
        depositMessage: string;
        cryptoAddress: string;
        walletTag: string;
        originator: {
            name: string;
            addressRaw: Array<string>;
            address: IAddress;
            bankData: {
                bankName: string;
                accountNumber: string;
                routingNumber: string;
                accountType: string;
            }
        },
        imad: {
            raw: string;
            parsed: {
                cycleDate: string;
                inputSource: string;
                inputSequenceNumber: string;
            }
        },
        clientId: string;
        clientType: string;
        bankName: string;
        accountName: string;
        senderName: string;
        senderCountry: string;
        accountNumber: string;
        referenceCode: string;
        firstName: string;
        lastName: string;
        phone: string;
        networkName: string;
        networkId: string;
        email: string;
        address: string;
        country: string;
        dateOfBirth: string;
        idNumber: string;
        idType: string;
        additionalIdNumber: string;
        additionalIdType: string;
        businessId: string;
        businessName: string;
        customerId: string;
    },
    onBehalfOfClientId: string;
    currency: string;
    sourceCurrency: string;
    destinationCurrency: string;
    network: "Mainnet" | "Sepolia";
    amount: number;
    cryptoAmount: number;
    transactionFee: number;
    totalAmount: number;
    comment: string;
    memo: string;
    purposeOfPayment: string;
    country: string;
    returnCode: string;
    executedPrice: number;
    transactionHash: string;
    mainTransactionId: string;
    createdAt: string;
    updatedAt: string;
    documentIds: Array<string>;
    confirmationDocumentUrl: string;
    bankingPartner: string;
    gasFeeUsd: number;
    returnReason: string;
    reason: string;
    customerType: string;
    receiverAmount: number;
    exchangeRate: number;
    refundForTransactionId: string;
    isRefunded: boolean;
    trackingInfo: {
        trackingReference: string;
        trackingStatus: string;
        network: string;
        senderName: string;
        senderAddress: string;
    },
    externalId: string;
    txHash: string;
}

export interface ITransactionQuoteListResponse {
    data: Array<ITransactionQuoteResponse>;
    meta: {
        pageCount: number;
        resourceCount: number;
    };
}

export interface ICustomerReviewPayload {
    uuid: string;
    status: "Approved" | "Rejected";
}

export interface IMintTokenPayload {
    walletAddress: string;
    tokenType: "USDT" | "USDC";
    amount: string;
}

export interface IMintTokenResponse {
    transactionHash: string;
    contractAddress: string;
    walletAddress: string;
    amount: string;
}

export interface ITenantResponse {
    id: string;
    legalName: string | null;
    companyEmail: string | null;
    countryOfRegistration: string | null;
    companyRegistrationDate: string | null;
    companyRegistrationNumber: string | null;
    phoneNumber: string | null;
    status: TenantStatus;
    complianceStatus: ComplianceStatus;
    walletId: string | null;
    createdAt: string;
}

export interface IWebhookConfigResponse {
    id: string;
    tenantId: string;
    url: string | null;
    enabled: boolean;
    sharedSecret: string | null;
    createdAtUtc: string;
    updatedAtUtc: string | null;
    webhookTypes: string[] | null;
}

export interface IUpdateWebhookConfigPayload {
    url?: string | null;
    enabled?: boolean | null;
    sharedSecret?: string | null;
    webhookTypes?: Array<WebhookConfigType> | null;
}

export interface ITenantBalance {
    assetFiatType: 'USDC' | 'USDT';
    asset: 'USDC' | 'USDT';
    network: 'Mainnet' | 'Sepolia';
    total: number;
}

export interface ITenantBalancesResponse {
    data: ITenantBalance[] | null;
}

export interface ICryptoDepositInstructionResponse {
    assetFiatType: 'USDC' | 'USDT';
    asset: 'USDC' | 'USDT';
    networkChain: 'Mainnet' | 'Sepolia';
    address: string | null;
}

export interface IRoutingDetailsResponse {
    bank_name: string;
    routing_number: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    county: string;
    timezone: string;
    latitude: number | string;
    longitude: number | string;
    phone_number: string;
}