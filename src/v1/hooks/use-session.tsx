

import * as React from "react"
import { session, SessionData } from "../session/session";
import Defaults from "../defaults/defaults";
import { IResponse } from "../interface/interface";
import { Status } from "../enums/enums";
import { ILoginFormProps } from "../components/auth/login-form";

export function updateSession() {
    const [loading, setLoading] = React.useState(false);
    const storage: SessionData = session.getUserData();

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

    return {
        fetchSession,
        loading,
    }
}