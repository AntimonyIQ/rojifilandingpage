export enum Status {
    SUCCESS = "success",
    ERROR = "error",
    PENDING = "pending",
    FAILED = "failed",
    NOT_FOUND = "not_found",
    UNAUTHORIZED = "unauthorized",
    FORBIDDEN = "forbidden",
    BAD_REQUEST = "bad_request",
    INTERNAL_SERVER_ERROR = "internal_server_error",
    SERVICE_UNAVAILABLE = "service_unavailable",
}

export enum Coin {
    BTC = "BTC",
    ETH = "ETH",
    USDT = "USDT",
    USDC = "USDC",
    NGN = "NGN",
    WBTC = "WBTC",
    DAI = "DAI",
    USD = "USD",
    BCH = "BCH",
    LTC = "LTC",
    XRP = "XRP",
    BSV = "BSV",
    ZEC = "ZEC",
    ADA = "ADA",
    DOT = "DOT",
    SOL = "SOL",
    KSM = "KSM",
    XLM = "XLM",
    BNB = "BNB",
    ONT = "ONT",
    HT = "HT",
    BTS = "BTS",
    XTZ = "XTZ",
    WETH = "WETH",
    TRON = "TRON",
    TRX = "TRX",
}

export enum BlockchainNetwork {
    ETHEREUM = "ETHEREUM",
    POLYGON = "POLYGON",
    BSC = "BSC",
    AVALANCHE = "AVALANCHE",
    FANTOM = "FANTOM",
    TRON = "TRON",
    ARBITRUM = "ARBITRUM",
    OPTIMISM = "OPTIMISM",
    CELO = "CELO",
    CELO_ALFAJORES = "CELO_ALFAJORES",
    BTC = "BTC",
    LTC = "LTC",
    XRP = "XRP",
    NONE = "NONE",
    MATIC = "MATIC",
    SOLANA = "SOLANA"
}

export enum RequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    DENIED = "denied",
    NONE = "none"
}

export enum Fiat {
    NGN = "NGN",
    USD = "USD",
    GHS = "GHS",
    GBP = "GBP",
    EUR = "EUR",
    JPY = "JPY",
    AUD = "AUD",
    CAD = "CAD",
    CHF = "CHF",
}

export enum WalletType {
    CRYPTO = "CRYPTO",
    FIAT = "FIAT",
}

export enum WalletStatus {
    active = "active",
    inactive = "inactive",
    suspended = "suspended"
}

export enum WhichModification {
    EMAIL = "email",
    PHONE = "phone",
    PASSWORD = "password",
    PIN = "pin",
    BIOMETRIC = "biometric",
    TWO_FACTOR_AUTH = "two_factor_auth",
    IDENTITY_VERIFICATION = "identity_verification",
    ACCOUNT_SETTINGS = "account_settings",
    NOTIFICATIONS = "notifications",
    SECURITY = "security",
    PRIVACY = "privacy",
    LANGUAGE = "language",
    THEME = "theme",
    WALLET = "wallet",
    ACCOUNT = "account",
    API_KEYS = "api_keys",
    SUBSCRIPTION = "subscription",
    PAYMENT_METHODS = "payment_methods",
    TRANSACTION_HISTORY = "transaction_history",
    REFERRAL_PROGRAM = "referral_program",
    SUPPORT = "support",
    LEGAL = "legal",
    FEEDBACK = "feedback",
    OTHER = "other",
    NONE = "none",
    VERIFICATION = "verification",
}

export enum SMS_CHANNEL {
    WHATSAPP = "whatsapp",
    SMS = "sms",
    DND = "dnd",
    GENERIC = "generic"
}

export enum PaymentRail {
    ETH = "ETH",
    MATIC = "MATIC",
    BNB = "BNB",
    TRX = "TRX",
    SOL = "SOL",
    SEPA = "SEPA",
    FPS = "FPS",
    SPEI = "SPEI",
    CEMAC_BANK = "CEMAC_BANK",
    PIX = "PIX",
    NIP = "NIP",
    UAEFTS = "UAEFTS",
    SARIE = "SARIE",
    MOBILE_MONEY_CI = "MOBILE_MONEY_CI",
    MOBILE_MONEY_SN = "MOBILE_MONEY_SN",
    MOBILE_MONEY_TG = "MOBILE_MONEY_TG",
    MOBILE_MONEY_BJ = "MOBILE_MONEY_BJ",
    MOBILE_MONEY_CM = "MOBILE_MONEY_CM",
    UEMOA = "UEMOA",
    SWIFT = "SWIFT",
    ACH = "ACH"
}

