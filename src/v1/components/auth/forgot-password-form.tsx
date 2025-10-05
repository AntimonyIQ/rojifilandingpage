
import type React from "react"
import { useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Mail, ArrowLeft } from "lucide-react"
import { Link } from "wouter"

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            setIsLoading(false)
            setIsSubmitted(true)
        } catch (err: any) {
            setIsLoading(false)
            setError(err.message || "Failed to send password reset link")
        }
    }

    if (isSubmitted) {
        return (
            <div className="w-full max-w-md mx-auto text-center">
                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" fill="white" />
                            <path
                                d="M8 12L12 16L16 10"
                                stroke="#0C4592"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Email on the way</h1>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                        We've sent a link to your email to reset your password. Please enter the code below to proceed. If you don't
                        see the email in your inbox, check your spam or junk folder.
                    </p>
                </div>

                {/* Action Button */}
                <Button asChild className="w-full max-w-xs h-12 bg-primary hover:bg-primary/90 text-white">
                    <Link href="/login">Return to login</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto text-center">
            {/* Icon */}
            <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V8C6 6.9 6.9 6 8 6H10V4C10 2.9 10.9 2 12 2ZM12 4C11.4 4 11 4.4 11 5V6H13V5C13 4.4 12.6 4 12 4Z"
                            fill="white"
                        />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Forgot password?</h1>
                <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                    It's all good. Enter your account's email address and we will send you a link to reset your password.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="pl-10 h-12 text-center"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <Button
                    type="submit"
                    className="w-full max-w-xs h-12 bg-primary hover:bg-primary/90 text-white"
                    disabled={isLoading}
                >
                    {isLoading ? "Sending..." : "Send reset link"}
                </Button>

                <div className="mt-8">
                    <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Return to login
                    </Link>
                </div>
            </form>
        </div>
    )
}