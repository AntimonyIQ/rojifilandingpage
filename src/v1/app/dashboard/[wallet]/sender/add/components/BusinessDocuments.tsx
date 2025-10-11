"use client";

import { useState, useEffect } from "react";
import { Button } from "@/v1/components/ui/button";
import { Label } from "@/v1/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/v1/components/ui/dialog";
import { X, Plus, Check, AlertCircle, Eye, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/v1/components/ui/alert";
import Defaults from "@/v1/defaults/defaults";
import { IResponse, ISender, ISenderDocument } from "@/v1/interface/interface";
import { Status, WhichDocument } from "@/v1/enums/enums";
import { session, SessionData } from "@/v1/session/session";

interface BusinessDocumentsProps {
    formData: Partial<ISender>;
    onFieldChange: (field: string, value: any) => void;
    onBack: () => void;
    onContinue: () => void;
}

export default function BusinessDocuments({
    formData,
    onFieldChange,
    onBack,
    onContinue
}: BusinessDocumentsProps) {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [missingDoc, setMissingDoc] = useState<string[]>([]);
    const [files, setFiles] = useState<Record<string, File | null>>({
        cacCertOfIncorporation: null,
        memorandumArticlesOfAssociation: null,
        cacStatusReport: null,
        proofOfAddress: null,
        proofOfWealth: null,
        proofOfFunds: null,
    });

    // per-field uploading state
    const [fieldUploading, setFieldUploading] = useState<Record<string, boolean>>({
        cacCertOfIncorporation: false,
        memorandumArticlesOfAssociation: false,
        cacStatusReport: false,
        proofOfAddress: false,
        proofOfWealth: false,
        proofOfFunds: false,
    });

    // store uploaded urls returned by backend for each field
    const [uploadedUrls, setUploadedUrls] = useState<Record<string, string | null>>({
        cacCertOfIncorporation: null,
        memorandumArticlesOfAssociation: null,
        cacStatusReport: null,
        proofOfAddress: null,
        proofOfWealth: null,
        proofOfFunds: null,
    });

    // per-field error
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({
        cacCertOfIncorporation: null,
        memorandumArticlesOfAssociation: null,
        cacStatusReport: null,
        proofOfAddress: null,
        proofOfWealth: null,
        proofOfFunds: null,
    });

    // file viewer modal state
    const [fileViewerState, setFileViewerState] = useState<{
        isOpen: boolean;
        file: File | null;
        fieldKey: string;
        label: string;
        url?: string | null;
    }>({
        isOpen: false,
        file: null,
        fieldKey: "",
        label: "",
        url: null,
    });

    const sd: SessionData = session.getUserData();

    // Initialize from existing formData documents
    useEffect(() => {
        if (formData.documents && formData.documents.length > 0) {
            const urls: Record<string, string | null> = {
                cacCertOfIncorporation: null,
                memorandumArticlesOfAssociation: null,
                cacStatusReport: null,
                proofOfAddress: null,
                proofOfWealth: null,
                proofOfFunds: null,
            };

            formData.documents.forEach((doc: ISenderDocument) => {
                switch (doc.which) {
                    case WhichDocument.CERTIFICATE_INCORPORATION:
                        urls.cacCertOfIncorporation = doc.url;
                        break;
                    case WhichDocument.MEMORANDUM_ARTICLES:
                        urls.memorandumArticlesOfAssociation = doc.url;
                        break;
                    case WhichDocument.INCORPORATION_STATUS:
                        urls.cacStatusReport = doc.url;
                        break;
                    case WhichDocument.PROOF_ADDRESS:
                        urls.proofOfAddress = doc.url;
                        break;
                    case WhichDocument.PROOF_WEALTH:
                        urls.proofOfWealth = doc.url;
                        break;
                    case WhichDocument.PROOF_FUNDS:
                        urls.proofOfFunds = doc.url;
                        break;
                }
            });

            setUploadedUrls(urls);
        }
    }, [formData.documents]);

    // Helper function to extract filename from URL
    const getFilenameFromUrl = (url: string): string => {
        try {
            // Decode the URL first
            const decodedUrl = decodeURIComponent(url);
            // Extract filename from path
            const filename = decodedUrl.split('/').pop() || 'document';
            // Remove any query parameters
            const cleanFilename = filename.split('?')[0];
            // Truncate if too long (keep extension)
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

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            // set file immediately and start upload
            setFiles((prev) => ({ ...prev, [field]: file }));
            uploadFile(file, field);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles((prev) => ({ ...prev, [field]: file }));
            uploadFile(file, field);
        }
    };

    useEffect(() => {
        const requiredDocs = [
            "cacCertOfIncorporation",
            "cacStatusReport",
            "proofOfAddress",
            "proofOfWealth",
            "proofOfFunds",
        ];
        setMissingDoc(requiredDocs.filter((docType) => !uploadedUrls[docType]));
    }, [uploadedUrls]);

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

    const uploadFile = async (file: File, fieldKey: string): Promise<void> => {
        // reset field error
        setFieldErrors((prev) => ({ ...prev, [fieldKey]: null }));

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setFieldErrors((prev) => ({
                ...prev,
                [fieldKey]: `File exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
            }));
            return;
        }

        try {
            setFieldUploading((prev) => ({ ...prev, [fieldKey]: true }));

            const form = new FormData();
            form.append("file", file);

            // clone headers and remove content-type so browser sets boundary
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
                body: form,
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
                // store returned url for the field
                setUploadedUrls((prev) => ({ ...prev, [fieldKey]: parseData.url }));

                // Update formData with the new document
                updateFormDataDocument(fieldKey, file, parseData.url);

                console.log(`File uploaded for ${fieldKey}: `, parseData.url);
            }
        } catch (err: any) {
            setFieldErrors((prev) => ({ ...prev, [fieldKey]: err.message || "File upload failed" }));
        } finally {
            setFieldUploading((prev) => ({ ...prev, [fieldKey]: false }));
        }
    };

    // Helper to update formData documents array
    const updateFormDataDocument = (fieldKey: string, file: File, url: string) => {
        const existingDocs = formData.documents || [];
        const whichDocument = getWhichDocumentFromFieldKey(fieldKey);

        // Remove existing document of this type
        const filteredDocs = existingDocs.filter(doc => doc.which !== whichDocument);

        // Add new document
        const newDocument: ISenderDocument = {
            which: whichDocument,
            name: file.name,
            type: file.type,
            url: url,
            uploadedAt: new Date(),
            kycVerified: false,
            kycVerifiedAt: null,
            smileIdStatus: "not_submitted",
            smileIdVerifiedAt: null,
            smileIdJobId: null,
            smileIdUploadId: null,
            isRequired: requiredDocuments.includes(fieldKey),
            issue: false,
            issueResolved: false,
            issueResolvedAt: null
        };

        const updatedDocs = [...filteredDocs, newDocument];
        onFieldChange('documents', updatedDocs);
    };

    // Helper to map field keys to WhichDocument enum
    const getWhichDocumentFromFieldKey = (fieldKey: string): WhichDocument => {
        const mapping: Record<string, WhichDocument> = {
            cacCertOfIncorporation: WhichDocument.CERTIFICATE_INCORPORATION,
            memorandumArticlesOfAssociation: WhichDocument.MEMORANDUM_ARTICLES,
            cacStatusReport: WhichDocument.INCORPORATION_STATUS,
            proofOfAddress: WhichDocument.PROOF_ADDRESS,
            proofOfWealth: WhichDocument.PROOF_WEALTH,
            proofOfFunds: WhichDocument.PROOF_FUNDS,
        };
        return mapping[fieldKey];
    };

    const requiredDocuments = [
        "cacCertOfIncorporation",
        "cacStatusReport",
        "proofOfAddress",
        "proofOfWealth",
        "proofOfFunds"
    ];

    // Helper to clear the native file input so selecting the same file again triggers onChange
    const clearFileInput = (fieldKey: string) => {
        try {
            const el = document.getElementById(`file-upload-${fieldKey}`) as HTMLInputElement | null;
            if (el) {
                el.value = "";
            }
        } catch (e) {
            // ignore
        }
    };

    // File Viewer Modal Component
    const FileViewerModal = ({
        file,
        isOpen,
        onClose,
        onDelete,
        label,
        url,
    }: {
        file: File | null;
        isOpen: boolean;
        onClose: () => void;
        onDelete: () => void;
        label: string;
        url?: string | null;
    }) => {
        const [fileUrl, setFileUrl] = useState<string | null>(null);

        useEffect(() => {
            if (isOpen) {
                if (file) {
                    // Handle File object
                    const objectUrl = URL.createObjectURL(file);
                    setFileUrl(objectUrl);

                    // Cleanup function to revoke the object URL
                    return () => {
                        URL.revokeObjectURL(objectUrl);
                        setFileUrl(null);
                    };
                } else if (url) {
                    // Handle URL string
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

            // Determine file type and name based on whether we have a File object or URL
            let fileType = '';
            let fileName = '';
            let fileSize = 0;

            if (file) {
                fileType = file.type.toLowerCase();
                fileName = file.name;
                fileSize = file.size;
            } else if (url) {
                fileName = getFilenameFromUrl(url);
                // Try to determine file type from extension
                const ext = fileName.split('.').pop()?.toLowerCase() || '';
                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                    fileType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
                } else if (ext === 'pdf') {
                    fileType = 'application/pdf';
                } else {
                    fileType = 'application/octet-stream';
                }
                fileSize = 0; // Size unknown for URLs
            }

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
                            {fileSize > 0 && (
                                <p className="text-xs text-gray-400 mt-2">
                                    File size: {(fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                            )}
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
                                    {file?.name || (url ? getFilenameFromUrl(url) : '')}
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
    };

    const renderUploadField = (fieldKey: string, label: string, required: boolean) => (
        <div key={fieldKey}>
            <Label className="block text-lg font-bold text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${dragActive ? "border-primary bg-primary/5" : "border-gray-300"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, fieldKey)}
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
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, fieldKey)}
                    id={`file-upload-${fieldKey}`}
                />
                <label htmlFor={`file-upload-${fieldKey}`} className="absolute inset-0 cursor-pointer" />
            </div>
            {/* per-field states: uploading, selected, uploaded, errors */}
            <div className="mt-3">
                {fieldUploading[fieldKey] ? (
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
                ) : uploadedUrls[fieldKey] ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <p className="text-sm font-medium">Uploaded</p>
                        </div>
                        <p className="text-sm text-gray-700 truncate">
                            {uploadedUrls[fieldKey] ? getFilenameFromUrl(uploadedUrls[fieldKey]!) : files[fieldKey]?.name}
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setFileViewerState({
                                    isOpen: true,
                                    file: files[fieldKey],
                                    fieldKey,
                                    label,
                                    url: uploadedUrls[fieldKey],
                                });
                            }}
                            className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            aria-label={`View uploaded ${fieldKey}`}
                        >
                            <Eye className="h-4 w-4" />
                            View
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                // remove uploaded file and update formData
                                setFiles((prev) => ({ ...prev, [fieldKey]: null }));
                                setUploadedUrls((prev) => ({ ...prev, [fieldKey]: null }));
                                setFieldErrors((prev) => ({ ...prev, [fieldKey]: null }));
                                clearFileInput(fieldKey);

                                // Remove from formData documents
                                const whichDocument = getWhichDocumentFromFieldKey(fieldKey);
                                const existingDocs = formData.documents || [];
                                const filteredDocs = existingDocs.filter(doc => doc.which !== whichDocument);
                                onFieldChange('documents', filteredDocs);
                            }}
                            className="ml-2 text-red-500 hover:text-red-600"
                            aria-label={`Remove ${fieldKey}`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : files[fieldKey] ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                                <svg
                                    className="w-4 h-4 text-gray-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11" />
                                    <polyline points="17 8 12 3 7 8" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-700">Selected: {files[fieldKey]?.name}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                // allow removing before upload completes or before user reselects
                                setFiles((prev) => ({ ...prev, [fieldKey]: null }));
                                setFieldErrors((prev) => ({ ...prev, [fieldKey]: null }));
                                clearFileInput(fieldKey);
                            }}
                            className="ml-auto text-red-500 hover:text-red-600"
                            aria-label={`Remove ${fieldKey}`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No file selected</p>
                )}

                {fieldErrors[fieldKey] && (
                    <p className="text-sm text-red-500 mt-2">{fieldErrors[fieldKey]}</p>
                )}
            </div>
        </div>
    );

    const handleContinue = () => {
        if (missingDoc.length > 0) {
            setError(`Please upload all required documents: ${missingDoc.join(', ')}`);
            return;
        }
        setError(null);
        onContinue();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
        >
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Documents</h2>
                <p className="text-gray-600">
                    Please upload the required business documents for verification and compliance.
                </p>
            </div>

            <div className="space-y-6">
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                {renderUploadField("cacCertOfIncorporation", "CAC Certificate of Incorporation", true)}
                {renderUploadField(
                    "memorandumArticlesOfAssociation",
                    "Memorandum & Articles of Association (Memart)",
                    false
                )}
                {renderUploadField("cacStatusReport", "CAC Status Report", true)}
                {renderUploadField(
                    "proofOfAddress",
                    "Business Proof of Address (Recent Utility Bill, Bank Statement, Etc...)",
                    true
                )}

                <Alert
                    variant="default"
                    className="mt-2 bg-yellow-50 border-yellow-200 text-yellow-800"
                >
                    <AlertCircle className="w-5 h-5" />
                    <AlertTitle className="text-sm">Note: Proof of Address requirement</AlertTitle>
                    <AlertDescription>
                        Kindly ensure the Proof of Address document matches the company's operations
                        address.
                    </AlertDescription>
                </Alert>

                {renderUploadField(
                    "proofOfWealth",
                    "Proof of Wealth (e.g., Recent Bank Statement dated within the last 3 months, Loan agreement, Sale Agreement, etc...)",
                    true
                )}
                {renderUploadField(
                    "proofOfFunds",
                    "Proof of Funds (e.g., Recent Bank Statement dated within the last 3 months, Tax return filings, audited financial statements/profit or loss account, Inheritance transfer deeds, etc...)",
                    true
                )}
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
                    disabled={missingDoc.length > 0}
                    className="px-6"
                >
                    Continue
                </Button>
            </div>

            {/* File Viewer Modal */}
            <FileViewerModal
                file={fileViewerState.file}
                url={fileViewerState.url}
                isOpen={fileViewerState.isOpen}
                onClose={() => setFileViewerState((prev) => ({ ...prev, isOpen: false }))}
                onDelete={() => {
                    const fieldKey = fileViewerState.fieldKey;
                    setFiles((prev) => ({ ...prev, [fieldKey]: null }));
                    setUploadedUrls((prev) => ({ ...prev, [fieldKey]: null }));
                    setFieldErrors((prev) => ({ ...prev, [fieldKey]: null }));
                    clearFileInput(fieldKey);

                    // Remove from formData documents
                    const whichDocument = getWhichDocumentFromFieldKey(fieldKey);
                    const existingDocs = formData.documents || [];
                    const filteredDocs = existingDocs.filter(doc => doc.which !== whichDocument);
                    onFieldChange('documents', filteredDocs);

                    setFileViewerState((prev) => ({ ...prev, isOpen: false }));
                }}
                label={fileViewerState.label}
            />
        </motion.div>
    );
}
