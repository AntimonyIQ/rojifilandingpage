import { motion } from "framer-motion";
import { Button } from "@/v1/components/ui/button";
import { Link } from "wouter";
import { HeroGlobeWrapper } from "./hero-globe";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Hero Globe - centered behind content */}
            <div className="absolute inset-0 -z-[1] flex items-center justify-center pointer-events-none">
                <HeroGlobeWrapper />
            </div>

            {/* Content positioned lower on the page */}
            <div className="container relative z-10 mt-32 md:mt-40 lg:mt-48">
                <div className="mx-auto max-w-3xl text-center">
                    <motion.h1
                        className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl relative"
                        style={{
                            textShadow:
                                "0 2px 8px rgba(255, 255, 255, 0.9), 0 4px 16px rgba(255, 255, 255, 0.7), 0 8px 32px rgba(255, 255, 255, 0.5)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Global Transactions Made Simple for African Businesses
                    </motion.h1>
                    <motion.p
                        className="mt-6 text-lg text-muted-foreground md:text-xl relative"
                        style={{
                            textShadow:
                                "0 2px 8px rgba(255, 255, 255, 0.9), 0 4px 16px rgba(255, 255, 255, 0.7), 0 8px 32px rgba(255, 255, 255, 0.5)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Empower your business to pay and collect local and international
                        currencies across 200+ countries worldwide with our advanced
                        financial services.
                    </motion.p>
                    <motion.div
                        className="mt-10 flex flex-wrap justify-center gap-4 relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Button
                            variant="outline"
                            size="lg"
                            asChild
                            className="px-8 py-6 text-base btn-outline-primary"
                        >
                            <Link href="/contactus">Contact Us</Link>
                        </Button>
                        <Button
                            size="lg"
                            asChild
                            className="px-8 py-6 text-base btn-primary-white"
                        >
                            <a href="https://use.rojifi.com/request-access">Request Access</a>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
