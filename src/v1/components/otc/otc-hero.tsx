"use client"

import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "wouter"
import nigeriaFlag from "../../public/nigeria-flag.png"
import usaFlag from "../../public/usa-flag.png"

export function OtcHero() {
    return (
        <section className="bg-blue-50 py-16 md:py-24">
            <div className="container">
                <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Tailored OTC Trading for High-Value Transactions
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground flex items-start gap-2">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mt-0.5 flex-shrink-0"
                            >
                                <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span>
                                Enjoy personalized trading with flexible rates for high-value transactions across 200+ countries
                            </span>
                        </p>
                        <div className="mt-8">
                            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-base" asChild>
                                <Link href="#start-trading">
                                    Start trading <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="rounded-xl bg-white p-6 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold">Convert currency</h2>
                        <p className="mt-2 text-muted-foreground">Swiftly exchange your currency for other pairs.</p>

                        <div className="mt-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Convert</label>
                                <div className="flex gap-4">
                                    <Input type="number" placeholder="1,000.00" className="flex-1" />
                                    <div className="w-32 rounded-md border border-input bg-background px-3 py-2 flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
                                            <img
                                                src={nigeriaFlag}
                                                alt="Nigeria"
                                                width={20}
                                                height={20}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm">NGN</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">To</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 rounded-md border border-input bg-gray-50 px-3 py-2 text-muted-foreground">
                                        2,500.00
                                    </div>
                                    <div className="w-32 rounded-md border border-input bg-background px-3 py-2 flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
                                            <img
                                                src={usaFlag}
                                                alt="USA"
                                                width={20}
                                                height={20}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm">USD</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
