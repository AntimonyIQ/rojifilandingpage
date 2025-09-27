import { Header } from "@/v1/components/header"
import { Hero } from "@/v1/components/hero"
import { Stats } from "@/v1/components/stats"
import { Features } from "@/v1/components/features"
import { Testimonials } from "@/v1/components/testimonials"
import { Faq } from "@/v1/components/faq"
import { Cta } from "@/v1/components/cta"
import { Newsletter } from "@/v1/components/newsletter"
import { Footer } from "@/v1/components/footer"
import CookieConsent from "@/v1/components/cookies";
import { ThemeProvider } from '@/v1/components/theme-provider';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { useSEO } from '@/hooks/useSEO';

export default function Home() {

    return (
        <>
            {useSEO({ page: 'homepage' })}
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
                <main className="flex min-h-screen flex-col">
                    <Header />
                    <Hero />
                    <Stats />
                    <Features />
                    <Testimonials />
                    <Faq />
                    <Cta />
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