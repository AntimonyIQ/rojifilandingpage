

import * as React from "react"
import { session, SessionData } from "../session/session";
import Defaults from "../defaults/defaults";
import { IResponse } from "../interface/interface";
import { Status } from "../enums/enums";
import { ILoginFormProps } from "../components/auth/login-form";
import { ILiveExchnageRate } from "../components/dashboard/payment/useExchangeRate";

export function updateSession() {
    const [loading, setLoading] = React.useState(false);
    const [ratesLoading, setLoadingRates] = React.useState(false);
    const [liveRates, setLiveRates] = React.useState<Array<ILiveExchnageRate>>([]);
    const [isLive, setIsLive] = React.useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
    const storage: SessionData = session.getUserData();
    const AUTO_RELOAD_INTERVAL = 1 * 60 * 1000; // 1 minute

    React.useEffect(() => {
        const interval = setInterval(() => {
            fetchSession();
        }, AUTO_RELOAD_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    const fetchSession = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
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
                if (!data.handshake) throw new Error("UInvalid response.");
                const parseData: ILoginFormProps = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );

                session.updateSession({
                    ...storage,
                    user: parseData.user,
                    wallets: parseData.wallets,
                    transactions: parseData.transactions,
                    sender: parseData.sender,
                    member: parseData.member || null,
                });
            }
        } catch (error: any) {
            console.error("Fetch Session Error:", error.message);
        } finally {
            setLoading(false)
        }
    }

    const fetchProviderRates = async () => {

        try {
            setLoadingRates(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/provider/rate/USD`, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake)
                    throw new Error(
                        "Unable to process response right now, please try again."
                    );
                const parseData: {
                    sampledRates: Array<ILiveExchnageRate>;
                    isLive: boolean;
                } = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );
                setLiveRates(parseData.sampledRates);
                setIsLive(parseData.isLive);
                setLastUpdated(new Date());
                session.updateSession({
                    ...storage,
                    exchangeRate: parseData.sampledRates,
                    providerIsLive: parseData.isLive,
                });
            }
        } catch (error: any) {
            console.error(error.message || "Error fetching rates");
        } finally {
            setLoadingRates(false);
        }
    };

    return {
        fetchSession,
        loading,
        fetchProviderRates,
        ratesLoading,
        liveRates,
        isLive,
        lastUpdated,
    }
}