export enum BooleanString {
    YES = "yes",
    NO = "no",
}

export enum AffiliationStatus {
    LIVE = "live",
    PENDING = "pending",
    INACTIVE = "inactive",
    NOT_REPORTED = "not_reported",
}

export enum Role {
    OWNER = "owner",
    MEMBER = "member",
    SHAREHOLDER = "shareholder",
    LEGISLATOR = "legislator",
}

export enum SenderStatus {
    ACTIVE = "active",
    IN_REVIEW = "in-review",
    UNAPPROVED = "unapproved",
    SUSPENDED = "suspended",
}

export enum AccountTier {
    TIER0 = "TIER0",
    TIER1 = "TIER1",
    TIER2 = "TIER2",
    TIER3 = "TIER3",
    TIER4 = "TIER4",
}

export enum UserType {
    USER = "USER",
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    DEVELOPER = "DEVELOPER",
    SUPPORT = "SUPPORT",
    SENDER = "SENDER",
    TEAM_MEMBER = "TEAM_MEMBER",
}

export enum BiometricType {
    FACE_ID = "FACE_ID",
    TOUCH_ID = "TOUCH_ID",
    FINGERPRINT = "FINGERPRINT",
    IRIS_SCAN = "IRIS_SCAN",
    VOICE_RECOGNITION = "VOICE_RECOGNITION",
    PALM_RECOGNITION = "PALM_RECOGNITION",
    VEIN_RECOGNITION = "VEIN_RECOGNITION",
    RETINA_SCAN = "RETINA_SCAN",
    NONE = "NONE",
}

// "successful" | "pending" | "processing" | "failed";
export enum TransactionStatus {
    SUCCESSFUL = "completed",
    PROCESSING = "processing",
    PENDING = "rejected",
    FAILED = "failed",
}

export enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    TRANSFER = "transfer",
    SWAP = "swap",
    BILLS = "bills",
}

export enum TeamStatus {
    ACTIVE = "active",
    INVITATIONS = "invitations",
    ARCHIVED = "archived",
}

export enum TeamRole {
    SUPPORT = "support",
    OPERATION = 'operation',
}

export enum WhichDocument {
    MEMORANDUM_ARTICLES = "memorandum_and_articles_of_association",
    CERTIFICATE_INCORPORATION = "certificate_of_incorporation",
    INCORPORATION_STATUS = "incorporation_status_report",
    PROOF_ADDRESS = "proof_of_address",
    PROOF_BUSINESS_ADDRESS = "proof_of_business_address",
    PROOF_WEALTH = "proof_of_wealth",
    PROOF_FUNDS = "proof_of_funds",
    CAC_CERTIFICATE = "cac_certificate",
    TAX_IDENTIFICATION = "tax_identification_certificate",
    BUSINESS_REGISTRATION = "business_registration_certificate",
}

// Enum of sender document keys used across the system (KYC & SmileID tracking)
export enum SenderDocuments {
    MEMORANDUM_AND_ARTICLES = "businessMemorandumAndArticlesOfAssociation",
    CERTIFICATE_OF_INCORPORATION = "businessCertificateOfIncorporation",
    INCORPORATION_STATUS_REPORT = "businessCertificateOfIncorporationStatusReport",
    PROOF_OF_ADDRESS = "businessProofOfAddress",
    PROOF_OF_BUSINESS_ADDRESS = "businessProofOfBusinessAddress",
}

export enum Reason {
    GOODS_SERVICES = "GOODS_SERVICES",
    PAYROLL_SALARIES = "PAYROLL_SALARIES",
    INVESTMENTS_DIVIDENDS = "INVESTMENTS_DIVIDENDS",
    LOANS_CREDIT = "LOANS_CREDIT",
    TAXES_GOVERNMENT = "TAXES_GOVERNMENT",
    PROFESSIONAL_FEES = "PROFESSIONAL_FEES",
    TRANSFERS_REFUNDS = "TRANSFERS_REFUNDS",
    OTHER = "OTHER",
}
