import React, { useState, useEffect } from "react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Eye, EyeOff, Mail, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/v1/components/logo";
import { session, SessionData } from "@/v1/session/session";
import Defaults from "@/v1/defaults/defaults";
import { IResponse, ISender, ITransaction, IUser, IWallet } from "@/v1/interface/interface";
import { Status } from "@/v1/enums/enums";

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
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        getLocationFromIP();
    }, []);

    const getLocationFromIP = async () => {
        try {
            const res = await fetch("https://ipapi.co/json/", {
                headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error("Network response was not ok");
            const data = await res.json();

            if (data) {
                const location: ILocation = {
                    country: data.country_name,
                    state: data.region,
                    city: data.city,
                    ip: data.ip,
                };

                setLocation(location);
            }
        } catch (error) {
            console.error("Unable to fetch location from IP!", error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        if (e && typeof e.preventDefault === "function") {
            e.preventDefault();
        }

        try {
            setError(null);
            setIsLoading(true);

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": sd.client.publicKey,
                    "x-rojifi-deviceid": sd.deviceid,
                    "x-rojifi-location": location ? `${location.state}, ${location.country}` : "Unknown",
                    "x-rojifi-ip": location?.ip || "Unknown",
                    "x-rojifi-devicename": sd.devicename,
                },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake)
                    throw new Error("Unable to process login response right now, please try again.");
                const parseData = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                const authorization = parseData.authorization;

                const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
                    method: "GET",
                    headers: {
                        ...Defaults.HEADERS,
                        "x-rojifi-handshake": sd.client.publicKey,
                        "x-rojifi-deviceid": sd.deviceid,
                        Authorization: `Bearer ${authorization}`,
                    },
                });

                const userdata: IResponse = await userres.json();
                if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
                if (userdata.status === Status.SUCCESS) {
                    if (!userdata.handshake)
                        throw new Error("Unable to process login response right now, please try again.");
                    const parseData: ILoginFormProps = Defaults.PARSE_DATA(
                        userdata.data,
                        sd.client.privateKey,
                        userdata.handshake
                    );
                    toast.success("Login successful!");

                    session.login({
                        ...sd,
                        authorization: authorization,
                        isLoggedIn: true,
                        user: parseData.user,
                        wallets: parseData.wallets,
                        transactions: parseData.transactions,
                        sender: parseData.sender,
                    });

                    const primaryWallet: IWallet | undefined = parseData.wallets.find((w) => w.isPrimary);
                    if (primaryWallet) {
                        window.location.href = `/dashboard/${primaryWallet.currency}`;
                    } else {
                        window.location.href = `/dashboard/NGN`;
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || "Login failed, please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
                <a href="/" className="flex items-center space-x-2">
                    <Logo className="h-8 w-auto" />
                </a>
                <a href="/" className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </a>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to Rojifi</h1>
                <p className="text-gray-600">We are glad to have you back</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                            onChange={(e) => handleInputChange("email", String(e.target.value).toLowerCase())}
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div>
                    <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            className="pl-10 pr-10 h-12"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                    <div className="text-right mt-2">
                        <a href="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                            Forgot Password?
                        </a>
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

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
                    <a href="/request-access" className="text-primary hover:text-primary/80 font-medium">
                        Request Access
                    </a>
                </div>
            </form>
        </div>
    );
}
