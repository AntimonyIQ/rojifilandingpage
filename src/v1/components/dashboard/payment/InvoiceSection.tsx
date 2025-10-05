import React from 'react';
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import { Calendar } from "@/v1/components/ui/calendar";
import { CalendarIcon, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/v1/lib/utils";
import { motion } from "framer-motion";
import { RenderInput, FileUploadField } from './SharedFormComponents';
import { InvoiceData, IResponse } from '@/v1/interface/interface';
import { session, SessionData } from '@/v1/session/session';
import { Status } from '@/v1/enums/enums';
import Defaults from '@/v1/defaults/defaults';

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
    const [invoicedetails, setInvoiceDetails] = React.useState<InvoiceData | null>(null);
    const [loadingInvoiceDetails, setLoadingInvoiceDetails] = React.useState<boolean>(false);
    const sd: SessionData = session.getUserData();

    const fetchInvoiceDetails = async (invoiceId: string) => {
        try {
            setLoadingInvoiceDetails(true);
            const res = await fetch(`${Defaults.API_BASE_URL}/invoice/${invoiceId}`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
                body: JSON.stringify({ url: uploadedUrl }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Invalid response from server");
                const parseData: InvoiceData = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                // console.log("Fetched Invoice Details:", parseData);
                setInvoiceDetails(parseData);
            }
        } catch (error) {
            console.error("Error fetching invoice details:", error);
            setInvoiceDetails(null);
        } finally {
            setLoadingInvoiceDetails(false);
        }
    };

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
                    onFieldChange={(field: string, value: string): void => {
                        onFieldChange(field, value);
                        if (value.trim().length > 3) { fetchInvoiceDetails(value.trim()); }
                    }}
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

            <div className="w-full">
                {!loadingInvoiceDetails && invoicedetails && (
                    <motion.div
                        className="w-full mt-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {(invoicedetails.totalAmount > 0 && invoicedetails.totalAmount === invoicedetails.paidAmount) ? (
                            <motion.div
                                className="w-full flex items-center justify-start space-x-2 px-3 py-2 bg-red-500 text-white rounded text-xs font-medium"
                                animate={{
                                    scale: [1, 1.02, 1],
                                    boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.7)", "0 0 0 4px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0)"]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            >
                                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="flex-1">This invoice has been exhausted. Kindly provide a new invoice.</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="w-full flex items-center justify-start space-x-2 px-3 py-2 bg-blue-500 text-white rounded text-xs font-medium"
                                animate={{
                                    opacity: [0.8, 1, 0.8],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            >
                                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="flex-1">A total of ${invoicedetails.paidAmount.toFixed(2)} has been paid on this invoice</span>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </>
    );
};