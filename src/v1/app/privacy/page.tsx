import { Footer } from "@/v1/components/footer"
import { Header } from "@/v1/components/header"
import { PrivacyContent } from "@/v1/components/privacy/privacy-content"
import { useSEO } from '@/hooks/useSEO';

export default function PrivacyPage() {
    return (
        <>
            {useSEO({ page: 'privacy' })}
            <main className="flex min-h-screen flex-col">
                <Header />
                <PrivacyContent />
                <Footer />
            </main>
        </>
    )
}
