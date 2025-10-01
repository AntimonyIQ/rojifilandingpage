
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Plus, Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { IPagination, IResponse, ITeamMember, ITeams } from "@/v1/interface/interface";
import { Status, TeamRole, TeamStatus } from "@/v1/enums/enums";
import { session, SessionData } from "@/v1/session/session";
import Defaults from "@/v1/defaults/defaults";


interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { email: string; role: string }) => void;
}

interface IState {
    email: string;
    role: string;
    loading: boolean;
}
class AddTeamModal extends React.Component<IProps, IState> {
    private sd: SessionData;
    constructor(props: IProps) {
        super(props);
        this.state = {
            email: "",
            role: "",
            loading: false
        }
        this.sd = session.getUserData();
    }

    private handleInputChange = (field: keyof IState, value: string): void => {
        this.setState({ [field]: value } as unknown as Pick<IState, keyof IState>);
    };

    private handleAddTeam = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/teams`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': this.sd.client.publicKey,
                    'x-rojifi-deviceid': this.sd.deviceid,
                    Authorization: `Bearer ${this.sd.authorization}`,
                },
                body: JSON.stringify({
                    email: this.state.email,
                    role: this.state.role,
                    senderId: this.sd.sender._id,
                    creatorId: this.sd.user._id
                })
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                toast.success("Team member added successfully");
                this.props.onOpenChange(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to add team member");
        } finally {
            this.setState({ loading: false });
        }
    }

    render(): React.ReactNode {
        const { open, onOpenChange } = this.props; // Unused: onSubmit
        const { email, role, loading } = this.state;
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl ">
                    <div className="flex flex-col gap-5 w-full">
                        <div className="flex items-center justify-end">
                            <Button variant="outline" className="bg-transparent" onClick={(): void => onOpenChange(false)}>
                                <X size={26} className="" />
                            </Button>
                        </div>
                        <div className="mt-4 flex flex-col items-start w-full gap-5">
                            <div className="w-full flex flex-col items-center justify-center gap-2">
                                <DialogTitle className="font-bold ">Add Team Member</DialogTitle>
                                <p className="">Your email will be used to invite them to the team and respective roles.</p>
                            </div>
                            <div className="flex flex-col gap-4 w-full">
                                <div className="relative">
                                    <Label
                                        htmlFor="sender"
                                        className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                                    >
                                        Enter team Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="text"
                                        required
                                        disabled={loading}
                                        className="h-10 "
                                        placeholder="Enter Email"
                                        value={email}
                                        onChange={(e): void => { this.handleInputChange("email", e.target.value) }}
                                    />
                                </div>
                                <div className="relative">
                                    <Label
                                        htmlFor="sender"
                                        className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                                    >
                                        Select Role <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={role}
                                        disabled={loading}
                                        onValueChange={(value) =>
                                            this.handleInputChange("role", value)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue className="capitalize" placeholder="Select Team Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(TeamRole).map((role) => (
                                                <SelectItem className="capitalize" key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    className="text-white"
                                    variant="default"
                                    size="lg"
                                    disabled={loading}
                                    onClick={this.handleAddTeam}
                                >
                                    {loading ? "Loading..." : "Continue"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
}

export function TeamsView() {
    const [teams, setTeams] = useState<Array<ITeamMember>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [addTeamModalOpen, setAddTeamModalOpen] = useState<boolean>(false);

    //// session data
    const sd: SessionData = session.getUserData();

    // filters:
    const [search, setSearch] = useState<string>("");
    const [pagination, setPagination] = useState<IPagination>({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(TeamStatus.ACTIVE);

    const statusTabs = Object.values(TeamStatus);

    useEffect(() => {
        fetchTeams();
    }, [statusFilter, search]);

    const fetchTeams = async () => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();

            const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
            const statusParam = statusFilter ? `&status=${encodeURIComponent(statusFilter.toLowerCase())}` : "";
            const url: string = `${Defaults.API_BASE_URL}/teams/sender/${sd.sender._id}?page=${currentPage}&limit=${pagination.limit}${searchParam}${statusParam}`;

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
                const parseData: ITeams = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                console.log("Fetched teams: ", parseData);
                setTeams(parseData.members);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error: any) {
            console.error("Error fetching teams:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddTeam = async () => {
        setLoading(true);
    };

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Teams</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage all your teams list.
                    </p>
                </div>
            </div>

            {/* Senders Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">{statusFilter} Teams</h2>
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
                                        fetchTeams();
                                    }}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors capitalize whitespace-nowrap ${statusFilter === status
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
                                    autoComplete="off"
                                    autoCorrect="off"
                                    className="pl-10 h-10 w-60"
                                    placeholder="Search any team name"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <Button size="md" variant="outline" onClick={() => setAddTeamModalOpen(true)}>
                                <Plus size={16} />
                                Create New Team
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Team loading skeleton */}
                {loading && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Email</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Role</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...Array(5)].map((_, index) => (
                                            <tr key={index} className="border-b border-gray-100 animate-pulse">
                                                <td className="py-4 px-6">
                                                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
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

                {/* Empty teams state */}
                {!loading && teams.length === 0 && (
                    <Card className="w-full">
                        <CardContent className="p-0 w-full">
                            <div className="py-20 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-gray-400 text-4xl">👥</div>
                                    <p className="text-sm text-gray-600">No {statusFilter.toLowerCase()} team members found</p>
                                    <p className="text-xs text-gray-500">Your team members will appear here</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sender Table */}
                {!loading && teams.length > 0 && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Email</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Role</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teams.map((team, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{team?.email}</td>
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{team?.role}</td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${team.status === TeamStatus.ACTIVE
                                                            ? "bg-green-100 text-green-800"
                                                            : team.status === TeamStatus.INVITATIONS
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-gray-100 text-gray-800"
                                                            }`}
                                                    >
                                                        {team.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                                                    {team.status === TeamStatus.ACTIVE
                                                        ? new Date(team.invitedAt || new Date()).toDateString()
                                                        : team.status === TeamStatus.INVITATIONS
                                                            ? new Date(team.invitedAt || new Date()).toDateString()
                                                            : "-"}
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
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>

            <AddTeamModal
                open={addTeamModalOpen}
                onOpenChange={(open: boolean): void => {
                    setAddTeamModalOpen(open);
                    fetchTeams();
                }}
                onSubmit={handleAddTeam}
            />
        </div>
    );
}