"use client"

import { useState, useEffect } from "react"
import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { OtcHero } from "@/v1/components/otc/otc-hero"
import { OtcFeatures } from "@/v1/components/otc/otc-features"
import { OtcPerks } from "@/v1/components/otc/otc-perks"
import { OtcStats } from "@/v1/components/otc/otc-stats"
import { OtcCta } from "@/v1/components/otc/otc-cta"
import { IHandshakeClient, IPayment, ISender, IUser } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session"
import Handshake from "@/v1/hash/handshake"
import { useSEO } from '@/hooks/useSEO';
import { FormStep } from "../dashboard/[wallet]/sender/add/types"

// Custom hook to manage authentication state
const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<IUser | null>(null)

    useEffect(() => {
        const sd: SessionData = session.getUserData();
        if (sd) {
            setIsLoggedIn(sd.isLoggedIn === true ? true : false);
            setUser(sd.user);
        } else {
            const client: IHandshakeClient = Handshake.generate();
            console.log("client: ", client);
            const sessionData: SessionData = {
                user: {} as IUser,
                activeWallet: '',
                client: client,
                deviceid: client.publicKey,
                isLoggedIn: false,
                devicename: "Unknown",
                authorization: "",
                wallets: [],
                transactions: [],
                sender: {} as ISender,
                draftPayment: {} as IPayment,
                addSender: {
                    formData: {},
                    currentStep: FormStep.COUNTRY_SELECTION,
                    timestamp: 0
                }
            };

            session.login(sessionData);
        }
    }, [])

    return { isLoggedIn, user }
}

export default function OtcPage() {

    const { isLoggedIn, user } = useAuth()

    return (
        <>
            {useSEO({ page: 'otc' })}
            <main className="flex min-h-screen flex-col">
                <Header isLoggedIn={isLoggedIn} user={user} />
                <OtcHero />
                <OtcFeatures />
                <OtcStats />
                <OtcPerks />
                <OtcCta />
                <Footer />
            </main>
        </>
    )
}
