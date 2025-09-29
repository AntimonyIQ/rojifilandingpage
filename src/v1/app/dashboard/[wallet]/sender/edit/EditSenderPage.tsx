import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Badge } from "@/v1/components/ui/badge";
import { Progress } from "@/v1/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/v1/components/ui/dialog";
import Loading from "@/v1/components/loading";
import { session, SessionData } from "@/v1/session/session";
import { ISender } from "@/v1/interface/interface";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import BusinessDetailsFormPlain from "./BusinessDetailsStage";
import { DirectorShareholderFormComponent } from "./DirectorsStage";
import { KYBVerificationFormComponent } from "./DocumentsStage";

enum EditStages {
    BUSINESS_INFO = 1,
    DOCUMENTS = 2,
    DIRECTORS = 3
}

export default function EditSenderPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [currentStage, setCurrentStage] = useState<number>(EditStages.BUSINESS_INFO);
    const [sender, setSender] = useState<ISender | null>(null);
    const [formData, setFormData] = useState<Partial<ISender>>({});
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    // Store submit functions from each stage
    const [currentStageSubmit, setCurrentStageSubmit] = useState<(() => Promise<boolean>) | null>(null);

    const handleStageSubmit = useCallback((submitFunction: () => Promise<boolean>) => {
        setCurrentStageSubmit(() => submitFunction);
    }, []);

    const { wallet } = useParams();
    const [, navigate] = useLocation();
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd?.sender) {
            setSender(sd.sender);
            setFormData(sd.sender);
            setLoading(false);
        }
    }, [sd]);

    // Reset submit function when stage changes
    useEffect(() => {
        setCurrentStageSubmit(null);
    }, [currentStage]);

    const proceedToNextStage = async () => {
        if (!currentStageSubmit) {
            toast.error("Please wait for the form to load");
            return;
        }

        setSubmitting(true);
        try {
            const success = await currentStageSubmit();
            if (success && currentStage < 3) {
                setCurrentStage(currentStage + 1);
                // Reset submit function for next stage
                setCurrentStageSubmit(null);
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const goToPreviousStage = () => {
        if (currentStage > 1) {
            setCurrentStage(currentStage - 1);
        }
    };

    const completeEdit = async () => {
        if (currentStage === EditStages.DIRECTORS && currentStageSubmit) {
            setSubmitting(true);
            try {
                const success = await currentStageSubmit();
                if (success) {
                    setShowSuccessModal(true);
                }
            } catch (error) {
                console.error("Final submission error:", error);
                toast.error("Something went wrong. Please try again.");
            } finally {
                setSubmitting(false);
            }
        } else {
            setShowSuccessModal(true);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        navigate(`/dashboard/${wallet}/businessprofile`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/${wallet}/businessprofile`)}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Profile
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Business Information</h1>
                            <p className="text-gray-600">{sender?.businessName}</p>
                        </div>
                    </div>
                    <Badge className="px-3 py-1 bg-blue-100 text-blue-800">
                        {sender?.status}
                    </Badge>
                </motion.div>

                {/* Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-muted-foreground">
                                    Stage {currentStage} of 3
                                </span>
                            </div>
                            <Progress value={(currentStage / 3) * 100} className="w-full" />
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <span className={currentStage >= 1 ? "text-primary font-medium" : ""}>
                                    Business Details
                                </span>
                                <span className={currentStage >= 2 ? "text-primary font-medium" : ""}>
                                    Documents
                                </span>
                                <span className={currentStage >= 3 ? "text-primary font-medium" : ""}>
                                    Directors
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stage Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {currentStage === EditStages.BUSINESS_INFO && (
                        <BusinessDetailsFormPlain
                            sender={formData}
                            onSubmit={handleStageSubmit}
                        />
                    )}

                    {currentStage === EditStages.DOCUMENTS && (
                        <KYBVerificationFormComponent
                            sender={formData}
                            onSubmit={handleStageSubmit}
                        />
                    )}

                    {currentStage === EditStages.DIRECTORS && (
                        <DirectorShareholderFormComponent
                            sender={formData}
                            onSubmit={handleStageSubmit}
                        />
                    )}
                </motion.div>

                {/* Navigation Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-between">
                                <div className="flex gap-2">
                                    {currentStage > 1 && (
                                        <Button variant="outline" onClick={goToPreviousStage}>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {currentStage < 3 && (
                                        <Button
                                            onClick={proceedToNextStage}
                                            className="bg-primary hover:bg-primary/90 text-white"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    Next
                                                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {currentStage === EditStages.DIRECTORS && (
                                        <Button
                                            onClick={completeEdit}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Complete
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={(_open): void => { }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            All Information Re-Submitted Successfully!
                        </DialogTitle>
                        <DialogDescription>
                            Your business profile has been updated successfully. We will review the changes and get back to you shortly.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 mt-4">
                        <Button onClick={handleSuccessModalClose} className="w-full">
                            Back to Business Profile
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
