import React, { useState, useEffect } from "react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/v1/components/logo";
import { session, SessionData } from "@/v1/session/session";
import Defaults from "@/v1/defaults/defaults";
import {
    IPGeolocation,
    IResponse,
    ISender,
    ITeamMember,
    ITransaction,
    IUser,
    IWallet,
} from "@/v1/interface/interface";
import { Status } from "@/v1/enums/enums";
import { AuthSidebar } from "./auth-sidebar";
import TwoFactorLoginModal from "../twofa/login-modal";
import OTPLoginModal from "../twofa/otp-modal";
import LocalSession from "@/v1/session/local";
import { Alert } from "../ui/alert";

interface ILocation {
    country: string;
    state: string;
    city: string;
    ip: string;
}

export interface ILoginFormProps {
    user: IUser;
    wallets: Array<IWallet>;
    transactions: Array<ITransaction>;
    sender: ISender;
    member: ITeamMember | null;
}

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<ILocation>({
        country: "",
        state: "",
        city: "",
        ip: "",
    });
    const [formData, setFormData] = useState({
        email: "", //
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [twoFaModal, setTwoFaModal] = useState(false);
    const [twoFaCode, setTwoFaCode] = useState("");
    const [otpModal, setOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpResending, setOtpResending] = useState(false);
    const [requiresBoth, setRequiresBoth] = useState(false); // Track if both OTP and 2FA are needed
    const passwordInputRef = React.useRef<HTMLInputElement>(null);
    const storage: SessionData = session.getUserData();

    useEffect(() => {
        if (storage && storage.location) {
            console.log("Using stored location from session.", storage.location);
            setLocation({
                country: storage.location.country_name,
                state: storage.location.region,
                city: storage.location.city,
                ip: storage.location.ip,
            });
            return;
        } else {
            getLocationFromIP();
        }
    }, []);

    async function getBrowserFingerprint(): Promise<string> {
        const data = {
            ua: navigator.userAgent,
            lang: navigator.language,
            plat: navigator.platform,
            hw: navigator.hardwareConcurrency,
            mem: (navigator as any).deviceMemory,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        const raw = JSON.stringify(data);
        const buffer = new TextEncoder().encode(raw);
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const finalHash = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        return finalHash;
    }

    const getLocationFromIP = async () => {
        try {
            const res = await fetch("https://ipapi.co/json/", {
                headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error("Network response was not ok");
            const data = await res.json();

            if (data) {
                const geoLoaction: IPGeolocation = data as IPGeolocation;
                const location: ILocation = {
                    country: data.country_name,
                    state: data.region,
                    city: data.city,
                    ip: data.ip,
                };

                setLocation(location);
                session.login({ ...storage, location: geoLoaction });
            }
        } catch (error) {
            console.error("Unable to fetch location from IP!", error);
            return null;
        }
    };

    const handleSubmit = async (
        e?: React.FormEvent,
        providedCode?: string,
        providedOtp?: string
    ) => {
        if (e && typeof e.preventDefault === "function") {
            e.preventDefault();
        }

        try {
            await LocalSession.init();

            const deviceFingerprint: string = await getBrowserFingerprint();
            setError(null);
            setIsLoading(true);
            const code = providedCode || twoFaCode;
            const otp = providedOtp || otpCode;
            const payload: any = {
                email: formData.email,
                password: formData.password,
                code: code,
                otp: otp,
            };

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    "x-rojifi-location": location
                        ? `${location.state}, ${location.country}`
                        : "Unknown",
                    "x-rojifi-ip": location?.ip || "Unknown",
                    "x-rojifi-devicename": deviceFingerprint,
                },
                body: JSON.stringify(payload),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake)
                    throw new Error(
                        "Unable to process login response right now, please try again."
                    );
                const parseData = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );
                const authorization = parseData.authorization;

                const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
                    method: "GET",
                    headers: {
                        ...Defaults.HEADERS,
                        "x-rojifi-handshake": storage.client.publicKey,
                        "x-rojifi-deviceid": storage.deviceid,
                        Authorization: `Bearer ${authorization}`,
                    },
                });

                const userdata: IResponse = await userres.json();
                if (userdata.status === Status.ERROR)
                    throw new Error(userdata.message || userdata.error);
                if (userdata.status === Status.SUCCESS) {
                    if (!userdata.handshake)
                        throw new Error(
                            "Unable to process login response right now, please try again."
                        );
                    const parseData: ILoginFormProps = Defaults.PARSE_DATA(
                        userdata.data,
                        storage.client.privateKey,
                        userdata.handshake
                    );

                    toast.success("Login successful!");

                    session.login({
                        ...storage,
                        authorization: authorization,
                        isLoggedIn: true,
                        user: parseData.user,
                        wallets: parseData.wallets,
                        transactions: parseData.transactions,
                        sender: parseData.sender,
                        member: parseData.member || null,
                        devicename: deviceFingerprint,
                    });

                    const primaryWallet: IWallet | undefined = parseData.wallets.find(
                        (w) => w.isPrimary
                    );
                    if (primaryWallet) {
                        window.location.href = `/dashboard/USD`; // `/dashboard/${primaryWallet.currency}`;
                    } else {
                        window.location.href = `/dashboard/USD`;
                    }
                }
            }
        } catch (err: any) {
            console.error("Login error: ", err.message);
            if (err.message === "Please provide 2FA Authentication code") {
                setRequiresBoth(false);
                setTwoFaModal(true);
            } else if (err.message === "OTP and 2FA Required") {
                setRequiresBoth(true);
                setOtpModal(true);
            } else if (err.message === "OTP Required") {
                setRequiresBoth(false);
                setOtpModal(true);
            } else if (
                err.message === "OTP Exipred, please request again" ||
                err.message === "Invalid OTP"
            ) {
                toast.error(err.message || "OTP Expired, please request again.");
                setOtpCode("");
                setOtpModal(true);
                setRequiresBoth(false);
                setError(null);
            } else {
                const errMsg = (err as Error).message;
                setError(errMsg === "Failed to fetch" ? "Network error, please try again." : errMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handle2FASubmit = (code: string) => {
        setTwoFaCode(code);
        setTwoFaModal(false);
        // Trigger login again with the 2FA code (and OTP if we have it)
        handleSubmit(undefined, code, otpCode);
    };

    const handle2FACancel = () => {
        setTwoFaCode("");
        setTwoFaModal(false);
        // Also reset OTP state if we were in a dual flow
        setOtpCode("");
        setRequiresBoth(false);
        setError(null);
    };

    const handleOTPSubmit = (code: string) => {
        setOtpCode(code);
        setOtpModal(true); //change to true to keep modal open after submit

        if (requiresBoth) {
            // If both OTP and 2FA are required, open 2FA modal next
            setTwoFaModal(true);
        } else {
            // If only OTP is required, submit immediately
            handleSubmit(undefined, twoFaCode, code);
        }
    };

    const handleOTPCancel = () => {
        setOtpCode("");
        setOtpModal(false);
        setRequiresBoth(false);
        setError(null);
    };

    const handleOTPResend = async () => {
        try {
            setOtpResending(true);

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/resend-otp`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) {
                throw new Error(data.message || data.error);
            }

            if (data.status === Status.SUCCESS) {
                toast.success("OTP sent successfully!");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to resend OTP. Please try again.");
        } finally {
            setOtpResending(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-md mx-auto">
                        <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                            <a href="/" className="flex items-center space-x-2">
                                <Logo className="h-8 w-auto" />
                            </a>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Sign in to Rojifi
                            </h1>
                            <p className="text-gray-600">We are glad to have you back</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/** show error here */}
                            {error && (
                                <Alert
                                    className="mb-4 flex items-start justify-between px-4 py-3 bg-red-50 border border-red-200 rounded"
                                    role="alert"
                                    aria-live="assertive"
                                >
                                    <div className="flex items-start">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-red-600 mr-3 flex-shrink-0"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M12 9v2m0 4h.01" />
                                            <path d="M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                                        </svg>

                                        <div className="text-sm text-red-700">
                                            {error}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setError(null)}
                                        className="ml-4 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none"
                                        aria-label="Dismiss error"
                                    >
                                        Dismiss
                                    </button>
                                </Alert>
                            )}

                            <div>
                                <Label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Email address <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="pl-10 h-12"
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "email",
                                                String(e.target.value).toLowerCase()
                                            )
                                        }
                                    />
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <Label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        ref={passwordInputRef}
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="pl-10 pr-10 h-12"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleInputChange("password", e.target.value)
                                        }
                                    />
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            const input = passwordInputRef.current;
                                            const cursorPosition = input?.selectionStart ?? 0;
                                            setShowPassword(!showPassword);
                                            // Restore cursor position after React re-renders
                                            setTimeout(() => {
                                                if (input) {
                                                    input.setSelectionRange(cursorPosition, cursorPosition);
                                                }
                                            }, 0);
                                        }}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <div className="text-right mt-2">
                                    <a
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:text-primary/80"
                                    >
                                        Forgot Password?
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing in..." : "Sign in"}
                                </Button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Don't have an account?{" "}
                                <a
                                    href="/request-access"
                                    className="text-primary hover:text-primary/80 font-medium"
                                >
                                    Request Access
                                </a>
                            </div>
                        </form>
                    </div>
                </div>

                <AuthSidebar />
            </div>
            <TwoFactorLoginModal
                open={twoFaModal}
                loading={isLoading}
                onSubmit={handle2FASubmit}
                onCancel={handle2FACancel}
            />
            <OTPLoginModal
                open={otpModal}
                loading={isLoading}
                onSubmit={handleOTPSubmit}
                onCancel={handleOTPCancel}
                reSendOTP={handleOTPResend}
                resending={otpResending}
            />
        </div>
    );
}
