import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Link } from "wouter"
import sendReceiveIcon from "../public/send-receive-money-icon.svg"
import globalTradingIcon from "../public/global-trading-icon.svg"
import exchangeRatesIcon from "../public/exchange-rates-icon.svg"
import virtualCardIcon from "../public/virtual-card-icon.svg"

export function Features() {
    return (
        <section className="py-16 md:py-24">
            <div className="container">
                <motion.div
                    className="mx-auto max-w-3xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Unlock Global Potential with <span className="text-primary">Rojifi's</span> Comprehensive Financial
                        Solutions
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        At Rojifi, we understand the challenges businesses face in managing international transactions. That's why
                        we offer a range of services designed to simplify your financial operations and help you grow globally.
                    </p>
                </motion.div>

                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:gap-12">
                    <motion.div
                        className="rounded-xl bg-blue-50 p-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-white p-3 shadow-sm">
                            <img src={sendReceiveIcon} alt="Send and Receive Money" width={40} height={40} />
                        </div>
                        <h3 className="text-xl font-bold">Send and Receive Money in Local Currencies</h3>
                        <ul className="mt-4 space-y-3">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                                <span>Transact in up to 80+ different currencies</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                                <span>Collect and pay out to vendors and partners in their local currencies</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                                <span>Convert currencies and receive instant deposits</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                                <span>Swift Payout in USD, EUR, GBP, CNY+ to suppliers and partners abroad</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                                <span>Near instant settlement within 24 hours</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                                <span>Fed wire enabled payout within the US</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        className="rounded-xl bg-green-50 p-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-white p-3 shadow-sm">
                            <img src={globalTradingIcon} alt="Global Trading" width={40} height={40} />
                        </div>
                        <h3 className="text-xl font-bold">Expand Your Global Reach with Comprehensive Trading Solutions</h3>
                        <ul className="mt-4 space-y-3">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                                <span>Engage in international trade seamlessly</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                                <span>Transact up to $10 million with ease</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                                <span>Benefit from competitive and adaptable rates</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                                <span>Access our services 24/7 anywhere</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        className="rounded-xl bg-red-50 p-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-white p-3 shadow-sm">
                            <img src={exchangeRatesIcon} alt="Exchange Rates" width={40} height={40} />
                        </div>
                        <h3 className="text-xl font-bold">Unlock Value with Competitive Foreign Exchange Rates</h3>
                        <ul className="mt-4 space-y-3">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
                                <span>Benefit from our highly competitive foreign exchange rates</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
                                <span>Manage your finances seamlessly with support for multiple currencies</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
                                <span>Leverage favorable rates to enhance your international transactions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
                                <span>Access up-to-date rates to make informed financial decisions</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        className="rounded-xl bg-amber-50 p-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-white p-3 shadow-sm">
                            <img src={virtualCardIcon} alt="Virtual Cards" width={40} height={40} />
                        </div>
                        <h3 className="text-xl font-bold">Virtual Cards for Effortless Transactions</h3>
                        <ul className="mt-4 space-y-3">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-amber-500" />
                                <span>Create as many USD expense cards as you need</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-amber-500" />
                                <span>Assign cards to team members and manage expenses efficiently</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-amber-500" />
                                <span>Pay online subscriptions up to $500,000</span>
                            </li>
                        </ul>
                        <Link
                            href="/cards"
                            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            Create a virtual card <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
