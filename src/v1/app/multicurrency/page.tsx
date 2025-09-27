import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { MultiCurrencyHero } from "@/v1/components/multicurrency/multicurrency-hero"
import { MultiCurrencyFeatures } from "@/v1/components/multicurrency/multicurrency-features"
import { MultiCurrencyPerks } from "@/v1/components/multicurrency/multicurrency-perks"
import { MultiCurrencyCta } from "@/v1/components/multicurrency/multicurrency-cta"
import { useSEO } from '@/hooks/useSEO';

export default function MultiCurrencyPage() {

    return (
        <>
            {useSEO({ page: 'multicurrency' })}
            <main className="flex min-h-screen flex-col">
                <Header />
                <MultiCurrencyHero />
                <MultiCurrencyFeatures />
                <MultiCurrencyPerks />
                <MultiCurrencyCta />
                <Footer />
            </main>
        </>
    )
}
