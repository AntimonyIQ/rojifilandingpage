import { Footer } from "@/v1/components/footer"
import { Header } from "@/v1/components/header"
import { TermsContent } from "@/v1/components/terms/terms-content"
import { useSEO } from '@/hooks/useSEO';

export default function TermsPage() {
    return (
        <>
            {useSEO({ page: 'terms' })}
            <main className="flex min-h-screen flex-col">
                <Header isLoggedIn={false} user={null} />
                <TermsContent />
                <Footer />
            </main>
        </>
    )
}