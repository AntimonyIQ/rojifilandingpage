"use client"

import { useState, useEffect } from "react"
import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { Faq } from "@/v1/components/faq"
import { session, SessionData } from "@/v1/session/session"
import { IUser } from "@/v1/interface/interface"
import { useSEO } from '@/hooks/useSEO';

// Custom hook to manage authentication state
const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<IUser | null>(null)
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        setIsLoggedIn(sd.isLoggedIn === true ? true : false);
        setUser(sd.user);
    }, [])

    return { isLoggedIn, user }
}

export default function FaqPage() {

    const { isLoggedIn, user } = useAuth()

    return (
        <>
            {useSEO({ page: 'faq' })}
            <main className="flex min-h-screen flex-col">
                <Header isLoggedIn={isLoggedIn} user={user} />
                <Faq />
                <Footer />
            </main>
        </>
    )
}
