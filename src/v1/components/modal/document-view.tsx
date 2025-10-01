import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/v1/components/ui/dialog";
import { Button } from "@/v1/components/ui/button";
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    ExternalLink,
    X,
    Maximize2,
    Minimize2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/v1/lib/utils";

interface DocumentViewerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentUrl: string;
    documentTitle: string;
    documentType?: 'image' | 'pdf' | 'auto';
}

export default function DocumentViewerModal({
    open,
    onOpenChange,
    documentUrl,
    documentTitle,
    documentType = 'auto'
}: DocumentViewerModalProps) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [detectedType, setDetectedType] = useState<'image' | 'pdf' | 'unknown'>('unknown');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Detect document type
    useEffect(() => {
        if (documentType === 'auto') {
            const extension = documentUrl.split('.').pop()?.toLowerCase();
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
            const pdfExtensions = ['pdf'];

            if (imageExtensions.includes(extension || '')) {
                setDetectedType('image');
            } else if (pdfExtensions.includes(extension || '')) {
                setDetectedType('pdf');
            } else {
                // Try to detect from URL or content-type
                setDetectedType('unknown');
            }
        } else {
            setDetectedType(documentType);
        }

        setIsLoading(true);
        setError(null);
    }, [documentUrl, documentType]);

    // Reset zoom and rotation when document changes
    useEffect(() => {
        setZoom(100);
        setRotation(0);
        setIsFullscreen(false);
    }, [documentUrl]);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 25, 500));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 25, 25));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleResetZoom = () => {
        setZoom(100);
        setRotation(0);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = documentTitle;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenExternal = () => {
        window.open(documentUrl, '_blank');
    };

    const handleImageLoad = () => {
        setIsLoading(false);
        setError(null);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setError('Failed to load image');
    };

    const renderImageViewer = () => (
        <div
            ref={containerRef}
            className="flex-1 overflow-auto bg-gray-50 rounded-lg relative"
            style={{ minHeight: '400px' }}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                        Loading...
                    </div>
                </div>
            )}

            {error ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <p className="mb-2">{error}</p>
                        <Button variant="outline" onClick={handleOpenExternal}>
                            Open in New Tab
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center min-h-full p-4">
                    <img
                        ref={imageRef}
                        src={documentUrl}
                        alt={documentTitle}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        className="max-w-none transition-transform duration-200 ease-in-out shadow-lg rounded"
                        style={{
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                            transformOrigin: 'center center'
                        }}
                    />
                </div>
            )}
        </div>
    );

    const renderPdfViewer = () => (
        <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden">
            {isLoading && (
                <div className="flex items-center justify-center h-96">
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                        Loading PDF...
                    </div>
                </div>
            )}
            <iframe
                src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
                className="w-full h-full min-h-[500px] border-0"
                title={documentTitle}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setError('Failed to load PDF');
                }}
            />
        </div>
    );

    const renderUnknownViewer = () => (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg min-h-[400px]">
            <div className="text-center text-gray-500">
                <p className="mb-4">Unable to preview this document type</p>
                <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button variant="outline" onClick={handleOpenExternal}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "transition-all duration-300 ease-in-out",
                isFullscreen
                    ? "max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh]"
                    : "max-w-5xl max-h-[90vh] w-[90vw] h-[85vh]"
            )}>
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                            {documentTitle}
                            <span className="text-sm font-normal text-gray-500 capitalize">
                                ({detectedType === 'unknown' ? 'Document' : detectedType})
                            </span>
                        </DialogTitle>

                        <div className="flex items-center gap-2">
                            {/* Image Controls */}
                            {detectedType === 'image' && (
                                <>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                                        {zoom}%
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleZoomOut}
                                        disabled={zoom <= 25}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleZoomIn}
                                        disabled={zoom >= 500}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRotate}
                                        className="h-8 w-8 p-0"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleResetZoom}
                                        className="h-8 px-2 text-xs"
                                    >
                                        Reset
                                    </Button>
                                </>
                            )}

                            {/* Common Controls */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="h-8 w-8 p-0"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-4 h-4" />
                                ) : (
                                    <Maximize2 className="w-4 h-4" />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                className="h-8 w-8 p-0"
                            >
                                <Download className="w-4 h-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleOpenExternal}
                                className="h-8 w-8 p-0"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {detectedType === 'image' && renderImageViewer()}
                    {detectedType === 'pdf' && renderPdfViewer()}
                    {detectedType === 'unknown' && renderUnknownViewer()}
                </div>

                {/* Footer with document info */}
                <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <span>Document: {documentTitle}</span>
                        {detectedType === 'image' && (
                            <span>Zoom: {zoom}% | Rotation: {rotation}°</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="h-8"
                        >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}