import { motion } from "framer-motion";
import { ArrowRight, Globe, Zap, DollarSign } from "lucide-react";
import { Button } from "@/v1/components/ui/button";
import tradingHorizons from "../../public/trading-horizons.png";

export function OtcFeatures() {
    return (
        <section className="py-16 md:py-24" id="start-trading">
            <div className="container">
                <motion.div
                    className="text-center mx-auto max-w-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm text-primary mb-4">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-2 h-4 w-4"
                        >
                            <path
                                d="M8 2V14"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M11 5L8 2L5 5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M5 11L8 14L11 11"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M14 8H2"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M11 5L14 8L11 11"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M5 11L2 8L5 5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        OTC Desk
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Expand Your Trading Horizons with Rojifi OTC
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Access a world of opportunities through our OTC desk for hassle-free
                        cross-border trading
                    </p>
                    <div className="mt-8">
                        <Button
                            size="lg"
                            className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-base"
                            asChild
                        >
                            <a href="https://use.rojifi.com/request-access">
                                Start trading <ArrowRight className="ml-2 h-5 w-5" />
                            </a>
                        </Button>
                    </div>
                </motion.div>

                <div className="mt-16 grid gap-8 md:grid-cols-[1fr,1fr] lg:gap-12">
                    <motion.div
                        className="rounded-xl bg-blue-50 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <img
                            src={tradingHorizons}
                            alt="Business handshake"
                            className="w-full h-full object-cover"
                            width={600}
                            height={400}
                        />
                    </motion.div>

                    <motion.div
                        className="grid gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <Globe className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-bold">
                                Unmatched Liquidity and Global Reach
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                                Benefit from deep liquidity pools and a wide range of payment
                                options for seamless transactions.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <Zap className="h-10 w-10 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold">Rapid Settlement</h3>
                            <p className="mt-2 text-muted-foreground">
                                Experience lightning-fast transaction processing and receive
                                funds reliably.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <DollarSign className="h-10 w-10 text-amber-500 mb-4" />
                            <h3 className="text-xl font-bold">Best-in-Class Pricing</h3>
                            <p className="mt-2 text-muted-foreground">
                                Enjoy highly competitive rates and transparent pricing for
                                maximum savings.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
