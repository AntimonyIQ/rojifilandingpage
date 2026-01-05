import { motion } from "framer-motion"
import { Button } from "@/v1/components/ui/button"
import { ArrowRight, Wallet, RefreshCw, Globe } from "lucide-react"
import { Link } from "wouter"
import business_man from "../../public/business-man.png"

export function MultiCurrencyFeatures() {
    return (
        <section className="py-16 md:py-24" id="create-wallet">
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
                                d="M12 3H4C2.89543 3 2 3.89543 2 5V11C2 12.1046 2.89543 13 4 13H12C13.1046 13 14 12.1046 14 11V5C14 3.89543 13.1046 3 12 3Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Multi-currency Wallet
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simplified Cross-Border Transactions</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our multi-currency wallet simplifies international payments for businesses, allowing them to handle
                        transactions in various currencies with ease.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-base" asChild>
                            <Link href="/request-access">
                                Create wallet <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>

                <div className="mt-16">
                    <motion.div
                        className="rounded-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="rounded-2xl bg-white overflow-hidden shadow-2xl border border-gray-100">
                            {/* Header */}
                            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                                        <img src="/logo.png" alt="Rojifi Logo" className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-lg">Rojifi</span>
                                        <p className="text-xs text-gray-500">Multi-Currency Dashboard</p>
                                    </div>
                                </div>
                                <div className="flex-1"></div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500 block">Total Balance</span>
                                        <motion.div
                                            className="font-bold text-lg text-primary"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            $575,682.50
                                        </motion.div>
                                    </div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>

                            {/* Transactions Table */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                                        <p className="text-sm text-gray-500 mt-1">Multi-currency payment history</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">24 transactions</span>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-gray-200">
                                            <tr className="text-left">
                                                <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Beneficiary</th>
                                                <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Currency</th>
                                                <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="pb-3 text-xs font-medium text-gray-500 uppercase text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {[
                                                { beneficiary: "Acme Corp Ltd", amount: "$15,240.00", currency: "USD", date: "Dec 28, 2024", status: "Completed", icon: "🇺🇸" },
                                                { beneficiary: "Global Solutions GmbH", amount: "€18,180.50", currency: "EUR", date: "Dec 27, 2024", status: "Completed", icon: "🇪🇺" },
                                                { beneficiary: "Tech Innovators UK", amount: "£15,450.00", currency: "GBP", date: "Dec 26, 2024", status: "Completed", icon: "🇬🇧" },
                                                { beneficiary: "Premier Consulting", amount: "$25,000.00", currency: "USD", date: "Dec 25, 2024", status: "Completed", icon: "🇺🇸" },
                                                { beneficiary: "Digital Services SA", amount: "€17,890.00", currency: "EUR", date: "Dec 24, 2024", status: "Completed", icon: "🇪🇺" },
                                                { beneficiary: "Innovation Partners", amount: "£24,320.00", currency: "GBP", date: "Dec 23, 2024", status: "Completed", icon: "🇬🇧" },
                                            ].map((tx, idx) => (
                                                <motion.tr
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                                                                {tx.icon}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm text-gray-900">{tx.beneficiary}</div>
                                                                <div className="text-xs text-gray-500">International Transfer</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="font-semibold text-sm text-gray-900">{tx.amount}</div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                            {tx.currency}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="text-sm text-gray-500">{tx.date}</div>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tx.status === "Completed"
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-yellow-50 text-yellow-700"
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "Completed" ? "bg-green-500" : "bg-yellow-500"
                                                                }`}></span>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* View All Button
                                <div className="mt-6 text-center">
                                    <Link href="/login">
                                        <motion.button
                                            className="text-sm text-primary font-medium hover:underline"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            View all transactions →
                                        </motion.button>
                                    </Link>
                                </div>
                                */}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-16 grid gap-8 md:grid-cols-[1fr,1fr] lg:gap-12" id="features">
                    <motion.div
                        className="rounded-xl overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <img
                            src={business_man}
                            alt="Business person using laptop"
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
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
                            <Wallet className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-bold">Topup your wallet</h3>
                            <p className="mt-2 text-muted-foreground">
                                Create multiple wallets and fund them in your local currency. Hold NGN, USD, EUR, GBP and ZAR for
                                limitless business transactions.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <RefreshCw className="h-10 w-10 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold">Seamless Currencies Conversion</h3>
                            <p className="mt-2 text-muted-foreground">
                                Effortlessly swap currencies and receive instant deposits to your wallet. View the latest rates to
                                ensure you get the best value for each transaction.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <Globe className="h-10 w-10 text-amber-500 mb-4" />
                            <h3 className="text-xl font-bold">Payout to international bank accounts</h3>
                            <p className="mt-2 text-muted-foreground">
                                Send and receive money directly to local and international bank accounts. Enjoy
                                competitive rates for transactions to and from Nigeria, Ghana, Asia, the US, the UK, and Europe.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
