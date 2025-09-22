import { motion } from "framer-motion";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import { ArrowLeft, ArrowUpRight, User } from "lucide-react";
import { ISender } from "@/v1/interface/interface";
import { countries } from "../constants";

interface SenderProfileProps {
    formData: Partial<ISender>;
    onFieldChange: (field: string, value: any) => void;
    onBack: () => void;
    onContinue: () => void;
}

export function SenderProfile({
    formData,
    onFieldChange,
    onBack,
    onContinue
}: SenderProfileProps) {
    const booleanOptions = [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" }
    ];

    const roleOptions = [
        { value: "ceo", label: "Chief Executive Officer (CEO)" },
        { value: "cto", label: "Chief Technology Officer (CTO)" },
        { value: "cfo", label: "Chief Financial Officer (CFO)" },
        { value: "director", label: "Director" },
        { value: "manager", label: "Manager" },
        { value: "owner", label: "Owner" },
        { value: "other", label: "Other" }
    ];

    const isFormValid = () => {
        return formData.creatorFirstName &&
            formData.creatorLastName &&
            formData.creatorDateOfBirth &&
            formData.creatorPosition &&
            formData.creatorBirthCountry &&
            formData.isBeneficialOwner &&
            formData.creatorPercentageOwnership &&
            formData.creatorRole &&
            formData.creatorVotingRightPercentage &&
            formData.creatorIsBusinessContact &&
            formData.creatorEmail &&
            formData.creatorTaxIdentificationNumber &&
            formData.creatorSocialSecurityNumber;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <User className="h-8 w-8 text-primary mr-3" />
                            <h2 className="text-2xl font-bold">Sender Profile</h2>
                        </div>
                        <p className="text-gray-600">
                            Please provide personal information about the primary contact/owner of this sender account.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>

                            <div>
                                <Label htmlFor="creatorFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="creatorFirstName"
                                    type="text"
                                    placeholder="John"
                                    value={formData.creatorFirstName || ""}
                                    onChange={(e) => onFieldChange('creatorFirstName', e.target.value)}
                                    className="border-2 focus:border-primary"
                                />
                            </div>

                            <div>
                                <Label htmlFor="creatorMiddleName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Middle Name
                                </Label>
                                <Input
                                    id="creatorMiddleName"
                                    type="text"
                                    placeholder="Michael"
                                    value={formData.creatorMiddleName || ""}
                                    onChange={(e) => onFieldChange('creatorMiddleName', e.target.value)}
                                    className="border-2 focus:border-primary"
                                />
                            </div>

                            <div>
                                <Label htmlFor="creatorLastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="creatorLastName"
                                    type="text"
                                    placeholder="Doe"
                                    value={formData.creatorLastName || ""}
                                    onChange={(e) => onFieldChange('creatorLastName', e.target.value)}
                                    className="border-2 focus:border-primary"
                                />
                            </div>

                            <div>
                                <Label htmlFor="creatorDateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="creatorDateOfBirth"
                                    type="date"
                                    value={formData.creatorDateOfBirth ? new Date(formData.creatorDateOfBirth).toISOString().split('T')[0] : ""}
                                    onChange={(e) => onFieldChange('creatorDateOfBirth', new Date(e.target.value))}
                                    className="border-2 focus:border-primary"
                                />
                            </div>

                            <div>
                                <Label htmlFor="creatorPosition" className="block text-sm font-medium text-gray-700 mb-2">
                                    Position in Company <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="creatorPosition"
                                    type="text"
                                    placeholder="CEO"
                                    value={formData.creatorPosition || ""}
                                    onChange={(e) => onFieldChange('creatorPosition', e.target.value)}
                                    className="border-2 focus:border-primary"
                                />
                            </div>

                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country of Birth <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.creatorBirthCountry || ""}
                                    onValueChange={(value) => onFieldChange('creatorBirthCountry', value)}
                                >
                                    <SelectTrigger className="border-2 focus:border-primary">
                                        <SelectValue placeholder="Select country of birth" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem key={country.code} value={country.name}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Business Role & Ownership */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Role & Ownership</h3>

                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Are you a Beneficial Owner? <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.isBeneficialOwner || ""}
                                    onValueChange={(value) => onFieldChange('isBeneficialOwner', value)}
                                >
                                    <SelectTrigger className="border-2 focus:border-primary">
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {booleanOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="creatorPercentageOwnership" className="block text-sm font-medium text-gray-700 mb-2">
                                    Ownership Percentage <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="creatorPercentageOwnership"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="25"
                                    value={formData.creatorPercentageOwnership || ""}
                                    onChange={(e) => onFieldChange('creatorPercentageOwnership', parseFloat(e.target.value))}
                                    className="border-2 focus:border-primary"
                                />
                            </div>

                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role in Company <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.creatorRole || ""}
                                    onValueChange={(value) => onFieldChange('creatorRole', value)}
                                >
                                    <SelectTrigger className="border-2 focus:border-primary">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="creatorVotingRightPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                                    Voting Rights Percentage <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="creatorVotingRightPercentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="25"
                                    value={formData.creatorVotingRightPercentage || ""}
                                    onChange={(e) => onFieldChange('creatorVotingRightPercentage', parseFloat(e.target.value))}
                                    className="border-2 focus:border-primary"
                                />
                            </div>

                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Are you the business contact? <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.creatorIsBusinessContact || ""}
                                    onValueChange={(value) => onFieldChange('creatorIsBusinessContact', value)}
                                >
                                    <SelectTrigger className="border-2 focus:border-primary">
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {booleanOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="creatorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                    Personal Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="creatorEmail"
                                    type="email"
                                    placeholder="john.doe@email.com"
                                    value={formData.creatorEmail || ""}
                                    onChange={(e) => onFieldChange('creatorEmail', e.target.value)}
                                    className="border-2 focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* Tax & Legal Information */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Tax & Legal Information</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="creatorTaxIdentificationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        Personal Tax ID Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="creatorTaxIdentificationNumber"
                                        type="text"
                                        placeholder="Enter personal tax ID"
                                        value={formData.creatorTaxIdentificationNumber || ""}
                                        onChange={(e) => onFieldChange('creatorTaxIdentificationNumber', e.target.value)}
                                        className="border-2 focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="creatorSocialSecurityNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        Social Security Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="creatorSocialSecurityNumber"
                                        type="text"
                                        placeholder="Enter SSN"
                                        value={formData.creatorSocialSecurityNumber || ""}
                                        onChange={(e) => onFieldChange('creatorSocialSecurityNumber', e.target.value)}
                                        className="border-2 focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button
                            variant="default"
                            className="bg-primary hover:bg-primary/90 text-white"
                            disabled={!isFormValid()}
                            onClick={onContinue}
                        >
                            Continue
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}