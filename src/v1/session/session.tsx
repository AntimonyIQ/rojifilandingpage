import Handshake from "@/v1/hash/handshake";
import JWT from "@/v1/hash/jwt";
import { IHandshakeClient, IPayment, ISender, ITransaction, IUser, IWallet } from "@/v1/interface/interface";

export interface SessionData {
    user: IUser;
    activeWallet: string;
    isLoggedIn: boolean;
    client: IHandshakeClient;
    deviceid: string;
    authorization: string;
    wallets: Array<IWallet>;
    transactions: Array<ITransaction>;
    sender: ISender;
    draftPayment: IPayment;
    signupTracker?: string;
    [key: string]: any;
}

interface DecodedToken {
    isLoggedIn: boolean;
    userData: SessionData;
    exp?: number;
}

export default class Session {
    private isLoggedIn: boolean;
    private userData: SessionData;
    private secretKey: string;
    private client: IHandshakeClient = Handshake.generate();
    private user: IUser = {} as IUser;
    private sender: ISender = {} as ISender;
    private draftPayment: IPayment = {} as IPayment;

    constructor(secretKey: string) {
        this.isLoggedIn = false;

        this.userData = {
            user: this.user,
            activeWallet: '',
            isLoggedIn: false,
            client: this.client,
            deviceid: this.client.publicKey,
            authorization: '',
            wallets: [],
            transactions: [],
            sender: this.sender,
            draftPayment: this.draftPayment,
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
        this.userData = {
            signupTracker: this.userData.signupTracker,
            user: this.user,
            activeWallet: '',
            isLoggedIn: false,
            client: this.client,
            deviceid: this.client.publicKey,
            authorization: '',
            wallets: [],
            transactions: [],
            sender: this.sender,
            draftPayment: this.draftPayment,
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

const secretKey: string = "a054d1f7f839eccf142fbaacedde77a415eee92298188d9734b863b58e1d8809";

export const session: Session = new Session(secretKey);