import { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Checkbox } from "@/v1/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/v1/components/ui/select";
import {
    Check,
    Plus,
    Trash2,
    X,
    ArrowLeft,
    ChevronsUpDown,
    CalendarIcon,
    CheckCircle,
    Eye,
    AlertCircle,
    ArrowUpRight,
} from "lucide-react";
import { cn } from "@/v1/lib/utils";
import { format } from "date-fns";
import { Link, useParams } from "wouter";
import { session, SessionData } from "@/v1/session/session";
import { Status } from "@/v1/enums/enums";
import { IRequestAccess, IResponse } from "@/v1/interface/interface";
import Defaults from "@/v1/defaults/defaults";
import { toast } from "sonner";
import { Logo } from "@/v1/components/logo";
import { Carousel, carouselItems } from "../carousel";
import GlobeWrapper from "../globe";
import countries from "../../data/country_state.json";
import { Calendar } from "../ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/v1/components/ui/dialog";

interface DirectorShareholderFormData {
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    jobTitle: string;
    role: string;
    isDirector: boolean;
    isShareholder: boolean;
    shareholderPercentage: string;
    dateOfBirth: Date | undefined;
    nationality: string;
    phoneCode: string;
    selectedCountryCode: string; // Track specific country for phone code
    phoneNumber: string;
    idType: "passport" | "drivers_license" | "";
    idNumber: string;
    issuedCountry: string;
    issueDate: Date | undefined;
    expiryDate: Date | undefined;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    idDocument: File | null;
    proofOfAddress: File | null;
    idDocumentUrl?: string;
    proofOfAddressUrl?: string;
}

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
};

