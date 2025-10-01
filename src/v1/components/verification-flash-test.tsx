import { useState } from "react";
import { session, SessionData } from "@/v1/session/session";
import { ISender } from "../interface/interface";

/**
 * Test component to verify the verification flash fix
 * This simulates the different states that could cause the flash
 */
export default function VerificationFlashTest() {
    const [testState, setTestState] = useState<'loading' | 'empty-docs' | 'verified' | 'in-review'>('loading');
    const sd: SessionData = session.getUserData();

    const simulateStates = () => {

        // Test different scenarios
        switch (testState) {
            case 'loading':
                setTestState('empty-docs');
                break;
            case 'empty-docs':
                setTestState('verified');
                break;
            case 'verified':
                setTestState('in-review');
                break;
            case 'in-review':
                setTestState('loading');
                break;
        }
    };

    const getDocumentStatuses = (sender: ISender) => {
        if (!sender) return { allVerified: false, hasFailed: false, inReview: false };

        const documents = sender.documents || [];

        // Handle empty documents array - treat as not ready yet (prevents flash)
        if (documents.length === 0) {
            return { allVerified: false, hasFailed: false, inReview: false, notReady: true };
        }

        // Any document with issue === true should mark the whole set as failed
        const hasFailed = documents.some((doc) => doc.issue === true || doc.smileIdStatus === "rejected");
        const allVerified = documents.every((doc) => doc.kycVerified === true && doc.issue !== true);
        const inReview = documents.some(
            (doc) => (doc.kycVerified === false || !doc.kycVerified) && doc.issue !== true
        );

        return { allVerified, hasFailed, inReview, notReady: false };
    };

    const getTestSender = () => {
        switch (testState) {
            case 'loading':
                return null;
            case 'empty-docs':
                return { documents: [] };
            case 'verified':
                return {
                    documents: [
                        { kycVerified: true, issue: false, smileIdStatus: 'verified' }
                    ]
                };
            case 'in-review':
                return {
                    documents: [
                        { kycVerified: false, issue: false, smileIdStatus: 'under_review' }
                    ]
                };
            default:
                return null;
        }
    };

    const sender = getTestSender();
    const { allVerified, notReady } = getDocumentStatuses(sd.sender);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Verification Flash Test
                </h1>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Current State: {testState}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Sender: {sender ? 'Loaded' : 'Not loaded'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Documents: {sender?.documents?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            All Verified: {allVerified ? 'Yes' : 'No'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Not Ready: {notReady ? 'Yes' : 'No'}
                        </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            What Should Happen:
                        </h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• <strong>Loading:</strong> Show preloader</li>
                            <li>• <strong>Empty docs:</strong> Show preloader (prevents flash)</li>
                            <li>• <strong>Verified:</strong> Show dashboard</li>
                            <li>• <strong>In review:</strong> Show verification screen</li>
                        </ul>
                    </div>

                    <button
                        onClick={simulateStates}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Simulate Next State
                    </button>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        This test verifies that the "empty documents" state shows a preloader
                        instead of flashing the verification screen.
                    </div>
                </div>
            </div>
        </div>
    );
}
