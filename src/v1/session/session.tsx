import Handshake from "@/v1/hash/handshake";
import JWT from "@/v1/hash/jwt";
import { IBank, IHandshakeClient, IPayment, IPGeolocation, ISender, ISession, ISmileIdBusinessResponse, ITeamMember, ITransaction, ITransactionsStat, IUser, IWallet } from "@/v1/interface/interface";
import { FormStep } from "../app/dashboard/[wallet]/sender/add/types";
import { SenderStatus, TransactionStatus } from "../enums/enums";
import { ILiveExchnageRate } from "../components/dashboard/payment/useExchangeRate";

export interface SessionData {
    user: IUser;
    activeWallet: string;
    isLoggedIn: boolean;
    client: IHandshakeClient;
    deviceid: string;
    authorization: string;
    wallets: Array<IWallet>;
    transactions: Array<ITransaction>;
    beneficiaries: Array<ITransaction>;
    transactionsTableData: { [key in TransactionStatus]: Array<ITransaction> };
    transactionCounts: { [key in TransactionStatus]: number }
    senders: Array<ISender>;
    sendersTableData: { [key in SenderStatus]: Array<ISender> };
    sender: ISender;
    draftPayment: IPayment;
    addSender: {
        formData: Partial<ISender>;
        currentStep: FormStep;
        timestamp: number;
    };
    signupTracker?: string;
    txStat: ITransactionsStat;
    smileid_business_response: ISmileIdBusinessResponse;
    smileid_business_lastChecked: Date | null;
    member: ITeamMember | null;
    banks: Array<IBank>;
    devicename: string;
    session: string;
    sessions: Array<ISession>;
    location: IPGeolocation | null;
    exchangeRate: Array<ILiveExchnageRate>;
    providerIsLive: boolean;
    [key: string]: any;
}

interface DecodedToken {
    isLoggedIn: boolean;
    userData: SessionData;
    exp?: number;
}

// helper to create a properly typed empty sendersTableData from the enum
function createEmptySendersTable(): { [key in SenderStatus]: ISender[] } {
    const entries = Object.values(SenderStatus) as unknown as SenderStatus[];
    const out = {} as { [key in SenderStatus]: ISender[] };
    for (const s of entries) {
        out[s] = [];
    }
    return out;
}

export class Session {
    private isLoggedIn: boolean;
    private userData: SessionData;
    private secretKey: string;
    private client: IHandshakeClient = Handshake.generate();
    private user: IUser = {} as IUser;
    private sender: ISender = {} as ISender;
    private draftPayment: IPayment = {} as IPayment;
    private smileid_business_response = {} as ISmileIdBusinessResponse;
    private readonly devicename = navigator.userAgent || "Unknown Device";

    constructor(secretKey: string) {
        this.isLoggedIn = true;

        this.userData = {
            user: this.user,
            activeWallet: '',
            isLoggedIn: true,
            client: this.client,
            deviceid: this.client.publicKey,
            authorization: '',
            wallets: [],
            transactions: [],
            beneficiaries: [],
            transactionsTableData: {
                [TransactionStatus.SUCCESSFUL]: [],
                [TransactionStatus.PROCESSING]: [],
                [TransactionStatus.PENDING]: [],
                [TransactionStatus.FAILED]: [],
                [TransactionStatus.INITIALIZING]: [],
            },
            // use dynamic initializer to match enum keys
            sendersTableData: createEmptySendersTable(),
            senders: [],
            banks: [],
            sender: this.sender,
            draftPayment: this.draftPayment,
            addSender: { formData: {}, currentStep: FormStep.COUNTRY_SELECTION, timestamp: 0 },
            transactionCounts: { [TransactionStatus.PENDING]: 0, [TransactionStatus.SUCCESSFUL]: 0, [TransactionStatus.FAILED]: 0, [TransactionStatus.PROCESSING]: 0, [TransactionStatus.INITIALIZING]: 0 },
            txStat: {
                total: 0,
                successful: 0,
                pending: 0,
                failed: 0,
                processing: 0,
                totalbeneficiary: 0,
                recent: [],
                chart: { weekly: [], monthly: [] }
            },
            smileid_business_response: this.smileid_business_response,
            smileid_business_lastChecked: null,
            member: null,
            devicename: this.devicename,
            session: "",
            sessions: [],
            location: null,
            exchangeRate: [],
            providerIsLive: true,
        };
        this.secretKey = secretKey;
        this.loadSession();
    }

