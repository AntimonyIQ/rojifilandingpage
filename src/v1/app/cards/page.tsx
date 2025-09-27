import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { CardsHero } from "@/v1/components/cards/cards-hero"
import { CardsCta } from "@/v1/components/cards/cards-cta"
import { useSEO } from '@/hooks/useSEO';

export default function CardsPage() {

    return (
        <>
            {useSEO({ page: 'cards' })}
            <main className="flex min-h-screen flex-col">
                <Header />
                <CardsHero />
                <CardsCta />
                <Footer />
            </main>
        </>
    )
}
