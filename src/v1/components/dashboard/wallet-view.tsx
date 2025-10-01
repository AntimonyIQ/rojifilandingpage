"use client"

import { useState } from "react"
// import { useEffect } from "react" // TODO: Re-enable when implementing wallet fetching
// import * as htmlToImage from "html-to-image";
import { Button } from "@/v1/components/ui/button"
import { ArrowLeftRight, EyeOff, Plus, Send } from "lucide-react"
// import { Card, CardContent } from "../ui/card"
// import TransactionChart from "./transactionchart"
// import { IUser } from "@/v1/interface/interface";
// import { session, SessionData } from "@/v1/session/session";

enum Currency {
    NGN = "NGN",
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP"
}

interface ITabs {
    name: string;
    icon: React.ReactNode | string;
}

interface IWallet {
    currency: Currency;
    balance: number;
    pending_payment_balance: number;
}

export function WalletView() {
    const [hideBalances, setHideBalances] = useState(false)
    // const [user] = useState<IUser | null>(null) // TODO: Implement user functionality
    // const [isStatisticsModalOpen] = useState<boolean>(false); // TODO: Implement statistics modal
    // const sd: SessionData = session.getUserData(); // TODO: Implement session data usage
    const [wallets] = useState<Array<IWallet>>([
        { currency: Currency.NGN, balance: 895_000.00, pending_payment_balance: 895_000.00 },
        { currency: Currency.USD, balance: 895_000.00, pending_payment_balance: 895_000.00 },
        { currency: Currency.EUR, balance: 0, pending_payment_balance: 0 },
        { currency: Currency.GBP, balance: 0, pending_payment_balance: 0 }
    ])
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.NGN);
    const currencySymbols: Record<Currency, string> = {
        [Currency.NGN]: "₦",
        [Currency.USD]: "$",
        [Currency.EUR]: "€",
        [Currency.GBP]: "£",
    }

    const tabs: Array<ITabs> = [
        { name: "NGN", icon: "🇳🇬" },
        { name: "USD", icon: "🇺🇸" },
        { name: "EUR", icon: "🇪🇺" },
        { name: "GBP", icon: "🇬🇧" },
    ]

    // TODO: Implement chart data
    // const chartData = [
    //     { day: "Sun", value: 60, amount: "$2,500" },
    //     { day: "Mon", value: 80, amount: "$3,200" },
    //     { day: "Tue", value: 70, amount: "$4,300" },
    //     { day: "Wed", value: 45, amount: "$2,000" },
    //     { day: "Thu", value: 90, amount: "$5,000" },
    //     { day: "Fri", value: 85, amount: "$4,800" },
    //     { day: "Sat", value: 75, amount: "$3,900" },
    // ];

    // TODO: Implement wallet fetching
    // useEffect(() => {
    //     const fetchWallets = async () => {
    //         try {
    //             // setUser(sd.user || null); // TODO: Implement user setting
    //         } catch (error) {
    //             console.error("Error fetching wallets:", error)
    //         }
    //     }
    //     fetchWallets()
    // }, [])

    const activeWallet = wallets.find(w => w.currency === selectedCurrency);

    // TODO: Implement download functionality
    // const handleDownload = async () => {
    //     try {
    //         const node = document.getElementById("screenshot");

    //         if (!node) {
    //             console.error("Screenshot element not found!");
    //             return;
    //         }

    //         const dataUrl = await htmlToImage.toPng(node, {
    //             backgroundColor: "white",
    //             pixelRatio: 2 // sharp output
    //         });

    //         // Trigger download instead of appending to DOM
    //         const link = document.createElement("a");
    //         link.download = "transaction-chart.png";
    //         link.href = dataUrl;
    //         link.click();

    //     } catch (err) {
    //         console.error("Oops, something went wrong!", err);
    //     }
    // };

    // TODO: Implement chart component
    // const Chart = () => {
    //     return (
    //         <Card>
    //             <CardContent>
    //                 <div className="flex items-center justify-between mb-4 pt-4">
    //                     <h3 className="text-lg font-medium">Statistics</h3>
    //                     <button onClick={() => setIsStatisticsModalOpen(true)} className="text-sm text-gray-500 flex gap-1">
    //                         Expand <Expand className="h-4 w-4" />
    //                     </button>
    //                 </div>
    //                 <TransactionChart data={chartData} height={400} />
    //             </CardContent>
    //         </Card>
    //     );
    // }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6 min-w-0">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Welcome Back, Cecilia & Jacin Enterprise {/** {user?.firstname} */}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Get a quick snapshot of your account activity and wallet balances
                        </p>
                    </div>

                    <div className="hidden md:flex items-start md:items-center gap-4">
                        <button
                            onClick={() => {
                                const newHide = !hideBalances
                                setHideBalances(newHide)
                                window.dispatchEvent(
                                    new CustomEvent("balanceVisibilityChanged", {
                                        detail: { hideBalances: newHide }
                                    })
                                )
                            }}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                            <EyeOff className="h-4 w-4" />
                            {hideBalances ? "Show Balances" : "Hide Balances"}
                        </button>
                    </div>
                </div>

                {/* Currency Tabs */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="w-full lg:w-auto">
                        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setSelectedCurrency(tab.name as Currency)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${selectedCurrency === tab.name
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}>
                                    {tab.icon} {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wallet Cards */}
                {activeWallet && (
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between w-full">
                        <div className="flex flex-row items-center justify-start gap-5 w-full py-3 overflow-x-auto scroll-smooth !scrollbar-hide">
                            {/* Current Balance Card */}
                            <div className="flex-shrink-0 px-4 py-3 rounded-lg bg-[#d3eaff] w-[300px] h-[150px] gap-4 flex flex-col items-start justify-between">
                                <div className="flex flex-col items-start justify-start">
                                    <div className="text-2xl">
                                        {hideBalances
                                            ? "•••••"
                                            : `${currencySymbols[activeWallet.currency]}850,000.00`}
                                    </div>
                                    <div className="text-xs uppercase">Total Balance</div>
                                </div>
                                {/** <Button variant="outline">View Spent</Button> */}
                            </div>

                            {/* Pending Payment Card */}
                            {activeWallet.currency !== Currency.NGN &&
                                <div className="flex-shrink-0 px-4 py-3 rounded-lg bg-slate-300 w-[300px] h-[150px] gap-4 flex flex-col items-start justify-between">
                                    <div className="flex flex-col items-start justify-start">
                                        <div className="text-2xl">
                                            {hideBalances
                                                ? "•••••"
                                                : `${currencySymbols[activeWallet.currency]}0.00`}
                                        </div>
                                        <div className="text-xs uppercase">Pending Payments</div>
                                    </div>
                                    <Button variant="outline">
                                        <a href={`/dashboard/${activeWallet.currency}/transactions?status=pending`} className="text-xs uppercase">View Payments</a>
                                    </Button>
                                </div>
                            }

                            {activeWallet.currency !== Currency.NGN &&
                                <div className="flex-shrink-0 px-4 py-3 rounded-lg bg-[#ffe8c3] w-[300px] h-[150px] gap-4 flex flex-col items-start justify-between">
                                    <div className="flex flex-col items-start justify-start">
                                        <div className="text-2xl">
                                            {hideBalances
                                                ? "•••••"
                                                : `0`}
                                        </div>
                                        <div className="text-xs uppercase">Total Recipient</div>
                                    </div>
                                    <Button variant="outline">View Recipient</Button>
                                </div>
                            }
                        </div>
                    </div>
                )}

                <div className="flex flex-row items-center justify-start gap-2">
                    <Button variant="outline"><Plus className="h-4 w-4" /> Deposit</Button>
                    <Button variant="outline"><ArrowLeftRight className="h-4 w-4" /> Swap</Button>
                    {selectedCurrency === Currency.NGN
                        ? <Button variant="default" size="sm" className="text-white"><Send className="h-4 w-4" /> Withdraw</Button>
                        : <Button variant="default" size="sm" className="text-white"><Send className="h-4 w-4" /> Transfer</Button>}
                </div>

                {/*
                <div className="w-full h-[250px] md:h-[100px] px-4 py-4 border rounded-lg">
                    <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between">
                        
                        <div className="flex h-full w-full md:w-auto flex-col lg:flex-row items-center justify-start gap-[20px] md:gap-[100px] ">
                            <div className="w-full md:w-auto flex flex-col items-start justify-start">
                                <div className="text-2xl">
                                    {hideBalances
                                        ? "•••••"
                                        : `${currencySymbols[selectedCurrency]}${(0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                </div>
                                <div className="text-xs uppercase">Total BALANCE</div>
                            </div>
                            <div className="h-[1px] md:h-full w-full md:w-[1px] bg-slate-200"></div>
                            <div className="w-full md:w-auto flex flex-col items-start justify-start">
                                <div className="text-2xl">
                                    {hideBalances
                                        ? "•••••"
                                        : `${currencySymbols[selectedCurrency]}${(0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                </div>
                                <div className="text-xs uppercase">Available Balance</div>
                            </div>
                        </div>
                        
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Button variant="outline"><ArrowLeftRight className="h-4 w-4" /> Swap</Button>
                            <Button variant="outline"><Plus className="h-4 w-4" /> Deposit</Button>
                            {selectedCurrency === Currency.NGN
                                ? <Button variant="default" size="sm" className="text-white"><Send className="h-4 w-4" /> Withdraw</Button>
                                : <Button variant="default" size="sm" className="text-white"><Send className="h-4 w-4" /> Transfer</Button>}
                        </div>
                    </div>
                </div>
                */}
            </div>
        </div>
    )
}