import { useState, useEffect } from "react"
import { Header } from "@/v1/components/header"
import { Hero } from "@/v1/components/hero"
import { Stats } from "@/v1/components/stats"
import { Features } from "@/v1/components/features"
import { Testimonials } from "@/v1/components/testimonials"
import { Faq } from "@/v1/components/faq"
import { Cta } from "@/v1/components/cta"
import { Newsletter } from "@/v1/components/newsletter"
import { Footer } from "@/v1/components/footer"
import { session, SessionData } from "@/v1/session/session"
import Handshake from "@/v1/hash/handshake"
import { IHandshakeClient, IPayment, ISender, IUser } from "@/v1/interface/interface"
import CookieConsent from "@/v1/components/cookies";
import { ThemeProvider } from '@/v1/components/theme-provider';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { useSEO } from '@/hooks/useSEO';
import { FormStep } from "./dashboard/[wallet]/sender/add/types"

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

export default function Home() {
    const { isLoggedIn, user } = useAuth()

    return (
        <>
            {useSEO({ page: 'homepage' })}
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
                <main className="flex min-h-screen flex-col">
                    <Header isLoggedIn={isLoggedIn} user={user} />
                    <Hero isLoggedIn={isLoggedIn} />
                    <Stats />
                    <Features />
                    <Testimonials />
                    <Faq />
                    <Cta isLoggedIn={isLoggedIn} />
                    <Newsletter />
                    <Footer />
                    <CookieConsent />
                </main>
                <Toaster richColors position="top-right" />
            </ThemeProvider>
            <Analytics />
        </>
    )
}