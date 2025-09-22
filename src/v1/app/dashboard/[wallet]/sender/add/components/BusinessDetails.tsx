import { motion } from "framer-motion";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { Label } from "@/v1/components/ui/label";
import { Input } from "@/v1/components/ui/input";
import { ArrowUpRight, ArrowLeft } from "lucide-react";

interface BusinessDetailsProps {
    businessNumber: string;
    taxId: string;
    isLoading?: boolean;
    onBusinessNumberChange: (value: string) => void;
    onTaxIdChange: (value: string) => void;
    onBack: () => void;
    onContinue: () => void;
}

export function BusinessDetails({
    businessNumber,
    isLoading = false,
    onBusinessNumberChange,
    onBack,
    onContinue
}: BusinessDetailsProps) {
    const validateInput = (value: string, onChange: (value: string) => void) => {
        // Allow only alphanumeric and selected symbols: - . / &
        if (/^[a-zA-Z0-9\-\.\/&]*$/.test(value) || value === "") {
            onChange(value);
        }
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
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Enter Sender's Business Details</h2>
                        <p className="text-lg text-gray-600">
                            Please provide the sender's business registration number for verification and compliance purposes.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="space-y-8">
                            <div>
                                <Label htmlFor="businessNumber" className="block text-lg font-medium text-gray-700 mb-4">
                                    Business Registration Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="businessNumber"
                                    type="text"
                                    placeholder="Enter registration number"
                                    value={businessNumber}
                                    onChange={e => validateInput(e.target.value, onBusinessNumberChange)}
                                    className="border-2 focus:border-primary h-16 text-lg px-4"
                                />
                            </div>

                            {/*
                            <div>
                                <Label htmlFor="taxId" className="block text-lg font-medium text-gray-700 mb-4">
                                    Tax Identification Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="taxId"
                                    type="text"
                                    placeholder="Enter tax identification number"
                                    value={taxId}
                                    onChange={e => validateInput(e.target.value, onTaxIdChange)}
                                    className="border-2 focus:border-primary h-16 text-lg px-4"
                                />
                            </div>
                            */}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-12">
                        <Button variant="outline" onClick={onBack} size="lg" className="h-12 px-6 text-base">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Go Back
                        </Button>
                        <Button
                            variant="default"
                            className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base"
                            disabled={!businessNumber || isLoading}
                            onClick={onContinue}
                            size="lg"
                        >
                            {isLoading ? "Loading..." : "Continue"}
                            {!isLoading && <ArrowUpRight className="h-5 w-5 ml-2" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};