import { useState, useEffect } from "react";
import { useSearchParams } from "wouter";
import {
    X,
    Loader2,
    Eye,
    EyeOff,
    ChevronsUpDownIcon,
    CheckIcon,
    Loader,
} from "lucide-react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";

import { Card, CardContent } from "@/v1/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/v1/components/ui/dialog";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/v1/components/ui/use-toast";
import { toast } from "sonner";
import {
    IBank,
    IBankList,
    IResponse,
    ISession,
    IUser,
} from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
import { cn } from "@/v1/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/v1/components/ui/popover";
import { Country, ICountry } from "country-state-city";
import Defaults from "@/v1/defaults/defaults";
import { Status } from "@/v1/enums/enums";
import TwoFactorAuthSetUp from "../twofa";
import TwoFactorLoginModal from "../twofa/login-modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/v1/components/ui/table";
import LocalSession from "@/v1/session/local";

// VisuallyHidden component for accessibility
const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => (
    <span
        style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: "0",
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: "0",
        }}
    >
        {children}
    </span>
);

export function SettingsView() {
    //const [activeTab, setActiveTab] = useState("overview");
    const [activeTab, setActiveTab] = useState("security");
    const [searchParams, setSearchParams] = useSearchParams();

    const tabs = [
        // { id: "overview", label: "Overview" },
        // { id: "profile", label: "My Profile" },
        // { id: "bank", label: "Bank Accounts" },
        { id: "security", label: "Security" },
        { id: "sessions", label: "Sessions" },
    ];

    useEffect(() => {
        const tabFromUrl = searchParams.get("tab");
        if (tabFromUrl && tabs.some((tab) => tab.id === tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="max-w-4xl">
                {activeTab === "overview" && (
                    <OverviewTab setActiveTab={setActiveTab} />
                )}
                {activeTab === "profile" && <MyProfileTab />}
                {activeTab === "bank" && <BankAccountsTab />}
                {activeTab === "security" && <SecurityTab />}
                {activeTab === "sessions" && <SessionsTab />}
            </div>
        </div>
    );
}

function MyProfileTab() {
    const { toast: toastHook } = useToast();
    const [user, setUser] = useState<IUser | null>(null);
    const [formData, setFormData] = useState<Partial<IUser>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [popOpen, setPopOpen] = useState<boolean>(false);

    // File upload states
    const [uploadLoading, setUploadLoading] = useState<boolean>(false);
    const [uploadFileUrl, setUploadFileUrl] = useState<string>("");

    const storage: SessionData = session.getUserData();
    const countries: Array<ICountry> = Country.getAllCountries();

    useEffect(() => {
        if (storage) {
            setUser(storage.user);
            setFormData(storage.user);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleEnableEditing = () => {
        setIsEditing(true);
        toast("Edit mode enabled");
        toastHook({
            title: "Edit Mode",
            description: "You can now edit your profile information",
            variant: "info",
        });
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true);

            // Prepare the data to send - only address details and image
            const updateData = {
                address: formData.address || "",
                city: formData.city || "",
                state: formData.state || "",
                postalCode: formData.postalCode || "",
                country: formData.country || "",
                imageURL: uploadFileUrl || user?.imageURL || "",
            };

            const url = `${Defaults.API_BASE_URL}/user/profile`;

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify(updateData),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                const updatedUser = { ...user, ...updateData };
                setUser(updatedUser as IUser);

                const updatedSessionData = {
                    ...storage,
                    user: updatedUser as IUser,
                };
                session.updateSession(updatedSessionData);

                setUploadFileUrl("");
                setIsEditing(false);

                toast.success("Profile updated successfully");
                toastHook({
                    title: "Profile Updated",
                    description: "Your profile has been updated successfully",
                    variant: "success",
                });
            }
        } catch (error: any) {
            console.error("Profile update error:", error);

            // Show error notification
            toast.error(error.message || "Failed to update profile");
            toastHook({
                title: "Update Failed",
                description: error.message || "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        try {
            setUploadLoading(true);

            // Upload the file
            const form = new FormData();
            form.append("file", file);

            const headers: Record<string, string> = { ...Defaults.HEADERS } as Record<
                string,
                string
            >;
            if (headers["Content-Type"]) delete headers["Content-Type"];
            if (headers["content-type"]) delete headers["content-type"];

            const uploadRes = await fetch(`${Defaults.API_BASE_URL}/upload`, {
                method: "POST",
                headers: {
                    ...headers,
                    "x-rojifi-handshake": storage.client.publicKey || "",
                    "x-rojifi-deviceid": storage.deviceid || "",
                },
                body: form,
            });

            const uploadData: IResponse = await uploadRes.json();
            if (uploadData.status === Status.ERROR)
                throw new Error(uploadData.message || uploadData.error);

            if (uploadData.status === Status.SUCCESS) {
                if (!uploadData.handshake) throw new Error("Invalid Response");
                const parseData: { url: string } = Defaults.PARSE_DATA(
                    uploadData.data,
                    storage.client.privateKey,
                    uploadData.handshake
                );

                setUploadFileUrl(parseData.url);

                toast.success("File uploaded successfully");
                toastHook({
                    title: "Success",
                    description: "File uploaded successfully.",
                    duration: 3000,
                    variant: "default",
                });
            }
        } catch (error: any) {
            console.error(error);
            toast.error((error as Error).message || "Failed to upload file");
            toastHook({
                title: "Error",
                description: (error as Error).message || "Failed to upload file",
                duration: 5000,
                variant: "destructive",
            });
        } finally {
            setUploadLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Biodata</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Personal</h4>
                        <p className="text-sm text-gray-500 mb-4">
                            Enter your name as it appears on your authorized ID
                        </p>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="firstname">First name *</Label>
                                <Input
                                    id="firstname"
                                    value={formData.firstname || ""}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <Label htmlFor="lastname">Last name *</Label>
                                <Input
                                    id="lastname"
                                    value={formData.lastname || ""}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.email || ""}
                                    className="mt-1"
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">
                            Profile picture
                        </Label>
                        <div className="mt-2 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                {uploadFileUrl ? (
                                    <img
                                        src={uploadFileUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : user?.imageURL ? (
                                    <img
                                        src={user.imageURL}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.fullName}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            {/* Hidden file input */}
                            <input
                                type="file"
                                id="profile-image-upload"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleFileUpload(file);
                                    }
                                }}
                            />

                            {/* Upload button */}
                            <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() =>
                                    document.getElementById("profile-image-upload")?.click()
                                }
                                disabled={uploadLoading}
                            >
                                {uploadLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Change Avatar"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Address</h4>
                <p className="text-sm text-gray-500 mb-4">
                    This should match your proof of address document
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="address">Address line 1 *</Label>
                        <Input
                            id="address"
                            value={formData.address || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                            id="city"
                            value={formData.city || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                            id="state"
                            value={formData.state || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="zip_code">Zip/Postal code</Label>
                        <Input
                            id="zip_code"
                            value={formData.postalCode || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="country" id="country">
                            Country *
                        </Label>

                        <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    size="md"
                                    aria-expanded={popOpen}
                                    disabled={!isEditing}
                                    className="w-full justify-between"
                                >
                                    {formData.country
                                        ? countries.find(
                                            (country) => country.name === formData.country
                                        )?.name
                                        : "Select country..."}
                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search framework..." />
                                    <CommandList>
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandGroup>
                                            {countries.map((country) => (
                                                <CommandItem
                                                    key={country.name}
                                                    value={country.name}
                                                    onSelect={(currentValue) => {
                                                        setFormData({ ...formData, country: currentValue });
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.country === country.name
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    <img
                                                        src={`https://flagcdn.com/w320/${country.isoCode.toLowerCase()}.png`}
                                                        alt=""
                                                        width={18}
                                                        height={18}
                                                    />
                                                    {country.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                {!isEditing ? (
                    <Button onClick={handleEnableEditing} className="text-white">
                        Edit Profile
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    firstname: user?.firstname,
                                    lastname: user?.lastname,
                                    address: user?.address,
                                    city: user?.city,
                                    state: user?.state,
                                    postalCode: user?.postalCode,
                                    country: user?.country,
                                });
                                toast("Changes cancelled");
                                toastHook({
                                    title: "Changes Cancelled",
                                    description: "Profile changes have been cancelled",
                                    variant: "info",
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={handleSaveChanges}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

function BankAccountsTab() {
    const { toast: toastHook } = useToast();
    const [bankAccounts, setBankAccounts] = useState<Array<IBank>>([]);
    const [banks, setBanks] = useState<Array<IBankList>>([]);
    const [newBankAccount, setNewBankAccount] = useState({
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountName: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingBanks, setLoadingBanks] = useState(true);
    const [loadingBankAccounts, setLoadingBankAccounts] = useState(true);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [bankToRemove, setBankToRemove] = useState<IBank | null>(null);
    const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
    const [bankPopOpen, setBankPopOpen] = useState(false);
    const storage: SessionData = session.getUserData();

    useEffect(() => {
        getBanks();
        getBankAccounts();
    }, []);

    const getBanks = async () => {
        try {
            setLoadingBanks(true);
            const url = `${Defaults.API_BASE_URL}/bank/list`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Invalid Response");
                const parseData = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );
                setBanks(parseData || []);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch banks");
            toastHook({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to fetch banks",
            });
        } finally {
            setLoadingBanks(false);
        }
    };

    const getBankAccounts = async () => {
        try {
            setLoadingBankAccounts(true);
            const url = `${Defaults.API_BASE_URL}/bank/`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Invalid Response");
                const parseData: Array<IBank> = Defaults.PARSE_DATA(
                    data.data,
                    storage.client.privateKey,
                    data.handshake
                );
                setBankAccounts(parseData || []);
                session.updateSession({
                    ...storage,
                    banks: parseData || [],
                });
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch bank accounts");
            toastHook({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to fetch bank accounts",
            });
        } finally {
            setLoadingBankAccounts(false);
        }
    };

    const handleAccountNumberChange = async (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
        setNewBankAccount((prev) => ({
            ...prev,
            accountNumber: numericValue,
            accountName: numericValue.length < 10 ? "" : prev.accountName,
        }));

        // Auto-verify account name when account number is complete and bank is selected
        if (numericValue.length === 10 && newBankAccount.bankCode) {
            setIsVerifyingAccount(true);
            try {
                const url = `${Defaults.API_BASE_URL}/bank/resolve`;
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        ...Defaults.HEADERS,
                        "x-rojifi-handshake": storage.client.publicKey,
                        "x-rojifi-deviceid": storage.deviceid,
                        Authorization: `Bearer ${storage.authorization}`,
                    },
                    body: JSON.stringify({
                        accountNumber: numericValue,
                        bankCode: newBankAccount.bankCode,
                    }),
                });

                const data: IResponse = await res.json();
                if (data.status === Status.ERROR)
                    throw new Error(data.message || data.error);
                if (data.status === Status.SUCCESS) {
                    if (!data.handshake) throw new Error("Invalid Response");
                    const parseData: { account_name: string } = Defaults.PARSE_DATA(
                        data.data,
                        storage.client.privateKey,
                        data.handshake
                    );
                    setNewBankAccount((prev) => ({
                        ...prev,
                        accountName: parseData.account_name,
                    }));
                    toast(
                        `Account verified successfully! Account holder: ${parseData.account_name}`
                    );
                }
            } catch (error: any) {
                toast(
                    `Account verification failed: ${error.message || "Failed to verify account name"
                    }`
                );
                setNewBankAccount((prev) => ({
                    ...prev,
                    accountName: "",
                }));
            } finally {
                setIsVerifyingAccount(false);
            }
        }
    };

    const handleAddBankAccount = async () => {
        try {
            if (
                !newBankAccount.bankName ||
                !newBankAccount.accountNumber ||
                !newBankAccount.accountName ||
                !newBankAccount.bankCode
            )
                throw new Error("Please fill in all required fields");
            setLoading(true);

            const url = `${Defaults.API_BASE_URL}/bank/save`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify(newBankAccount),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                // Clear form after successful addition
                setNewBankAccount({
                    bankName: "",
                    bankCode: "",
                    accountNumber: "",
                    accountName: "",
                });

                // Show success notifications
                toast("Bank account added successfully");
                toastHook({
                    title: "Bank Account Added",
                    description: "Your new bank account has been successfully linked.",
                    variant: "success",
                });

                // Refresh bank accounts list
                getBankAccounts();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to add bank account");
            toastHook({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to add bank account",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBankAccount = async () => {
        if (!bankToRemove) return;

        setLoading(true);
        try {
            const url = `${Defaults.API_BASE_URL}/bank/remove/${bankToRemove._id}`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);

            if (data.status === Status.SUCCESS) {
                // Remove from local state only after successful API call
                setBankAccounts(
                    bankAccounts.filter((bank) => bank._id !== bankToRemove._id)
                );
                setRemoveDialogOpen(false);
                setBankToRemove(null);

                toast("Bank account removed successfully");
                toastHook({
                    title: "Bank Account Removed",
                    description: "Your bank account has been permanently removed.",
                    variant: "success",
                });

                // Refresh bank accounts list
                getBankAccounts();
            }
        } catch (error: any) {
            toast(
                `Failed to remove bank account: ${error.message || "Unknown error"}`
            );
            toastHook({
                title: "Removal Failed",
                description: error.message || "Failed to remove bank account",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Bank Accounts
                </h3>
                <p className="text-gray-600">
                    Manage your linked bank accounts for deposits and withdrawals
                </p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                        Add New Bank Account
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="bankName">Bank Name *</Label>
                            <Popover open={bankPopOpen} onOpenChange={setBankPopOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={bankPopOpen}
                                        className="w-full justify-between mt-1"
                                    >
                                        {newBankAccount.bankName
                                            ? banks.find(
                                                (bank) => bank.name === newBankAccount.bankName
                                            )?.name
                                            : "Select your bank..."}
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search banks..." />
                                        <CommandList>
                                            <CommandEmpty>No bank found.</CommandEmpty>
                                            <CommandGroup>
                                                {loadingBanks && (
                                                    <div className="flex items-center justify-center p-4">
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Loading banks...
                                                    </div>
                                                )}
                                                {!loadingBanks &&
                                                    banks.map((bank) => (
                                                        <CommandItem
                                                            key={bank.slug}
                                                            value={bank.name}
                                                            onSelect={(currentValue) => {
                                                                const selectedBank = banks.find(
                                                                    (b) =>
                                                                        b.name.toLowerCase() ===
                                                                        currentValue.toLowerCase()
                                                                );
                                                                if (selectedBank) {
                                                                    setNewBankAccount({
                                                                        ...newBankAccount,
                                                                        bankName: selectedBank.name,
                                                                        bankCode: selectedBank.code,
                                                                    });
                                                                }
                                                                setBankPopOpen(false);
                                                            }}
                                                        >
                                                            <CheckIcon
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    newBankAccount.bankName === bank.name
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex items-center">
                                                                {bank.icon && (
                                                                    <img
                                                                        src={bank.icon}
                                                                        alt={`Icon for ${bank.name}`}
                                                                        className="w-5 h-5 mr-2"
                                                                    />
                                                                )}
                                                                {bank.name}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label htmlFor="accountNumber">Account Number *</Label>
                            <Input
                                id="accountNumber"
                                value={newBankAccount.accountNumber}
                                onChange={(e) => handleAccountNumberChange(e.target.value)}
                                placeholder="Enter 10-digit account number"
                                maxLength={10}
                                disabled={isVerifyingAccount}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="accountName">Account Name *</Label>
                            <Input
                                id="accountName"
                                value={newBankAccount.accountName}
                                readOnly
                                className="mt-1 bg-gray-50 cursor-not-allowed"
                                placeholder={
                                    isVerifyingAccount
                                        ? "Verifying..."
                                        : "Name will appear after verification"
                                }
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={handleAddBankAccount}
                            className="text-white"
                            disabled={
                                !newBankAccount.bankName ||
                                !newBankAccount.accountNumber ||
                                !newBankAccount.accountName ||
                                !newBankAccount.bankCode ||
                                loading ||
                                isVerifyingAccount
                            }
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {loading ? "Adding..." : "Add Bank Account"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Your Bank Accounts</h4>

                    {loadingBankAccounts ? (
                        <div className="space-y-4">
                            {/* Shimmer Loading State */}
                            {[1, 2, 3].map((index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 animate-pulse"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : bankAccounts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No bank accounts linked
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Add your first bank account to start receiving funds and making
                                withdrawals.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    document
                                        .getElementById("bankName")
                                        ?.scrollIntoView({ behavior: "smooth" })
                                }
                            >
                                Add Bank Account
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Bank Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Account Information
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bankAccounts.map((bank) => (
                                        <tr key={bank._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center">
                                                        <svg
                                                            className="w-4 h-4 text-gray-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                            ></path>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {bank.bankName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {bank.accountNumber}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {bank.accountName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setBankToRemove(bank);
                                                        setRemoveDialogOpen(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 hover:border-red-300"
                                                >
                                                    Remove
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <VisuallyHidden>
                        <DialogTitle>Remove Bank Account Confirmation</DialogTitle>
                    </VisuallyHidden>

                    <div className="flex justify-end">
                        <button
                            onClick={() => setRemoveDialogOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-6 pb-4">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                ></path>
                            </svg>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Permanently Remove Bank Account
                            </h3>

                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="text-sm text-red-800 font-medium mb-1">
                                    This action cannot be reversed
                                </div>
                                <div className="text-sm text-red-700">
                                    Once removed, you'll need to re-add this bank account if you
                                    want to use it again.
                                </div>
                            </div>

                            {bankToRemove && (
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                        Bank Account Details:
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div>
                                            <strong>{bankToRemove.bankName}</strong>
                                        </div>
                                        <div>Account: {bankToRemove.accountNumber}</div>
                                        <div>Name: {bankToRemove.accountName}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 w-full pt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setRemoveDialogOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                onClick={handleRemoveBankAccount}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Removing...
                                    </>
                                ) : (
                                    "Yes, Remove Permanently"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SecurityTab() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pinData, setPinData] = useState({ pin: "", password: "" });
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [twoFaModal, setTwoFaModal] = useState(false);
    const [twoFaLoading, setTwoFaLoading] = useState(false);
    const [twoFactorOpen, setTwoFactorOpen] = useState(false);

    // Independent loading states for each form
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [pinLoading, setPinLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast: toastHook } = useToast();
    const storage: SessionData = session.getUserData();

    const handlePasswordInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
    };

    const handleConfirmPasswordChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setConfirmPassword(e.target.value);
    };

    const handleUpdatePassword = async () => {
        try {
            setPasswordLoading(true);
            if (
                !passwordData.current_password ||
                !passwordData.new_password ||
                !confirmPassword
            )
                throw new Error("Please fill in all password fields");
            if (passwordData.new_password !== confirmPassword)
                throw new Error("New password and confirmation do not match");
            if (passwordData.new_password.length < 8)
                throw new Error("New password must be at least 8 characters long");

            const url: string = `${Defaults.API_BASE_URL}/user/password`;

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordData.current_password,
                    newPassword: passwordData.new_password,
                    confirmNewPassword: confirmPassword,
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                // Use Sonner toast (the one that actually shows up)
                toast.success("Password updated successfully. Please log in again.");

                // Keep useToast for consistency
                toastHook({
                    title: "Password Updated",
                    description:
                        "Your password has been updated successfully. Please log in again.",
                    variant: "success",
                });
            }
        } catch (error: any) {
            // Use Sonner toast (the one that actually shows up)
            toast.error(error.message || "Failed to update password");

            // Keep useToast for consistency
            toastHook({
                title: "Error",
                description: error.message || "Failed to update password",
                variant: "destructive",
            });
        } finally {
            setPasswordData({ current_password: "", new_password: "" });
            setConfirmPassword("");
            setShowPasswordModal(false);
            setPasswordLoading(false);
        }
    };

    const handlePinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPinData({ ...pinData, [e.target.id]: e.target.value });
        setErrorMessage("");
    };

    const handleSetTransactionPin = async () => {
        try {
            setErrorMessage("");
            if (!pinData.pin || !pinData.password) {
                setErrorMessage("Please enter both a PIN and your password");
                return;
            }

            if (!/^\d{4}$/.test(pinData.pin)) {
                setErrorMessage("PIN must be a 4-digit number");
                return;
            }

            setPinLoading(true);

            const url: string = `${Defaults.API_BASE_URL}/user/pin`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify({
                    newPin: pinData.pin.trim(),
                    currentPassword: pinData.password.trim(),
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                setShowPinModal(false);
                toast.success("Transaction PIN set successfully");
                toastHook({
                    title: "Transaction PIN Set",
                    description: "Your transaction PIN has been set successfully",
                    variant: "success",
                });
            }
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to set transaction PIN");
            toast.error(error.message || "Failed to set transaction PIN");
            toastHook({
                title: "Error",
                description: error.message || "Failed to set transaction PIN",
                variant: "destructive",
            });
        } finally {
            setPinData({ pin: "", password: "" });
            setPinLoading(false);
        }
    };

    const handleDisable2FA = async (code: string) => {
        try {
            setTwoFaLoading(true);
            const url: string = `${Defaults.API_BASE_URL}/user/2fa/disable`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                    Authorization: `Bearer ${storage.authorization}`,
                },
                body: JSON.stringify({
                    code: code,
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR)
                throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                session.updateSession({
                    ...storage,
                    user: {
                        ...storage.user,
                        twoFactorEnabled: false,
                        twoFactorVerified: false,
                    },
                });
                toast.success("Two-Factor Authentication disabled successfully");
                toastHook({
                    title: "2FA Disabled",
                    description:
                        "Two-Factor Authentication has been disabled on your account",
                    variant: "success",
                });
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to disable 2FA");
            toastHook({
                title: "Error",
                description: error.message || "Failed to disable 2FA",
                variant: "destructive",
            });
        } finally {
            setTwoFactorOpen(false);
            setTwoFaLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600">
                    Manage your account security settings and authentication methods
                </p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <Label htmlFor="current_password">Current Password *</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={handlePasswordInputChange}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="new_password">New Password *</Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={passwordData.new_password}
                                onChange={handlePasswordInputChange}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                className="mt-1"
                            />
                        </div>

                        <Button
                            className="text-white"
                            onClick={() => setShowPasswordModal(true)}
                            disabled={
                                passwordLoading ||
                                !passwordData.current_password ||
                                !passwordData.new_password ||
                                !confirmPassword
                            }
                        >
                            {passwordLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Update Password
                        </Button>

                        <Dialog
                            open={showPasswordModal}
                            onOpenChange={setShowPasswordModal}
                        >
                            <DialogContent className="sm:max-w-md">
                                <VisuallyHidden>
                                    <DialogTitle>Update Password Confirmation</DialogTitle>
                                </VisuallyHidden>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowPasswordModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center space-y-4 pb-4">
                                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">!</span>
                                    </div>

                                    <h3 className="text-2xl font-semibold text-gray-900">
                                        Update Password?
                                    </h3>

                                    <p className="text-gray-600 max-w-sm">
                                        You're about to update your password. For security, you will
                                        be logged out and need to log in again using your new
                                        password.
                                    </p>

                                    <div className="flex gap-3 w-full pt-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setShowPasswordModal(false);
                                                // Use Sonner toast
                                                toast("Password update cancelled");

                                                // Keep useToast for consistency
                                                toastHook({
                                                    title: "Password Update Cancelled",
                                                    description: "Password update has been cancelled",
                                                    variant: "info",
                                                });
                                            }}
                                        >
                                            No, cancel
                                        </Button>
                                        <Button
                                            className="flex-1 text-white bg-blue-600 hover:bg-blue-700"
                                            onClick={handleUpdatePassword}
                                            disabled={passwordLoading}
                                        >
                                            {passwordLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            {passwordLoading ? "Updating..." : "Yes, proceed"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            {/*
            <Card>
                <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                        Set Transaction PIN
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                        Set a 4-digit PIN for secure transactions
                    </p>

                    <div className="space-y-4 max-w-md">
                        <Button
                            className="text-white"
                            onClick={() => {
                                setShowPinModal(true);
                                toast("Opened PIN setup dialog");
                                toastHook({
                                    title: "Set PIN",
                                    description: "Opened transaction PIN setup dialog",
                                    variant: "info",
                                });
                            }}
                        >
                            Set Transaction PIN
                        </Button>

                        <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
                            <DialogContent className="sm:max-w-md">
                                <VisuallyHidden>
                                    <DialogTitle>Set Transaction PIN</DialogTitle>
                                </VisuallyHidden>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            setShowPinModal(false);
                                            setErrorMessage("");
                                            setShowPin(false);
                                            setShowPassword(false);
                                            // Use Sonner toast
                                            toast("PIN setup cancelled");

                                            // Keep useToast for consistency
                                            toastHook({
                                                title: "PIN Setup Cancelled",
                                                description: "Transaction PIN setup has been cancelled",
                                                variant: "info",
                                            });
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4 pb-4">
                                    <h3 className="text-2xl font-semibold text-gray-900 text-center">
                                        Set Transaction PIN
                                    </h3>

                                    <div className="relative">
                                        <Label htmlFor="pin">New PIN (4 digits) *</Label>
                                        <Input
                                            id="pin"
                                            type={showPin ? "text" : "password"}
                                            value={pinData.pin}
                                            onChange={handlePinInputChange}
                                            placeholder="Enter 4-digit PIN"
                                            className="mt-1 pr-10"
                                            maxLength={4}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPin(!showPin)}
                                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPin ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Label htmlFor="password">Current Password *</Label>
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={pinData.password}
                                            onChange={handlePinInputChange}
                                            placeholder="Enter your password"
                                            className="mt-1 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    {errorMessage && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <div className="text-sm text-red-600 text-center">
                                                {errorMessage}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 w-full pt-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setShowPinModal(false);
                                                setErrorMessage("");
                                                setShowPin(false);
                                                setShowPassword(false);
                                                // Use Sonner toast
                                                toast("PIN setup cancelled");

                                                // Keep useToast for consistency
                                                toastHook({
                                                    title: "PIN Setup Cancelled",
                                                    description:
                                                        "Transaction PIN setup has been cancelled",
                                                    variant: "info",
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 text-white bg-blue-600 hover:bg-blue-700"
                                            onClick={handleSetTransactionPin}
                                            disabled={pinLoading}
                                        >
                                            {pinLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            {pinLoading ? "Setting PIN..." : "Set PIN"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                            <DialogContent className="sm:max-w-md">
                                <VisuallyHidden>
                                    <DialogTitle>PIN Set Successfully</DialogTitle>
                                </VisuallyHidden>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowSuccessModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center space-y-4 pb-4">
                                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                                        <svg
                                            className="h-8 w-8 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>

                                    <h3 className="text-2xl font-semibold text-gray-900">
                                        PIN Set Successfully
                                    </h3>

                                    <p className="text-gray-600 max-w-sm">
                                        Your transaction PIN has been set successfully. You can now
                                        use it for secure transactions.
                                    </p>

                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => setShowSuccessModal(false)}
                                    >
                                        Done
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
            */}

            <Card>
                <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Set Up 2FA</h4>
                    <p className="text-sm text-gray-500 mb-4">
                        Secure your account with two-factor authentication
                    </p>
                    <Button
                        className="text-white"
                        disabled={storage.user.twoFactorEnabled === true ? true : false}
                        onClick={() => setTwoFaModal(true)}
                    >
                        Set Up 2FA
                    </Button>
                    {storage.user.twoFactorEnabled === true && (
                        <Button
                            className="ml-4 text-white bg-red-600 hover:bg-red-700"
                            onClick={() => setTwoFactorOpen(true)}
                        >
                            Disable 2FA
                        </Button>
                    )}
                    {twoFaModal && (
                        <TwoFactorAuthSetUp onClose={() => setTwoFaModal(false)} />
                    )}
                </CardContent>
            </Card>
            <TwoFactorLoginModal
                open={twoFactorOpen}
                loading={twoFaLoading}
                onSubmit={handleDisable2FA}
                onCancel={() => {
                    setTwoFactorOpen(false);
                }}
            />
        </div>
    );
}

function OverviewTab({
    setActiveTab,
}: {
        setActiveTab: (tab: string) => void;
}) {
    const { toast } = useToast();
    const [user, setUser] = useState<IUser | null>(null);
    const [_banks, setBanks] = useState<IBank[]>([]);
    const storage: SessionData = session.getUserData();

    useEffect(() => {
        if (storage) {
            setUser(storage.user);
            setBanks(storage.banks || []);
        }
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-500">Profile</div>
                        <div className="mt-2 font-medium text-lg text-gray-900">
                            {user?.fullName}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {user?.email || "No email"}
                        </div>
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setActiveTab("profile");
                                    toast({
                                        title: "Navigating",
                                        description: "Opening profile tab",
                                        variant: "info",
                                    });
                                }}
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-500">Bank Accounts</div>
                        <div className="mt-2 font-medium text-lg text-gray-900">{banks.length || "0"}</div>
                        <div className="text-xs text-gray-400 mt-1">Manage deposit & withdrawal accounts</div>
                        <div className="mt-4">
                            <Button variant="outline" size="sm" onClick={() => setActiveTab("bank")}>
                                Manage Accounts
                            </Button>
                        </div>
                    </CardContent>
                </Card> */}

                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-500">Security</div>
                        <div className="mt-2 font-medium text-lg text-gray-900">
                            View & update
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Change password, set PIN and more
                        </div>
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab("security")}
                            >
                                Update Security
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900">Quick actions</h4>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              size="sm"
              className="text-white"
              onClick={() => setActiveTab("profile")}
            >
              Edit Profile
            </Button>
            <Button
              size="sm"
              className="text-white"
              onClick={() => setActiveTab("bank")}
            >
              Add Bank Account
            </Button>
            <Button
              size="sm"
              className="text-white"
              onClick={() => setActiveTab("security")}
            >
              Set PIN / Password
            </Button>
          </div>
        </CardContent>
      </Card> */}
        </div>
    );
}

function SessionsTab() {
    const [activeSession, setActiveSession] = useState<ISession | null>(null);
    const [indexSession, setIndexSession] = useState<ISession | null>(null);
    const [sessions, setSessions] = useState<Array<ISession>>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [revokeLoading, setRevokeLoading] = useState(false);
    const storage: SessionData = session.getUserData();

    useEffect(() => {
        setSessions(storage.sessions || []);
        if (storage.session) {
            const decrypted: ISession = LocalSession.decode();
            setIndexSession(decrypted);
        }
    }, [storage.sessions]);

    const revokeSession = async (sessionId: string) => {
        try {
            setRevokeLoading(true);
            await LocalSession.revoke(sessionId);
        } catch (error) {
            console.error("Failed to revoke session:", error);
        } finally {
            setRevokeLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                Active Sessions
            </h3>
            <p className="text-gray-600">
                Manage your active sessions and log out from other devices
            </p>
            {/** Active Sessions Table */}
            <h1>Active Sessions</h1>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Device</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{indexSession?.deviceType}</TableCell>
                            <TableCell>{indexSession?.ipAddress}</TableCell>
                            <TableCell>
                                {indexSession?.geoLocation?.country || "N/A"}
                            </TableCell>
                            <TableCell>
                                {new Date(indexSession?.lastAccessedAt || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={revokeLoading}
                                    onClick={() => {
                                        setActiveSession(sessions[0]);
                                        setModalOpen(true);
                                    }}
                                >
                                    Revoke
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/** Other Sessions Table */}
            <h1>Other Sessions</h1>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Device</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center py-4 text-gray-500"
                                >
                                    No active sessions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sessions.map((session, index) => (
                                <TableRow key={index}>
                                    <TableCell>{session.deviceType}</TableCell>
                                    <TableCell>{session.ipAddress}</TableCell>
                                    <TableCell>
                                        {session?.geoLocation?.country || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(session.lastAccessedAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={revokeLoading}
                                            onClick={() => {
                                                setActiveSession(session);
                                                setModalOpen(true);
                                            }}
                                        >
                                            Revoke
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/** Revoke Session Confirmation Modal */}

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <VisuallyHidden>
                        <DialogTitle>Revoke Session Confirmation</DialogTitle>
                    </VisuallyHidden>

                    <div className="flex justify-end">
                        <button
                            disabled={revokeLoading}
                            onClick={() => setModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4 pb-4">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">!</span>
                        </div>

                        <h3 className="text-2xl font-semibold text-gray-900">
                            Revoke Session?
                        </h3>

                        <p className="text-gray-600 max-w-sm">
                            Are you sure you want to revoke this session? This action cannot
                            be undone.
                        </p>

                        <div className="flex gap-3 w-full pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setModalOpen(false)}
                                disabled={revokeLoading}
                            >
                                No, cancel
                            </Button>
                            <Button
                                className="flex-1 text-white bg-red-600 hover:bg-red-700"
                                disabled={revokeLoading}
                                onClick={async () => {
                                    if (activeSession) {
                                        await revokeSession(activeSession._id);
                                        if (!revokeLoading) {
                                            setModalOpen(false);
                                        }
                                    }
                                }}
                            >
                                {revokeLoading && (
                                    <Loader className="h-4 w-4 animate-spin mr-2" />
                                )}
                                Yes, revoke
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default SettingsView;
