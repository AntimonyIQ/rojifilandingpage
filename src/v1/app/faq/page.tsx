import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { Faq } from "@/v1/components/faq"
import { useSEO } from '@/hooks/useSEO';

export default function FaqPage() {

    return (
        <>
            {useSEO({ page: 'faq' })}
            <main className="flex min-h-screen flex-col">
                <Header />
                <Faq />
                <Footer />
            </main>
        </>
    )
}
