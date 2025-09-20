import React from 'react';
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import { Calendar } from "@/v1/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/v1/lib/utils";
import { RenderInput, FileUploadField } from './SharedFormComponents';

interface InvoiceSectionProps {
    formdata: {
        paymentInvoice?: string;
        paymentInvoiceNumber?: string;
        paymentInvoiceDate?: Date;
    };
    onFieldChange: (field: string, value: string | Date) => void;
    loading?: boolean;
    uploading?: boolean;
    uploadError?: string;
    onFileUpload?: (file: File) => void | Promise<void>;
    uploadedFile?: File | null;
    uploadedUrl?: string | null;
    onFileRemove?: () => void;
}

export const InvoiceSection: React.FC<InvoiceSectionProps> = ({
    formdata,
    onFieldChange,
    loading = false,
    uploading = false,
    uploadError = "",
    onFileUpload,
    uploadedFile = null,
    uploadedUrl = null,
    onFileRemove
}) => {
    return (
        <>
            <div className="divide-gray-300 w-full h-[1px] bg-slate-300"></div>

            <FileUploadField
                fieldKey="paymentInvoice"
                label="Attach Invoice"
                description="(please attach invoice or any related document that shows the purpose of this payment. Also note that data should match beneficiary details to avoid delays)"
                uploading={uploading}
                uploadError={uploadError}
                onFileUpload={onFileUpload || (() => { })}
                uploadedFile={uploadedFile}
                uploadedUrl={uploadedUrl}
                onFileRemove={onFileRemove}
            />

            <div className="w-full">
                <Label htmlFor="invoice_description" className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice
                </Label>
                <p className="text-sm text-orange-700">
                    (Ensure to use an invoice number that matches the one in the uploaded invoice. Using an incorrect/exhausted invoice number may cause delays in processing your payment)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <RenderInput
                    fieldKey="paymentInvoiceNumber"
                    label="Invoice Number"
                    placeholder="Invoice Number"
                    value={formdata.paymentInvoiceNumber || ""}
                    disabled={loading}
                    readOnly={loading}
                    type="text"
                    required={true}
                    onFieldChange={onFieldChange}
                />

                <div className="w-full">
                    <Label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal h-12",
                                    !formdata.paymentInvoiceDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formdata.paymentInvoiceDate ? format(formdata.paymentInvoiceDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                captionLayout='dropdown'
                                selected={formdata.paymentInvoiceDate}
                                onSelect={(date: Date | undefined) => {
                                    if (date) {
                                        onFieldChange("paymentInvoiceDate", date);
                                    }
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </>
    );
};