import { Button } from "@/v1/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import wavebg from "../public/wave-background.png";

export function Cta() {
    return (
        <section className="py-16 md:py-24">
            <div className="container">
                <motion.div
                    className="rounded-xl bg-primary px-6 py-12 text-center text-white md:px-12 md:py-24 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Wave background image */}
                    <div className="absolute inset-0 z-0 opacity-20">
                        <img
                            src={wavebg}
                            alt=""
                            className="w-full h-full object-cover"
                            aria-hidden="true"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Ready for Borderless Transactions?
                        </h2>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
                            Enjoy seamless global payments with Rojifi's innovative financial
                            solutions.
                        </p>
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-white text-primary hover:bg-white/90 hover:text-primary"
                                asChild
                            >
                                <Link href="/contactus">Contact Us</Link>
                            </Button>
                            <Button
                                size="lg"
                                className="bg-white text-primary hover:bg-white/90 hover:text-primary"
                                asChild
                            >
                                <a href="https://use.rojifi.com/request-access">
                                    Request Access
                                </a>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