export function DirectorShareholderForm() {
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotApprove, setIsNotApprove] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [allValid, setAllValid] = useState(false);

    // Forms array to handle multiple directors/shareholders
    const [forms, setForms] = useState<DirectorShareholderFormData[]>([]);

    // File upload states
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Popover states for each form
    const [popoverStates, setPopoverStates] = useState<Record<string, boolean>>({});

    const { id } = useParams();
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (id) {
            loadData();
        }
        // Initialize with one empty form
        setForms([createNewForm()]);
    }, [id]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/requestaccess/approved/${id}`, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    "x-rojifi-handshake": sd.client.publicKey,
                    "x-rojifi-deviceid": sd.deviceid,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake)
                    throw new Error("Unable to process response right now, please try again.");
                const parseData: IRequestAccess = Defaults.PARSE_DATA(
                    data.data,
                    sd.client.privateKey,
                    data.handshake
                );

                setCompleted(parseData.completed);
            }
        } catch (error: any) {
            setError(error.message || "Failed to verify authorization");
            setIsNotApprove(true);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewForm = (): DirectorShareholderFormData => {
        return {
            firstName: "",
            lastName: "",
            middleName: "",
            email: "",
            jobTitle: "",
            role: "",
            isDirector: false,
            isShareholder: false,
            shareholderPercentage: "",
            dateOfBirth: undefined,
            nationality: "",
            phoneCode: "234",
            selectedCountryCode: "Nigeria",
            phoneNumber: "",
            idType: "",
            idNumber: "",
            issuedCountry: "",
            issueDate: undefined,
            expiryDate: undefined,
            streetAddress: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            idDocument: null,
            proofOfAddress: null,
        };
    };

    const handleAddForm = () => {
        setForms((prev) => [...prev, createNewForm()]);
    };

    const handleRemoveForm = (index: number) => {
        setForms((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFormChange = (index: number, field: string, value: any) => {
        setForms((prev) => prev.map((form, i) => (i === index ? { ...form, [field]: value } : form)));
        // Clear validation error when user starts typing
        const fieldKey = `${index}-${field}`;
        if (validationErrors[fieldKey]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldKey];
                return newErrors;
            });
        }
        setError(null);
    };

    const togglePopover = (key: string, value: boolean) => {
        setPopoverStates((prev) => ({ ...prev, [key]: value }));
    };

    const handleFileUpload = async (
        file: File,
        formIndex: number,
        fieldType: "idDocument" | "proofOfAddress"
    ) => {
        const uploadKey = `${formIndex}-${fieldType}`;

        try {
            setUploadingFiles((prev) => ({ ...prev, [uploadKey]: true }));
            setFieldErrors((prev) => ({ ...prev, [uploadKey]: "" }));

            const formData = new FormData();
            formData.append("file", file);

            const headers: Record<string, string> = { ...Defaults.HEADERS } as Record<string, string>;
            if (headers["Content-Type"]) delete headers["Content-Type"];
            if (headers["content-type"]) delete headers["content-type"];

            const res = await fetch(`${Defaults.API_BASE_URL}/upload`, {
                method: "POST",
                headers: {
                    ...headers,
                    "x-rojifi-handshake": sd?.client?.publicKey || "",
                    "x-rojifi-deviceid": sd?.deviceid || "",
                },
                body: formData,
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error || "Upload failed");
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Unable to process upload response");
                const parseData: { url: string } = Defaults.PARSE_DATA(
                    data.data,
                    sd.client.privateKey,
                    data.handshake
                );

                // Update form with file and URL
                handleFormChange(formIndex, fieldType, file);
                handleFormChange(formIndex, `${fieldType}Url`, parseData.url);
            }
        } catch (err: any) {
            setFieldErrors((prev) => ({ ...prev, [uploadKey]: err.message || "File upload failed" }));
        } finally {
            setUploadingFiles((prev) => ({ ...prev, [uploadKey]: false }));
        }
    };

    const validateForm = (form: DirectorShareholderFormData): boolean => {
        return (
            form.firstName.trim() !== "" &&
            form.lastName.trim() !== "" &&
            form.email.trim() !== "" &&
            form.role.trim() !== "" &&
            form.dateOfBirth !== undefined &&
            form.nationality.trim() !== "" &&
            form.phoneNumber.trim() !== "" &&
            form.idType !== "" &&
            form.idNumber.trim() !== "" &&
            form.issuedCountry.trim() !== "" &&
            form.issueDate !== undefined &&
            form.expiryDate !== undefined &&
            form.streetAddress.trim() !== "" &&
            form.city.trim() !== "" &&
            form.state.trim() !== "" &&
            form.postalCode.trim() !== "" &&
            form.country.trim() !== "" &&
            (form.isShareholder ? form.shareholderPercentage.trim() !== "" : true) &&
            form.idDocumentUrl !== undefined &&
            form.proofOfAddressUrl !== undefined
        );
    };

    useEffect(() => {
        setAllValid(forms.every((form) => validateForm(form)));
    }, [forms]);

    const handleSubmit = async () => {
        setError(null);
        // console.log(forms);

        // Validate all forms
        for (let i = 0; i < forms.length; i++) {
            if (!validateForm(forms[i])) {
                setError(`Please fill all required fields for ${forms[i].firstName || `Person ${i + 1}`}`);
                return;
            }
        }

        try {
            setLoading(true);

            const submitData = forms.map((form) => ({
                senderId: id,
                firstName: form.firstName,
                lastName: form.lastName,
                middleName: form.middleName,
                email: form.email,
                jobTitle: form.jobTitle,
                role: form.role,
                isDirector: form.isDirector,
                isShareholder: form.isShareholder,
                shareholderPercentage: form.isShareholder ? Number(form.shareholderPercentage) : undefined,
                dateOfBirth: form.dateOfBirth,
                nationality: form.nationality,
                phoneCode: form.phoneCode,
                selectedCountryCode: form.selectedCountryCode,
                phoneNumber: form.phoneNumber,
                idType: form.idType,
                idNumber: form.idNumber,
                issuedCountry: form.issuedCountry,
                issueDate: form.issueDate,
                expiryDate: form.expiryDate,
                streetAddress: form.streetAddress,
                city: form.city,
                state: form.state,
                postalCode: form.postalCode,
                country: form.country,
                idDocument: form.idDocumentUrl,
                proofOfAddress: form.proofOfAddressUrl,
            }));

            const res = await fetch(`${Defaults.API_BASE_URL}/auth/directors`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": sd.client.publicKey,
                    "x-rojifi-deviceid": sd.deviceid,
                },
                body: JSON.stringify({
                    rojifiId: id,
                    directorsAndShareholders: submitData,
                }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success("Directors/Shareholders information submitted successfully");
                setShowSuccessModal(true);
            }
        } catch (err: any) {
            setError(err.message || "Failed to submit information");
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
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

    if (isNotApprove) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-center max-w-lg px-6">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900">Request access required</h2>
                    <p className="mt-2 text-gray-600">
                        You currently don't have access to this page. Please request access to continue.
                    </p>
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
        );
    }

    if (completed) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                <div className="p-6 max-w-md mx-auto text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Submission Received</h2>
                    <p className="text-gray-600 mb-4">
                        You have successfully submitted your documents. They are under review — you will be
                        notified once the review is complete.
                    </p>
                    <div className="space-y-3">
                        <Button
                            onClick={() => (window.location.href = "/login")}
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => (window.location.href = "/")}
                            className="w-full"
                        >
                            Back to Homepage
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                {/* Left side - Form */}
                <div className="w-full md:w-[40%] h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-full mx-auto">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                type="button"
                                onClick={() => window.location.href = `/signup/${id}/verification`}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <Logo className="h-8 w-auto" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Director & Shareholder Information
                            </h1>
                            <p className="text-gray-600">Provide detailed information for each person</p>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                {forms.map((form, index) => (
                                    <DirectorShareholderFormCard
                                        key={index}
                                        form={form}
                                        index={index}
                                        isFirstForm={index === 0}
                                        onFormChange={handleFormChange}
                                        onFileUpload={handleFileUpload}
                                        onRemove={
                                            forms.length > 1 && index > 0 ? () => handleRemoveForm(index) : undefined
                                        }
                                        popoverStates={popoverStates}
                                        togglePopover={togglePopover}
                                        uploadingFiles={uploadingFiles}
                                        fieldErrors={fieldErrors}
                                        validationErrors={validationErrors}
                                        countries={countries}
                                    />
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddForm}
                                    className="w-full h-12 bg-green-50 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Another Director/Shareholder
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || !allValid}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </Button>

                                <div className="text-center text-sm text-gray-600">
                                    Have any issues?{" "}
                                    <a
                                        href="mailto:support@rojifi.com"
                                        className="text-primary hover:text-primary/80 font-medium"
                                    >
                                        Contact Support
                                    </a>
                                </div>
                            </motion.div>
                        </form>
                    </div>
                </div>

                {/* Right side - Globe and carousel */}
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

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-2xl border-none flex flex-col gap-12">
                    <DialogHeader className="flex flex-col gap-4">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-4xl font-semibold">
                            Information Submitted Successfully!
                        </DialogTitle>
                        <DialogDescription className="text-center text-2xl text-gray-800">
                            Your KYC/KYB details has been received and they are currently under review. We will
                            get in touch with you on your email/dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            onClick={() => (window.location.href = "/login")}
                            className="w-full bg-primary hover:bg-primary/90 text-white text-xl"
                        >
                            Login to your Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Individual form card component
interface DirectorShareholderFormCardProps {
    form: DirectorShareholderFormData;
    index: number;
    isFirstForm: boolean;
    onFormChange: (index: number, field: string, value: any) => void;
    onFileUpload: (file: File, formIndex: number, fieldType: "idDocument" | "proofOfAddress") => void;
    onRemove?: () => void;
    popoverStates: Record<string, boolean>;
    togglePopover: (key: string, value: boolean) => void;
    uploadingFiles: Record<string, boolean>;
    fieldErrors: Record<string, string>;
    validationErrors: Record<string, string>;
    countries: any[];
}

function DirectorShareholderFormCard({
    form,
    index,
    isFirstForm,
    onFormChange,
    onFileUpload,
    onRemove,
    popoverStates,
    togglePopover,
    uploadingFiles,
    fieldErrors,
    validationErrors,
    countries,
}: DirectorShareholderFormCardProps) {
    // Local validation state
    const [localValidationErrors, setLocalValidationErrors] = useState<Record<string, string>>({});
    console.log("Local Validation Errors:", validationErrors);

    // Validation function
    const validateField = (field: string, value: any): string => {
        switch (field) {
            case "firstName":
                if (!value || value.trim().length < 2) return "First name must be at least 2 characters";
                break;
            case "lastName":
                if (!value || value.trim().length < 2) return "Last name must be at least 2 characters";
                break;
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value || !emailRegex.test(value)) return "Please enter a valid email address";
                break;
            case "phoneNumber":
                if (!value || value.trim().length < 7) return "Phone number must be at least 7 digits";
                break;
            case "idNumber":
                if (!value || value.trim().length < 3) return "ID number must be at least 3 characters";
                break;
            case "shareholderPercentage":
                if (form.isShareholder) {
                    const num = parseFloat(value);
                    if (!value || isNaN(num) || num <= 0 || num > 100) {
                        return "Percentage must be between 0.01 and 100";
                    }
                }
                break;
            case "streetAddress":
                if (!value || value.trim().length < 5)
                    return "Street address must be at least 5 characters";
                break;
            case "city":
                if (!value || value.trim().length < 2) return "City must be at least 2 characters";
                break;
            case "state":
                if (!value || value.trim().length < 2)
                    return "State/Province must be at least 2 characters";
                break;
            case "postalCode":
                if (!value || value.trim().length < 3) return "Postal code must be at least 3 characters";
                break;
        }
        return "";
    };

    const getFieldError = (field: string): string => {
        return localValidationErrors[field] || "";
    };

    const hasFieldError = (field: string): boolean => {
        return !!localValidationErrors[field];
    };

    const handleFieldChange = (field: string, value: any) => {
        onFormChange(index, field, value);
        // Clear validation error when user starts typing
        if (localValidationErrors[field]) {
            setLocalValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleFieldBlur = (field: string, value: any) => {
        const error = validateField(field, value);
        if (error) {
            setLocalValidationErrors((prev) => ({
                ...prev,
                [field]: error,
            }));
        }
    };

    const handleRoleChange = (roleType: "director" | "shareholder", checked: boolean) => {
        onFormChange(index, roleType === "director" ? "isDirector" : "isShareholder", checked);

        // Update role display
        const newIsDirector = roleType === "director" ? checked : form.isDirector;
        const newIsShareholder = roleType === "shareholder" ? checked : form.isShareholder;

        let roleDisplay = "";
        if (newIsDirector && newIsShareholder) {
            roleDisplay = "Director and Shareholder";
        } else if (newIsDirector) {
            roleDisplay = "Director";
        } else if (newIsShareholder) {
            roleDisplay = "Shareholder";
        }

        onFormChange(index, "role", roleDisplay);
    };

    const handleFileRemove = (fieldType: "idDocument" | "proofOfAddress") => {
        onFormChange(index, fieldType, null);
        onFormChange(index, `${fieldType}Url`, undefined);
    };

    return (
        <div className="space-y-6 border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-center justify-between">
                {!isFirstForm && (
                    <h3 className="text-lg font-semibold text-gray-900">
                        {form.firstName ? `${form.firstName} ${form.lastName}` : `Person ${index + 1}`}
                    </h3>
                )}
                {onRemove && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 bg-red-50 hover:bg-red-600 hover:text-white"
                        onClick={onRemove}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Personal Information */}
            <div>
                <Label
                    htmlFor={`firstName-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    First Name<span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`firstName-${index}`}
                    className={`h-12 ${hasFieldError("firstName")
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    value={form.firstName}
                    onChange={(e) => handleFieldChange("firstName", e.target.value)}
                    onBlur={(e) => handleFieldBlur("firstName", e.target.value)}
                    placeholder="First name"
                />
                {getFieldError("firstName") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("firstName")}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label
                        htmlFor={`middleName-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Middle Name
                    </Label>
                    <Input
                        id={`middleName-${index}`}
                        className="h-12"
                        value={form.middleName}
                        onChange={(e) => onFormChange(index, "middleName", e.target.value)}
                        placeholder="Middle name"
                    />
                </div>
                <div>
                    <Label
                        htmlFor={`lastName-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Last Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`lastName-${index}`}
                        className={`h-12 ${hasFieldError("lastName")
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                            }`}
                        value={form.lastName}
                        onChange={(e) => handleFieldChange("lastName", e.target.value)}
                        onBlur={(e) => handleFieldBlur("lastName", e.target.value)}
                        placeholder="Last name"
                    />
                    {getFieldError("lastName") && (
                        <p className="text-red-500 text-xs mt-1">{getFieldError("lastName")}</p>
                    )}
                </div>
            </div>

            <div>
                <Label
                    htmlFor={`jobTitle-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`jobTitle-${index}`}
                    className="h-12"
                    value={form.jobTitle}
                    onChange={(e) => onFormChange(index, "jobTitle", e.target.value)}
                    placeholder="e.g., CEO, CFO"
                />
            </div>

            <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Role<span className="text-red-500">*</span>
                </Label>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`director-${index}`}
                            checked={form.isDirector}
                            onCheckedChange={(checked) => handleRoleChange("director", checked as boolean)}
                        />
                        <Label htmlFor={`director-${index}`} className="font-normal">
                            Director
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`shareholder-${index}`}
                            checked={form.isShareholder}
                            onCheckedChange={(checked) => handleRoleChange("shareholder", checked as boolean)}
                        />
                        <Label htmlFor={`shareholder-${index}`} className="font-normal">
                            Shareholder
                        </Label>
                    </div>
                </div>
            </div>

            {form.isShareholder && (
                <div>
                    <Label
                        htmlFor={`shareholderPercentage-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        How many percentage of the company does this shareholder own?
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`shareholderPercentage-${index}`}
                        type="text"
                        className={`h-12 ${hasFieldError("shareholderPercentage")
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                            }`}
                        inputMode="decimal"
                        pattern="^\d*\.?\d*$"
                        maxLength={6}
                        value={form.shareholderPercentage}
                        onChange={(e) => {
                            let value = e.target.value;
                            // Only allow digits and at most one decimal point, and max 6 chars
                            if (/^\d*\.?\d*$/.test(value) && value.length <= 6) {
                                handleFieldChange("shareholderPercentage", value);
                            }
                        }}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        title="Enter a number between 0.01 and 100"
                        onBlur={(e) => handleFieldBlur("shareholderPercentage", e.target.value)}
                        placeholder=""
                    />
                    {getFieldError("shareholderPercentage") && (
                        <p className="text-red-500 text-xs mt-1">{getFieldError("shareholderPercentage")}</p>
                    )}
                </div>
            )}

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Email */}
            <div>
                <Label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Email<span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`email-${index}`}
                    className={`h-12 ${hasFieldError("email") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    onBlur={(e) => handleFieldBlur("email", e.target.value)}
                    placeholder="Email address"
                />
                {getFieldError("email") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("email")}</p>
                )}
            </div>

            {/* Phone Number with Country Code */}
            <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number<span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                    <Popover
                        open={popoverStates[`phoneCode-${index}`]}
                        onOpenChange={(open) => togglePopover(`phoneCode-${index}`, open)}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={popoverStates[`phoneCode-${index}`]}
                                className="w-32 h-12 justify-between"
                            >
                                <img
                                    src={`https://flagcdn.com/w320/${countries
                                        .find((country) => country.name === form.selectedCountryCode)
                                        ?.iso2.toLowerCase()}.png`}
                                    alt=""
                                    width={18}
                                    height={18}
                                />
                                {form.phoneCode ? `+${form.phoneCode}` : "Code"}
                                <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-0">
                            <Command>
                                <CommandInput placeholder="Search country..." />
                                <CommandList>
                                    <CommandEmpty>No country found.</CommandEmpty>
                                    <CommandGroup>
                                        {countries.map((country: any, countryIndex: number) => (
                                            <CommandItem
                                                key={`${country.name}-${countryIndex}`}
                                                value={country.name}
                                                onSelect={(currentValue) => {
                                                    const selectedCountry = countries.find(
                                                        (c) => c.name.toLowerCase() === currentValue.toLowerCase()
                                                    );
                                                    if (selectedCountry) {
                                                        onFormChange(
                                                            index,
                                                            "phoneCode",
                                                            selectedCountry.phonecode || selectedCountry.phone_code
                                                        );
                                                        onFormChange(index, "selectedCountryCode", selectedCountry.name);
                                                    }
                                                    togglePopover(`phoneCode-${index}`, false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        form.selectedCountryCode === country.name ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <img
                                                    src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                                    alt=""
                                                    width={18}
                                                    height={18}
                                                    className="mr-2"
                                                />
                                                +{country.phonecode || country.phone_code} {country.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <div className="flex-1">
                        <Input
                            className={`h-12 ${hasFieldError("phoneNumber")
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : ""
                                }`}
                            value={form.phoneNumber}
                            onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                            onBlur={(e) => handleFieldBlur("phoneNumber", e.target.value)}
                            placeholder="Phone number"
                        />
                        {getFieldError("phoneNumber") && (
                            <p className="text-red-500 text-xs mt-1">{getFieldError("phoneNumber")}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Date of Birth and Nationality */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth<span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={popoverStates[`dateOfBirth-${index}`]}
                        onOpenChange={(open) => togglePopover(`dateOfBirth-${index}`, open)}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full h-12 justify-start text-left font-normal",
                                    !form.dateOfBirth && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {form.dateOfBirth ? format(form.dateOfBirth, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                selected={form.dateOfBirth}
                                onSelect={(date) => {
                                    onFormChange(index, "dateOfBirth", date);
                                    togglePopover(`dateOfBirth-${index}`, false);
                                }}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Country Of Birth<span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={popoverStates[`nationality-${index}`]}
                        onOpenChange={(open) => togglePopover(`nationality-${index}`, open)}
                    >
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-12 justify-between">
                                <div className="flex items-center gap-2">
                                    {form.nationality && (
                                        <img
                                            src={`https://flagcdn.com/w320/${countries
                                                .find((country) => country.name === form.nationality)
                                                ?.iso2.toLowerCase()}.png`}
                                            alt=""
                                            width={18}
                                            height={18}
                                        />
                                    )}
                                    {form.nationality || "Select country of birth"}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput placeholder="Search nationality..." />
                                <CommandEmpty>No nationality found.</CommandEmpty>
                                <CommandGroup>
                                    <CommandList className="max-h-[200px] overflow-y-auto">
                                        {countries.map((country: any) => (
                                            <CommandItem
                                                key={country.name}
                                                value={country.name}
                                                onSelect={() => {
                                                    onFormChange(index, "nationality", country.name);
                                                    togglePopover(`nationality-${index}`, false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        form.nationality === country.name ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <img
                                                    src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                                    alt=""
                                                    width={18}
                                                    height={18}
                                                    className="mr-2"
                                                />
                                                {country.name}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* ID Information */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Type<span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={form.idType}
                        onValueChange={(value) => onFormChange(index, "idType", value)}
                    >
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="drivers_license">Driver's License</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label
                        htmlFor={`idNumber-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        ID Number<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`idNumber-${index}`}
                        className={`h-12 ${hasFieldError("idNumber")
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                            }`}
                        value={form.idNumber}
                        onChange={(e) => handleFieldChange("idNumber", e.target.value)}
                        onBlur={(e) => handleFieldBlur("idNumber", e.target.value)}
                        placeholder="ID number"
                    />
                    {getFieldError("idNumber") && (
                        <p className="text-red-500 text-xs mt-1">{getFieldError("idNumber")}</p>
                    )}
                </div>
            </div>

            <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Issued Country<span className="text-red-500">*</span>
                </Label>
                <Popover
                    open={popoverStates[`issuedCountry-${index}`]}
                    onOpenChange={(open) => togglePopover(`issuedCountry-${index}`, open)}
                >
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-12 justify-between">
                            <div className="flex items-center gap-2">
                                {form.issuedCountry && (
                                    <img
                                        src={`https://flagcdn.com/w320/${countries
                                            .find((country) => country.name === form.issuedCountry)
                                            ?.iso2.toLowerCase()}.png`}
                                        alt=""
                                        width={18}
                                        height={18}
                                    />
                                )}
                                {form.issuedCountry || "Select issued country"}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search country..." />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                <CommandList className="max-h-[200px] overflow-y-auto">
                                    {countries.map((country: any) => (
                                        <CommandItem
                                            key={country.name}
                                            value={country.name}
                                            onSelect={() => {
                                                onFormChange(index, "issuedCountry", country.name);
                                                togglePopover(`issuedCountry-${index}`, false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    form.issuedCountry === country.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <img
                                                src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                                alt=""
                                                width={18}
                                                height={18}
                                                className="mr-2"
                                            />
                                            {country.name}
                                        </CommandItem>
                                    ))}
                                </CommandList>
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Date<span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={popoverStates[`issueDate-${index}`]}
                        onOpenChange={(open) => togglePopover(`issueDate-${index}`, open)}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full h-12 justify-start text-left font-normal",
                                    !form.issueDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {form.issueDate ? format(form.issueDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                selected={form.issueDate}
                                onSelect={(date) => {
                                    onFormChange(index, "issueDate", date);
                                    togglePopover(`issueDate-${index}`, false);
                                }}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date<span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={popoverStates[`expiryDate-${index}`]}
                        onOpenChange={(open) => togglePopover(`expiryDate-${index}`, open)}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full h-12 justify-start text-left font-normal",
                                    !form.expiryDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {form.expiryDate ? format(form.expiryDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                selected={form.expiryDate}
                                onSelect={(date) => {
                                    onFormChange(index, "expiryDate", date);
                                    togglePopover(`expiryDate-${index}`, false);
                                }}
                                disabled={(date) => date < new Date()}
                                fromYear={new Date().getFullYear()}
                                toYear={new Date().getFullYear() + 50}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Address Information */}
            <div>
                <Label
                    htmlFor={`streetAddress-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Street Address<span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`streetAddress-${index}`}
                    className={`h-12 ${hasFieldError("streetAddress")
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    value={form.streetAddress}
                    onChange={(e) => handleFieldChange("streetAddress", e.target.value)}
                    onBlur={(e) => handleFieldBlur("streetAddress", e.target.value)}
                    placeholder="Street address"
                />
                {getFieldError("streetAddress") && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError("streetAddress")}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`city-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        City<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`city-${index}`}
                        className={`h-12 ${hasFieldError("city") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                            }`}
                        value={form.city}
                        onChange={(e) => handleFieldChange("city", e.target.value)}
                        onBlur={(e) => handleFieldBlur("city", e.target.value)}
                        placeholder="City"
                    />
                    {getFieldError("city") && (
                        <p className="text-red-500 text-xs mt-1">{getFieldError("city")}</p>
                    )}
                </div>
                <div>
                    <Label
                        htmlFor={`postalCode-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Postal Code<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`postalCode-${index}`}
                        className={`h-12 ${hasFieldError("postalCode")
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                            }`}
                        value={form.postalCode}
                        onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                        onBlur={(e) => handleFieldBlur("postalCode", e.target.value)}
                        placeholder="Postal code"
                    />
                    {getFieldError("postalCode") && (
                        <p className="text-red-500 text-xs mt-1">{getFieldError("postalCode")}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label
                        htmlFor={`state-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        State/Province<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`state-${index}`}
                        className={`h-12 ${hasFieldError("state") ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                            }`}
                        value={form.state}
                        onChange={(e) => handleFieldChange("state", e.target.value)}
                        onBlur={(e) => handleFieldBlur("state", e.target.value)}
                        placeholder="State or Province"
                    />
                    {getFieldError("state") && (
                        <p className="text-red-500 text-xs mt-1">{getFieldError("state")}</p>
                    )}
                </div>
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Country<span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={popoverStates[`country-${index}`]}
                        onOpenChange={(open) => togglePopover(`country-${index}`, open)}
                    >
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-12 justify-between">
                                <div className="flex items-center gap-2">
                                    {form.country && (
                                        <img
                                            src={`https://flagcdn.com/w320/${countries
                                                .find((country) => country.name === form.country)
                                                ?.iso2.toLowerCase()}.png`}
                                            alt=""
                                            width={18}
                                            height={18}
                                        />
                                    )}
                                    {form.country || "Select country"}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput placeholder="Search country..." />
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                    <CommandList className="max-h-[200px] overflow-y-auto">
                                        {countries.map((country: any) => (
                                            <CommandItem
                                                key={country.name}
                                                value={country.name}
                                                onSelect={() => {
                                                    onFormChange(index, "country", country.name);
                                                    togglePopover(`country-${index}`, false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        form.country === country.name ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <img
                                                    src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                                    alt=""
                                                    width={18}
                                                    height={18}
                                                    className="mr-2"
                                                />
                                                {country.name}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Document Uploads */}
            <div className="space-y-6">
                <FileUploadField
                    label="Upload ID Document (Passport or Driver's License)"
                    required={true}
                    fieldKey={`${index}-idDocument`}
                    file={form.idDocument}
                    uploading={uploadingFiles[`${index}-idDocument`]}
                    error={fieldErrors[`${index}-idDocument`]}
                    onFileSelect={(file) => onFileUpload(file, index, "idDocument")}
                    onFileRemove={() => handleFileRemove("idDocument")}
                />
                <FileUploadField
                    label="Upload Proof of Address (utility bill, residence permit, etc.)"
                    required={true}
                    fieldKey={`${index}-proofOfAddress`}
                    file={form.proofOfAddress}
                    uploading={uploadingFiles[`${index}-proofOfAddress`]}
                    error={fieldErrors[`${index}-proofOfAddress`]}
                    onFileSelect={(file) => onFileUpload(file, index, "proofOfAddress")}
                    onFileRemove={() => handleFileRemove("proofOfAddress")}
                />
            </div>
        </div>
    );
}

// File Viewer Modal Component
interface FileViewerModalProps {
    file: File | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    label: string;
}

function FileViewerModal({ file, isOpen, onClose, onDelete, label }: FileViewerModalProps) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file && isOpen) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);

            // Cleanup function to revoke the object URL
            return () => {
                URL.revokeObjectURL(url);
                setFileUrl(null);
            };
        }
    }, [file, isOpen]);

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    const renderFileContent = () => {
        if (!file || !fileUrl) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No file to display</p>
                </div>
            );
        }

        const fileType = file.type.toLowerCase();
        const fileName = file.name;

        // Handle images
        if (fileType.startsWith("image/")) {
            return (
                <img
                    src={fileUrl}
                    alt={fileName}
                    className="max-w-full max-h-full object-contain mx-auto"
                />
            );
        }

        // Handle PDFs using browser's built-in PDF viewer
        if (fileType === "application/pdf") {
            return (
                <iframe
                    src={fileUrl}
                    className="w-full h-full border-0"
                    title={fileName ?? "pdf-preview"}
                />
            );
        }

        // Handle other documents - show download option
        if (
            fileType.includes("document") ||
            fileType.includes("spreadsheet") ||
            fileType.includes("presentation")
        ) {
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="text-6xl text-blue-500">📄</div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-700">{fileName}</p>
                        <p className="text-sm text-gray-500">Document preview</p>
                        <p className="text-xs text-gray-400 mt-2">
                            File size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Download Document
                        </a>
                    </div>
                </div>
            );
        }

        // Fallback for other file types
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-6xl text-gray-300">📄</div>
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-700">{fileName}</p>
                    <p className="text-sm text-gray-500">Preview not available for this file type</p>
                    <p className="text-xs text-gray-400 mt-2">
                        File size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[80vw] w-[80vw] h-[80vh] p-0 flex flex-col">
                <DialogHeader className="p-6 pb-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg font-semibold">{label}</DialogTitle>
                            <DialogDescription className="text-sm text-gray-600">
                                {file?.name} ({file ? (file.size / 1024 / 1024).toFixed(2) : "0"} MB)
                            </DialogDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                            <Button variant="outline" size="sm" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
                <div className="flex-1 p-6 pt-2 overflow-hidden min-h-0">
                    <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden">
                        {renderFileContent()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// File upload component
interface FileUploadFieldProps {
    label: string;
    required?: boolean;
    fieldKey: string;
    file: File | null;
    uploading: boolean;
    error: string;
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
}

function FileUploadField({
    label,
    required = false,
    fieldKey,
    file,
    uploading,
    error,
    onFileSelect,
    onFileRemove,
}: FileUploadFieldProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [showViewer, setShowViewer] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div>
            <Label className="block text-lg font-bold text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500">*</span>}
            </Label>
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary cursor-pointer",
                    dragActive ? "border-primary bg-primary/5" : "border-gray-300"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
            >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">Drag & drop or click to choose files</p>
                <p className="text-sm text-gray-500 mb-2">JPEG, PNG, and PDF formats</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                    Max file size: 10 MB
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileSelect(file);
                    }}
                />
            </div>

            {/* File status display */}
            <div className="mt-3">
                {uploading ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600">Uploading...</p>
                            <p className="text-xs text-gray-400">Preparing file</p>
                        </div>

                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-2 bg-primary rounded-full"
                                style={{
                                    width: "30%",
                                    transform: "translateX(-100%)",
                                    animation: "upload-slide 1.2s linear infinite",
                                }}
                            />
                        </div>

                        <style>{`
                            @keyframes upload-slide {
                                0% { transform: translateX(-120%); }
                                50% { transform: translateX(20%); }
                                100% { transform: translateX(120%); }
                            }
                        `}</style>
                    </div>
                ) : file ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <p className="text-sm font-medium">Uploaded</p>
                        </div>
                        <p className="text-sm text-gray-700 truncate flex-1">{file.name}</p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowViewer(true);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                aria-label={`View ${fieldKey}`}
                            >
                                <Eye className="h-3 w-3" />
                                View
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                        // clear native input so selecting same file again triggers onChange
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    } catch (e) {
                                        // ignore
                                    }
                                    onFileRemove();
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                aria-label={`Remove ${fieldKey}`}
                            >
                                <X className="h-3 w-3" />
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No file selected</p>
                )}

                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>

            {/* File Viewer Modal */}
            <FileViewerModal
                file={file}
                isOpen={showViewer}
                onClose={() => setShowViewer(false)}
                onDelete={() => {
                    try {
                        if (fileInputRef.current) fileInputRef.current.value = "";
                    } catch (e) {
                        // ignore
                    }
                    onFileRemove();
                }}
                label={label}
            />
        </div>
    );
}
