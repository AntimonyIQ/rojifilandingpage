import { useState, useEffect, useRef } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { ArrowUpRight, ExpandIcon, Info, MoreHorizontal, Plus, Trash2 } from "lucide-react";
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
import { useParams } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/v1/components/ui/tooltip";

export default function SenderPage() {
    const [senders, setSenders] = useState<Array<ISender>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // track which row popover is open (null = none). avoids opening all rows when one is clicked.
    const [popOpenId, setPopOpenId] = useState<string | null>(null);
    const { wallet } = useParams();

    const sd: SessionData = session.getUserData();

    // filters:
    const [pagination, setPagination] = useState<IPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(SenderStatus.ACTIVE);

    // search term (used to filter senders list)
    const [search, _setSearch] = useState<string>("");

    const statusTabs = Object.values(SenderStatus);

    const isInitialMount = useRef(true);

    // Initial mount: show cached data immediately if available; always refresh by calling fetchSenders with explicit params.
    useEffect(() => {
        if (sd.sendersTableData[statusFilter]) {
            setSenders(sd.sendersTableData[statusFilter]);
            setLoading(false);
        } else {
            setSenders([]);
            setLoading(true);
        }
        // Fetch fresh data for initial status/page explicitly, clear initial flag after done
        fetchSenders(statusFilter, currentPage).finally(() => {
            isInitialMount.current = false;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When search or currentPage changes, fetch using explicit params
    useEffect(() => {
        fetchSenders(statusFilter, currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, currentPage]);

    // Helper used by UI when user clicks a status tab.
    const handleSelectStatus = (tab: SenderStatus) => {
        if (tab === statusFilter) return;
        setStatusFilter(tab);
        const page = 1;
        setCurrentPage(page);
        setSenders([]); // clear current results immediately
        // fetch with explicit status and page to avoid race with state updates
        fetchSenders(tab, page);
    };

    const fetchSenders = async (status?: SenderStatus, page?: number) => {
        try {
            setLoading(true); // ensure spinner shows immediately when fetch starts
            const useStatus = status || statusFilter;
            const usePage = page ?? currentPage;

            // always read fresh session data here to reflect any updates (clear/resume drafts)
            const currentSession: SessionData = session.getUserData();

            // Drafts are stored in the session (client-side). If the current filter is DRAFT,
            // show the saved draft(s) from session and skip the API call.
            if (useStatus === SenderStatus.DRAFT) {
                // Ensure the spinner is painted at least once before we synchronously update UI.
                // This prevents the draft branch from instantly flipping loading=false and skipping the spinner render.
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

                if (currentSession?.addSender?.formData) {
                    const draft: any = currentSession.addSender.formData;
                    const draftSender: ISender = {
                        _id: draft._id || `draft-${sd?.deviceid || "local"}`,
                        businessName: (draft.businessName || draft.companyName || "Draft Sender") as any,
                        status: SenderStatus.DRAFT,
                        createdAt: (draft.createdAt as any) || new Date().toISOString(),
                        archived: false,
                    } as any;
                    setSenders([draftSender]);
                } else {
                    setSenders([]);
                }
                setLoading(false);
                return;
            }

            const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
            const statusParam = useStatus ? `&status=${encodeURIComponent(useStatus)}` : "";
            const url: string = `${Defaults.API_BASE_URL}/sender/all?page=${usePage}&limit=${pagination.limit}${searchParam}${statusParam}`;

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
                if (!data.handshake) throw new Error('Unable to process login response right now, please try again.');
                const parseData: Array<ISender> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setSenders(parseData);

                const updatedSendersTableData = {
                    ...sd.sendersTableData,
                    [useStatus]: parseData
                };
                session.updateSession({ ...sd, sendersTableData: updatedSendersTableData });
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

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900 capitalize">{statusFilter} Senders</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Status Tabs */}
                    <div className="w-full lg:w-auto">
                        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
                            {statusTabs.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleSelectStatus(status as SenderStatus)}
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

                    <div className="flex items-center gap-3">
                        {/* Create New Sender button (keeps existing behaviour) */}
                        <div>
                            <Button
                                size="md"
                                variant="outline"
                                onClick={() => {
                                    if (sd?.addSender?.formData) {
                                        // route to add page and resume draft using SPA navigation
                                        window.location.href = `/dashboard/${wallet}/sender/add?resume=true`;
                                    } else {
                                        window.location.href = `/dashboard/${wallet}/sender/add`;
                                    }
                                }}
                            >
                                <Plus size={16} />
                                Create New Sender
                            </Button>
                        </div>

                        {/* Drafts panel replaces the three-dots menu */}
                        {/* <DraftsList wallet={wallet ?? ""} onCleared={() => { fetchSenders(); }} /> */}
                    </div>

                </div>

                {/* Loading skeleton - only show when no cached data available */}
                {loading && senders.length === 0 && isInitialMount.current && (
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
                                        {[...Array(5)].map((_, index) => (
                                            <tr key={index} className="border-b border-gray-100 animate-pulse">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Shimmer Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty state */}
                {!loading && senders.length === 0 && (
                    <Card className="w-full">
                        <CardContent className="p-0 w-full">
                            <div className="py-20 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-gray-400 text-4xl">📤</div>
                                    <p className="text-sm text-gray-600">No {statusFilter.toLowerCase()} senders found</p>
                                    <p className="text-xs text-gray-500">Your sender list will appear here</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Data table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        {/* inline animation to guarantee spinning even if Tailwind animate-spin is unavailable */}
                        <div
                            style={{ width: 24, height: 24, borderWidth: 4, borderStyle: "solid", borderColor: "#e5e7eb", borderTopColor: "#3b82f6", borderRadius: "9999px", animation: "rs-spin 1s linear infinite" }}
                        />
                        <style>{`@keyframes rs-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : senders.length > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
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
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sender.status.toLowerCase() === SenderStatus.ACTIVE
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
                                                    <Popover
                                                        open={popOpenId === sender._id}
                                                        onOpenChange={(open) => setPopOpenId(open ? sender._id : null)}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                aria-expanded={popOpenId === sender._id}>
                                                                <MoreHorizontal size={16} />
                                                            </Button>
                                                        </PopoverTrigger>

                                                        {/* If we're viewing the Drafts tab, replace menu with Resume / Cancel Draft */}
                                                        {statusFilter === SenderStatus.DRAFT ? (
                                                            <PopoverContent className="w-full p-0">
                                                                <Command>
                                                                    <CommandList>
                                                                        <CommandGroup>
                                                                            <CommandItem
                                                                                className="justify-start"
                                                                                onSelect={() => {
                                                                                    // Resume draft — navigate to add page with resume flag
                                                                                    setPopOpenId(null);
                                                                                    window.location.href = `/dashboard/${wallet}/sender/add?resume=true`;
                                                                                }}
                                                                            >
                                                                                <ExpandIcon size={18} />
                                                                                Resume draft
                                                                            </CommandItem>
                                                                            <CommandItem
                                                                                className="justify-start text-red-600"
                                                                                onSelect={() => {
                                                                                    setPopOpenId(null);
                                                                                    const ok = window.confirm("Delete saved draft? This cannot be undone.");
                                                                                    if (!ok) return;
                                                                                    // Remove draft from session and refresh list
                                                                                    session.updateSession({
                                                                                        ...sd,
                                                                                        addSender: undefined
                                                                                    } as any);
                                                                                    // refresh data after clearing
                                                                                    fetchSenders();
                                                                                }}
                                                                            >
                                                                                <Trash2 size={18} />
                                                                                Cancel draft
                                                                            </CommandItem>
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        ) : (
                                                            // keep existing menu for non-draft statuses
                                                            <PopoverContent className="w-full p-0">
                                                                <Command>
                                                                    <CommandList>
                                                                        <CommandGroup>
                                                                            <CommandItem className="justify-start" onSelect={() => { /* View action */ setPopOpenId(null); }}>
                                                                                <ExpandIcon size={18} />
                                                                                View Details
                                                                            </CommandItem>
                                                                            <CommandItem
                                                                                className="justify-start"
                                                                                onSelect={() => {
                                                                                    setPopOpenId(null);
                                                                                    window.location.href = `/dashboard/${wallet}/teams`;
                                                                                }}>
                                                                                <ArrowUpRight size={18} />
                                                                                Teams
                                                                            </CommandItem>
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        )}
                                                    </Popover>
                                                </td>
                                             </tr>
                                         ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={4} className="py-4 px-6">
                                                {/* Pagination */}
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <div className="text-sm text-gray-700">
                                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const next = Math.max(currentPage - 1, 1);
                                                                setCurrentPage(next);
                                                                // explicitly fetch for the new page
                                                                fetchSenders(statusFilter, next);
                                                            }}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Previous
                                                        </Button>
                                                        <span className="text-sm text-gray-700 px-2">
                                                            Page {currentPage} of {pagination.totalPages}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const next = Math.min(currentPage + 1, pagination.totalPages);
                                                                setCurrentPage(next);
                                                                fetchSenders(statusFilter, next);
                                                            }}
                                                            disabled={currentPage === pagination.totalPages}
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                     </tfoot>
                                 </table>
                             </div>
                         </CardContent>
                     </Card>
         ) : (
             <div className="text-center py-12 text-sm text-gray-500">
                 No senders found for this status.
             </div>
         )}
 
     </div>
 </div>
 );
 }