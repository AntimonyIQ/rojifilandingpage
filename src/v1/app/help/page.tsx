"use client"

import { useState, useEffect } from "react"
import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { HelpHero } from "@/v1/components/help/help-hero"
import { HelpContactOptions } from "@/v1/components/help/help-contact-options"
import { IUser } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session"
import { useSEO } from '@/hooks/useSEO';
import loginChecker from "@/v1/utils/login"

// Custom hook to manage authentication state
const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<IUser | null>(null)
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        const isLogin = loginChecker();
        if (!isLogin) {
            session.logout();
        } else {
            setUser(sd.user);
            setIsLoggedIn(sd.isLoggedIn)
        }
    }, [])

    return { isLoggedIn, user }
}


export default function HelpPage() {

    const { isLoggedIn, user } = useAuth()
    return (
        <>
            {useSEO({ page: 'help' })}
            <main className="flex min-h-screen flex-col">
                <Header isLoggedIn={isLoggedIn} user={user} />
                <HelpHero />
                <HelpContactOptions />
                <Footer />
            </main>
        </>
    )
}
