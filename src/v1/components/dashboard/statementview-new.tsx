"use client";

import { useState } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Plus, CalendarIcon, ReceiptText, Mail, Clock, Download } from "lucide-react";
import { Label } from "../ui/label";
import { usePathname } from "wouter/use-browser-location";
import { Link } from "wouter";
import { Calendar } from "@/v1/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/v1/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/v1/lib/utils"

export function BankStatementView() {
    const [totalTransactions] = useState<number>(1); // TODO: Implement dynamic transaction count
    const [email] = useState<string>("antimonyiq@gmail.com"); // TODO: Implement dynamic email
    const [months] = useState<number>(3); // TODO: Implement month selection

    const [fromDate, setFromDate] = useState<Date>();
    const [toDate, setToDate] = useState<Date>();
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);

    const today = new Date();
    const pastDate = new Date();
    pastDate.setMonth(today.getMonth() - months);

    const pathname = usePathname();
    const parts = pathname ? pathname.split('/') : [];
    const wallet = (parts[2] || 'NGN').toUpperCase();

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Bank Statement</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all your bank statement history across all accounts
                    </p>
                </div>
            </div>

            {/* Export Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Export Bank Statement</h2>
                </div>

                {/* Empty State */}
                {totalTransactions === 0 && (
                    <Card className="border-dashed border-2 border-gray-300">
                        <CardContent className="flex flex-col items-center justify-center py-16 px-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ReceiptText className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Available</h3>
                            <p className="text-center text-gray-500 mb-6 max-w-md">
                                You currently have no transaction payments. Create your first payment to enable bank statement exports.
                            </p>
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                asChild
                            >
                                <Link href={`/dashboard/${wallet}/transactions`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Payment
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Export Configuration */}
                {totalTransactions > 0 && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Configuration Card */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Date Range Selection</h3>
                                            <p className="text-sm text-gray-500">Choose the period for your statement export</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                                        {/* From Date */}
                                        <div className="space-y-2">
                                            <Label htmlFor="from-date" className="text-sm font-medium text-gray-700">
                                                From Date
                                            </Label>
                                            <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="from-date"
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !fromDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {fromDate ? format(fromDate, "PPP") : "Select start date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={fromDate}
                                                        onSelect={(date) => {
                                                            setFromDate(date);
                                                            setFromDateOpen(false);
                                                        }}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* To Date */}
                                        <div className="space-y-2">
                                            <Label htmlFor="to-date" className="text-sm font-medium text-gray-700">
                                                To Date
                                            </Label>
                                            <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="to-date"
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !toDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {toDate ? format(toDate, "PPP") : "Select end date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={toDate}
                                                        onSelect={(date) => {
                                                            setToDate(date);
                                                            setToDateOpen(false);
                                                        }}
                                                        disabled={(date) => {
                                                            if (date > new Date() || date < new Date("1900-01-01")) {
                                                                return true;
                                                            }
                                                            if (fromDate && date < fromDate) {
                                                                return true;
                                                            }
                                                            return false;
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Quick Date Presets */}
                                    <div className="mb-6">
                                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                                            Quick Select
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: "Last 30 days", days: 30 },
                                                { label: "Last 3 months", days: 90 },
                                                { label: "Last 6 months", days: 180 },
                                                { label: "Last year", days: 365 },
                                            ].map((preset) => (
                                                <Button
                                                    key={preset.label}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const end = new Date();
                                                        const start = new Date();
                                                        start.setDate(end.getDate() - preset.days);
                                                        setFromDate(start);
                                                        setToDate(end);
                                                    }}
                                                    className="text-xs"
                                                >
                                                    {preset.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Export Button */}
                                    <Button
                                        size="lg"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={!fromDate || !toDate}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Bank Statement
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary Card */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <ReceiptText className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Export Summary</h3>
                                            <p className="text-sm text-gray-500">Statement details</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Period</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {fromDate && toDate
                                                    ? `${format(fromDate, "MMM dd")} - ${format(toDate, "MMM dd, yyyy")}`
                                                    : "Not selected"
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Days</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {fromDate && toDate
                                                    ? Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                                                    : "—"
                                                }
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Format</span>
                                            <span className="text-sm font-medium text-gray-900">PDF</span>
                                        </div>

                                        <div className="pt-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <Mail className="h-4 w-4" />
                                                <span>Delivery method</span>
                                            </div>
                                            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                                                {email.substring(0, 3)}***{email.slice(-10)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
