import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogPortal,
    DialogOverlay,
} from "@/v1/components/ui/dialog";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { toast } from "@/v1/hooks/use-toast";
import { cn } from "@/v1/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import React from "react";
import { Loader } from "lucide-react";
import OTPIllustration from "../../assets/OTP.png";

const CustomDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-6 border bg-background p-8 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                className
            )}
            {...props}
        >
            {children}
        </DialogPrimitive.Content>
    </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";

interface OTPLoginModalProps {
    open: boolean;
    loading?: boolean;
    onSubmit: (code: string) => void;
    onCancel: () => void;
    reSendOTP: () => void;
    resending: boolean;
}

export default function OTPLoginModal({
    open,
    loading = false,
    onSubmit,
    onCancel,
    reSendOTP,
    resending,
}: OTPLoginModalProps) {
    const [code, setCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Start countdown when modal opens
    useEffect(() => {
        if (open) {
            setTimeLeft(30); // Reset to 5 minutes
            setCanResend(false);

            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        setCanResend(true);
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                        }
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            // Clear timer when modal closes
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [open]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleResend = () => {
        if (canResend && !resending) {
            reSendOTP();
            setTimeLeft(300); // Reset timer
            setCanResend(false);

            // Restart countdown
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        setCanResend(true);
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                        }
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
    };

    const handleSubmit = () => {
        if (!code.trim()) {
            toast({
                title: "Enter code",
                description: "Please enter the 4-digit OTP code sent to your email."
            });
            return;
        }

        if (code.trim().length !== 4) {
            toast({
                title: "Invalid code",
                description: "Please enter a valid 4-digit OTP code."
            });
            return;
        }

        onSubmit(code.trim());
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && code.trim().length === 4 && !loading) {
            handleSubmit();
        }
    };

    const handleCancel = () => {
        setCode("");
        onCancel();
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <CustomDialogContent className="max-w-md backdrop-blur-xl">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-[200px] h-[200px] mx-auto">
                        <img
                            src={OTPIllustration}
                            alt="OTP Verification"
                            className="w-full h-full object-contain rounded-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                            OTP Verification
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Please enter the 4-digit verification code sent to your email to complete the login.
                        </p>
                    </div>

                    {/* Verification Input */}
                    <div className="w-full space-y-3">
                        <label className="text-sm font-medium text-gray-700 block text-left">
                            Enter verification code:
                        </label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            onKeyPress={handleKeyPress}
                            placeholder="0000"
                            className="text-center text-lg tracking-widest font-mono"
                            maxLength={4}
                            autoFocus
                        />
                    </div>

                    {/* Resend OTP Section */}
                    <div className="w-full text-center space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                            <span>Didn't receive the code?</span>
                            {canResend ? (
                                <Button
                                    variant="link"
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="p-0 h-auto text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                    {resending ? (
                                        <>
                                            <Loader className="w-3 h-3 animate-spin mr-1" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Resend OTP"
                                    )}
                                </Button>
                            ) : (
                                <span className="text-gray-500">
                                    Resend in {formatTime(timeLeft)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2 w-full">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || code.length !== 4}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading && <Loader className="w-4 h-4 animate-spin mr-2" />}
                            Verify
                        </Button>
                    </div>
                </div>
            </CustomDialogContent>
        </Dialog>
    );
}