import React from "react";
import { Button } from "@/v1/components/ui/button";
import { Trash2 } from "lucide-react";
import { session, SessionData } from "@/v1/session/session";
import { FormStep } from "../add/types";
import { SenderStatus } from "@/v1/enums/enums";
import { useLocation } from "wouter";

interface DraftsListProps {
    wallet: string;
    onCleared?: () => void;
}

export default function DraftsList({ wallet, onCleared }: DraftsListProps) {
    const sd: SessionData = session.getUserData();
    const draftEntry = sd?.addSender;
    const draft = draftEntry?.formData;
    const [, setLocation] = useLocation();

    if (!draft) return null;

    const title = ((draft as any).businessName || (draft as any).companyName || "Draft Sender") as string;
    const savedAt = draftEntry?.timestamp ? new Date(draftEntry.timestamp) : new Date();

    const handleResume = () => {
        // SPA navigation to add page; add resume flag for clarity
        setLocation(`/dashboard/${wallet}/sender/add?resume=true`);
    };

    const handleClear = () => {
        const ok = window.confirm("Clear saved draft? This will permanently remove the saved progress.");
        if (!ok) return;

        // Remove draft from session (keep other session data intact)
        session.updateSession({
            ...sd,
            addSender: undefined
        } as any);

        if (onCleared) onCleared();
    };

    return (
        <div className="ml-4">
            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-yellow-800 truncate">Draft: {title}</p>
                    <p className="text-xs text-gray-500">Saved {savedAt.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Status: {SenderStatus.DRAFT}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleResume}>Resume draft</Button>
                    <Button size="sm" variant="outline" onClick={handleClear} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}