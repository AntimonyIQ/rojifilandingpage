

import { session, SessionData } from "@/v1/session/session";
import { Check, X } from "lucide-react";
import React from "react";

export default function OnboardingBusinessRegistration({ rojifiId }: { rojifiId: string }) {
    const sd: SessionData = session.getUserData();
    // Get the signupTracker from session
    const [signupTracker, setSignupTracker] = React.useState<string | undefined>(undefined);
    React.useEffect(() => {
        setSignupTracker(sd.signupTracker);
    }, []);

    // Fallback if no tracker
    const fallbackLink = `/signup/${rojifiId}/business-details`;
    const trackerLink = signupTracker || fallbackLink;

    return (
        <div className="mt-10 bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center overflow-hidden">
            <div className="max-w-2xl w-full mx-auto">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Business Registration</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        To access all platform features, you need to complete your business verification by adding your company directors and shareholders information. This helps us ensure compliance and security for all transactions.
                    </p>
                    <div className="space-y-4 mb-8 w-full">
                        <div className="flex items-center text-left">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">Add business details</span>
                        </div>
                        <div className="flex items-center text-left">
                            <div className={`w-8 h-8 ${sd.sender.documents && sd.sender.documents.length > 0 ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                                {sd.sender.documents && sd.sender.documents.length > 0 ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <X className="w-4 h-4 text-red-600" />
                                )}
                            </div>
                            <span className="text-gray-700">Upload required verification documents</span>
                        </div>
                        <div className="flex items-center text-left">
                            <div className={`w-8 h-8 ${sd.sender.directors && sd.sender.directors.length > 0 ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                                {sd.sender.directors && sd.sender.directors.length > 0 ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <X className="w-4 h-4 text-red-600" />
                                )}
                            </div>
                            <span className="text-gray-700">Add directors and shareholders details</span>
                        </div>
                    </div>
                    <button
                        onClick={() => (window.location.href = trackerLink)}
                        className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                    >
                        Complete Business Registration
                    </button>
                </div>
            </div>
        </div>
    );
}
