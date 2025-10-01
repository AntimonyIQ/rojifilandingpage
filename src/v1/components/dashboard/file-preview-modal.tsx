"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/v1/components/ui/sheet"
import { Button } from "../ui/button"
import { Download, Trash } from "lucide-react"

export interface FilePreviewModalProps {
    open: boolean
    onClose: () => void
    fileUrl?: string | null
    fileName?: string | null
}

export function FilePreviewModal({ open, onClose, fileUrl, fileName }: FilePreviewModalProps) {
    const [txtContent, setTxtContent] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const ext = fileUrl?.split(".").pop()?.split('?')[0]?.toLowerCase() || fileName?.split(".").pop()?.toLowerCase()

    useEffect(() => {
        setTxtContent(null)
        setError(null)

        if (!open) return

        if (!fileUrl) {
            setError("No file URL provided")
            return
        }

        if (ext === "txt") {
            setLoading(true)
            fetch(fileUrl)
                .then(res => {
                    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
                    return res.text()
                })
                .then(t => setTxtContent(t))
                .catch(e => setError(String(e)))
                .finally(() => setLoading(false))
        }
    }, [open, fileUrl, ext])

    // Helper to get download filename
    const getDownloadName = () => {
        try {
            if (fileName) return decodeURIComponent(fileName).split('/').pop() ?? 'download'
            return fileUrl?.split('?')[0].split('/').pop() ?? 'download'
        } catch (e) {
            return fileName ?? fileUrl?.split('?')[0].split('/').pop() ?? 'download'
        }
    }

    const renderPreview = () => {
        if (!fileUrl) return <div className="p-4">No file to preview</div>

        if (ext === "pdf") {
            // PDF: use native browser PDF viewer in an iframe
            return (
                <iframe src={fileUrl} className="w-full h-[70vh]" title={fileName ?? "pdf-preview"} />
            )
        }

        // Image formats
        if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif" || ext === "webp" || ext === "svg") {
            return (
                <div className="w-full flex items-center justify-center">
                    <img src={fileUrl} alt={fileName ?? "image"} className="max-h-[80vh] w-auto max-w-full object-contain rounded-md shadow-sm" />
                </div>
            )
        }

        if (ext === "txt") {
            if (loading) return <div className="p-4">Loading text file...</div>
            if (error) return <div className="p-4 text-red-600">Error loading file: {error}</div>
            return (
                <pre className="whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-md max-h-[70vh] overflow-auto">{txtContent ?? "(empty)"}</pre>
            )
        }

        // For doc/docx and other office formats we try Google Docs viewer as a pragmatic fallback.
        if (ext === "doc" || ext === "docx" || ext === "ppt" || ext === "pptx" || ext === "xls" || ext === "xlsx") {
            // NOTE: Google Docs viewer requires the file URL to be publicly reachable and CORS friendly.
            const viewer = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`
            return (
                <iframe src={viewer} className="w-full h-[90vh]" title={fileName ?? "doc-preview"} />
            )
        }

        return (
            <div className="p-4 h-full bg-red-300">Preview for this file type is not supported in the built-in viewer.</div>
        )
    }

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
            <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
                <div className="p-4 h-full">
                    <SheetHeader className="p-0">
                        <SheetTitle
                            className="text-lg font-medium max-w-[80%] overflow-hidden text-ellipsis whitespace-nowrap"
                            title={fileName ? decodeURIComponent(fileName).split('/').pop() ?? "File preview" : "File preview"}
                        >
                            {fileName ? decodeURIComponent(fileName).split('/').pop() ?? "File preview" : "File preview"}
                        </SheetTitle>
                    </SheetHeader>

                    <div className="my-4 h-full">
                        {renderPreview()}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                    </div>

                </div>
                <SheetFooter className="mt-6 bg-white flex flex-row items-center justify-between w-full p-5 absolute bottom-0 left-0 right-0 border-t border-gray-200">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    {fileUrl ? (
                        // Use API proxy to force download (avoids CORS issues). Fallback to direct link if needed.
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary hover:bg-primary/90 text-white h-10 px-4 py-2 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </a>
                    ) : (
                        <Button variant="default" disabled>
                            <Download className="h-4 w-4" />
                            Download
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default FilePreviewModal
