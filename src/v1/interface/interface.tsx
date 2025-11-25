import {
    AccountTier,
    AffiliationStatus,
    BiometricType,
    BlockchainNetwork,
    BooleanString,
    Coin,
    Fiat,
    PaymentRail,
    Reason,
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
    companyActivity?: string;
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
    reason: Reason;
    reasonDescription: string;
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