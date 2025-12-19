import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Checkbox } from "@/v1/components/ui/checkbox"
import { Eye, EyeOff, AlertCircle, ArrowUpRight, Check } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { OTPVerificationModal } from "../modal/otp";
import { Carousel, carouselItems } from "../carousel"
import GlobeWrapper from "../globe"
import { session, SessionData } from "@/v1/session/session"
import Defaults from "@/v1/defaults/defaults"
import { IRequestAccess, IResponse } from "@/v1/interface/interface"
import { Status } from "@/v1/enums/enums"
import { motion, Variants } from "framer-motion";
import { toast } from "sonner"
import { Link, useParams } from "wouter"

const logoVariants: Variants = {
    animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.7, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
}

export interface IFormData {
    firstName: string,
    lastName: string,
    middleName: string,
    businessName: string,
    email: string,
    password: string,
    confirmPassword: string,
    agreeToTerms: boolean,
    agreeToMarketing: boolean,
}

export function SignupForm() {
    const [completed, setCompleted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isNotApprove, setIsNotApprove] = useState(false)
    const [passwordValidation, setPasswordValidation] = useState({
        hasLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
    })
    const [isPasswordMatching, setIsPasswordMatching] = useState(true)
    const [formData, setFormData] = useState<IFormData>({
        firstName: "",
        lastName: "",
        middleName: "",
        businessName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
        agreeToMarketing: false,
    });
    const { id } = useParams();
    const storage: SessionData = session.getUserData();

    // Password validation function
    const validatePassword = (password: string) => {
        return {
            hasLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
    };

    // Check if password is fully valid
    const isPasswordValid = () => {
        return Object.values(passwordValidation).every(Boolean);
    };

    // Check if all required fields are filled
    const isFormValid = () => {
        return (
            formData.firstName.trim() !== "" &&
            formData.lastName.trim() !== "" &&
            // formData.middleName.trim() !== "" &&
            formData.businessName.trim() !== "" &&
            formData.email.trim() !== "" &&
            formData.password.trim() !== "" &&
            formData.confirmPassword.trim() !== "" &&
            isPasswordValid() &&
            isPasswordMatching &&
            formData.agreeToTerms &&
            formData.agreeToMarketing
        );
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleInputChange = (field: string, value: string | boolean) => {
        let sanitizedValue = value;

        if (typeof value === "string") {
            switch (field) {
                case "firstName":
                case "lastName":
                case "middleName":
                    sanitizedValue = value.replace(/[^a-zA-Z]/g, "");
                    break;

                case "email":
                    sanitizedValue = value.replace(/\s+/g, "").toLowerCase();
                    sanitizedValue = sanitizedValue.replace(/[^a-z0-9@._-]/g, "");
                    break;

                case "phoneNumber":
                    sanitizedValue = value.replace(/[^0-9]/g, "");
                    break;
            }
        }

        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));

        // Real-time password validation
        if (field === "password") {
            const validation = validatePassword(String(sanitizedValue));
            setPasswordValidation(validation);
            // Check if confirm password still matches
            if (formData.confirmPassword) {
                setIsPasswordMatching(String(sanitizedValue) === formData.confirmPassword);
            }
        }

        // Real-time confirm password validation
        if (field === "confirmPassword") {
            setIsPasswordMatching(formData.password === String(sanitizedValue));
        }

        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!formData.agreeToTerms) {
            setError("You must agree to the Terms and Conditions to proceed")
            return
        }

        if (!isPasswordValid()) {
            setError("Password does not meet all requirements")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match")
            return
        }

        try {
            setLoading(true)
            const res = await fetch(`${Defaults.API_BASE_URL}/auth/email`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': storage.client.publicKey,
                    'x-rojifi-deviceid': storage.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: id,
                    password: formData.password,
                    businessName: formData.businessName,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    middleName: formData.middleName,
                })
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                setShowOtpModal(true);
                toast.success("OTP sent successfully. Please verify your email to continue.", { duration: 8000 });
            }
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    }

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/requestaccess/approved/${id}`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': storage.client.publicKey,
                    'x-rojifi-deviceid': storage.deviceid,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Invalid Response');
                const parseData: IRequestAccess = Defaults.PARSE_DATA(data.data, storage.client.privateKey, data.handshake);
                // console.log("Parsed Data: ", parseData);
                setCompleted(parseData.completed);
                setFormData((prev) => ({
                    ...prev,
                    firstName: parseData.firstname,
                    lastName: parseData.lastname,
                    middleName: parseData.middlename,
                    email: parseData.email,
                    businessName: parseData.businessName,
                }));
            }
        } catch (error: any) {
            setError(error.message || "Failed to create account");
            setIsNotApprove(true);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-white">
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <motion.div variants={logoVariants} animate="animate">
                        <Logo className="h-16 w-auto" />
                    </motion.div>
                </div>
            </div>
        )
    }

    if (isNotApprove) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-center max-w-lg px-6">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900">Request access required</h2>
                    <p className="mt-2 text-gray-600">You currently don't have access to this page. Please request access to continue.</p>
                    <div className="mt-6">
                        <Link href="/request-access" className="inline-flex">
                            <Button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white">
                                <ArrowUpRight size={18} />
                                Request Access
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (completed) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                <div className="p-6 max-w-md mx-auto text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Submission Received</h2>
                    <p className="text-gray-600 mb-4">You have successfully submitted your documents. They are under review — you will be notified once the review is complete.</p>
                    <div className="space-y-3">
                        <Button
                            onClick={() => window.location.href = '/login'}
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="w-full"
                        >
                            Back to Homepage
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return ( 
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-md mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <button
                                type="button"
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <Logo className="h-8 w-auto" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account on Rojifi Business</h1>
                            <p className="text-gray-600">Let's start with your personal credentials</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First name <span className="text-red-500">*</span>
                                    </Label>
                                    <div>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            autoComplete="off"
                                            className="h-12"
                                            placeholder="First name"
                                            value={formData.firstName}
                                            disabled={loading}
                                            readOnly={loading}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last name <span className="text-red-500">*</span>
                                    </Label>
                                    <div>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            autoComplete="off"
                                            className="h-12"
                                            placeholder="Last name"
                                            value={formData.lastName}
                                            disabled={loading}
                                            readOnly={loading}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Other Name
                                </Label>
                                <div>
                                    <Input
                                        id="middleName"
                                        name="middleName"
                                        type="text"
                                        autoComplete="off"
                                        className="h-12"
                                        placeholder="Other Name"
                                        disabled={loading}
                                        readOnly={loading}
                                        value={formData.middleName}
                                        onChange={(e) => handleInputChange("middleName", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address <span className="text-red-500">*</span>
                                </Label>
                                <div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="off"
                                        required
                                        className="h-12"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        disabled={true}
                                        readOnly={true}
                                        onChange={(_e) => { } /* handleInputChange("email", e.target.value) */}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Name <span className="text-red-500">*</span>
                                </Label>
                                <div>
                                    <Input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        autoComplete="off"
                                        required
                                        className="h-12"
                                        placeholder="Enter your business name"
                                        value={formData.businessName}
                                        disabled={loading}
                                        readOnly={loading}
                                        onChange={(_e) => { } /* handleInputChange("email", e.target.value) */}
                                    />
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
                                        autoComplete="off"
                                        required
                                        className="pr-10 h-12"
                                        placeholder="Password"
                                        value={formData.password}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                    </button>
                                </div>
                                {formData.password && !isPasswordValid() && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-gray-600 mb-1">Password must include:</p>
                                        <div className="space-y-1">
                                            <div className={`flex items-center text-xs ${passwordValidation.hasLength ? 'text-green-600' : 'text-red-500'}`}>
                                                <span className="mr-1">{passwordValidation.hasLength ? '✓' : '×'}</span>
                                                At least 8 characters
                                            </div>
                                            <div className={`flex items-center text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                                                <span className="mr-1">{passwordValidation.hasUppercase ? '✓' : '×'}</span>
                                                One uppercase letter
                                            </div>
                                            <div className={`flex items-center text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                                                <span className="mr-1">{passwordValidation.hasLowercase ? '✓' : '×'}</span>
                                                One lowercase letter
                                            </div>
                                            <div className={`flex items-center text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                                                <span className="mr-1">{passwordValidation.hasNumber ? '✓' : '×'}</span>
                                                One number
                                            </div>
                                            <div className={`flex items-center text-xs ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-500'}`}>
                                                <span className="mr-1">{passwordValidation.hasSpecial ? '✓' : '×'}</span>
                                                One special character
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="off"
                                        required
                                        className="pr-10 h-12"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        disabled={loading}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    />
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
                                    <p className="text-red-500 text-xs mt-1">Passwords must match</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        required={true}
                                        disabled={loading}
                                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                                    />
                                    <Label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                                        I agree to Rojifi's{" "}
                                        <a
                                            href="/privacy"
                                            className="text-primary hover:text-primary/80"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Privacy Policy
                                        </a>{" "}
                                        and{" "}
                                        <a
                                            href="/terms"
                                            className="text-primary hover:text-primary/80"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Terms and Conditions
                                        </a>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="agreeToMarketing"
                                        disabled={loading}
                                        required={true}
                                        checked={formData.agreeToMarketing}
                                        onCheckedChange={(checked) => handleInputChange("agreeToMarketing", checked)}
                                    />
                                    <Label htmlFor="agreeToMarketing" className="text-sm text-gray-600">
                                        I consent to receive electronic communications regarding my accounts and services
                                    </Label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                    disabled={loading || !isFormValid()}
                                >
                                    {loading ? "Creating account..." : "Submit"}
                                </Button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Have an account?{" "}
                                <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                                    Sign in
                                </Link>
                            </div>
                        </form>
                        <OTPVerificationModal
                            isOpen={showOtpModal}
                            onClose={() => setShowOtpModal(false)}
                            email={formData.email}
                            id={id as string}
                            onSuccess={() => {
                                setShowOtpModal(false);
                                toast.success("Email verified successfully");
                                window.location.href = `/signup/${id}/business-details`;
                            }}
                            resend={async () => {
                                const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                                await handleSubmit(fakeEvent);
                            }}
                        />
                    </div>
                </div>

                <div className="w-[60%] hidden md:block h-full px-10 py-1 bg-primary relative">
                    <div className="mt-12">
                        <Carousel data={carouselItems} interval={4000} />
                    </div>
                    <div className="absolute bottom-5 left-5 px-5 right-0 flex justify-start items-center mt-6 text-white text-lg z-10">
                        &copy; {new Date().getFullYear()} Rojifi. All rights reserved.
                    </div>
                    <div className="absolute -bottom-40 -right-40 flex justify-center items-center mt-6">
                        <GlobeWrapper />
                    </div>
                </div>
            </div>
        </div>
    );
}