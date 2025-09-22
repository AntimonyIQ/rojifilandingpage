import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { Label } from "@/v1/components/ui/label";
import { ArrowLeft, ArrowUpRight, FileText, Upload, CheckCircle, X } from "lucide-react";

interface KycDocumentsProps {
    documents: Record<string, File | null>;
    onDocumentChange: (field: string, file: File | null) => void;
    onBack: () => void;
    onSubmit: () => void;
}

export function KycDocuments({
    documents,
    onDocumentChange,
    onBack,
    onSubmit
}: KycDocumentsProps) {
    const [dragActive, setDragActive] = useState<string | null>(null);

    const requiredDocuments = [
        {
            key: "cacCertOfIncoporation",
            name: "CAC Certificate of Incorporation",
            description: "Official certificate of incorporation from CAC",
            required: true
        },
        {
            key: "memorandumArticlesOfAssociation",
            name: "Memorandum & Articles of Association",
            description: "Company's memorandum and articles of association",
            required: true
        },
        {
            key: "cacStatusReport",
            name: "CAC Status Report",
            description: "Current status report from CAC",
            required: true
        },
        {
            key: "proofOfAddress",
            name: "Proof of Business Address",
            description: "Utility bill or lease agreement showing business address",
            required: true
        }
    ];

    const handleDrag = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(field);
        } else if (e.type === "dragleave") {
            setDragActive(null);
        }
    };

    const handleDrop = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(null);

        const file = e.dataTransfer.files?.[0];
        if (file && (file.type === "application/pdf" || file.type.startsWith("image/"))) {
            onDocumentChange(field, file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            onDocumentChange(field, file);
        }
    };

    const removeFile = (field: string) => {
        onDocumentChange(field, null);
    };

    const isFormValid = () => {
        return requiredDocuments.every(doc =>
            doc.required ? documents[doc.key] !== null : true
        );
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                            <FileText className="h-8 w-8 text-primary mr-3" />
                            <h2 className="text-2xl font-bold">KYC Documents</h2>
                        </div>
                        <p className="text-gray-600">
                            Please upload the required documents to complete your sender verification.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {requiredDocuments.map((doc) => (
                            <div key={doc.key} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {doc.name}
                                            {doc.required && <span className="text-red-500 ml-1">*</span>}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                    </div>
                                    {documents[doc.key] && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                </div>

                                {documents[doc.key] ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-green-900">
                                                        {documents[doc.key]!.name}
                                                    </p>
                                                    <p className="text-xs text-green-700">
                                                        {formatFileSize(documents[doc.key]!.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(doc.key)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive === doc.key
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onDragEnter={(e) => handleDrag(e, doc.key)}
                                        onDragLeave={(e) => handleDrag(e, doc.key)}
                                        onDragOver={(e) => handleDrag(e, doc.key)}
                                        onDrop={(e) => handleDrop(e, doc.key)}
                                    >
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                                Drag and drop your file here, or{" "}
                                                <Label
                                                    htmlFor={`file-${doc.key}`}
                                                    className="text-primary hover:text-primary/80 cursor-pointer underline"
                                                >
                                                    browse
                                                </Label>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Supported formats: PDF, JPG, PNG (Max 10MB)
                                            </p>
                                        </div>
                                        <input
                                            id={`file-${doc.key}`}
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileChange(e, doc.key)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Information Note */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Document Verification
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>All documents will be verified for authenticity</li>
                                            <li>Documents should be clear and legible</li>
                                            <li>Files must be in PDF, JPG, or PNG format</li>
                                            <li>Maximum file size is 10MB per document</li>
                                        </ul>
                                    </div>
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
                            onClick={onSubmit}
                        >
                            Submit Application
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}