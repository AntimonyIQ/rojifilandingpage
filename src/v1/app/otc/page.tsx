
import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { OtcHero } from "@/v1/components/otc/otc-hero"
import { OtcFeatures } from "@/v1/components/otc/otc-features"
import { OtcPerks } from "@/v1/components/otc/otc-perks"
import { OtcStats } from "@/v1/components/otc/otc-stats"
import { OtcCta } from "@/v1/components/otc/otc-cta"
import { useSEO } from '@/hooks/useSEO';


export default function OtcPage() {

    return (
        <>
            {useSEO({ page: 'otc' })}
            <main className="flex min-h-screen flex-col">
                <Header />
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
