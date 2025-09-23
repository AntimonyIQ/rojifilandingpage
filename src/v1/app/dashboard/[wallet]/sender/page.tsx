import { useState, useEffect } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Archive, ArrowUpRight, ExpandIcon, Info, Loader2, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import Defaults from "@/v1/defaults/defaults";
import { session, SessionData } from "@/v1/session/session";
import { IPagination, IResponse, ISender } from "@/v1/interface/interface";
import { SenderStatus, Status } from "@/v1/enums/enums";

import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/v1/components/ui/popover"
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/v1/components/ui/dialog";
import { useParams } from "wouter";
import { Input } from "@/v1/components/ui/input";
import Loading from "@/v1/components/loading";
import EmptySender from "@/v1/components/emptysender";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/v1/components/ui/tooltip";
import { DropdownMenuSeparator } from "@/v1/components/ui/dropdown-menu";

export default function SenderPage() {
    const [senders, setSenders] = useState<Array<ISender>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [archiveLoading, setArchiveLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    // Confirmation dialog state for archive / delete actions
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [confirmType, setConfirmType] = useState<"archive" | "delete" | null>(null);
    const [confirmSenderId, setConfirmSenderId] = useState<string | null>(null);
    const [popOpen, setPopOpen] = useState<boolean>(false);
    const { wallet } = useParams();

    // Derived loading state used by the shared confirm dialog
    const confirmLoading = confirmType === "delete" ? deleteLoading : confirmType === "archive" ? archiveLoading : false;

    //// session data
    const sd: SessionData = session.getUserData();

    // filters:
    const [search, setSearch] = useState<string>("");
    const [pagination, setPagination] = useState<IPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(SenderStatus.ACTIVE);

    const statusTabs = Object.values(SenderStatus);

    useEffect(() => {
        fetchSenders();
    }, [statusFilter, search]);

    const fetchSenders = async () => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();

            const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
            const statusParam = statusFilter ? `&status=${encodeURIComponent(statusFilter)}` : "";
            const url: string = `${Defaults.API_BASE_URL}/sender/all?page=${currentPage}&limit=${pagination.limit}${searchParam}${statusParam}`;

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
                if (!data.handshake) throw new Error('Unable to process login response right now, please try again.');
                const parseData: Array<ISender> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setSenders(parseData);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error: any) {
            console.error("Error fetching senders:", error)
        } finally {
            setLoading(false)
        }
    }

    const archiveSender = async (senderId: string): Promise<void> => {
        try {
            setArchiveLoading(true)

            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/sender/${senderId}/archive`, {
                method: 'POST',
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

                const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
                    method: 'GET',
                    headers: {
                        ...Defaults.HEADERS,
                        'x-rojifi-handshake': sd.client.publicKey,
                        'x-rojifi-deviceid': sd.deviceid,
                        Authorization: `Bearer ${sd.authorization}`,
                    },
                });

                const userdata: IResponse = await userres.json();
                if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
                if (userdata.status === Status.SUCCESS) {
                    if (!userdata.handshake) throw new Error('Unable to process response right now, please try again.');
                    const parseData: any = Defaults.PARSE_DATA(userdata.data, sd.client.privateKey, userdata.handshake);

                    session.updateSession({
                        ...sd,
                        user: parseData.user,
                        wallets: parseData.wallets,
                        transactions: parseData.transactions,
                        sender: parseData.sender,
                    });

                    toast.success("Archived sender successfully.");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Error Activating OTC desk");
        } finally {
            setArchiveLoading(false)
        }
    };

    const deleteSender = async (senderId: string): Promise<void> => {
        try {
            setDeleteLoading(true)

            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/sender/${senderId}/delete`, {
                method: 'DELETE',
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

                const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
                    method: 'GET',
                    headers: {
                        ...Defaults.HEADERS,
                        'x-rojifi-handshake': sd.client.publicKey,
                        'x-rojifi-deviceid': sd.deviceid,
                        Authorization: `Bearer ${sd.authorization}`,
                    },
                });

                const userdata: IResponse = await userres.json();
                if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
                if (userdata.status === Status.SUCCESS) {
                    if (!userdata.handshake) throw new Error('Unable to process response right now, please try again.');
                    const parseData: any = Defaults.PARSE_DATA(userdata.data, sd.client.privateKey, userdata.handshake);

                    session.updateSession({
                        ...sd,
                        user: parseData.user,
                        wallets: parseData.wallets,
                        transactions: parseData.transactions,
                        sender: parseData.sender,
                    });

                    toast.success("Deleted sender successfully.");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Error Deleting sender");
        } finally {
            setDeleteLoading(false)
        }
    };

    // Open confirmation dialog before performing archive/delete
    const openConfirm = (type: "archive" | "delete", senderId: string) => {
        // close any open popover to avoid stacked UI
        setPopOpen(false);
        setConfirmType(type);
        setConfirmSenderId(senderId);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!confirmType || !confirmSenderId) {
            setConfirmOpen(false);
            return;
        }

        try {
            if (confirmType === "archive") {
                await archiveSender(confirmSenderId);
            } else if (confirmType === "delete") {
                await deleteSender(confirmSenderId);
            }
        } catch (err) {
            // errors already handled in functions
        } finally {
            setConfirmOpen(false);
            setConfirmType(null);
            setConfirmSenderId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Sender</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all your senders list.
                    </p>
                </div>
            </div>

            {/* Senders Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900 capitalize">{statusFilter} Senders</h2>
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
                                        setStatusFilter(status);
                                        setCurrentPage(1); // Reset to first page when filter changes
                                        fetchSenders();
                                    }}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap capitalize ${statusFilter === status
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row items-center justify-end gap-4">
                        {/* Currency Filter */}
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Search:</label>
                            <div className="relative">
                                <Input
                                    id="search"
                                    name="search"
                                    type="text"
                                    autoComplete="name"
                                    className="pl-10 h-10 w-60"
                                    placeholder="Search any sender name"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <Button size="md" variant="outline" onClick={() => window.location.href = `/dashboard/${wallet}/sender/add`}>
                                <Plus size={16} />
                                Create New Sender
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Sender loading */}
                {loading && <div className="py-40"><Loading /></div>}

                {/* Empty Sender */}
                {!loading && senders.length === 0 &&
                    <div className="py-20">
                        <EmptySender statusFilter={statusFilter} onClick={() => window.location.href = `/dashboard/${wallet}/sender/add`} />
                    </div>
                }

                {/* Sender Table */}
                {!loading && senders.length > 0 &&
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Name</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Date</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {senders.map((sender) => (
                                            <tr
                                                key={sender._id}
                                                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => { }}
                                            >
                                                <td className="py-4 px-6 text-sm text-gray-900 font-medium flex flex-row items-center gap-2">
                                                    {sender.businessName}
                                                    {sender.archived &&
                                                        <TooltipProvider delayDuration={200}>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Info size={16} className="text-orange-600 hover:text-orange-900" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    This Sender has been Archived
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    }
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sender.status.toLowerCase() === "successful"
                                                            ? "bg-green-100 text-green-800"
                                                            : sender.status.toLowerCase() === "pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-red-100 text-red-800"
                                                            }`}
                                                    >
                                                        {sender.status.charAt(0).toUpperCase() + sender.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{new Date(sender.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                aria-expanded={popOpen}>
                                                                <MoreHorizontal size={16} />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-full p-0">
                                                            <Command>
                                                                <CommandList>
                                                                    <CommandGroup>
                                                                        <CommandItem className="justify-start" onSelect={() => { /* View action */ }}>
                                                                            <ExpandIcon size={18} />
                                                                            View Details
                                                                        </CommandItem>
                                                                        <CommandItem
                                                                            className="justify-start"
                                                                            onSelect={() => {
                                                                                window.location.href = `/dashboard/${wallet}/teams`;
                                                                            }}>
                                                                            <ArrowUpRight size={18} />
                                                                            Teams
                                                                        </CommandItem>
                                                                    </CommandGroup>
                                                                    <DropdownMenuSeparator />
                                                                    <CommandGroup>
                                                                        <CommandItem disabled={archiveLoading} onSelect={() => openConfirm("archive", sender._id)}>
                                                                            {archiveLoading && <Loader2 className="animate-spin ml-2" size={16} />}
                                                                            {!archiveLoading && <Archive size={18} />}
                                                                            Archive
                                                                        </CommandItem>
                                                                        <CommandItem disabled={deleteLoading} className="justify-start text-red-700" onSelect={() => openConfirm("delete", sender._id)}>
                                                                            {deleteLoading
                                                                                ? <Loader2 className="animate-spin ml-2" size={16} />
                                                                                : <Trash2 size={18} />}
                                                                            Delete
                                                                        </CommandItem>
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing {pagination.page} to {pagination.total} of {pagination.totalPages} entries
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
                                        onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.page + 1, prev.totalPages) }))}
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                }

                {/* Shared Confirm Dialog (single instance) */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{confirmType === "delete" ? "Confirm Delete" : "Confirm Archive"}</DialogTitle>
                            <DialogDescription>
                                {confirmType === "delete"
                                    ? "Are you sure you want to permanently delete this sender? This action cannot be undone."
                                    : "Are you sure you want to archive this sender? You can restore archived senders later."}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={confirmLoading}>Cancel</Button>
                            <Button className="text-white flex items-center gap-2" onClick={handleConfirm} disabled={confirmLoading}>
                                {confirmLoading && <Loader2 className="animate-spin" size={16} />}
                                {confirmType === "delete" ? "Delete" : "Archive"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}