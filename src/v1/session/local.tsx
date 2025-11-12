import { IPGeolocation, IResponse, ISession } from "../interface/interface";
import Defaults from "../defaults/defaults";
import { session, SessionData } from "../session/session";
import { Status } from "../enums/enums";
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

export default class LocalSession {
    public static init = async () => {
        const storage: SessionData = session.getUserData();
        if (!storage || !storage.session) {
            LocalSession.device();
            await LocalSession.create();
        }
    }

    public static create = async () => {
        const deviceId = await this.fingerprint();
        const storage: SessionData = session.getUserData();

        const location: IPGeolocation | null = storage.location;
        const deviceInfo: any = storage.deviceInfo;
        const key = Defaults.SESSION_KEY;

        const sessionHeader: Partial<ISession> = {
            userId: storage.user._id,
            userAgent: navigator.userAgent,
            ipAddress: location ? location.ip : "",
            lastAccessedAt: new Date(),
            deviceType: "WEB",
            browser: navigator.userAgent,
            os: navigator.platform,
            fingerprint: deviceId,
            geoLocation: {
                country: location ? location.country : "Unknown",
                region: location ? location.region : "Unknown",
                city: location ? location.city : "Unknown",
            },
            metadata: {
                location: location || {},
                deviceInfo: deviceInfo || {},
                submission: {
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    referrer: document.referrer || "Direct",
                    url: window.location.href
                }
            },
        };

        const encryptedSession: string = AES.encrypt(JSON.stringify(sessionHeader), key).toString();
        session.updateSession({
            ...storage,
            session: encryptedSession,
        });
    }

    public static fingerprint = async (): Promise<string> => {
        const data = {
            ua: navigator.userAgent,
            lang: navigator.language,
            plat: navigator.platform,
            hw: navigator.hardwareConcurrency,
            mem: (navigator as any).deviceMemory,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        const raw = JSON.stringify(data);
        const buffer = new TextEncoder().encode(raw);
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const finalHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        return finalHash;
    }

    public static sessions = async (): Promise<boolean> => {
        try {
            const storage: SessionData = session.getUserData();
            const res = await fetch(`${Defaults.API_BASE_URL}/session`, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Invalid Response");
                const parseData: ISession[] = Defaults.PARSE_DATA(data.data, storage.client.privateKey, data.handshake);
                session.updateSession({ ...storage, sessions: parseData });
                return true;
            }

            return false;
        } catch (err: any) {
            console.error("Failed to fetch sessions:", (err as Error).message);
            return false;
        }
    };

    public static revoke = async (sessionId: string): Promise<boolean> => {
        const storage: SessionData = session.getUserData();
        try {
            const res = await fetch(`${Defaults.API_BASE_URL}/session/revoke`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    "x-rojifi-session": storage.session || "",
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify({ sessionId }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                return true;
            }
            return false;
        } catch (err: any) {
            console.error("Failed to revoke session:", (err as Error).message);
            return false;
        } finally {
            await LocalSession.sessions();
        }
    };

    public static save = async (): Promise<void> => {
        await LocalSession.init();
        const storage: SessionData = session.getUserData();

        try {
            if (!storage.session) {
                throw new Error("No session to save");
            }

            const res = await fetch(`${Defaults.API_BASE_URL}/session`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    "x-rojifi-session": storage.session || "",
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                return;
            }
        } catch (error: any) {
            console.error("Failed to save session:", (error as Error).message);
        } finally {
            await LocalSession.sessions();
        }
    };

    public static decode = (): ISession => {
        const storage: SessionData = session.getUserData();
        const decryptedBytes = AES.decrypt(storage.session || "", Defaults.SESSION_KEY);
        const decodedSession = decryptedBytes.toString(encUtf8);
        const parsedSession: ISession = JSON.parse(decodedSession);
        return parsedSession;
    }

    public static device = () => {
        const storage: SessionData = session.getUserData();
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const language = navigator.language;
        const cookieEnabled = navigator.cookieEnabled;
        const onLine = navigator.onLine;
        const screen = window.screen;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Detect browser
        let browserName = "Unknown";
        let browserVersion = "Unknown";

        if (userAgent.indexOf("Chrome") > -1) {
            browserName = "Chrome";
            browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
        } else if (userAgent.indexOf("Firefox") > -1) {
            browserName = "Firefox";
            browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
        } else if (userAgent.indexOf("Safari") > -1) {
            browserName = "Safari";
            browserVersion = userAgent.match(/Safari\/([0-9.]+)/)?.[1] || "Unknown";
        } else if (userAgent.indexOf("Edge") > -1) {
            browserName = "Edge";
            browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || "Unknown";
        }

        // Detect OS
        let osName = "Unknown";
        if (userAgent.indexOf("Windows") > -1) osName = "Windows";
        else if (userAgent.indexOf("Mac") > -1) osName = "macOS";
        else if (userAgent.indexOf("Linux") > -1) osName = "Linux";
        else if (userAgent.indexOf("Android") > -1) osName = "Android";
        else if (userAgent.indexOf("iOS") > -1) osName = "iOS";

        // Detect device type
        let deviceType = "Desktop";
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            deviceType = "Mobile";
        } else if (/iPad/i.test(userAgent)) {
            deviceType = "Tablet";
        }

        const info = {
            browser: {
                name: browserName,
                version: browserVersion,
                userAgent: userAgent,
                language: language,
                cookieEnabled: cookieEnabled,
                onLine: onLine
            },
            device: {
                type: deviceType,
                platform: platform,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                }
            },
            system: {
                os: osName,
                timezone: timezone,
                timestamp: new Date().toISOString()
            }
        };

        session.updateSession({ ...storage, deviceInfo: info });
    };
}
