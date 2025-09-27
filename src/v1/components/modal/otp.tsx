"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/v1/components/ui/button"
import { X, MailOpen, Clock, Loader } from "lucide-react"
import { Status } from "@/v1/enums/enums"
import { IResponse } from "@/v1/interface/interface"
import Defaults from "@/v1/defaults/defaults"
import { session, SessionData } from "@/v1/session/session"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/v1/components/ui/input-otp"

// OTP Timer Configuration - Change this value to adjust the countdown duration
const OTP_TIMER_SECONDS = 120; // 2 minutes in seconds

interface OTPVerificationFormProps {
    email: string
    isOpen: boolean
    onClose: () => void;
    onSuccess: () => void;
    id: string;
    resend: () => void;
}

export function OTPVerificationModal({ email, isOpen, onClose, id, onSuccess, resend }: OTPVerificationFormProps) {
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState(OTP_TIMER_SECONDS)
    const [_canResend, setCanResend] = useState(false)
    const sd: SessionData = session.getUserData();

    // Timer countdown effect
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    // Reset timer when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeLeft(OTP_TIMER_SECONDS);
            setCanResend(false);
            setOtp("");
            setError(null);
        }
    }, [isOpen]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleResendOTP = async () => {
        try {
            setIsResending(true);
            setError(null);

            // Call the resend function passed from parent component
            await resend();

            // Reset timer and form state
            setTimeLeft(OTP_TIMER_SECONDS);
            setCanResend(false);
            setOtp("");
        } catch (err: any) {
            setError(err.message || "Failed to resend OTP. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!email) {
            setIsLoading(false)
            setError("Email is required for verification")
            return
        }

        if (otp.length !== 4) {
            setError("Please enter a complete 4-digit OTP")
            return
        }

        try {
            setIsLoading(true)

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/email/verify`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: id,
                    email: email,
                    otp: otp
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || "Invalid OTP. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8 relative border">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MailOpen size={24} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                    <p className="text-gray-600 text-sm">
                        We've sent a 4-digit code to <span className="font-medium text-gray-900">{email}</span>
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* OTP Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 text-center">
                            Enter verification code
                        </label>
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={4}
                                value={otp}
                                onChange={(value) => {
                                    setOtp(value);
                                    setError(null);
                                }}
                                className="gap-3" // Optional: increase gap between groups
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="w-14 h-14 text-xl" />
                                    <InputOTPSlot index={1} className="w-14 h-14 text-xl" />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={2} className="w-14 h-14 text-xl" />
                                    <InputOTPSlot index={3} className="w-14 h-14 text-xl" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </div>

                    {/* Timer and Resend */}
                    <div className="text-center">
                        {timeLeft > 0 ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                <Clock size={16} className="text-gray-400" />
                                <span>Code expires in {formatTime(timeLeft)}</span>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600">
                                <span>Didn't receive the code? </span>
                                <button
                                    type="button"
                                        onClick={handleResendOTP}
                                        disabled={isResending}
                                        className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                                    >
                                        {isResending && <Loader size={14} className="animate-spin" />}
                                        {isResending ? "Sending..." : "Resend code"}
                                    </button>
                                </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                        disabled={isLoading || otp.length !== 4}
                    >
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Having trouble? Check your spam folder or contact support.
                    </p>
                </div>
            </div>
        </div>
    )
}
