import type React from "react";
import { useState } from "react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Checkbox } from "@/v1/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/v1/components/ui/dialog";
import { CheckIcon, ChevronsUpDownIcon, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/v1/components/logo";
import { Textarea } from "../ui/textarea";
import Defaults from "@/v1/defaults/defaults";
import { session, SessionData } from "@/v1/session/session";
import { toast } from "sonner";
import countries from "../../data/country_state.json";
import { Link } from "wouter";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/v1/components/ui/popover";
import { cn } from "@/v1/lib/utils";
import { Header } from "../header";
import { Footer } from "../footer";

export function ContactForm() {
    const [popOpen, setPopOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        businessName: "",
        phoneNumber: "",
        message: "",
        agreeToTerms: false,
        countryCode: "234",
        selectedCountry: "Nigeria", // Default to Nigeria since countryCode is "234"
    });
    const storage: SessionData = session.getUserData();

    // Validation helpers
    const isValidName = (name: string) => /^[A-Za-z]{2,}$/.test(name);
    const isValidPhone = (phone: string) => /^[0-9]+$/.test(phone);
    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    // Simple malicious content detector for messages
    const detectMalicious = (text: string) => {
        if (!text) return null;
        const patterns: { name: string; re: RegExp }[] = [
            { name: "script_tag", re: /<\s*script\b/i },
            { name: "on_event_attr", re: /<[^>]+\s(on\w+)\s*=\s*['\"]/i },
            { name: "javascript_uri", re: /javascript:/i },
            { name: "iframe_tag", re: /<\s*iframe\b/i },
            { name: "img_tag_onerror", re: /<\s*img[^>]*onerror\b/i },
            { name: "eval_call", re: /eval\s*\(/i },
            { name: "document_cookie", re: /document\.cookie/i },
            { name: "window_location", re: /window\.location/i },
            { name: "base64_data", re: /data:\s*image\/(?:png|jpeg|jpg);base64,/i },
            { name: "sql_injection", re: /\b(SELECT|DROP|INSERT|DELETE|UPDATE)\b/i },
        ];

        const matches = patterns.filter((p) => p.re.test(text)).map((p) => p.name);
        if (matches.length === 0) return null;
        return { matches, preview: text.slice(0, 300) };
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        let sanitizedValue = value;

        if (typeof value === "string") {
            switch (field) {
                case "firstName":
                case "lastName":
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
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic required validations
        if (!formData.agreeToTerms) {
            setError("You must agree to the Terms and Conditions");
            return;
        }

        if (!isValidName(formData.firstName)) {
            setError("First name must be at least 2 alphabetic characters (A-Z).");
            return;
        }

        if (!isValidName(formData.lastName)) {
            setError("Last name must be at least 2 alphabetic characters (A-Z).");
            return;
        }

        if (!isValidEmail(formData.email)) {
            setError("Enter a valid email address.");
            return;
        }

        // phone: allow only numbers, prevent duplicated prefix
        let phone = (formData.phoneNumber || "").replace(/\s+/g, "");
        // If autocomplete included the country code prefix, strip it
        const prefix = String(formData.countryCode || "").replace(/^\+/, "");
        if (prefix && phone.startsWith(prefix)) {
            phone = phone.slice(prefix.length);
        }

        if (!isValidPhone(phone) || phone.length < 4) {
            setError("Enter a valid phone number (numbers only).");
            return;
        }

        // message can contain anything, but detect malicious patterns
        const malicious = detectMalicious(formData.message || "");

        const metadata: Record<string, any> = {};
        if (malicious) {
            metadata.malicious = malicious;
        }

        try {
            setIsLoading(true);

            const res = await fetch(`${Defaults.API_BASE_URL}/contactus`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                },
                body: JSON.stringify({
                    email: formData.email,
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    businessName: formData.businessName,
                    phoneNumber: phone,
                    phoneCode: formData.countryCode,
                    message: formData.message,
                    agreement: formData.agreeToTerms,
                    metadata,
                }),
            });
            const data = await res.json();
            if (data.status === "error") throw new Error(data.message || data.error);
            if (data.status === "success") {
                toast.success("Message sent successfully. We'll get back to you soon.");
                setShowSuccessModal(true);
                // Reset form after successful submission
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    businessName: "",
                    phoneNumber: "",
                    message: "",
                    agreeToTerms: false,
                    countryCode: "234",
                    selectedCountry: "Nigeria",
                });
            }
        } catch (err: any) {
            setError(err.message || "Failed to send message. Please try again.");
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Header />
            <div className="p-4 py-10 max-w-md mx-auto">
                <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
                    {/* Success Modal using Dialog */}
                    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                        <DialogContent className="max-w-sm md:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-center">
                                    Message Sent Successfully
                                </DialogTitle>
                                <DialogDescription className="text-center text-gray-600 font-medium">
                                    Thank you for contacting us! We'll get back to you soon.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-center gap-2">
                                {/* Close button and Go to Homepage button */}
                                {/*
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={() => setShowSuccessModal(false)}
                                >
                                    Send Another
                                </Button>
                                */}
                                <Button
                                    size="md"
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        window.location.href = "/";
                                    }}
                                    className="text-white"
                                >
                                    <ArrowUpRight size={16} className="mr-1" />
                                    Go to Homepage
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Contact Us
                        </h1>
                        <p className="text-gray-600">
                            Let's connect. Fill out the form and our team will respond as soon
                            as possible.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label
                                    htmlFor="firstName"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    First name <span className="text-red-500">*</span>
                                </Label>
                                <div>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        required
                                        className="h-12"
                                        placeholder="First name"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            handleInputChange("firstName", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <Label
                                    htmlFor="lastName"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Last name <span className="text-red-500">*</span>
                                </Label>
                                <div>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        className="h-12"
                                        placeholder="Last name"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            handleInputChange("lastName", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email address <span className="text-red-500">*</span>
                            </Label>
                            <div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="work email"
                                    required
                                    className="h-12"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label
                                htmlFor="businessName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Name of your Business <span className="text-red-500">*</span>
                            </Label>
                            <div>
                                <Input
                                    id="businessName"
                                    name="businessName"
                                    type="text"
                                    autoComplete="work name"
                                    required
                                    className="h-12"
                                    placeholder="Enter your business name"
                                    value={formData.businessName}
                                    onChange={(e) =>
                                        handleInputChange("businessName", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <Label
                                htmlFor="phoneNumber"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Popover
                                    open={popOpen}
                                    onOpenChange={setPopOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            size="md"
                                            aria-expanded={popOpen}
                                            className="w-28 justify-between"
                                        >
                                            <img
                                                src={`https://flagcdn.com/w320/${countries
                                                    .find(
                                                        (country) =>
                                                            country.name === formData.selectedCountry
                                                    )
                                                    ?.iso2.toLowerCase()}.png`}
                                                alt=""
                                                width={18}
                                                height={18}
                                            />
                                            {formData.countryCode
                                                ? `+${formData.countryCode}`
                                                : "Select country..."}
                                            <ChevronsUpDownIcon className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60 p-0">
                                        <Command>
                                            <CommandInput placeholder="Search country..." />
                                            <CommandList>
                                                <CommandEmpty>No country found.</CommandEmpty>
                                                <CommandGroup>
                                                    {countries.map((country, index) => (
                                                        <CommandItem
                                                            key={`${country.name}-${index}`}
                                                            value={country.name}
                                                            onSelect={(currentValue) => {
                                                                const selectedCountry = countries.find(
                                                                    (c) =>
                                                                        c.name.toLowerCase() ===
                                                                        currentValue.toLowerCase()
                                                                );
                                                                if (selectedCountry) {
                                                                    handleInputChange(
                                                                        "countryCode",
                                                                        selectedCountry.phonecode
                                                                    );
                                                                    handleInputChange(
                                                                        "selectedCountry",
                                                                        selectedCountry.name
                                                                    );
                                                                }
                                                                setPopOpen(false);
                                                            }}
                                                        >
                                                            <CheckIcon
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formData.selectedCountry === country.name
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <img
                                                                src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                                                alt=""
                                                                width={18}
                                                                height={18}
                                                            />
                                                            +{country.phonecode} {country.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    className="flex-1"
                                    value={formData.phoneNumber}
                                    onChange={(e) =>
                                        handleInputChange("phoneNumber", e.target.value)
                                    }
                                    placeholder="Enter Phone Number"
                                    required
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="text"
                                    autoComplete="work tel"
                                />
                            </div>
                        </div>

                        <div>
                            <Label
                                htmlFor="message"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Your Message <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex flex-row !items-start !justify-start">
                                <Textarea
                                    id="message"
                                    name="message"
                                    autoComplete="message"
                                    required
                                    className="h-12"
                                    placeholder="Enter reason for contacting us"
                                    value={formData.message}
                                    onChange={(e) => handleInputChange("message", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onCheckedChange={(checked) =>
                                        handleInputChange("agreeToTerms", checked)
                                    }
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
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Submit"}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            Have an account?{" "}
                            <a
                                href="/login"
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                Sign in
                            </a>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
