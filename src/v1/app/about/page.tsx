import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { AboutHero } from "@/v1/components/about/about-hero"
import { AboutValues } from "@/v1/components/about/about-values"
import { AboutVision } from "@/v1/components/about/about-vision"
import { AboutMission } from "@/v1/components/about/about-mission"
import { AboutCta } from "@/v1/components/about/about-cta"
import { useSEO } from '@/hooks/useSEO';

export default function AboutPage() {

    return (
        <>
            {useSEO({ page: 'about' })}
            <main className="flex min-h-screen flex-col">
                <Header />
                <AboutHero />
                <AboutValues />
                <AboutVision />
                <AboutMission />
                <AboutCta />
                <Footer />
            </main>
        </>
    )
}
