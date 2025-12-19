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
  Maximize2,
  Minimize2,
  DownloadIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/v1/lib/utils";
import Defaults from "@/v1/defaults/defaults";

interface DocumentViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentUrl: string;
  documentTitle: string;
  documentType?: "image" | "pdf" | "auto";
}

export default function DocumentViewerModal({
  open,
  onOpenChange,
  documentUrl,
  documentTitle,
  documentType = "auto",
}: DocumentViewerModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detectedType, setDetectedType] = useState<"image" | "pdf" | "unknown">(
    "unknown"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  // const containerRef = useRef<HTMLDivElement>(null);

  // Detect document type
  useEffect(() => {
    if (documentType === "auto") {
      const extension = documentUrl.split(".").pop()?.toLowerCase();
      const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "svg",
      ];
      const pdfExtensions = ["pdf"];

      if (imageExtensions.includes(extension || "")) {
        setDetectedType("image");
      } else if (pdfExtensions.includes(extension || "")) {
        setDetectedType("pdf");
      } else {
        // Try to detect from URL or content-type
        setDetectedType("unknown");
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
  }, [documentUrl, detectedType]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 500));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  //   const handleDownload = () => {
  //     const link = document.createElement("a");
  //     link.href = documentUrl;
  //     link.download = documentUrl;
  //     link.target = "_blank";
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   };

  const handleDownload = async () => {
    console.log(documentUrl);
    const src = documentTitle || documentUrl || "";
    const name = src.split("/").pop() || src;
    const title = decodeURIComponent(name.split("?")[0]);

    const encodedDownloadFilename = encodeURIComponent(title);
    const downloadUrl = `${
      Defaults.API_BASE_URL
    }/download?url=${encodeURIComponent(
      documentUrl
    )}&filename=${encodedDownloadFilename}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.target = "_self";
    a.rel = "noopener noreferrer";
    a.download = title;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleOpenExternal = () => {
    window.open(documentUrl, "_blank");
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError("Failed to load image");
  };

  const renderImageViewer = () => (
    <div
      className="flex-1 overflow-hidden bg-gray-50 rounded-lg relative flex flex-col"
      style={{
        minHeight: "60vh",
        height: isFullscreen ? "calc(98vh - 140px)" : "calc(85vh - 140px)",
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50/50">
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
        <div className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-4">
          <div
            style={{
              width: `${zoom}%`,
              height: `${zoom}%`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "width 0.2s ease-in-out, height 0.2s ease-in-out",
            }}
          >
            <img
              ref={imageRef}
              src={documentUrl}
              alt={documentTitle}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className="max-w-full max-h-full object-contain shadow-sm rounded"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.2s ease-in-out",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderPdfViewer = () => (
    <div
      className="flex-1 bg-gray-50 rounded-lg overflow-hidden relative"
      style={{ minHeight: "60vh" }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            Loading PDF...
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
        <iframe
          src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
          className="w-full h-full border-0"
          style={{
            height: isFullscreen ? "calc(98vh - 140px)" : "calc(85vh - 140px)",
          }}
          title={documentTitle}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError("Failed to load PDF");
          }}
        />
      )}
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
      <DialogContent
        className={cn(
          "transition-all duration-300 ease-in-out [&>button]:hidden",
          isFullscreen
            ? "max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh]"
            : "max-w-5xl max-h-[90vh] w-[90vw] h-[85vh]"
        )}
      >
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              {(() => {
                const src = documentTitle || documentUrl || "";
                const name = src.split("/").pop() || src;
                return decodeURIComponent(name.split("?")[0]);
              })()}
              <span className="text-sm font-normal text-gray-500 capitalize">
                ({detectedType === "unknown" ? "Document" : detectedType})
              </span>
            </DialogTitle>

            <div className="flex items-center gap-2">
              {/* Image Controls */}
              {detectedType === "image" && (
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
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {detectedType === "image" && renderImageViewer()}
          {detectedType === "pdf" && renderPdfViewer()}
          {detectedType === "unknown" && renderUnknownViewer()}
        </div>

        {/* Footer with document info */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {detectedType === "image" && (
              <span>
                Zoom: {zoom}% | Rotation: {rotation}°
              </span>
            )}
          </div>

          <div className="flex  gap-5 items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8"
              >
                Close
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8"
              >
                <DownloadIcon />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
