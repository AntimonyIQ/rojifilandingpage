"use client"
import { OTPVerificationForm } from "@/v1/components/auth/otp-form"

export default function OtpPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <OTPVerificationForm />
        </div>
    )
}
