import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/v1/components/ui/card";
import { CheckCircle, Copy, ArrowDown, Building, Network, Wallet2, AlertTriangle, LoaderIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import { Button } from "@/v1/components/ui/button";
import { QRCode } from 'react-qrcode-logo';
import { toast } from "sonner";
import { session, SessionData } from "@/v1/session/session";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/v1/components/ui/dialog";
import { motion } from "framer-motion";
import { IResponse, IWallet } from "@/v1/interface/interface";
import { Fiat, Status } from "@/v1/enums/enums";
import { usePathname } from "wouter/use-browser-location";
import BVNVerification from "./bvnverification";
import Defaults from "@/v1/defaults/defaults";
import { ILoginFormProps } from "../auth/login-form";

export function DepositView() {
    const [isCreatingWallet, setIsCreatingWallet] = useState(false);
    const ss: SessionData = session.getUserData();
    const [selectedCurrency, setSelectedCurrency] = useState<IWallet | null>(null);
    const [usdToken, setUsdToken] = useState("USDT");
    const [network, setNetwork] = useState("");
    const [_selectedDepositOption, setSelectedDepositOption] = useState<any>(null);
    const [activated, _setActivated] = useState<boolean>(false);

    const [successfulDeposit, setSuccessfulDeposit] = useState(false);
    const [depositResponse, setDepositResponse] = useState<{ status: string; amount: number; currency: string } | null>(null);
    const [isCheckingDeposits, setIsCheckingDeposits] = useState(false);

    const intervalRef = useRef<number | null>(null);

    const pathname = usePathname()
    const parts = pathname ? pathname.split('/') : []
    const wallet = (parts[2] || Fiat.NGN).toUpperCase()

    useEffect(() => {
        const wallets: Array<IWallet> = ss.wallets || [];
        const sel = wallets.find(w => w.currency === wallet) || null;
        setSelectedCurrency(sel);

        if (sel && Array.isArray(sel.deposit) && sel.deposit.length > 0) {
            if (sel.currency !== Fiat.NGN) {
                const usdtOptions = sel.deposit.filter(d => d.currency === "USDT");
                if (usdtOptions.length > 0) {
                    setUsdToken("USDT");
                    setNetwork(usdtOptions[0].network);
                    setSelectedDepositOption(usdtOptions[0]);
                } else {
                    const first = sel.deposit[0] as any;
                    setUsdToken(first.currency);
                    setNetwork(first.network);
                    setSelectedDepositOption(first);
                }
            } else {
                const first = sel.deposit[0] as any;
                const defaultVal = first.institution ?? first.currency ?? first.network ?? usdToken;
                setUsdToken(defaultVal);
                setSelectedDepositOption(first);
            }
        }
    }, [wallet]);

    const supportedCryptocurrencies = [
        { currency: "USDT", icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
        { currency: "USDC", icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" }
    ];

    const allSupportedNetworks = [
        { network: "ETH", name: "Ethereum", icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
        { network: "MATIC", name: "Polygon", icon: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" },
        { network: "BNB", name: "BSC", icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
        { network: "TRX", name: "Tron", icon: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png" },
        { network: "SOL", name: "Solana", icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png" }
    ];

    const getAvailableNetworks = () => {
        if (usdToken === "USDC") {
            return allSupportedNetworks.filter(net => !["TRX", "ETH",].includes(net.network));
        }
        return allSupportedNetworks;
    };

    const findWalletDeposit = () => {
        if (!selectedCurrency?.deposit || !usdToken || !network) return null;

        return selectedCurrency.deposit.find(
            deposit => deposit.currency === usdToken && deposit.network === network
        );
    };

    const handleCryptoChange = (cryptoValue: string) => {
        setUsdToken(cryptoValue);
        const availableNetworks = cryptoValue === "USDC"
            ? allSupportedNetworks.filter(net => !["TRX", "ETH"].includes(net.network))
            : allSupportedNetworks;

        if (network && !availableNetworks.some(net => net.network === network)) {
            setNetwork("");
            setSelectedDepositOption(null);
        }
    };

    const handleNetworkChange = (networkValue: string) => {
        setNetwork(networkValue);
        const depositOption = findWalletDeposit();
        if (depositOption) {
            setSelectedDepositOption(depositOption);
        }
    };

    const createWallet = async () => {
        if (!usdToken || !network) {
            toast.error("Please select both currency and network");
            return;
        }

        try {
            setIsCreatingWallet(true);
            const response = await fetch(`${Defaults.API_BASE_URL}/wallet/create`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': ss.client.publicKey,
                    'x-rojifi-deviceid': ss.deviceid,
                    'Authorization': `Bearer ${ss.authorization}`,
                },
                body: JSON.stringify({
                    currency: usdToken,
                    network: network,
                    senderId: ss.sender._id,
                })
            });

            const data: IResponse = await response.json();
            if (data.status === Status.ERROR) throw new Error(data.error || data.message);
            if (data.status === Status.SUCCESS) {
                const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
                    method: "GET",
                    headers: {
                        ...Defaults.HEADERS,
                        "x-rojifi-handshake": ss.client.publicKey,
                        "x-rojifi-deviceid": ss.deviceid,
                        Authorization: `Bearer ${ss.authorization}`,
                    },
                });

                const userdata: IResponse = await userres.json();
                if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
                if (userdata.status === Status.SUCCESS) {
                    if (!userdata.handshake) throw new Error("Invalid Server Response");
                    const parseData: ILoginFormProps = Defaults.PARSE_DATA(
                        userdata.data,
                        ss.client.privateKey,
                        userdata.handshake
                    );
                    session.updateSession({
                        ...ss,
                        user: parseData.user,
                        wallets: parseData.wallets,
                        transactions: parseData.transactions,
                        sender: parseData.sender,
                    });

                    setSelectedCurrency(parseData.wallets.find(w => w.currency === wallet) || null);
                    toast.success("Wallet created successfully!");
                }
            }
        } catch (error: any) {
            toast.error((error as Error).message || "Error creating wallet");
            console.error("Create wallet error:", error);
        } finally {
            setIsCreatingWallet(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    // Get the deposit address or account details
    const getDepositDetails = () => {
        if (selectedCurrency?.currency === Fiat.NGN) {
            const bankOption = selectedCurrency.deposit.find(d => d.institution === usdToken);
            return {
                label: "Account Number",
                value: bankOption?.accountNumber || "0123456789",
                accountName: "John Doe",
                institution: bankOption?.institution || "First Bank",
                icon: bankOption?.icon
            };
        } else {
            const cryptoOption = selectedCurrency?.deposit.find(
                d => d.currency === usdToken && d.network === network
            );
            return {
                label: `${network} Address`,
                value: cryptoOption?.address || "",
                network: network,
                currency: usdToken,
                icon: cryptoOption?.icon
            };
        }
    };

    // API function to check for deposits
    const checkForDeposits = async () => {
        if (isCheckingDeposits) return;

        setIsCheckingDeposits(true);
        try {

            const response = await fetch(`${Defaults.API_BASE_URL}/wallet/deposit`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': ss.client.publicKey,
                    'x-rojifi-deviceid': ss.deviceid,
                    'Authorization': `Bearer ${ss.authorization}`,
                },
            });

            const data: IResponse = await response.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                const { status } = data.data;

                if (status === 'success') {
                    setDepositResponse(data.data);
                    setSuccessfulDeposit(true);
                }

                const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
                    method: 'GET',
                    headers: {
                        ...Defaults.HEADERS,
                        'x-rojifi-handshake': ss.client.publicKey,
                        'x-rojifi-deviceid': ss.deviceid,
                        Authorization: `Bearer ${ss.authorization}`,
                    },
                });

                const userdata: IResponse = await userres.json();
                if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
                if (userdata.status === Status.SUCCESS) {
                    if (!userdata.handshake) throw new Error('Invalid Response');
                    const parseData: ILoginFormProps = Defaults.PARSE_DATA(userdata.data, ss.client.privateKey, userdata.handshake);

                    session.updateSession({
                        ...ss,
                        user: parseData.user,
                        wallets: parseData.wallets,
                        transactions: parseData.transactions,
                        sender: parseData.sender,
                    });

                    setSelectedCurrency(parseData.wallets.find(w => w.currency === wallet) || null);
                }
            }
        } catch (error) {
            console.error('Error checking deposits:', error);
        } finally {
            setIsCheckingDeposits(false);
        }
    };

    useEffect(() => {
        // start checking for deposits every 30 seconds
        intervalRef.current = window.setInterval(() => {
            checkForDeposits();
        }, 60_000);

        // cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    const depositDetails = getDepositDetails();

    if (!activated && selectedCurrency?.currency === Fiat.NGN) {
        return <BVNVerification />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Premium Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{
                                    y: [0, -5, 0],
                                    rotateY: [0, 180, 360]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="p-2 bg-teal-600 rounded-full"
                            >
                                <ArrowDown className="h-5 w-5 text-white" />
                            </motion.div>
                            <div className="text-left">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    Deposit {selectedCurrency?.currency}
                                </h1>
                                <p className="text-sm text-gray-500">Fund your wallet securely</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-emerald-700">Secure</span>
                        </div>
                    </div>
                </motion.div>

                {/* Main Deposit Interface  */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center"
                >
                    <Card className="w-full max-w-4xl border border-gray-200 bg-white/95 backdrop-blur-sm">
                        <CardContent className="p-0">
                            {/* Header Section */}
                            <div className="px-8 py-6 bg-emerald-600 text-white rounded-t-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                            <img src={selectedCurrency?.icon} alt="" className="w-7 h-7 rounded-full" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">Deposit {selectedCurrency?.currency}</h2>
                                            <p className="text-emerald-100 text-sm">
                                                {selectedCurrency?.currency === Fiat.NGN ? 'Bank Transfer' : 'Dollar Deposit to your account'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-100 text-sm">Current Balance</p>
                                        <p className="text-xl font-bold">{selectedCurrency?.symbol}{selectedCurrency?.balance.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-8">
                                {selectedCurrency?.currency === Fiat.NGN ? (
                                    /* NGN Bank Deposit Section */
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-emerald-600" />
                                                    Select Bank
                                                </label>
                                                <Select value={usdToken} onValueChange={setUsdToken}>
                                                    <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 transition-colors">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedCurrency?.deposit.map((token, idx) => (
                                                            <SelectItem key={idx} value={token.institution}>
                                                                <div className="flex items-center gap-3">
                                                                    <img src={token.icon} alt="" width={20} height={20} className="rounded-full" />
                                                                    <span className="font-medium">{token.institution}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/*}
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div className="text-sm text-blue-800">
                                                        <p className="font-medium mb-1">Important Notice</p>
                                                        <p>Only send funds from a Nigerian bank account registered in your name. Third-party transfers will be rejected.</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                            */}

                                            <div className="space-y-4">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-700">Account Number</label>
                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                                        <span className="flex-1 font-mono text-lg font-semibold">{depositDetails.value}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(depositDetails.value)}
                                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-700">Account Name</label>
                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                                        <span className="flex-1 font-semibold">{depositDetails.accountName}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(depositDetails.accountName!)}
                                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                <LoaderIcon className={`h-4 w-4 ${isCheckingDeposits ? 'animate-spin' : ''}`} />
                                                <span>Monitoring for incoming deposits...</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={checkForDeposits}
                                                    disabled={isCheckingDeposits}
                                                    className="ml-auto text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                                                >
                                                    {isCheckingDeposits ? 'Checking...' : 'Check Now'}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-center lg:justify-end">
                                            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                                                <QRCode
                                                    value={depositDetails.value}
                                                    size={220}
                                                    logoImage="/favicon.png"
                                                    logoPaddingRadius={120}
                                                    logoWidth={45}
                                                    removeQrCodeBehindLogo={true}
                                                    qrStyle="squares"
                                                    eyeRadius={8}
                                                />
                                                <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                                                    Scan to copy account number
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Cryptocurrency Deposit Section */
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Wallet2 className="h-4 w-4 text-emerald-600" />
                                                        Cryptocurrency
                                                    </label>
                                                    <Select value={usdToken} onValueChange={handleCryptoChange}>
                                                        <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 transition-colors">
                                                                <SelectValue placeholder="Select cryptocurrency" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                                {supportedCryptocurrencies.map((crypto, idx) => (
                                                                    <SelectItem key={idx} value={crypto.currency}>
                                                                    <div className="flex items-center gap-3">
                                                                            <img src={crypto.icon} alt="" width={20} height={20} className="rounded-full" />
                                                                            <span className="font-medium">{crypto.currency}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Network className="h-4 w-4 text-emerald-600" />
                                                        Network
                                                    </label>
                                                        <Select value={network} onValueChange={handleNetworkChange} disabled={!usdToken}>
                                                        <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 transition-colors">
                                                                <SelectValue placeholder="Select network" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                                {getAvailableNetworks().map((net, idx) => (
                                                                    <SelectItem key={idx} value={net.network}>
                                                                    <div className="flex items-center gap-3">
                                                                            <img src={net.icon} alt="" width={20} height={20} className="rounded-full" />
                                                                            <span className="font-medium">{net.name}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                                {usdToken && network && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                                            <div className="text-sm text-amber-800">
                                                                <p className="font-medium mb-1">Network Warning</p>
                                                                <p>Only send <span className="font-semibold">{usdToken}</span> on the <span className="font-semibold">{
                                                                    network === "MATIC" ? "Polygon (MATIC)" :
                                                                        network === "BNB" ? "BSC (BNB)" :
                                                                            network === "ETH" ? "Ethereum (ETH)" :
                                                                                network === "TRX" ? "Tron (TRX)" :
                                                                                    network === "SOL" ? "Solana (SOL)" :
                                                                                        network
                                                                }</span> network. Wrong network transfers cannot be recovered.</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Show deposit details if wallet exists, otherwise show create wallet */}
                                                {findWalletDeposit() ? (
                                                    <>
                                                        <div className="space-y-3">
                                                            <label className="text-sm font-semibold text-gray-700">Deposit Address</label>
                                                            <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                                                <span className="flex-1 font-mono text-sm break-all">{depositDetails.value}</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleCopy(depositDetails.value)}
                                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 flex-shrink-0"
                                                                >
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                            <LoaderIcon className={`h-4 w-4 ${isCheckingDeposits ? 'animate-spin' : ''}`} />
                                                            <span>Monitoring blockchain for deposits...</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={checkForDeposits}
                                                                disabled={isCheckingDeposits}
                                                                className="ml-auto text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                                                            >
                                                                {isCheckingDeposits ? 'Checking...' : 'Check Now'}
                                                            </Button>
                                                        </div>
                                                    </>
                                                ) : usdToken && network ? (
                                                    /* Create Wallet Component */
                                                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                                                        <div className="text-center space-y-4">
                                                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                                                <Wallet2 className="h-8 w-8 text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                                    Create {usdToken} Wallet
                                                                </h3>
                                                                <p className="text-sm text-gray-600 mb-4">
                                                                    No {usdToken} wallet found on {network} network. Create one to start receiving deposits.
                                                                </p>
                                                            </div>
                                                            <Button
                                                                onClick={createWallet}
                                                                disabled={isCreatingWallet}
                                                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            >
                                                                {isCreatingWallet ? (
                                                                    <>
                                                                        <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                                                                        Creating Wallet...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Wallet2 className="h-4 w-4 mr-2" />
                                                                        Create Wallet
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                                                        <div className="text-center space-y-4">
                                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                                <Wallet2 className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                                                    Select Currency & Network
                                                                </h3>
                                                                <p className="text-sm text-gray-500">
                                                                    Please select both cryptocurrency and network to view or create your wallet.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>

                                        <div className="flex justify-center lg:justify-end">
                                                {findWalletDeposit() && (
                                                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                                                        <QRCode
                                                            value={depositDetails.value}
                                                            size={220}
                                                            logoImage="/favicon.png"
                                                            logoPaddingRadius={120}
                                                            logoWidth={45}
                                                            removeQrCodeBehindLogo={true}
                                                            qrStyle="squares"
                                                            eyeRadius={8}
                                                        />
                                                        <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                                                            Scan to copy address
                                                        </p>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 max-w-4xl mx-auto">
                    <Button
                        variant="outline"
                        className="px-8 py-3 h-auto border-2 hover:bg-gray-50"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                    <Button
                        className="px-8 py-3 h-auto bg-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        onClick={() => window.location.href = `/dashboard/${wallet}`}
                    >
                        View Dashboard
                    </Button>
                </div>
            </div>

            {/* Enhanced Success Dialog */}
            <Dialog open={successfulDeposit} onOpenChange={setSuccessfulDeposit}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="mx-auto"
                        >
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                        </motion.div>
                        <div className="space-y-2">
                            <DialogTitle className="text-xl font-bold">Deposit Successful!</DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Your {depositResponse?.currency || selectedCurrency?.currency} wallet has been credited with {selectedCurrency?.symbol}{depositResponse?.amount?.toLocaleString() || '0'}.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:flex-row pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setSuccessfulDeposit(false)}
                            className="flex-1"
                        >
                            Close
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                            onClick={() => window.location.href = `/dashboard/${wallet}`}
                        >
                            View Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
