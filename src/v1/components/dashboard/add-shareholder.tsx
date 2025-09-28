"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { Label } from "@/v1/components/ui/label"
import { Checkbox } from "@/v1/components/ui/checkbox"
import { Mail, User, Percent, IdCard, Calendar, Building, Mailbox, Map, Plus } from "lucide-react"
import { Logo } from "@/v1/components/logo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select"
import { Country, ICountry } from 'country-state-city'
// import { useLocation } from "wouter"

export function AddShareHolderForm() {
    const [dragActive, setDragActive] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [roles, setRoles] = useState<string[]>([])

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        volume: "",
        country: "",
        countryCode: "",
        phoneNumber: "",
        address: "",
        postal: "",
        city: "",
        state: "",
        dateOfBirth: "",
        idType: "",
        idNumber: "",
        issuedCountry: "",
        issuedDate: "",
        expiryDate: "",
        agreeToTerms: false,
        agreeToMarketing: false,
    })

    // const { id } = useParams() // TODO: Implement URL param extraction for wouter
    const countries: Array<ICountry> = Country.getAllCountries()

    // Get id from URL path if needed
    // const [location] = useLocation()
    // const id = location.split('/').pop() // Extract id from URL if needed

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(e.type === "dragenter" || e.type === "dragover")
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            setUploadedFile(file)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
        }
    }

    const toggleRole = (role: string) => {
        setRoles((prev) =>
            prev.includes(role)
                ? prev.filter((r) => r !== role)
                : [...prev, role]
        )
    }

    // const isChecked = (role: string) => roles.includes(role) // TODO: Implement role checking if needed

    const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
        let sanitizedValue: string | boolean = value

        if (typeof value === "string") {
            switch (field) {
                case "firstName":
                case "lastName":
                case "middleName":
                    sanitizedValue = value.replace(/[^a-zA-Z]/g, "")
                    break
                case "email":
                    sanitizedValue = value.replace(/\s+/g, "").toLowerCase()
                    sanitizedValue = sanitizedValue.replace(/[^a-z0-9@._-]/g, "")
                    break
                case "phoneNumber":
                    sanitizedValue = value.replace(/[^0-9]/g, "")
                    break
                case "volume":
                    sanitizedValue = value.replace(/[^0-9.]/g, "")
                    break
                case "idNumber":
                    sanitizedValue = value.replace(/[^a-zA-Z0-9-]/g, "")
                    break
            }
        }

        setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!formData.agreeToTerms) {
            setError("You must agree to the Terms and Conditions")
            return
        }

        if (!roles.length) {
            setError("Please select at least one role (Director/Shareholder)")
            return
        }

        setIsLoading(true)

        try {
            // Submit to server with formData and roles
            // Include uploadedFile if needed
        } catch (err: any) {
            setIsLoading(false)
            setError(err.message || "Failed to submit form")
        }
    }

    const renderUploadField = (fieldKey: string, label: string) => (
        <div key={fieldKey}>
            <Label className="block text-lg font-bold text-gray-700 mb-2">{label}</Label>
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${dragActive ? "border-primary bg-primary/5" : "border-gray-300"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
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
                    Max file size: 2 MB
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    id={`file-upload-${fieldKey}`}
                />
                <label htmlFor={`file-upload-${fieldKey}`} className="absolute inset-0 cursor-pointer" />
            </div>
            {uploadedFile && (
                <p className="text-sm text-green-600 mt-2">File uploaded: {uploadedFile?.name}</p>
            )}
        </div>
    )

    const textInputProps = {
        className: "pl-10 h-12",
        required: true,
    }

    const iconProps = {
        className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
    }

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0">
            <div className="w-full h-full flex flex-row items-start justify-between">
                <div className="w-full h-full overflow-y-auto custom-scroll px-4 py-6">
                    <div className="p-4 max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <a href="/" className="flex items-center space-x-2">
                                <Logo className="h-8 w-auto" />
                            </a>
                            <a href="/login" className="text-gray-400 hover:text-gray-600">
                                Skip
                            </a>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Director and Shareholders to (Business Name)</h1>
                            <p className="text-gray-600">Let's start with your personal credentials</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            <div>
                                <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First name <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        placeholder="First name"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        {...textInputProps}
                                    />
                                    <User {...iconProps} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Other Name
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="middleName"
                                            name="middleName"
                                            type="text"
                                            autoComplete="additional-name"
                                            placeholder="Other name"
                                            value={formData.middleName}
                                            onChange={(e) => handleInputChange("middleName", e.target.value)}
                                            className="pl-10 h-12"
                                        />
                                        <User {...iconProps} />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last name <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            autoComplete="family-name"
                                            placeholder="Last name"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            {...textInputProps}
                                        />
                                        <User {...iconProps} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        {...textInputProps}
                                    />
                                    <Mail {...iconProps} />
                                </div>
                            </div>

                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Title (Director / Shareholder) <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-6">
                                    <label className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={roles.includes("Director")}
                                            onCheckedChange={() => toggleRole("Director")}
                                            id="role-director"
                                        />
                                        <span>Director</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={roles.includes("Shareholder")}
                                            onCheckedChange={() => toggleRole("Shareholder")}
                                            id="role-shareholder"
                                        />
                                        <span>Shareholder</span>
                                    </label>
                                </div>
                                <Label className="block text-sm font-medium text-gray-700 mt-2">
                                    {roles.length > 0 ? roles.join(", ") : "Select Role"}
                                </Label>
                            </div>

                            <div>
                                <Label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                                    Ownership Percentage <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="volume"
                                        name="volume"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="0.00"
                                        value={formData.volume}
                                        onChange={(e) => handleInputChange("volume", e.target.value)}
                                        {...textInputProps}
                                    />
                                    <Percent {...iconProps} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        autoComplete="bday"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                        {...textInputProps}
                                    />
                                    <Calendar {...iconProps} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nationality <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country, index) => (
                                            <SelectItem key={index} value={country.name}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <Select value={formData.countryCode} onValueChange={(value) => handleInputChange("countryCode", value)}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue placeholder="Code" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((country, index) => (
                                                <SelectItem key={index} value={country.phonecode}>
                                                    {country.flag} {country.phonecode}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        className="flex-1 pl-10 h-12"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        placeholder="Enter Phone Number"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="text"
                                        autoComplete="tel"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-2">
                                    ID Type <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.idType} onValueChange={(value) => handleInputChange("idType", value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select ID type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="passport">Passport</SelectItem>
                                        <SelectItem value="drivingLicense">Driving License</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    ID Number <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="idNumber"
                                        name="idNumber"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="0000-0000-0000-0000"
                                        value={formData.idNumber}
                                        onChange={(e) => handleInputChange("idNumber", e.target.value)}
                                        {...textInputProps}
                                    />
                                    <IdCard {...iconProps} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="issuedCountry" className="block text-sm font-medium text-gray-700 mb-2">
                                    Issued Country <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.issuedCountry} onValueChange={(value) => handleInputChange("issuedCountry", value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country, index) => (
                                            <SelectItem key={index} value={country.name}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="issuedDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Issued Date <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="issuedDate"
                                            name="issuedDate"
                                            type="date"
                                            autoComplete="off"
                                            value={formData.issuedDate}
                                            onChange={(e) => handleInputChange("issuedDate", e.target.value)}
                                            {...textInputProps}
                                        />
                                        <Calendar {...iconProps} />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Expiry Date <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="expiryDate"
                                            name="expiryDate"
                                            type="date"
                                            autoComplete="off"
                                            value={formData.expiryDate}
                                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                                            {...textInputProps}
                                        />
                                        <Calendar {...iconProps} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </Label>
                            </div>

                            <div>
                                <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                    Address <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="address"
                                        name="address"
                                        type="text"
                                        autoComplete="street-address"
                                        placeholder="Enter your address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        {...textInputProps}
                                    />
                                    <Map {...iconProps} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nationality <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country, index) => (
                                            <SelectItem key={index} value={country.name}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                    State
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="state"
                                        name="state"
                                        type="text"
                                        autoComplete="address-level1"
                                        placeholder="Enter your state"
                                        value={formData.state}
                                        onChange={(e) => handleInputChange("state", e.target.value)}
                                        className="pl-10 h-12"
                                    />
                                    <Mailbox {...iconProps} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="city"
                                            name="city"
                                            type="text"
                                            autoComplete="address-level2"
                                            placeholder="Enter your city"
                                            value={formData.city}
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                            {...textInputProps}
                                        />
                                        <Building {...iconProps} />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="postal" className="block text-sm font-medium text-gray-700 mb-2">
                                        Postal code <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="postal"
                                            name="postal"
                                            type="text"
                                            autoComplete="postal-code"
                                            placeholder="Enter your postal code"
                                            value={formData.postal}
                                            onChange={(e) => handleInputChange("postal", e.target.value)}
                                            {...textInputProps}
                                        />
                                        <Mailbox {...iconProps} />
                                    </div>
                                </div>
                            </div>

                            {renderUploadField("idcard", "Upload ID (International Passport or Driver's License)")}
                            {renderUploadField("proofOfAddress", "Upload Proof of Address (Recent Utility Bill, Residence Permit)")}

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                                        required
                                    />
                                    <Label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                                        I agree to Rojifi's{" "}
                                        <a href="/privacy" className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                                            Privacy Policy
                                        </a>{" "}
                                        and{" "}
                                        <a href="/terms" className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                                            Terms and Conditions
                                        </a>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="agreeToMarketing"
                                        checked={formData.agreeToMarketing}
                                        required={true}
                                        onCheckedChange={(checked) => handleInputChange("agreeToMarketing", checked)}
                                    />
                                    <Label htmlFor="agreeToMarketing" className="text-sm text-gray-600">
                                        I consent to receive electronic communications regarding my accounts and services
                                    </Label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                                    {isLoading ? "Creating account..." : "Submit"}
                                </Button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Have an account?{" "}
                                <a href="/login" className="text-primary hover:text-primary/80 font-medium">
                                    Sign in
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}