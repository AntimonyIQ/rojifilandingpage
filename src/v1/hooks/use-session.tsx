import * as React from "react"
import { IPGeolocation, IResponse, ISession } from "../interface/interface";
import Defaults from "../defaults/defaults";
import { session, SessionData } from "../session/session";
import { Status } from "../enums/enums";
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

export default function useSession() {
    const key = Defaults.SESSION_KEY;
    const [sessions, setSessions] = React.useState<ISession[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [revokeLoading, setRevokeLoading] = React.useState<boolean>(false);
    const [saveLoading, setSaveLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [revokeError, setRevokeError] = React.useState<string | null>(null);
    const [location, setLocation] = React.useState<IPGeolocation | null>(null);
    const [deviceInfo, setDeviceInfo] = React.useState<any>(null);
    const storage: SessionData = session.getUserData();

    const run = () => {
        if (storage.location) {
            setLocation(storage.location);
        }

        if (!location || !deviceInfo) {
            getDeviceInfo();
        }

        if (location && deviceInfo && !storage.session) {
            constructSessionPayload();
        }
    };

    const getBrowserFingerprint = async (): Promise<string> => {
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

    const constructSessionPayload = async () => {
        const fingerprint = await getBrowserFingerprint();

        const sessionHeader: Partial<ISession> = {
            userId: storage.user._id,
            userAgent: navigator.userAgent,
            ipAddress: location ? location.ip : "",
            lastAccessedAt: new Date(),
            deviceType: "WEB",
            browser: navigator.userAgent,
            os: navigator.platform,
            fingerprint: fingerprint,
            geoLocation: {
                country: location ? location.country : "",
                region: location ? location.region : "",
                city: location ? location.city : "",
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

    const decodeSessionHeader = (): ISession => {
        const session: string = storage.session || "";
        const decryptedBytes = AES.decrypt(session, Defaults.SESSION_KEY);
        const decodedSession = decryptedBytes.toString(encUtf8);
        const parsedSession: ISession = JSON.parse(decodedSession);
        return parsedSession;
    }

    const getDeviceInfo = () => {
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

        setDeviceInfo(info);
    };

    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            setError(null);
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
                setSessions(parseData);
                session.updateSession({ ...storage, sessions: parseData });
            }
        } catch (err: any) {
            setError(err.message || "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const revokeSession = async (sessionId: string) => {
        try {
            setRevokeLoading(true);
            setError(null);
            const res = await fetch(`${Defaults.API_BASE_URL}/session/revoke/`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify({ sessionId }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                await fetchSessions();
            }
        } catch (err: any) {
            setRevokeError(err.message || "An unknown error occurred");
        } finally {
            setRevokeLoading(false);
        }
    };

    const saveSession = async (): Promise<void> => {
        try {
            setSaveLoading(true);

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
                await fetchSessions();
            }
        } catch (error: any) {
            console.error("Failed to save session:", (error as Error).message);
        } finally {
            setSaveLoading(false);
        }
    };

    React.useEffect(() => {
        if (sessions.length === 0 && storage.authorization) {
            fetchSessions();
        }
    }, [sessions.length]);

    return {
        sessions,
        isLoading,
        error,
        refetch: fetchSessions,
        revokeError,
        revokeLoading,
        revokeSession,
        location,
        deviceInfo,
        run,
        constructSessionPayload,
        saveSession,
        saveLoading,
        decodeSessionHeader,
    };
} 