    private loadSession(): void {
        const storedToken = localStorage.getItem('session');
        if (storedToken) {
            try {
                const decodedToken = JWT.decode(storedToken, this.secretKey) as DecodedToken;
                if (decodedToken && typeof decodedToken === 'object') {
                    const { isLoggedIn, userData, exp } = decodedToken;

                    const currentTime = Math.floor(Date.now() / 1000);
                    if (exp && exp < currentTime) {
                        console.error('Token has expired. Clearing from local storage.');
                        localStorage.removeItem('session');
                        return;
                    }

                    // Clean up userData to remove any old signupProgress property
                    const cleanUserData = { ...userData };
                    if ('signupProgress' in cleanUserData) {
                        delete cleanUserData.signupProgress;
                    }

                    this.isLoggedIn = isLoggedIn;
                    this.userData = cleanUserData;
                } else {
                    throw new Error('Invalid token data');
                }
            } catch (error) {
                console.error('Failed to load session:', (error as Error).message);
                localStorage.removeItem('session');
            }
        }
    }

    private saveSession(): void {
        // 60 minutes * 24 hours * 365 days = 525,600 minutes (1 year)
        const expiresInMinutes = 60 * 24 * 365;
        const token = JWT.encode({ isLoggedIn: this.isLoggedIn, userData: this.userData }, this.secretKey, expiresInMinutes);
        localStorage.setItem('session', token);
    }

    public login(userData: SessionData): void {
        this.isLoggedIn = true;
        this.userData = { ...userData, isLoggedIn: true }; // Ensure isLoggedIn is set to true
        this.saveSession();
    }

    public logout(): void {
        this.isLoggedIn = false;
        const client: IHandshakeClient = Handshake.generate();
        this.userData = {
            devicename: this.devicename,
            signupTracker: this.userData.signupTracker,
            user: this.user,
            activeWallet: '',
            isLoggedIn: false,
            client: client,
            deviceid: client.publicKey,
            authorization: '',
            wallets: [],
            banks: [],
            transactions: [],
            beneficiaries: [],
            transactionsTableData: {
                [TransactionStatus.SUCCESSFUL]: [],
                [TransactionStatus.PROCESSING]: [],
                [TransactionStatus.PENDING]: [],
                [TransactionStatus.FAILED]: [],
                [TransactionStatus.INITIALIZING]: [],
            },
            sendersTableData: createEmptySendersTable(),
            senders: [],
            sender: this.sender,
            draftPayment: this.draftPayment,
            addSender: { formData: {}, currentStep: FormStep.COUNTRY_SELECTION, timestamp: 0 },
            transactionCounts: { [TransactionStatus.PENDING]: 0, [TransactionStatus.SUCCESSFUL]: 0, [TransactionStatus.FAILED]: 0, [TransactionStatus.PROCESSING]: 0, [TransactionStatus.INITIALIZING]: 0 },
            txStat: {
                total: 0,
                successful: 0,
                pending: 0,
                failed: 0,
                processing: 0,
                totalbeneficiary: 0,
                recent: [],
                chart: { weekly: [], monthly: [] }
            },
            smileid_business_response: this.userData.smileid_business_response,
            smileid_business_lastChecked: null,
            member: null,
            session: "",
            sessions: [],
            location: null,
            exchangeRate: this.userData.exchangeRate,
            providerIsLive: this.userData.providerIsLive || true,
        };
        this.saveSession();
    }

    public checkLoggedIn(): boolean {
        return this.isLoggedIn;
    }

    public getUserData(): SessionData {
        // Ensure isLoggedIn is synchronized
        this.userData.isLoggedIn = this.isLoggedIn;
        return this.userData;
    }

    public updateSession(userData: SessionData): void {
        if (this.isLoggedIn) {
            this.userData = { ...this.userData, ...userData };
            this.saveSession();
        } else {
            console.error('Cannot update session. User is not logged in.');
        }
    }

    public updateSessionKey(key: string, value: any): void {
        if (this.isLoggedIn) {
            if (key in this.userData) {
                this.userData[key] = value;
                this.saveSession();
            } else {
                console.error(`Key '${key}' does not exist in userData.`);
            }
        } else {
            console.error('Cannot update session. User is not logged in.');
        }
    }
}

// single named instance other modules import
const secretKey: string = "a054d1f7f839eccf142fbaacedde77a415eee92298188d9734b863b58e1d8809";
export const session = new Session(secretKey);

// optional: keep a default export for backward compatibility (export default session)
// export default session;