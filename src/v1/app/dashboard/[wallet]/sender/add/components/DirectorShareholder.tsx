"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/v1/components/ui/button";
import { Label } from "@/v1/components/ui/label";
import { Input } from "@/v1/components/ui/input";
import { Checkbox } from "@/v1/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/v1/components/ui/command";
import { Calendar } from "@/v1/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/v1/components/ui/dialog";
import {
    Plus,
    Trash2,
    Check,
    ChevronsUpDown,
    CalendarIcon,
    X,
    Eye,
    Upload,
    CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/v1/lib/utils";
import { Country } from "country-state-city";

import { ISender, IDirectorAndShareholder, IResponse } from "@/v1/interface/interface";
import { Status } from "@/v1/enums/enums";
import Defaults from "@/v1/defaults/defaults";
import { session, SessionData } from "@/v1/session/session";

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

interface DirectorShareholderProps {
    formData: Partial<ISender>;
    onFieldChange: (field: string, value: any) => void;
    onBack: () => void;
    onContinue: () => void;
}

export default function DirectorShareholder({
    formData,
    onFieldChange,
    onBack,
    onContinue
}: DirectorShareholderProps) {
    const [loading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allValid, setAllValid] = useState(false);

    // Forms array to handle multiple directors/shareholders
    const [forms, setForms] = useState<DirectorShareholderFormData[]>([]);

    // File upload states
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Popover states for each form
    const [popoverStates, setPopoverStates] = useState<Record<string, boolean>>({});

    const sd: SessionData = session.getUserData();

    // Initialize from existing formData directors (run only once on mount)
    // IMPORTANT: we avoid re-initializing on every prop change because that overwrites
    // transient local File objects (causes the uploaded/no-file flash).
    useEffect(() => {
        if (formData.directors && formData.directors.length > 0) {
            const convertedForms = formData.directors.map((director: IDirectorAndShareholder) => ({
                firstName: director.firstName || "",
                lastName: director.lastName || "",
                middleName: director.middleName || "",
                email: director.email || "",
                jobTitle: director.jobTitle || "",
                role: director.role || "",
                isDirector: director.isDirector || false,
                isShareholder: director.isShareholder || false,
                shareholderPercentage: director.shareholderPercentage?.toString() || "",
                dateOfBirth: director.dateOfBirth ? new Date(director.dateOfBirth) : undefined,
                nationality: director.nationality || "",
                phoneCode: director.phoneCode || "234",
                selectedCountryCode: "Nigeria", // Default or derive from phoneCode
                phoneNumber: director.phoneNumber || "",
                idType: director.idType || "" as any,
                idNumber: director.idNumber || "",
                issuedCountry: director.issuedCountry || "",
                issueDate: director.issueDate ? new Date(director.issueDate) : undefined,
                expiryDate: director.expiryDate ? new Date(director.expiryDate) : undefined,
                streetAddress: director.streetAddress || "",
                city: director.city || "",
                state: director.state || "",
                postalCode: director.postalCode || "",
                country: director.country || "",
                idDocument: null, // File objects can't be persisted across parent
                proofOfAddress: null,
                idDocumentUrl: director.idDocument?.url || "",
                proofOfAddressUrl: director.proofOfAddress?.url || "",
            }));
            setForms(convertedForms);
        } else {
            // Initialize with one empty form
            setForms([createNewForm()]);
        }
        // Run only once on mount to avoid overwriting local File state when parent updates
    }, [] as []);

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
                if (!data.handshake)
                    throw new Error("Unable to process upload response right now, please try again.");
                const parseData: { url: string } = Defaults.PARSE_DATA(
                    data.data,
                    sd.client.privateKey,
                    data.handshake
                );

                // Update form with file and URL in a single state update to avoid transient flicker
                setForms((prev) =>
                    prev.map((f, i) =>
                        i === formIndex
                            ? { ...f, [fieldType]: file, [`${fieldType}Url`]: parseData.url }
                            : f
                    )
                );
                // Clear any validation errors for these fields (optional)
                setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next[`${formIndex}-${fieldType}`];
                    delete next[`${formIndex}-${fieldType}Url`];
                    return next;
                });
            }
        } catch (err: any) {
            setFieldErrors((prev) => ({ ...prev, [uploadKey]: err.message || "File upload failed" }));
        } finally {
            setUploadingFiles((prev) => ({ ...prev, [uploadKey]: false }));
        }
    };

    const validateForm = (form: DirectorShareholderFormData): boolean => {
        const hasIdDocument = !!form.idDocument || (!!form.idDocumentUrl && form.idDocumentUrl.trim() !== "");
        const hasProofOfAddress = !!form.proofOfAddress || (!!form.proofOfAddressUrl && form.proofOfAddressUrl.trim() !== "");
        const hasShareholderPercentage = !form.isShareholder || form.shareholderPercentage.trim() !== "";

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
            hasShareholderPercentage &&
            hasIdDocument &&
            hasProofOfAddress
        );
    };

    useEffect(() => {
        setAllValid(forms.every((form) => validateForm(form)));

        // Update formData with current directors data
        const directorsData: IDirectorAndShareholder[] = forms.map((form) => ({
            senderId: "", // Will be set when submitting
            firstName: form.firstName,
            lastName: form.lastName,
            middleName: form.middleName,
            email: form.email,
            jobTitle: form.jobTitle,
            role: form.role,
            isDirector: form.isDirector,
            isShareholder: form.isShareholder,
            shareholderPercentage: form.isShareholder ? Number(form.shareholderPercentage) || 0 : 0,
            dateOfBirth: form.dateOfBirth || new Date(),
            nationality: form.nationality,
            phoneCode: form.phoneCode,
            phoneNumber: form.phoneNumber,
            idType: form.idType as "passport" | "drivers_license",
            idNumber: form.idNumber,
            issuedCountry: form.issuedCountry,
            issueDate: form.issueDate || new Date(),
            expiryDate: form.expiryDate || new Date(),
            streetAddress: form.streetAddress,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
            isVerificationComplete: false,
            idDocument: {
                name: form.idDocument?.name || "",
                type: form.idDocument?.type || "",
                url: form.idDocumentUrl || "",
                uploadedAt: new Date(),
                smileIdStatus: "not_submitted",
                smileIdVerifiedAt: null,
                smileIdJobId: null,
                smileIdUploadId: null,
                issue: false,
                issueResolved: false,
                issueResolvedAt: null
            },
            proofOfAddress: {
                name: form.proofOfAddress?.name || "",
                type: form.proofOfAddress?.type || "",
                url: form.proofOfAddressUrl || "",
                uploadedAt: new Date(),
                smileIdStatus: "not_submitted",
                smileIdVerifiedAt: null,
                smileIdJobId: null,
                smileIdUploadId: null,
                issue: false,
                issueResolved: false,
                issueResolvedAt: null
            }
        }));

        onFieldChange('directors', directorsData);
    }, [forms]);

    const handleContinue = () => {
        setError(null);

        // Validate all forms
        for (let i = 0; i < forms.length; i++) {
            if (!validateForm(forms[i])) {
                setError(`Please fill all required fields for ${forms[i].firstName || `Person ${i + 1}`}`);
                return;
            }
        }

        if (forms.length === 0) {
            setError("Please add at least one director or shareholder");
            return;
        }

        onContinue();
    };

    const countries = Country.getAllCountries();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
        >
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Directors & Shareholders</h2>
                <p className="text-gray-600">
                    Add information for all company directors and shareholders.
                </p>
            </div>

            <div className="space-y-8">
                {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                {forms.map((form, index) => (
                    <DirectorShareholderFormCard
                        key={index}
                        form={form}
                        index={index}
                        isFirstForm={index === 0}
                        onFormChange={handleFormChange}
                        onFileUpload={handleFileUpload}
                        onRemove={forms.length > 1 ? () => handleRemoveForm(index) : undefined}
                        popoverStates={popoverStates}
                        togglePopover={togglePopover}
                        uploadingFiles={uploadingFiles}
                        fieldErrors={fieldErrors}
                        countries={countries}
                    />
                ))}

                {/* Add Another Form Button */}
                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddForm}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Another Director/Shareholder
                    </Button>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="px-6"
                >
                    Back
                </Button>
                <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={loading || !allValid}
                    className="px-6"
                >
                    {loading ? "Processing..." : "Continue"}
                </Button>
            </div>
        </motion.div>
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
    countries,
}: DirectorShareholderFormCardProps) {
    // Local validation state
    const [localValidationErrors, setLocalValidationErrors] = useState<Record<string, string>>({});

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
                    if (!value || isNaN(Number(value)) || Number(value) <= 0 || Number(value) > 100) {
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
        <div className="space-y-6 border rounded-lg p-6 bg-gray-50">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    {isFirstForm ? "Primary " : "Additional "}Director/Shareholder {!isFirstForm && `#${index + 1}`}
                </h3>
                {onRemove && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onRemove}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                    </Button>
                )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`firstName-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`firstName-${index}`}
                        className={`h-12 ${hasFieldError("firstName") ? "border-red-500" : ""}`}
                        value={form.firstName}
                        onChange={(e) => handleFieldChange("firstName", e.target.value)}
                        onBlur={(e) => handleFieldBlur("firstName", e.target.value)}
                        placeholder="First name"
                    />
                    {getFieldError("firstName") && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError("firstName")}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor={`lastName-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`lastName-${index}`}
                        className={`h-12 ${hasFieldError("lastName") ? "border-red-500" : ""}`}
                        value={form.lastName}
                        onChange={(e) => handleFieldChange("lastName", e.target.value)}
                        onBlur={(e) => handleFieldBlur("lastName", e.target.value)}
                        placeholder="Last name"
                    />
                    {getFieldError("lastName") && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError("lastName")}</p>
                    )}
                </div>
            </div>

            <div>
                <Label htmlFor={`middleName-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name
                </Label>
                <Input
                    id={`middleName-${index}`}
                    className="h-12"
                    value={form.middleName}
                    onChange={(e) => onFormChange(index, "middleName", e.target.value)}
                    placeholder="Middle name (optional)"
                />
            </div>

            <div>
                <Label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`email-${index}`}
                    type="email"
                    className={`h-12 ${hasFieldError("email") ? "border-red-500" : ""}`}
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    onBlur={(e) => handleFieldBlur("email", e.target.value)}
                    placeholder="Email address"
                />
                {getFieldError("email") && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError("email")}</p>
                )}
            </div>

            <div>
                <Label htmlFor={`jobTitle-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                </Label>
                <Input
                    id={`jobTitle-${index}`}
                    className="h-12"
                    value={form.jobTitle}
                    onChange={(e) => onFormChange(index, "jobTitle", e.target.value)}
                    placeholder="e.g., CEO, CFO"
                />
            </div>

            {/* Role Selection */}
            <div>
                <Label className="block text-sm font-medium text-gray-700 mb-3">
                    Role <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`director-${index}`}
                            checked={form.isDirector}
                            onCheckedChange={(checked) => handleRoleChange("director", checked as boolean)}
                        />
                        <Label htmlFor={`director-${index}`}>Director</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`shareholder-${index}`}
                            checked={form.isShareholder}
                            onCheckedChange={(checked) => handleRoleChange("shareholder", checked as boolean)}
                        />
                        <Label htmlFor={`shareholder-${index}`}>Shareholder</Label>
                    </div>
                </div>
            </div>

            {form.isShareholder && (
                <div>
                    <Label htmlFor={`shareholderPercentage-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Shareholding Percentage <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`shareholderPercentage-${index}`}
                        type="text"
                        className={`h-12 ${hasFieldError("shareholderPercentage") ? "border-red-500" : ""}`}
                        inputMode="decimal"
                        pattern="^\d*\.?\d*$"
                        maxLength={6}
                        value={form.shareholderPercentage}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                handleFieldChange("shareholderPercentage", value);
                            }
                        }}
                        onBlur={(e) => handleFieldBlur("shareholderPercentage", e.target.value)}
                        placeholder="e.g., 25.5"
                    />
                    {getFieldError("shareholderPercentage") && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError("shareholderPercentage")}</p>
                    )}
                </div>
            )}

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={popoverStates[`dob-${index}`]}
                        onOpenChange={(open) => togglePopover(`dob-${index}`, open)}
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
                                {form.dateOfBirth ? format(form.dateOfBirth, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={form.dateOfBirth}
                                onSelect={(date) => {
                                    onFormChange(index, "dateOfBirth", date);
                                    togglePopover(`dob-${index}`, false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality <span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={popoverStates[`nationality-${index}`]}
                        onOpenChange={(open) => togglePopover(`nationality-${index}`, open)}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-full h-12 justify-between"
                            >
                                {form.nationality || "Select nationality..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search nationality..." />
                                <CommandList>
                                    <CommandEmpty>No nationality found.</CommandEmpty>
                                    <CommandGroup>
                                        {countries.map((country) => (
                                            <CommandItem
                                                key={country.isoCode}
                                                value={country.name}
                                                onSelect={(value) => {
                                                    onFormChange(index, "nationality", value);
                                                    togglePopover(`nationality-${index}`, false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        form.nationality === country.name ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {country.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Phone Number */}
            <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                    <Select
                        value={form.phoneCode}
                        onValueChange={(value) => onFormChange(index, "phoneCode", value)}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="234">+234 (NG)</SelectItem>
                            <SelectItem value="1">+1 (US)</SelectItem>
                            <SelectItem value="44">+44 (UK)</SelectItem>
                            {/* Add more country codes as needed */}
                        </SelectContent>
                    </Select>
                    <Input
                        className={`flex-1 h-12 ${hasFieldError("phoneNumber") ? "border-red-500" : ""}`}
                        value={form.phoneNumber}
                        onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                        onBlur={(e) => handleFieldBlur("phoneNumber", e.target.value)}
                        placeholder="Phone number"
                    />
                </div>
                {getFieldError("phoneNumber") && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError("phoneNumber")}</p>
                )}
            </div>

            {/* ID Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Type <span className="text-red-500">*</span>
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
                    <Label htmlFor={`idNumber-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        ID Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`idNumber-${index}`}
                        className={`h-12 ${hasFieldError("idNumber") ? "border-red-500" : ""}`}
                        value={form.idNumber}
                        onChange={(e) => handleFieldChange("idNumber", e.target.value)}
                        onBlur={(e) => handleFieldBlur("idNumber", e.target.value)}
                        placeholder="ID number"
                    />
                    {getFieldError("idNumber") && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError("idNumber")}</p>
                    )}
                </div>
            </div>

            <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Issued Country <span className="text-red-500">*</span>
                </Label>
                <Popover
                    open={popoverStates[`issuedCountry-${index}`]}
                    onOpenChange={(open) => togglePopover(`issuedCountry-${index}`, open)}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full h-12 justify-between"
                        >
                            {form.issuedCountry || "Select country..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search country..." />
                            <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                    {countries.map((country) => (
                                        <CommandItem
                                            key={country.isoCode}
                                            value={country.name}
                                            onSelect={(value) => {
                                                onFormChange(index, "issuedCountry", value);
                                                togglePopover(`issuedCountry-${index}`, false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    form.issuedCountry === country.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {country.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Issue and Expiry Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Date <span className="text-red-500">*</span>
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
                                {form.issueDate ? format(form.issueDate, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={form.issueDate}
                                onSelect={(date) => {
                                    onFormChange(index, "issueDate", date);
                                    togglePopover(`issueDate-${index}`, false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date <span className="text-red-500">*</span>
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
                                {form.expiryDate ? format(form.expiryDate, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={form.expiryDate}
                                onSelect={(date) => {
                                    onFormChange(index, "expiryDate", date);
                                    togglePopover(`expiryDate-${index}`, false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Address Information */}
            <div>
                <Label htmlFor={`streetAddress-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`streetAddress-${index}`}
                    className={`h-12 ${hasFieldError("streetAddress") ? "border-red-500" : ""}`}
                    value={form.streetAddress}
                    onChange={(e) => handleFieldChange("streetAddress", e.target.value)}
                    onBlur={(e) => handleFieldBlur("streetAddress", e.target.value)}
                    placeholder="Street address"
                />
                {getFieldError("streetAddress") && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError("streetAddress")}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`city-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`city-${index}`}
                        className={`h-12 ${hasFieldError("city") ? "border-red-500" : ""}`}
                        value={form.city}
                        onChange={(e) => handleFieldChange("city", e.target.value)}
                        onBlur={(e) => handleFieldBlur("city", e.target.value)}
                        placeholder="City"
                    />
                    {getFieldError("city") && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError("city")}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor={`state-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`state-${index}`}
                        className={`h-12 ${hasFieldError("state") ? "border-red-500" : ""}`}
                        value={form.state}
                        onChange={(e) => handleFieldChange("state", e.target.value)}
                        onBlur={(e) => handleFieldBlur("state", e.target.value)}
                        placeholder="State/Province"
                    />
                    {getFieldError("state") && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError("state")}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`postalCode-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`postalCode-${index}`}
                        className={`h-12 ${hasFieldError("postalCode") ? "border-red-500" : ""}`}
                        value={form.postalCode}
                        onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                        onBlur={(e) => handleFieldBlur("postalCode", e.target.value)}
                        placeholder="Postal code"
                    />
                    {getFieldError("postalCode") && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError("postalCode")}</p>
                    )}
                </div>

                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                    </Label>
                    <Popover
                        open={popoverStates[`country-${index}`]}
                        onOpenChange={(open) => togglePopover(`country-${index}`, open)}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-full h-12 justify-between"
                            >
                                {form.country || "Select country..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search country..." />
                                <CommandList>
                                    <CommandEmpty>No country found.</CommandEmpty>
                                    <CommandGroup>
                                        {countries.map((country) => (
                                            <CommandItem
                                                key={country.isoCode}
                                                value={country.name}
                                                onSelect={(value) => {
                                                    onFormChange(index, "country", value);
                                                    togglePopover(`country-${index}`, false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        form.country === country.name ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {country.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Document Uploads */}
            <div className="space-y-6">
                <FileUploadField
                    label="Upload ID Document (Passport or Driver's License)"
                    required={true}
                    file={form.idDocument}
                    fileUrl={form.idDocumentUrl}
                    uploading={uploadingFiles[`${index}-idDocument`]}
                    error={fieldErrors[`${index}-idDocument`]}
                    onFileSelect={(file) => onFileUpload(file, index, "idDocument")}
                    onFileRemove={() => handleFileRemove("idDocument")}
                />
                <FileUploadField
                    label="Upload Proof of Address (utility bill, residence permit, etc.)"
                    required={true}
                    file={form.proofOfAddress}
                    fileUrl={form.proofOfAddressUrl}
                    uploading={uploadingFiles[`${index}-proofOfAddress`]}
                    error={fieldErrors[`${index}-proofOfAddress`]}
                    onFileSelect={(file) => onFileUpload(file, index, "proofOfAddress")}
                    onFileRemove={() => handleFileRemove("proofOfAddress")}
                />
            </div>
        </div>
    );
}

// Helper function to extract filename from URL
const getFilenameFromUrlHelper = (url: string): string => {
    try {
        const decodedUrl = decodeURIComponent(url);
        const filename = decodedUrl.split('/').pop() || 'document';
        const cleanFilename = filename.split('?')[0];
        if (cleanFilename.length > 30) {
            const parts = cleanFilename.split('.');
            const ext = parts.pop() || '';
            const name = parts.join('.');
            return name.substring(0, 25) + '...' + (ext ? '.' + ext : '');
        }
        return cleanFilename;
    } catch (error) {
        return 'document';
    }
};

// File Viewer Modal Component
interface FileViewerModalProps {
    file: File | null;
    url?: string | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    label: string;
}

function FileViewerModal({ file, url, isOpen, onClose, onDelete, label }: FileViewerModalProps) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (file) {
                const objectUrl = URL.createObjectURL(file);
                setFileUrl(objectUrl);
                return () => {
                    URL.revokeObjectURL(objectUrl);
                    setFileUrl(null);
                };
            } else if (url) {
                setFileUrl(url);
                return () => {
                    setFileUrl(null);
                };
            }
        }
    }, [file, url, isOpen]);

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    const renderFileContent = () => {
        if (!fileUrl) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No file to display</p>
                </div>
            );
        }

        let fileType = '';
        let fileName = '';
        let fileSize = 0;

        if (file) {
            fileType = file.type.toLowerCase();
            fileName = file.name;
            fileSize = file.size;
        } else if (url) {
            fileName = getFilenameFromUrlHelper(url);
            const ext = fileName.split('.').pop()?.toLowerCase() || '';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                fileType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            } else if (ext === 'pdf') {
                fileType = 'application/pdf';
            } else {
                fileType = 'application/octet-stream';
            }
            fileSize = 0;
        }

        if (fileType.startsWith("image/")) {
            return (
                <img
                    src={fileUrl}
                    alt={fileName}
                    className="max-w-full max-h-full object-contain mx-auto"
                />
            );
        }

        if (fileType === "application/pdf") {
            return (
                <iframe
                    src={fileUrl}
                    className="w-full h-full border-0"
                    title={fileName ?? "pdf-preview"}
                />
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-6xl text-gray-300">📄</div>
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-700">{fileName}</p>
                    <p className="text-sm text-gray-500">Preview not available for this file type</p>
                    {fileSize > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                            File size: {(fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[80vw] w-[80vw] h-[95vh] p-0 flex flex-col">
                <DialogHeader className="p-6 pb-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg font-semibold">{label}</DialogTitle>
                            <DialogDescription className="text-sm text-gray-600">
                                {file?.name || (url ? getFilenameFromUrlHelper(url) : '')}
                                {file && file.size > 0 && `(${(file.size / 1024 / 1024).toFixed(2)} MB)`}
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
    file: File | null;
    fileUrl?: string;
    uploading: boolean;
    error: string;
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
}

function FileUploadField({
    label,
    required = false,
    file,
    fileUrl,
    uploading,
    error,
    onFileSelect,
    onFileRemove,
}: FileUploadFieldProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

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
            if (file.size > MAX_FILE_SIZE) {
                setLocalError(`File too large. Max allowed size is 20 MB.`);
                return;
            }
            setLocalError(null);
            onFileSelect(file);
        }
    };

    return (
        <div>
            <Label className="block text-lg font-bold text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
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
                    Max file size: 20 MB
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > MAX_FILE_SIZE) {
                            setLocalError(`File too large. Max allowed size is 20 MB.`);
                            // reset input so user can re-select same file if desired
                            e.currentTarget.value = "";
                            return;
                        }
                        setLocalError(null);
                        onFileSelect(file);
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
                ) : fileUrl ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <p className="text-sm font-medium">Uploaded</p>
                        </div>
                        <p className="text-sm text-gray-700 truncate">
                            {file?.name || getFilenameFromUrlHelper(fileUrl)}
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowViewer(true)}
                            className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            <Eye className="h-4 w-4" />
                            View
                        </button>
                        <button
                            type="button"
                            onClick={onFileRemove}
                            className="ml-2 text-red-500 hover:text-red-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : file ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                                <Upload className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-700">Selected: {file.name}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onFileRemove}
                            className="ml-auto text-red-500 hover:text-red-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No file selected</p>
                )}

                {/* show local size error first, then server error prop */}
                {(localError || error) && (
                    <p className="text-sm text-red-500 mt-2">{localError || error}</p>
                )}

                {/* File Viewer Modal */}
                <FileViewerModal
                    file={file}
                    url={fileUrl}
                    isOpen={showViewer}
                    onClose={() => setShowViewer(false)}
                    onDelete={() => {
                        try {
                            onFileRemove();
                        } catch (e) {
                            console.error("Error removing file:", e);
                        }
                    }}
                    label={label}
                />
            </div>
        </div>
    );
}