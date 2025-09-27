import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { HelpHero } from "@/v1/components/help/help-hero"
import { HelpContactOptions } from "@/v1/components/help/help-contact-options"
import { useSEO } from '@/hooks/useSEO';


export default function HelpPage() {

    return (
        <>
            {useSEO({ page: 'help' })}
            <main className="flex min-h-screen flex-col">
                <Header />
                <HelpHero />
                <HelpContactOptions />
                <Footer />
            </main>
        </>
    )
}
