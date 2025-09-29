import { motion } from "framer-motion";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { ArrowLeft, ArrowUpRight, Building2, CheckCircle } from "lucide-react";
import { ISmileIdBusinessResponse } from "@/v1/interface/interface";

interface BusinessConfirmationProps {
    businessDetails: ISmileIdBusinessResponse | null;
    selectedBusiness: string;
    volumeWeekly: string;
    isLoading?: boolean;
    onBusinessSelect: (businessId: string) => void;
    onVolumeChange: (volume: string) => void;
    onBack: () => void;
    onContinue: () => void;
}

export function BusinessConfirmation({
    businessDetails,
    selectedBusiness,
    volumeWeekly,
    isLoading = false,
    onBusinessSelect,
    onVolumeChange,
    onBack,
    onContinue
}: BusinessConfirmationProps) {

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
                        <h2 className="text-3xl font-bold mb-4">Confirm Business Details</h2>
                        <p className="text-lg text-gray-600">
                            Please select your business from the results and provide your expected weekly volume.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="space-y-8">
                            {/* Business Selection */}
                            <div>
                                <Label className="block text-lg font-medium text-gray-700 mb-4">
                                    Select Your Business <span className="text-red-500">*</span>
                                </Label>
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => onBusinessSelect(businessDetails?.company_information?.registration_number || "")}
                                        className={`w-full p-6 border-2 rounded-lg text-left transition-all ${selectedBusiness === businessDetails?.company_information?.registration_number
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <Building2 className="h-6 w-6 text-gray-400" />
                                                <div>
                                                    <div className="font-semibold text-lg text-gray-900">{businessDetails?.company_information?.legal_name}</div>
                                                    <div className="text-base text-gray-500 mt-1">
                                                        Reg: {businessDetails?.company_information?.registration_number}
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedBusiness === businessDetails?.company_information?.registration_number && (
                                                <CheckCircle className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Volume Selection */}
                            <div>
                                <Label htmlFor="volumeWeekly" className="block text-lg font-medium text-gray-700 mb-4">
                                    Expected Weekly Transaction Volume ($) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="volumeWeekly"
                                    type="text"
                                    value={volumeWeekly}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/,/g, ''); // Remove commas for processing
                                        if (/^\d*$/.test(value)) { // Only allow digits
                                            const formatted = value ? Number(value).toLocaleString() : '';
                                            onVolumeChange(formatted);
                                        }
                                    }}
                                    placeholder="Enter expected weekly volume (e.g. 10,000)"
                                    className="border-2 focus:border-primary h-16 text-lg font-semibold"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Enter the amount in dollars (numbers only, commas will be added automatically)
                                </p>
                            </div>
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
                            disabled={!selectedBusiness || !volumeWeekly || isLoading}
                            onClick={onContinue}
                            size="lg"
                        >
                            {isLoading ? "Processing..." : "Continue"}
                            {!isLoading && <ArrowUpRight className="h-5 w-5 ml-2" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}