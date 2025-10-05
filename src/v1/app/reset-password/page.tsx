import type React from "react"
import { useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Link, useParams } from "wouter"
import { Logo } from "@/v1/components/logo"
import { AuthSidebar } from "@/v1/components/auth/auth-sidebar"
import { toast } from "sonner"
import Defaults from "@/v1/defaults/defaults"
import { session, SessionData } from "@/v1/session/session"
import { Status } from "@/v1/enums/enums"
import { IResponse } from "@/v1/interface/interface"

export default function ResetPasswordPage() {
    const { id } = useParams()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPasswordMatching, setIsPasswordMatching] = useState(true)
    const [passwordValidation, setPasswordValidation] = useState({
        hasLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
    });
    const sd: SessionData = session.getUserData();

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })

    // Password validation function
    const validatePassword = (password: string) => {
        return {
            hasLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        }
    }

    // Check if password is fully valid
    const isPasswordValid = () => {
        return Object.values(passwordValidation).every(Boolean)
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))

        // Real-time password validation
        if (field === "password") {
            const validation = validatePassword(value)
            setPasswordValidation(validation)
            // Check if confirm password still matches
            if (formData.confirmPassword) {
                setIsPasswordMatching(value === formData.confirmPassword)
            }
        }

        // Real-time confirm password validation
        if (field === "confirmPassword") {
            setIsPasswordMatching(formData.password === value)
        }

        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!isPasswordValid()) {
            setError("Password does not meet all requirements")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match")
            return
        }

        try {
            setIsLoading(true)
            console.log("Resetting password for id:", id)

            const response = await fetch(`${Defaults.API_BASE_URL}/auth/reset`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    hash: id,
                    password: formData.password,
                    confirmedPassword: formData.confirmPassword
                }),
            });

            const data: IResponse = await response.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                setIsCompleted(true)
                toast.success("Password reset successfully!")
            }
        } catch (err: any) {
            setError(err.message || "Failed to reset password")
        } finally {
            setIsLoading(false)
        }
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

                        {isCompleted ? (
                            <div className="text-center">
                                {/* Success Icon */}
                                <div className="flex justify-center mb-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="mb-8">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successfully</h1>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Your password has been reset successfully. You can now login with your new password.
                                    </p>
                                </div>

                                {/* Action Button */}
                                <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white">
                                    <Link href="/login">Continue to Login</Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
                                    <p className="text-gray-600">
                                        Enter your new password below to reset your account password.
                                    </p>
                                </div>

                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div>
                                        <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                required
                                                className="pl-10 pr-10 h-12"
                                                placeholder="Enter new password"
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
                                        {formData.password && !isPasswordValid() && (
                                            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                                                <ul className="space-y-1 text-xs">
                                                    <li className={`flex items-center space-x-2 ${passwordValidation.hasLength ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`w-1 h-1 rounded-full ${passwordValidation.hasLength ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                        <span>At least 8 characters</span>
                                                    </li>
                                                    <li className={`flex items-center space-x-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`w-1 h-1 rounded-full ${passwordValidation.hasUppercase ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                        <span>One uppercase letter</span>
                                                    </li>
                                                    <li className={`flex items-center space-x-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`w-1 h-1 rounded-full ${passwordValidation.hasLowercase ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                        <span>One lowercase letter</span>
                                                    </li>
                                                    <li className={`flex items-center space-x-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`w-1 h-1 rounded-full ${passwordValidation.hasNumber ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                        <span>One number</span>
                                                    </li>
                                                    <li className={`flex items-center space-x-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`w-1 h-1 rounded-full ${passwordValidation.hasSpecial ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                        <span>One special character</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                required
                                                className="pl-10 pr-10 h-12"
                                                placeholder="Confirm new password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                            />
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {formData.confirmPassword && !isPasswordMatching && (
                                            <p className="mt-1 text-sm text-red-500">Passwords don't match</p>
                                        )}
                                    </div>

                                    {error && (
                                        <p className="text-sm text-red-500 text-center">{error}</p>
                                    )}

                                    <div className="space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                            disabled={isLoading || !isPasswordValid() || !isPasswordMatching}
                                        >
                                            {isLoading ? "Resetting..." : "Reset Password"}
                                        </Button>
                                    </div>

                                    <div className="text-center">
                                        <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to login
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
