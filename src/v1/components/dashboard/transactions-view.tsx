import { useEffect, useState } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/v1/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/v1/components/ui/table";
import { EyeOff, Wallet, Search, X, Filter } from "lucide-react";
import { TransactionDetailsDrawer } from "./transaction-details-modal";
import { IPagination, IResponse, ITransaction } from "@/v1/interface/interface";
import { Status, TransactionStatus, TransactionType } from "@/v1/enums/enums";
import { session, SessionData } from "@/v1/session/session";
import Defaults from "@/v1/defaults/defaults";
import { Input } from "@/v1/components/ui/input";
import { Calendar } from "@/v1/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/v1/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/v1/components/ui/dialog";
import { useTransactionFilters } from "@/v1/hooks/useTransactionFilters";

interface ICurrency {
    name: string;
    icon: string;
}

enum Owners {
    EVERYONE = "Everyone",
    ME = "Me",
    TEAM = "Teammates"
}

interface TransactionsViewProps {
    initialFilters?: any;
}

export function TransactionsView({ }: TransactionsViewProps) {
    // Use URL-based filtering
    const { filters, updateFilter, updateMultipleFilters } = useTransactionFilters();

    const [hideBalances, setHideBalances] = useState(false);
    const [transactions, setTransactions] = useState<Array<ITransaction>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const sd: SessionData = session.getUserData();

    // console.log("Current Filters:", initialFilters); // --- IGNORE ---

    // Use URL-based filters instead of local state
    const statusFilter = filters.status;
    const currencyFilter = filters.currency;
    const ownerFilter = filters.owner;
    const searchQuery = filters.search;
    const startDate = filters.startDate;
    const endDate = filters.endDate;

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [counts, setCounts] = useState<{ [key in TransactionStatus]: number }>({
        [TransactionStatus.SUCCESSFUL]: 0,
        [TransactionStatus.PROCESSING]: 0,
        [TransactionStatus.PENDING]: 0,
        [TransactionStatus.FAILED]: 0,
        [TransactionStatus.INITIALIZING]: 0,
    });

    // UI state
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);

    // Temporary filter states for modal
    const [tempStartDate, setTempStartDate] = useState<Date | undefined>();
    const [tempEndDate, setTempEndDate] = useState<Date | undefined>();
    const [tempCurrencyFilter, setTempCurrencyFilter] = useState("All");
    const [tempOwnerFilter, setTempOwnerFilter] = useState("Everyone");
    const [tempPageSize, setTempPageSize] = useState(10);

    const statusTabs = Object.values(TransactionStatus); //     const statusTabs = ["Completed", "Processing", "Rejected", "Failed"];
    const owners = Object.values(Owners);
    const currencies: Array<ICurrency> = [
        { name: "All", icon: "https://img.icons8.com/color/50/worldwide-location.png" },
        // { name: "NGN", icon: "https://img.icons8.com/color/50/nigeria-circular.png" },
        { name: "USD", icon: "https://img.icons8.com/color/50/usa-circular.png" },
        { name: "EUR", icon: "https://img.icons8.com/fluency/48/euro-pound-exchange.png" },
        { name: "GBP", icon: "https://img.icons8.com/color/50/british-pound--v1.png" },
    ];
    const pageSizeOptions = [10, 20, 50, 100];

    useEffect(() => {
        // Load cached transactions for the current status filter
        if (sd.transactionsTableData[statusFilter]) {
            setTransactions(sd.transactionsTableData[statusFilter]);
        }
        setCounts(sd.transactionCounts);
    }, []);

    // Handle status filter changes - use cached data if available
    useEffect(() => {
        if (sd.transactionsTableData[statusFilter] && sd.transactionsTableData[statusFilter].length > 0) {
            setTransactions(sd.transactionsTableData[statusFilter]);
        } else {
            setTransactions([]);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchTransactions();
        fetchCounts();
    }, [statusFilter, currencyFilter, searchQuery, startDate, endDate, pagination.page]);

    // Update active filters count
    useEffect(() => {
        let count = 0;
        // if (statusFilter) count++;
        if (currencyFilter !== "All") count++;
        if (searchQuery.trim()) count++;
        if (startDate) count++;
        if (endDate) count++;
        setActiveFiltersCount(count);
    }, [statusFilter, currencyFilter, searchQuery, startDate, endDate]);

    const fetchTransactions = async () => {
        try {
            if (transactions.length === 0) setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                type: TransactionType.TRANSFER,
                includePagination: "true"
            });

            // Add filters
            if (statusFilter) {
                params.append("status", statusFilter.toLowerCase());
            }
            if (currencyFilter !== "All") {
                params.append("wallet", currencyFilter);
            }
            if (searchQuery.trim()) {
                params.append("search", searchQuery.trim());
            }
            if (startDate) {
                params.append("startDate", format(startDate, "yyyy-MM-dd"));
            }
            if (endDate) {
                params.append("endDate", format(endDate, "yyyy-MM-dd"));
            }

            const url: string = `${Defaults.API_BASE_URL}/transaction/?${params.toString()}`;

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process transaction response right now, please try again.');
                const parseData: Array<ITransaction> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setTransactions(parseData);

                // Update session with transactions stored by status
                const updatedTransactionsTableData = {
                    ...sd.transactionsTableData,
                    [statusFilter]: parseData
                };
                session.updateSession({ ...sd, transactionsTableData: updatedTransactionsTableData });

                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const url: string = `${Defaults.API_BASE_URL}/transaction/count/status`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process transaction response right now, please try again.');
                const parseData: { [key in TransactionStatus]: number } = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setCounts(parseData);
                session.updateSession({ ...sd, transactionCounts: parseData });
            }
        } catch (error: any) {
            console.error("Error fetching transaction counts:", error);
        }
    }

    const handleTransactionClick = (transaction: any) => {
        setSelectedTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleOpenFilterModal = () => {
        // Initialize temp values with current filter values
        setTempStartDate(startDate);
        setTempEndDate(endDate);
        setTempCurrencyFilter(currencyFilter);
        setTempOwnerFilter(ownerFilter);
        setTempPageSize(pagination.limit);
        setIsFilterModalOpen(true);
    };

    const handleApplyFilters = () => {
        updateMultipleFilters({
            startDate: tempStartDate,
            endDate: tempEndDate,
            currency: tempCurrencyFilter,
            owner: tempOwnerFilter,
            page: 1,
            limit: tempPageSize
        });
        setIsFilterModalOpen(false);
    };

    const handleClearFilters = () => {
        setTempStartDate(undefined);
        setTempEndDate(undefined);
        setTempCurrencyFilter("All");
        setTempOwnerFilter("Everyone");
        setTempPageSize(10);
    };

    const handleClearAllFilters = () => {
        updateMultipleFilters({
            status: TransactionStatus.SUCCESSFUL,
            currency: "All",
            owner: "Everyone",
            search: "",
            startDate: undefined,
            endDate: undefined,
            page: 1,
            limit: 10
        });
        setIsFilterModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all your transaction history across different currencies
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setHideBalances(!hideBalances)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                        <EyeOff className="h-4 w-4" />
                        Hide Amount
                    </button>
                </div>
            </div>


            {/* Transactions Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">All Transactions</h2>
                </div>

                {/* Status Tabs and Currency Filter */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Status Tabs */}
                    <div className="w-full lg:w-auto">
                        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
                            {statusTabs.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        updateFilter('status', status);
                                        setPagination((prev) => ({ ...prev, page: 1 }));
                                    }}
                                    className={`px-3 py-2 text-sm font-medium capitalize rounded-md transition-colors whitespace-nowrap ${statusFilter === status
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    {status} ({counts[status as TransactionStatus] || 0})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search and Filter Button */}
                <div className="flex items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 lg:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search transactions by reference, name, bank..."
                            value={searchQuery}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="pl-10 pr-4"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => updateFilter('search', '')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="hidden md:flex flex-row items-center justify-end gap-4">
                        {/* Filter Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenFilterModal}
                            className={`flex items-center gap-2 ${activeFiltersCount > 0 ? 'border-blue-500 text-blue-600' : ''}`}
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>

                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Made By:</label>
                            <Select
                                value={ownerFilter}
                                onValueChange={(value) => {
                                    updateFilter('owner', value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                }}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Everyone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {owners.map((owner) => (
                                        <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Transaction loading skeleton */}
                {loading && (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead>Beneficiary</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, index) => (
                                        <TableRow key={index} className="animate-pulse">
                                            <TableCell>
                                                <div className="flex flex-col space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination skeleton */}
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty Transaction */}
                {!loading && transactions.length === 0 &&
                    <Card className="w-full">
                        <CardContent className="p-0 w-full">
                            <div className="py-20 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Wallet className="h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-600">No {statusFilter.toLowerCase()} transactions found</p>
                                    <p className="text-xs text-gray-500">Your transaction history will appear here</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                }

                {/* Transactions Table */}
                {!loading && transactions.length > 0 &&
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead>Beneficiary</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow
                                            key={transaction._id}
                                            className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                                            onClick={() => handleTransactionClick(transaction)}
                                        >
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">
                                                        {transaction.beneficiaryAccountName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">
                                                        {hideBalances ? (
                                                            "••••••••"
                                                        ) : (
                                                            `$${Number(transaction.beneficiaryAmount || transaction.amount || 0).toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}`
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center font-semibold gap-1 text-sm">
                                                    {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : ''}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries ({pagination.limit} per page)
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                                        disabled={pagination.page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-700 px-2">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.page + 1, pagination.totalPages) }))}
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                }
            </div>

            {/* Transaction Details Modal */}
            {selectedTransaction && (
                <TransactionDetailsDrawer
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    transaction={selectedTransaction}
                />
            )}

            {/* Filter Modal */}
            <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Filter Transactions</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Currency Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Currency</label>
                            <Select
                                value={tempCurrencyFilter}
                                onValueChange={setTempCurrencyFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map((currency) => (
                                        <SelectItem key={currency.name} value={currency.name}>
                                            <div className="flex items-center gap-2">
                                                <img src={currency.icon} alt="" width={20} height={20} />
                                                {currency.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Made By Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Made By</label>
                            <Select
                                value={tempOwnerFilter}
                                onValueChange={setTempOwnerFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Everyone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {owners.map((owner) => (
                                        <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Page Size Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Items per page</label>
                            <Select
                                value={tempPageSize.toString()}
                                onValueChange={(value) => setTempPageSize(Number(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageSizeOptions.map((size) => (
                                        <SelectItem key={size} value={size.toString()}>
                                            {size} items
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range Filters */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-700">Date Range</label>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-600">From</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {tempStartDate ? format(tempStartDate, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            captionLayout="dropdown"
                                            selected={tempStartDate}
                                            onSelect={setTempStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-600">To</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {tempEndDate ? format(tempEndDate, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            captionLayout="dropdown"
                                            selected={tempEndDate}
                                            onSelect={setTempEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClearFilters}
                            className="flex-1"
                        >
                            Clear Filters
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleClearAllFilters}
                            className="flex-1 bg-red-500 text-white hover:bg-red-600 hover:text-white"
                        >
                            Clear All
                        </Button>
                        <Button
                            onClick={handleApplyFilters}
                            className="flex-1"
                        >
                            Apply Filters
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}