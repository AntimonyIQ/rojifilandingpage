import { useState } from "react";
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
import TwoFAIllustration from "../../assets/2fa.png";

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

interface TwoFactorLoginModalProps {
    open: boolean;
    loading?: boolean;
    onSubmit: (code: string) => void;
    onCancel: () => void;
}

export default function TwoFactorLoginModal({
    open,
    loading = false,
    onSubmit,
    onCancel,
}: TwoFactorLoginModalProps) {
    const [code, setCode] = useState("");

    const handleSubmit = () => {
        if (!code.trim()) {
            toast({
                title: "Enter code",
                description: "Please enter the 6-digit code from your authenticator app."
            });
            return;
        }

        if (code.trim().length !== 6) {
            toast({
                title: "Invalid code",
                description: "Please enter a valid 6-digit code."
            });
            return;
        }

        onSubmit(code.trim());
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && code.trim().length === 6 && !loading) {
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
                            src={TwoFAIllustration}
                            alt="Two-Factor Authentication"
                            className="w-full h-full object-contain rounded-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Two-Factor Authentication
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Please enter the 6-digit verification code from your authenticator app to complete the login.
                        </p>
                    </div>

                    {/* Verification Input */}
                    <div className="w-full space-y-3">
                        <label className="text-sm font-medium text-gray-700 block text-left">
                            Enter verification code:
                        </label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            onKeyPress={handleKeyPress}
                            placeholder="000000"
                            className="text-center text-lg tracking-widest font-mono"
                            maxLength={6}
                            autoFocus
                        />
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
                            disabled={loading || code.length !== 6}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading && <Loader className="w-4 h-4 animate-spin mr-2" />}
                            Verify & Login
                        </Button>
                    </div>
                </div>
            </CustomDialogContent>
        </Dialog>
    );
}