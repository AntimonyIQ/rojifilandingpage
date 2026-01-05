import { Button } from "@/v1/components/ui/button"
import { ArrowRight, ArrowUpRight, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "wouter"
import { useState, useEffect } from "react"

// Animation interval constants (in milliseconds)
const CURRENCY_ROTATION_INTERVAL = 3000
const TRANSACTION_ROTATION_INTERVAL = 2500

export function MultiCurrencyHero() {
    const [hideBalance, setHideBalance] = useState(false)
    const [currentCurrency, setCurrentCurrency] = useState(0)
    const [currentTransaction, setCurrentTransaction] = useState(0)

    const currencies = [
        { code: "USD", symbol: "$", balance: "250,000.00", change: "+12.5%", color: "bg-blue-500" },
        { code: "EUR", symbol: "€", balance: "180,432.50", change: "+8.3%", color: "bg-purple-500" },
        { code: "GBP", symbol: "£", balance: "145,820.00", change: "+15.2%", color: "bg-green-500" },
    ]

    const recentTransactions = [
        { type: "Deposit", amount: "+$105,240.00", time: "2 mins ago", status: "completed" },
        { type: "Sent Payment", amount: "-€15,180.50", time: "1 hour ago", status: "completed" },
        { type: "Currency Swap", amount: "£15,000 → $18,600", time: "3 hours ago", status: "completed" },
    ]

    // Auto-rotate currencies
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCurrency((prev) => (prev + 1) % currencies.length)
        }, CURRENCY_ROTATION_INTERVAL)
        return () => clearInterval(interval)
    }, [])

    // Auto-rotate transactions
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTransaction((prev) => (prev + 1) % recentTransactions.length)
        }, TRANSACTION_ROTATION_INTERVAL)
        return () => clearInterval(interval)
    }, [recentTransactions.length])

    return (
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 md:py-24">
            <div className="container">
                <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Expand your market with{" "}
                            <span className="text-primary">
                                multi-currency
                                <br />
                                payments
                            </span>
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
                                Seamlessly grow your global presence by making secure, efficient cross-border payments with ease.
                            </span>
                        </p>
                        <div className="mt-8">
                            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-base" asChild>
                                <Link href="#create-wallet">
                                    Get started <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="rounded-2xl bg-white p-6 shadow-2xl border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                    <img src="/logo.png" alt="Rojifi Logo" className="w-7 h-7" />
                                </div>
                                <span className="font-bold text-lg">Rojifi</span>
                            </div>
                            <button
                                onClick={() => setHideBalance(!hideBalance)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label={hideBalance ? "Show balance" : "Hide balance"}
                            >
                                {hideBalance ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                            </button>
                        </div>

                        {/* Currency Display with Animation */}
                        <div className="mt-6">
                            <p className="text-sm text-gray-500">Total Balance</p>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentCurrency}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-2"
                                >
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-bold">
                                            {hideBalance
                                                ? "••••••"
                                                : `${currencies[currentCurrency].symbol}${currencies[currentCurrency].balance}`}
                                        </span>
                                        <span className="text-sm font-medium text-green-600 flex items-center gap-0">
                                            <svg
                                                className="h-5 w-5 fill-current"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path d="M7 14l5-5 5 5z" />
                                            </svg>
                                            {currencies[currentCurrency].change}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{currencies[currentCurrency].code} Wallet</p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Currency Indicators */}
                            <div className="flex gap-2 mt-4" role="group" aria-label="Currency status indicators">
                                {currencies.map((curr, idx) => (
                                    <div
                                        key={curr.code}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentCurrency ? curr.color : "bg-gray-200"
                                            }`}
                                        role={idx === currentCurrency ? "status" : "presentation"}
                                        aria-label={idx === currentCurrency ? `${curr.code} currency, ${idx + 1} of ${currencies.length}, currently displayed` : undefined}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <motion.div
                                className="bg-blue-50 rounded-xl p-3"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <p className="text-xs text-gray-600">Sent</p>
                                <p className="text-sm font-bold mt-1">142</p>
                            </motion.div>
                            <motion.div
                                className="bg-green-50 rounded-xl p-3"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <p className="text-xs text-gray-600">Deposits</p>
                                <p className="text-sm font-bold mt-1">89</p>
                            </motion.div>
                            <motion.div
                                className="bg-purple-50 rounded-xl p-3"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <p className="text-xs text-gray-600">Swaps</p>
                                <p className="text-sm font-bold mt-1">34</p>
                            </motion.div>
                        </div>

                        {/* Recent Activity */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
                                <div className="flex gap-1">
                                    {recentTransactions.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentTransaction ? "bg-primary w-4" : "bg-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentTransaction}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-50 rounded-xl p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <ArrowUpRight className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{recentTransactions[currentTransaction].type}</p>
                                                <p className="text-xs text-gray-500">{recentTransactions[currentTransaction].time}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{recentTransactions[currentTransaction].amount}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <p className="text-xs text-gray-500 capitalize">{recentTransactions[currentTransaction].status}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* CTA Banner */}
                        <div className="mt-6 bg-gradient-to-r from-primary/10 via-purple-50 to-blue-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-sm">Ready to go global?</h4>
                                    <p className="text-xs text-gray-600 mt-1">Start settling payments in over 200+ countries</p>
                                </div>
                                <Link href="/requestaccess">
                                    <motion.button
                                        className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium shadow-md whitespace-nowrap"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Request Access
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
