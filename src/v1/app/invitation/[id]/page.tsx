import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Checkbox } from "@/v1/components/ui/checkbox"
import { Eye, EyeOff, X, AlertCircle } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { Carousel, carouselItems } from "../../../components/carousel"
import GlobeWrapper from "../../../components/globe"
import { session } from "@/v1/session/session"
import Defaults from "@/v1/defaults/defaults"
import { motion, Variants } from "framer-motion";
import { Link, useParams, useLocation } from "wouter"

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

interface InvitationData {
    email: string;
    role: string;
    organisationName: string;
    status: string;
}

const useInvitation = (id: string | undefined) => {
    const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
    const [fetchingInvite, setFetchingInvite] = useState(true);
    const [isInvalidInvitation, setIsInvalidInvitation] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (id) {
            fetchInvitationDetails();
        }
    }, [id]);

    const fetchInvitationDetails = async () => {
        try {
            setFetchingInvite(true);
            setError("");
            setIsInvalidInvitation(false);

            // Validate ID format (basic check)
            if (!id || id.length < 10) {
                throw new Error("Invalid invitation ID");
            }

            // Fetch invitation details using the ID
            const url = `${Defaults.API_BASE_URL}/teams/invite/${id}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (data.status === "error") {
                throw new Error(data.message || "Failed to fetch invitation details");
            }

            if (data.status === "success" && data.handshake) {
                // Parse the encrypted invitation data
                const sessionData = session.getUserData();
                const inviteData = Defaults.PARSE_DATA(data.data, sessionData?.client?.privateKey || "", data.handshake);

                if (inviteData.accepted) {
                    setError("This invitation has already been accepted.");
                    setIsInvalidInvitation(true);
                    return;
                }

                if (inviteData.deleted || inviteData.archived) {
                    setError("This invitation is no longer valid.");
                    setIsInvalidInvitation(true);
                    return;
                }

                setInvitationData({
                    email: inviteData.email,
                    role: inviteData.role,
                    organisationName: inviteData.organisationName || "Organization",
                    status: inviteData.status
                });
            } else {
                throw new Error("Invalid invitation data");
            }
        } catch (error) {
            console.error("Error fetching invitation:", error);
            setError(error instanceof Error ? error.message : "Failed to load invitation details");
            setIsInvalidInvitation(true);
        } finally {
            setFetchingInvite(false);
        }
    };

    return { invitationData, fetchingInvite, isInvalidInvitation, error };
};

export default function TeamInvitationPage() {
    const { id } = useParams();
    const [, setLocation] = useLocation();

    const { invitationData, fetchingInvite, isInvalidInvitation, error } = useInvitation(id);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
        agreeToMarketing: false,
    });
    const [passwordValidation, setPasswordValidation] = useState({
        hasLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
    });
    const [isPasswordMatching, setIsPasswordMatching] = useState(true);

    useEffect(() => {
        if (invitationData?.email) {
            setFormData(prev => ({
                ...prev,
                email: invitationData.email
            }));
        }
    }, [invitationData]);

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

        setSubmitError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        if (!formData.agreeToTerms) {
            setSubmitError("You must agree to the Terms and Conditions to proceed");
            return;
        }

        if (!isPasswordValid()) {
            setSubmitError("Password does not meet all requirements");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setSubmitError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            // Accept the invitation
            const url = `${Defaults.API_BASE_URL}/teams/accept-invite`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rojifiId: id,
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    middleName: formData.middleName.trim(),
                    password: formData.password
                })
            });

            const data = await res.json();

            if (data.status === "error") {
                throw new Error(data.message || "Failed to accept invitation");
            }

            // Redirect to login immediately
            setLocation("/login");

        } catch (error) {
            console.error("Error accepting invitation:", error);
            setSubmitError(error instanceof Error ? error.message : "Failed to accept invitation");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingInvite) {
        return (
            <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-white">
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <motion.div variants={logoVariants} animate="animate">
                        <Logo className="h-16 w-auto" />
                    </motion.div>
                </div>
            </div>
        );
    }

    /*
    if (isInvalidInvitation) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
                    <h1 className="mt-6 text-3xl font-bold text-gray-900">Oops! Wrong Page</h1>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        It looks like you've accessed an invalid or expired invitation link.
                        This invitation may have already been used, deleted, or the link might be incorrect.
                    </p>
                    <div className="mt-8 space-y-4">
                        <Link href="/" className="inline-block">
                            <Button className="w-full px-8 py-3 bg-primary hover:bg-primary/90 text-white font-medium">
                                Go to Homepage
                            </Button>
                        </Link>
                        <p className="text-sm text-gray-500">
                            Need help?{" "}
                            <Link href="/contact" className="text-primary hover:text-primary/80 font-medium">
                                Contact Support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    */

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-md mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <Link href="/" className="flex items-center space-x-2">
                                <Logo className="h-8 w-auto" />
                            </Link>
                            <Link href="/" className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </Link>
                        </div>

                        {/* Form Content */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join {invitationData?.organisationName || "the Team"}</h1>
                            <p className="text-gray-600">Let's start with your personal credentials</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        placeholder="First name"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        placeholder="Last name"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="middleName">Other Name</Label>
                                <Input
                                    id="middleName"
                                    name="middleName"
                                    type="text"
                                    placeholder="Other name"
                                    value={formData.middleName}
                                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    disabled
                                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        required
                                        disabled={loading}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {formData.password && !isPasswordValid() && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-gray-600 mb-1">Password must include:</p>
                                        <div className="space-y-1">
                                            <div className={`flex items-center text-xs ${passwordValidation.hasLength ? 'text-green-600' : 'text-red-500'}`}>
                                                • At least 8 characters
                                            </div>
                                            <div className={`flex items-center text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                                                • One uppercase letter
                                            </div>
                                            <div className={`flex items-center text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                                                • One lowercase letter
                                            </div>
                                            <div className={`flex items-center text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                                                • One number
                                            </div>
                                            <div className={`flex items-center text-xs ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-500'}`}>
                                                • One special character
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        required
                                        disabled={loading}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
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
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80"
                                        >
                                            Privacy Policy
                                        </a>{" "}
                                        and{" "}
                                        <a
                                            href="/terms"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80"
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

                            {submitError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600 text-sm">{submitError}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                    disabled={loading || !invitationData}
                                >
                                    {loading ? "Accepting Invitation..." : "Accept Invitation & Join Team"}
                                </Button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Have an account?{" "}
                                <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                                    Sign in
                                </Link>
                            </div>
                        </form>
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
