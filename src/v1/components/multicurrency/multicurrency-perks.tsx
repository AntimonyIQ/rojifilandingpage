"use client";

import { motion } from "framer-motion";
import { Button } from "@/v1/components/ui/button";
import { CheckCircle } from "lucide-react";
import unbeatablePerks from "../../public/unbeatable-perks.png";

export function MultiCurrencyPerks() {
    const perks = [
        "Instant deposits for every conversion",
        "Safety and reliability for your financial operations",
        "Get the best value on every transaction",
        "Comprehensive international coverage",
        "Local and international currency options",
        "Convenient digital flows management",
    ];

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container">
                <div className="grid gap-12 md:grid-cols-2 items-center">
                    <motion.div
                        className="bg-amber-50 rounded-xl p-8"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold tracking-tight">
                            Unbeatable Perks
                        </h2>
                        <ul className="mt-8 space-y-4">
                            {perks.map((perk, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span>{perk}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8">
                            <Button
                                variant="outline"
                                className="bg-white border-amber-200 hover:bg-amber-100 hover:text-amber-900"
                            >
                                <a href="https://use.rojifi.com/request-access">Get started</a>
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <img
                            src={unbeatablePerks}
                            alt="Hand holding money"
                            width={400}
                            height={300}
                            className="max-w-full h-auto"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
