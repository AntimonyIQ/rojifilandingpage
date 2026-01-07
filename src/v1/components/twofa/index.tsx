import { useEffect, useState } from "react";
import {
    Dialog,
    DialogPortal,
    DialogOverlay,
} from "@/v1/components/ui/dialog";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { session, SessionData } from "@/v1/session/session";
import { cn } from "@/v1/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import React from "react";
import { IResponse, IUser } from "@/v1/interface/interface";
import { Copy, Loader } from "lucide-react";
import QRCode from "react-qrcode-logo";
import Defaults from "@/v1/defaults/defaults";
import { Status } from "@/v1/enums/enums";
import TwoFAIllustration from "../../assets/2fa.png";
import { toast } from "sonner";
import { updateSession } from "@/v1/hooks/use-session";

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

export default function TwoFactorAuthSetUp({ onClose }: { onClose: () => void }) {
    const [user, setUser] = useState<IUser | null>(null);
    const storage: SessionData = session.getUserData();
    const [open, setOpen] = useState(true);
    const [showQRStep, setShowQRStep] = useState(false);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");
    const { fetchSession } = updateSession();

    useEffect(() => {
        if (storage && storage.user) {
            setUser(storage.user);
        }
    }, [open, loading]);

    const copySecret = async () => {
        if (!user?.twoFactorSecret) return;
        try {
            await navigator.clipboard.writeText(user.twoFactorSecret);
            toast.success("The secret has been copied to your clipboard.");
        } catch (err: any) {
            toast.error(err.message || "Unknown Error");
        }
    };

    const verifyCode = async () => {
        if (!code.trim()) {
            toast.warning("Please enter the 6-digit code from your authenticator app.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/user/2fa/verify`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': storage.client.publicKey,
                    'x-rojifi-deviceid': storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify({ code: code.trim() }),
            });

            const userdata: IResponse = await res.json();
            if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
            if (userdata.status === Status.SUCCESS) {
                await fetchSession();

                toast.success("Two-factor authentication has been enabled successfully!");

                setShowQRStep(false);
                setCode("");
                onClose();
                setOpen(false);
            }
        } catch (err: any) {
            toast.error(err.message || "Unknown Error");
        } finally {
            setLoading(false);
            setCode("");
        }
    };

    const handleSetupClick = () => {
        setShowQRStep(true);
    };

    const handleBackClick = () => {
        setShowQRStep(false);
        setCode("");
    };

    if (!user) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <CustomDialogContent className="max-w-lg">
                {!showQRStep ? (
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-[250px] h-[250px] mx-auto">
                            <img
                                src={TwoFAIllustration}
                                alt="Two-Factor Authentication"
                                className="w-full h-full object-contain rounded-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Secure Your Account
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Enable two-factor authentication to add an extra layer of security to your account.
                                You'll need an authenticator app like Google Authenticator or Authy.
                            </p>
                        </div>

                        <Button
                            onClick={handleSetupClick}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                            size="lg"
                        >
                            Enable Two-Factor Authentication
                        </Button>
                    </div>
                ) : (
                    // Step 2: QR Code setup and verification
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Scan QR Code
                            </h2>
                            <p className="text-sm text-gray-600">
                                Scan this QR code with your authenticator app
                            </p>
                        </div>

                        {/* QR Code Display */}
                        <div className="flex justify-center">
                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                {user.twoFactorURL ? (
                                    <QRCode
                                        value={user.twoFactorURL}
                                        size={192}
                                    />
                                ) : (
                                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                                        <p className="text-gray-500 text-sm">QR Code not available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Manual Entry Option */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <p className="text-xs text-gray-600">
                                Can't scan? Copy the secret key manually:
                            </p>
                            <Button
                                variant="outline"
                                onClick={copySecret}
                                disabled={!user.twoFactorSecret}
                                className="w-full"
                                size="sm"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Secret Key
                            </Button>
                        </div>

                        {/* Verification Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">
                                Enter the 6-digit code from your app:
                            </label>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="000000"
                                className="text-center text-lg tracking-widest"
                                maxLength={6}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={handleBackClick}
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={verifyCode}
                                disabled={loading || code.length !== 6}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                {loading && <Loader className="w-4 h-4 animate-spin mr-2" />}
                                Verify & Enable
                            </Button>
                        </div>
                    </div>
                )}
            </CustomDialogContent>
        </Dialog>
    );
}