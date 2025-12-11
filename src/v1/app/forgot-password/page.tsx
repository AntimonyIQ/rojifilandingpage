import type React from "react"
import { useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Mail, ArrowLeft, Check } from "lucide-react"
import { Link } from "wouter"
import { Logo } from "@/v1/components/logo"
import { AuthSidebar } from "@/v1/components/auth/auth-sidebar"
import { session, SessionData } from "@/v1/session/session"
import Defaults from "@/v1/defaults/defaults"
import { Status } from "@/v1/enums/enums"
import { IResponse } from "@/v1/interface/interface"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const sd: SessionData = session.getUserData();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${Defaults.API_BASE_URL}/auth/forget`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({ email }),
            });

            const data: IResponse = await response.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                setIsSubmitted(true)
                setIsLoading(false)
            }
        } catch (err: any) {
            setIsLoading(false)
            setError(err.message || "Failed to send password reset link")
        }
    }

    const handleInputChange = (value: string) => {
        setEmail(value.toLowerCase())
        setError(null)
    }

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-md mx-auto">
                        <div className="mb-8">
                            <a href="/" className="flex items-center space-x-2">
                                <Logo className="h-8 w-auto" />
                            </a>
                        </div>

                        {isSubmitted ? (
                            <div className="text-center">
                                {/* Success Icon */}
                                <div className="flex justify-center mb-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="mb-8">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Email on the way</h1>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        We've sent a link to your email to reset your password. If you don't
                                        see the email in your inbox, check your spam or junk folder.
                                    </p>
                                </div>

                                {/* Action Button */}
                                <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white">
                                    <Link href="/login">Return to login</Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
                                    <p className="text-gray-600">
                                        Enter your account's email address and we will send you a link to reset your password.
                                    </p>
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
                                                placeholder="Enter email address"
                                                value={email}
                                                onChange={(e) => handleInputChange(e.target.value)}
                                            />
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-sm text-red-500 text-center">{error}</p>
                                    )}

                                    <div className="space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Sending..." : "Send reset link"}
                                        </Button>
                                    </div>

                                    <div className="text-center">
                                        <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Return to login
                                        </Link>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                <AuthSidebar />
            </div>
        </div>
    )
}
