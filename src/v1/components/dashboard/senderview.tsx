"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import {
  Archive,
  ArrowUpRight,
  ExpandIcon,
  Info,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Shield,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Loading from "../loading";
import { Input } from "../ui/input";
import EmptySender from "../emptysender";
import countries from "../../data/country_state.json";
// Custom country list
// const countries = [
//     { code: "NG", name: "Nigeria", icon: "https://flagcdn.com/w320/ng.png", phoneCode: "" },
//     // { code: "BJ", name: "Benin", icon: "https://flagcdn.com/w320/bj.png", phoneCode: "+229" },
//     // { code: "KE", name: "Kenya", icon: "https://flagcdn.com/w320/ke.png", phoneCode: "+254" },
//     // { code: "CM", name: "Cameroon", icon: "https://flagcdn.com/w320/cm.png", phoneCode: "+237" },
//     // { code: "CI", name: "Cote d'Ivoire", icon: "https://flagcdn.com/w320/ci.png", phoneCode: "+225" },
//     // { code: "SN", name: "Senegal", icon: "https://flagcdn.com/w320/sn.png", phoneCode: "+221" },
//     // { code: "TG", name: "Togo", icon: "https://flagcdn.com/w320/tg.png", phoneCode: "+228" },
// ];
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/v1/components/ui/select";
import { Label } from "../ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/v1/components/ui/sheet";
import Defaults from "@/v1/defaults/defaults";
import { session, SessionData } from "@/v1/session/session";
import { IPagination, IResponse, ISender } from "@/v1/interface/interface";
import { SenderStatus, Status } from "@/v1/enums/enums";
import { ILoginFormProps } from "../auth/login-form";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/v1/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/v1/components/ui/popover";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
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

export function SenderView() {
  const [senders, setSenders] = useState<Array<ISender>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [archiveLoading, setArchiveLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("NG");
  const [businessNumber, setBusinessNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // New state for Sender Profile Sheet
  const [showSenderProfileSheet, setShowSenderProfileSheet] = useState(false);
  const [kycSheet, setKycSheet] = useState<boolean>(false);
  // Final modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessOptions, setBusinessOptions] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [volumeWeekly, setVolumeWeekly] = useState("");
  // Confirmation dialog state for archive / delete actions
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [confirmType, setConfirmType] = useState<"archive" | "delete" | null>(
    null
  );
  const [confirmSenderId, setConfirmSenderId] = useState<string | null>(null);
  const [popOpen, setPopOpen] = useState<boolean>(false);
  const { wallet } = useParams();

  // Sort countries: Nigeria first, then the rest
  const sortedCountries = useMemo(() => {
    const nigeria = countries.find((c) => c.iso2 === "NG");
    const others = countries.filter((c) => c.iso2 !== "NG");
    return nigeria ? [nigeria, ...others] : countries;
  }, [countries]);

  // Derived loading state used by the shared confirm dialog
  const confirmLoading =
    confirmType === "delete"
      ? deleteLoading
      : confirmType === "archive"
      ? archiveLoading
      : false;

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

  // uploads:
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<Record<string, File | null>>({
    cacCertOfIncoporation: null,
    memorandumArticlesOfAssociation: null,
    cacStatusReport: null,
    proofOfAddress: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(SenderStatus.ACTIVE);

  const statusTabs = Object.values(SenderStatus); // ["Active", "In Review", "Unapproved", "Suspended"];

  useEffect(() => {
    fetchSenders();
  }, [statusFilter, search]);

  const fetchSenders = async () => {
    try {
      setLoading(true);

      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const statusParam = statusFilter
        ? `&status=${encodeURIComponent(statusFilter)}`
        : "";
      const url: string = `${Defaults.API_BASE_URL}/sender/all?page=${currentPage}&limit=${pagination.limit}${searchParam}${statusParam}`;

      //console.log("ISSUE IS FROM HERE 3");

      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...Defaults.HEADERS,
          "Content-Type": "application/json",
          "x-rojifi-handshake": sd.client.publicKey,
          "x-rojifi-deviceid": sd.deviceid,
          Authorization: `Bearer ${sd.authorization}`,
        },
      });
      const data: IResponse = await res.json();
      if (data.status === Status.ERROR)
        throw new Error(data.message || data.error);
      if (data.status === Status.SUCCESS) {
        if (!data.handshake)
          throw new Error(
            "Unable to process login response right now, please try again."
          );
        const parseData: Array<ISender> = Defaults.PARSE_DATA(
          data.data,
          sd.client.privateKey,
          data.handshake
        );
        setSenders(parseData);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (error: any) {
      console.error("Error fetching senders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }));
    }
  };

  const renderUploadField = (fieldKey: string, label: string) => (
    <div key={fieldKey}>
      <Label className="block text-lg font-bold text-gray-700 mb-2">
        {label}
      </Label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-primary ${
          dragActive ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(e) => handleDrop(e, fieldKey)}
        tabIndex={0}
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-2">
          Drag & drop or click to choose files
        </p>
        <p className="text-sm text-gray-500 mb-2">JPEG, PNG, and PDF formats</p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
          Max file size: 2 MB
        </div>
        <input
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => handleFileChange(e, fieldKey)}
          id={`file-upload-${fieldKey}`}
        />
        <label
          htmlFor={`file-upload-${fieldKey}`}
          className="absolute inset-0 cursor-pointer"
        />
      </div>
      {formData[fieldKey] && (
        <p className="text-sm text-green-600 mt-2">
          File uploaded: {formData[fieldKey]?.name}
        </p>
      )}
    </div>
  );

  const archiveSender = async (senderId: string): Promise<void> => {
    try {
      setArchiveLoading(true);

      Defaults.LOGIN_STATUS();

      const res = await fetch(
        `${Defaults.API_BASE_URL}/sender/${senderId}/archive`,
        {
          method: "POST",
          headers: {
            ...Defaults.HEADERS,
            "Content-Type": "application/json",
            "x-rojifi-handshake": sd.client.publicKey,
            "x-rojifi-deviceid": sd.deviceid,
            Authorization: `Bearer ${sd.authorization}`,
          },
        }
      );
      const data: IResponse = await res.json();
      if (data.status === Status.ERROR)
        throw new Error(data.message || data.error);
      if (data.status === Status.SUCCESS) {
        const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
          method: "GET",
          headers: {
            ...Defaults.HEADERS,
            "x-rojifi-handshake": sd.client.publicKey,
            "x-rojifi-deviceid": sd.deviceid,
            Authorization: `Bearer ${sd.authorization}`,
          },
        });

        const userdata: IResponse = await userres.json();
        if (userdata.status === Status.ERROR)
          throw new Error(userdata.message || userdata.error);
        if (userdata.status === Status.SUCCESS) {
          if (!userdata.handshake)
            throw new Error(
              "Unable to process response right now, please try again."
            );
          const parseData: ILoginFormProps = Defaults.PARSE_DATA(
            userdata.data,
            sd.client.privateKey,
            userdata.handshake
          );

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
      setArchiveLoading(false);
    }
  };

  const deleteSender = async (senderId: string): Promise<void> => {
    try {
      setDeleteLoading(true);

      Defaults.LOGIN_STATUS();

      const res = await fetch(
        `${Defaults.API_BASE_URL}/sender/${senderId}/delete`,
        {
          method: "DELETE",
          headers: {
            ...Defaults.HEADERS,
            "Content-Type": "application/json",
            "x-rojifi-handshake": sd.client.publicKey,
            "x-rojifi-deviceid": sd.deviceid,
            Authorization: `Bearer ${sd.authorization}`,
          },
        }
      );
      const data: IResponse = await res.json();
      if (data.status === Status.ERROR)
        throw new Error(data.message || data.error);
      if (data.status === Status.SUCCESS) {
        const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
          method: "GET",
          headers: {
            ...Defaults.HEADERS,
            "x-rojifi-handshake": sd.client.publicKey,
            "x-rojifi-deviceid": sd.deviceid,
            Authorization: `Bearer ${sd.authorization}`,
          },
        });

        const userdata: IResponse = await userres.json();
        if (userdata.status === Status.ERROR)
          throw new Error(userdata.message || userdata.error);
        if (userdata.status === Status.SUCCESS) {
          if (!userdata.handshake)
            throw new Error(
              "Unable to process response right now, please try again."
            );
          const parseData: ILoginFormProps = Defaults.PARSE_DATA(
            userdata.data,
            sd.client.privateKey,
            userdata.handshake
          );

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
      setDeleteLoading(false);
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
          <h2 className="text-xl font-medium text-gray-900 capitalize">
            {statusFilter} Senders
          </h2>
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
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap capitalize ${
                    statusFilter === status
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
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Search:
              </label>
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
              <Button
                size="md"
                variant="outline"
                onClick={() => setShowModal(true)}
              >
                <Plus size={16} />
                Create New Sender
              </Button>
            </div>
          </div>
        </div>

        {/* Sender loading */}
        {loading && (
          <div className="py-40">
            <Loading />
          </div>
        )}

        {/* Empty Sender */}
        {!loading && senders.length === 0 && (
          <div className="py-20">
            <EmptySender
              statusFilter={statusFilter}
              onClick={() => setShowModal(true)}
            />
          </div>
        )}

        {/* Country Selection Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 -top-5 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-full md:max-w-2xl mx-4 md:mx-auto p-6 relative">
              <h3 className="text-lg font-semibold mb-2">Select Country</h3>
              <p className="text-sm text-gray-500 mb-4">
                Choose the sender's country of incorporation to continue
                onboarding.
              </p>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {sortedCountries
                  .filter(
                    (c) =>
                      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.phonecode.toString().includes(searchTerm)
                  )
                  .map((c) => (
                    <button
                      key={c.iso2}
                      type="button"
                      onClick={() => setSelectedCountry(c.iso2)}
                      className={`flex items-center justify-between w-full gap-3 p-3 rounded-md border ${
                        selectedCountry === c.iso2
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 bg-white hover:bg-gray-100"
                      } hover:shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          <img
                            src={`https://flagcdn.com/w320/${c.iso2.toLowerCase()}.png`}
                            alt={`${c.name} flag`}
                            className="w-6 h-6"
                          />
                        </span>
                        <div className="text-left">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-gray-500">
                            {c.phonecode}
                          </div>
                        </div>
                      </div>
                      {selectedCountry === c.iso2 && (
                        <span className="text-sm text-green-600">Selected</span>
                      )}
                    </button>
                  ))}
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setSearchTerm("");
                  }}
                >
                  Cancel
                </Button>
                <div>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    disabled={!selectedCountry}
                    onClick={() => {
                      setShowModal(false);
                      setShowBusinessModal(true);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Details Modal */}
        {showBusinessModal && (
          <div className="fixed inset-0 z-50 -top-5 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-full md:max-w-2xl mx-4 md:mx-auto p-8 relative">
              {/* Title */}
              <h2 className="text-xl font-bold text-center mb-2">
                Enter Sender's Business Details
              </h2>
              {/* Description */}
              <p className="text-center text-gray-600 text-xs md:text-base mb-6">
                Please provide the sender's business registration number and tax
                identification number for verification and compliance purposes.
              </p>
              {/* Business Number Input */}
              <div className="mb-4">
                <Label
                  htmlFor="businessNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Business Registration Number{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <input
                  id="businessNumber"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter registration number"
                  value={businessNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow only alphanumeric and selected symbols: - . / &
                    if (/^[a-zA-Z0-9\-\.\/&]*$/.test(val) || val === "") {
                      setBusinessNumber(val);
                    }
                  }}
                />
              </div>
              {/* Tax ID Input */}
              <div className="mb-8">
                <Label
                  htmlFor="taxId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tax Identification Number{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <input
                  id="taxId"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter tax identification number"
                  value={taxId}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow only alphanumeric and selected symbols: - . / &
                    if (/^[a-zA-Z0-9\-\.\/&]*$/.test(val) || val === "") {
                      setTaxId(val);
                    }
                  }}
                />
              </div>
              {/* Footer Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBusinessModal(false);
                    setShowModal(true);
                  }}
                >
                  Go Back
                </Button>
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={!businessNumber || !taxId}
                  onClick={() => {
                    setShowBusinessModal(false);
                    setShowConfirmModal(true);
                    setBusinessLoading(true);
                    // Simulate API call for business info
                    setTimeout(() => {
                      setBusinessOptions([
                        {
                          id: "1",
                          name: "Demo Business Ltd",
                          regNumber: businessNumber,
                          taxId: taxId,
                        },
                      ]);
                      setBusinessLoading(false);
                    }, 1500);
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Business Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 -top-5 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-full md:max-w-2xl mx-4 md:mx-auto p-8 relative">
              {/* Info Icon */}
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                  <svg
                    className="w-7 h-7 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16v-4m0-4h.01"
                    />
                  </svg>
                </span>
              </div>
              {/* Title */}
              <h2 className="text-xl font-bold text-center mb-2">
                Select & Confirm Business
              </h2>
              {/* Description */}
              <p className="text-center text-gray-600 text-xs md:text-base mb-6">
                Tap on a business to select, then enter weekly volume.
              </p>
              {/* Business Info Select */}
              <div className="mb-8">
                {businessLoading ? (
                  <div className="flex justify-center py-8">
                    <Loading />
                  </div>
                ) : businessOptions.length > 0 ? (
                  <div className="space-y-2">
                    {businessOptions.map((biz) => (
                      <div
                        key={biz.id}
                        className={`flex items-center justify-between border rounded-md px-4 py-3 cursor-pointer transition-colors ${
                          selectedBusiness === biz.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-white"
                        }`}
                        onClick={() => setSelectedBusiness(biz.id)}
                      >
                        <span
                          className={`mr-3 flex items-center justify-center w-6 h-6 rounded-full ${
                            selectedBusiness === biz.id
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {selectedBusiness === biz.id ? (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {biz.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Reg No: {biz.regNumber}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No business found.
                  </div>
                )}
              </div>
              {/* Volume Processed Weekly Input */}
              <div className="mb-8">
                <Label
                  htmlFor="volumeWeekly"
                  className="flex flex-col items-start justify-start text-sm font-medium text-gray-700 mb-2"
                >
                  <span>
                    Volume Processed Weekly ($){" "}
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="text-slate-400">
                    (please enter an accurate total volume processed to enable
                    us serve your business better)
                  </span>
                </Label>
                <input
                  id="volumeWeekly"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter volume (e.g. 10,000.50)"
                  value={volumeWeekly.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChange={(e) => {
                    // Remove commas for processing
                    const rawVal = e.target.value.replace(/,/g, "");
                    // Only allow numbers and decimal
                    if (/^\d*\.?\d*$/.test(rawVal) || rawVal === "") {
                      setVolumeWeekly(rawVal);
                    }
                  }}
                  inputMode="decimal"
                />
              </div>
              {/* Footer Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setShowBusinessModal(true);
                  }}
                >
                  Go Back
                </Button>
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={!selectedBusiness || !volumeWeekly}
                  onClick={() => {
                    setShowConfirmModal(false);
                    setShowDetails(true);
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {showConfirmModal === false && selectedBusiness && (
          <Sheet open={showDetails} onOpenChange={setShowDetails}>
            <SheetContent
              side="right"
              className="w-full sm:max-w-full p-0 bg-gradient-to-br from-slate-50 to-slate-100"
            >
              <div className="flex flex-col h-full">
                {/* Enhanced Header */}
                <div className=" p-6 text-white">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-3 mb-2 text-gray-950">
                      <Building2 className="h-6 w-6" />
                      <h2 className="text-2xl font-bold text-gray-950">
                        Business Details
                      </h2>
                    </div>
                    <p className="text-gray-500">
                      Provide comprehensive business information for compliance
                      and verification
                    </p>
                  </motion.div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Contact Information Card */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <div className="bg-gray-100 p-4">
                          <div className="flex items-center gap-2 text-gray-950">
                            <Mail className="h-5 w-5 text-gray-950" />
                            <h3 className="font-semibold text-gray-950">
                              Contact Information
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="senderEmail"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Mail className="h-4 w-4 text-emerald-600" />
                                Email Address{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="senderEmail"
                                type="email"
                                placeholder="sender@company.com"
                                className="border-2 focus:border-emerald-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="senderPhone"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Phone className="h-4 w-4 text-emerald-600" />
                                Phone Number{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <div className="flex gap-2">
                                <Select defaultValue={selectedCountry}>
                                  <SelectTrigger className="w-32 border-2 focus:border-emerald-500">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {countries.map((country) => (
                                      <SelectItem
                                        key={country.iso2}
                                        value={country.iso2}
                                      >
                                        <span className="inline-flex items-center gap-2">
                                          <img
                                            src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                            alt={`${country.name} flag`}
                                            className="w-4 h-4 rounded-sm"
                                          />
                                          <span>{country.phonecode}</span>
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  id="senderPhone"
                                  type="tel"
                                  placeholder="Phone number"
                                  className="flex-1 border-2 focus:border-emerald-500 transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Business Information Card */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <div className="bg-gray-100 p-4">
                          <div className="flex items-center gap-2 text-gray-950">
                            <Building2 className="h-5 w-5" />
                            <h3 className="font-semibold">
                              Business Information
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="companyName"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Building2 className="h-4 w-4 text-blue-600" />
                                Company Name
                              </Label>
                              <Input
                                id="companyName"
                                type="text"
                                placeholder="Company name"
                                readOnly
                                disabled
                                className="bg-gray-50 border-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="countryOfInc"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Country of Incorporation{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="countryOfInc"
                                type="text"
                                value={
                                  countries.find(
                                    (c) => c.iso2 === selectedCountry
                                  )?.name || ""
                                }
                                readOnly
                                className="bg-gray-50 border-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="percentageOwnership"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4 text-blue-600" />
                                Ownership Percentage{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="percentageOwnership"
                                type="number"
                                placeholder="e.g., 25"
                                min="0"
                                max="100"
                                className="border-2 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="dateOfInc"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Calendar className="h-4 w-4 text-blue-600" />
                                Date of Incorporation
                              </Label>
                              <Input
                                id="dateOfInc"
                                type="date"
                                className="border-2 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label
                                htmlFor="affiliatedBusiness"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Shield className="h-4 w-4 text-blue-600" />
                                Affiliated Status
                              </Label>
                              <Select>
                                <SelectTrigger className="border-2 focus:border-blue-500">
                                  <SelectValue placeholder="Select affiliated status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_reported">
                                    Not Reported
                                  </SelectItem>
                                  <SelectItem value="live">Live</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Address Information Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <div className="bg-gray-100 p-4">
                          <div className="flex items-center gap-2 text-gray-950">
                            <MapPin className="h-5 w-5 text-gray-950" />
                            <h3 className="font-semibold text-gray-950">
                              Business Address
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-900">
                                Country
                              </Label>
                              <Input
                                id="addressCountry"
                                type="text"
                                placeholder="Country"
                                value={
                                  countries.find(
                                    (c) => c.iso2 === selectedCountry
                                  )?.name || ""
                                }
                                readOnly
                                className="bg-gray-50 border-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-900">
                                State/Province
                              </Label>
                              <Input
                                id="addressState"
                                type="text"
                                placeholder="State or Province"
                                className="border-2 focus:border-purple-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-900">
                                City
                              </Label>
                              <Input
                                id="addressCity"
                                type="text"
                                placeholder="City"
                                className="border-2 focus:border-purple-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-900">
                                Postal Code
                              </Label>
                              <Input
                                id="addressPostal"
                                type="text"
                                placeholder="Postal Code"
                                className="border-2 focus:border-purple-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-sm font-medium text-gray-900">
                                Street Address
                              </Label>
                              <Input
                                id="addressStreet"
                                type="text"
                                placeholder="Complete street address"
                                className="border-2 focus:border-purple-500 transition-colors"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>

                {/* Enhanced Footer */}
                <div className="border-t bg-white/90 backdrop-blur-sm p-6">
                  <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      Secure encrypted data transmission
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDetails(false)}
                        className="min-w-24"
                      >
                        Cancel
                      </Button>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className=" text-white min-w-32"
                          onClick={() => {
                            setShowDetails(false);
                            setShowSenderProfileSheet(true);
                          }}
                        >
                          Continue
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Sender Details Sheet */}
        {showSenderProfileSheet && (
          <Sheet
            open={showSenderProfileSheet}
            onOpenChange={setShowSenderProfileSheet}
          >
            <SheetContent
              side="right"
              className="w-full sm:max-w-full p-0 bg-gradient-to-br from-slate-50 to-slate-100"
            >
              <div className="flex flex-col h-full">
                {/* Enhanced Header */}
                <div className=" p-6 text-gray-950">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-6 w-6" />
                      <h2 className="text-2xl font-bold">
                        Sender Profile Details
                      </h2>
                    </div>
                    <p className="text-gray-500">
                      Complete personal profile information for compliance
                      verification
                    </p>
                  </motion.div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Personal Information Card */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <div className="bg-gray-100 p-4">
                          <div className="flex items-center gap-2 text-gray-900">
                            <User className="h-5 w-5" />
                            <h3 className="font-semibold">
                              Personal Information
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="firstName"
                                className="text-sm font-medium"
                              >
                                First Name *
                              </Label>
                              <Input
                                id="firstName"
                                type="text"
                                placeholder="Enter first name"
                                required
                                className="border-2 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="middleName"
                                className="text-sm font-medium"
                              >
                                Middle Name
                              </Label>
                              <Input
                                id="middleName"
                                type="text"
                                placeholder="Enter middle name"
                                className="border-2 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="lastName"
                                className="text-sm font-medium"
                              >
                                Last Name *
                              </Label>
                              <Input
                                id="lastName"
                                type="text"
                                placeholder="Enter last name"
                                required
                                className="border-2 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="birthDate"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Calendar className="h-4 w-4 text-blue-600" />
                                Date of Birth
                              </Label>
                              <Input
                                id="birthDate"
                                type="date"
                                className="border-2 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="position"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Building2 className="h-4 w-4 text-blue-600" />
                                Position *
                              </Label>
                              <Input
                                id="position"
                                type="text"
                                placeholder="e.g., CEO, Director"
                                required
                                className="border-2 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="birthCountry"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Birth Country
                              </Label>
                              <Select>
                                <SelectTrigger className="border-2 focus:border-blue-500">
                                  <SelectValue placeholder="Select birth country" />
                                </SelectTrigger>
                                <SelectContent>
                                  {countries.map((country) => (
                                    <SelectItem
                                      key={country.iso2}
                                      value={country.iso2}
                                    >
                                      <span className="inline-flex items-center gap-2">
                                        <img
                                          src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                          alt={`${country.name} flag`}
                                          className="w-4 h-4 rounded-sm"
                                        />
                                        <span>{country.name}</span>
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Business Role & Ownership Card */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <div className="bg-gray-100 p-4">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Shield className="h-5 w-5" />
                            <h3 className="font-semibold">
                              Business Role & Ownership
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="isUBO"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4 text-purple-600" />
                                Is Beneficial Owner?
                              </Label>
                              <Select>
                                <SelectTrigger className="border-2 focus:border-purple-500">
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="ownershipPercentage"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4 text-purple-600" />
                                Ownership Percentage *
                              </Label>
                              <Input
                                id="ownershipPercentage"
                                type="number"
                                placeholder="Enter percentage"
                                min="0"
                                max="100"
                                required
                                className="border-2 focus:border-purple-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="roles"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <User className="h-4 w-4 text-purple-600" />
                                Role
                              </Label>
                              <Select>
                                <SelectTrigger className="border-2 focus:border-purple-500">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="shareholder">
                                    Shareholder
                                  </SelectItem>
                                  <SelectItem value="legal_representative">
                                    Legal Representative
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="votingRightsPercentage"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Shield className="h-4 w-4 text-purple-600" />
                                Voting Rights %
                              </Label>
                              <Input
                                id="votingRightsPercentage"
                                type="number"
                                placeholder="Enter voting rights %"
                                min="0"
                                max="100"
                                className="border-2 focus:border-purple-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label
                                htmlFor="isBusinessContact"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Mail className="h-4 w-4 text-purple-600" />
                                Is Business Contact?
                              </Label>
                              <Select>
                                <SelectTrigger className="border-2 focus:border-purple-500">
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Contact & Address Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <div className="bg-gray-100 p-4">
                          <div className="flex items-center gap-2 text-gray-900">
                            <MapPin className="h-5 w-5" />
                            <h3 className="font-semibold">
                              Contact & Address Information
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="email"
                              className="text-sm font-medium flex items-center gap-2"
                            >
                              <Mail className="h-4 w-4 text-orange-600" />
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="personal@email.com"
                              className="border-2 focus:border-orange-500 transition-colors"
                            />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-orange-700">
                                Country
                              </Label>
                              <Select>
                                <SelectTrigger className="border-2 focus:border-orange-500">
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                  {countries.map((country) => (
                                    <SelectItem
                                      key={country.iso2}
                                      value={country.iso2}
                                    >
                                      <span className="inline-flex items-center gap-2">
                                        <img
                                          src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                          alt={`${country.name} flag`}
                                          className="w-4 h-4 rounded-sm"
                                        />
                                        <span>{country.name}</span>
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-orange-700">
                                State/Province
                              </Label>
                              <Input
                                id="addressState"
                                type="text"
                                placeholder="State or Province"
                                className="border-2 focus:border-orange-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-orange-700">
                                City
                              </Label>
                              <Input
                                id="addressCity"
                                type="text"
                                placeholder="City"
                                className="border-2 focus:border-orange-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-orange-700">
                                Postal Code
                              </Label>
                              <Input
                                id="addressPostal"
                                type="text"
                                placeholder="Postal Code"
                                className="border-2 focus:border-orange-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-sm font-medium text-orange-700">
                                Street Address
                              </Label>
                              <Input
                                id="addressStreet"
                                type="text"
                                placeholder="Complete street address"
                                className="border-2 focus:border-orange-500 transition-colors"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Tax & Identity Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <div className="bg-gray-100 p-4">
                          <div className="flex items-center gap-2 text-gray-900">
                            <FileText className="h-5 w-5" />
                            <h3 className="font-semibold">
                              Tax & Identity Information
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="taxId"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4 text-green-600" />
                                Tax Identification Number
                              </Label>
                              <Input
                                id="taxId"
                                type="text"
                                placeholder="Enter tax ID"
                                className="border-2 focus:border-green-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="ssn"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Shield className="h-4 w-4 text-green-600" />
                                Social Security Number
                              </Label>
                              <Input
                                id="ssn"
                                type="text"
                                placeholder="XXX-XX-XXXX"
                                className="border-2 focus:border-green-500 transition-colors"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>

                {/* Enhanced Footer */}
                <div className="border-t bg-white/90 backdrop-blur-sm p-6">
                  <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      All information is encrypted and secure
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowSenderProfileSheet(false)}
                        className="min-w-24"
                      >
                        Cancel
                      </Button>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className=" text-white min-w-40"
                          onClick={(): void => {
                            setShowSenderProfileSheet(false);
                            setKycSheet(true);
                          }}
                        >
                          Save Profile
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {kycSheet && (
          <Sheet open={kycSheet} onOpenChange={setKycSheet}>
            <SheetContent side="right" className="w-full sm:max-w-full p-0">
              <SheetHeader className="p-5">
                <SheetTitle>KYC Information</SheetTitle>
                <SheetDescription>
                  Please provide your KYC information.
                </SheetDescription>
              </SheetHeader>
              <div
                className="space-y-4 p-5 sm:px-72 overflow-y-auto"
                style={{ maxHeight: "80vh" }}
              >
                {/* KYC Fields */}
                {renderUploadField(
                  "cacCertOfIncoporation",
                  "CAC Certificate of Incorporation"
                )}
                {renderUploadField(
                  "memorandumArticlesOfAssociation",
                  "Memorandum & Articles of Association (Memart)"
                )}
                {renderUploadField("cacStatusReport", "CAC Status Report")}
                {renderUploadField(
                  "proofOfAddress",
                  "Proof of Address (Recent Utility Bill)"
                )}
              </div>
              <SheetFooter className="mt-6 flex flex-row items-center justify-between w-full p-5 absolute bottom-0 left-0 right-0 border-t border-gray-200">
                <Button variant="outline" onClick={() => setKycSheet(false)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={(): void => {
                    setKycSheet(false);
                  }}
                >
                  Save KYC Information
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}

        {/* Sender Table */}
        {!loading && senders.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {senders.map((sender) => (
                      <tr
                        key={sender._id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {}}
                      >
                        <td className="py-4 px-6 text-sm text-gray-900 font-medium flex flex-row items-center gap-2">
                          {sender.businessName}
                          {sender.archived && (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info
                                    size={16}
                                    className="text-orange-600 hover:text-orange-900"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  This Sender has been Archived
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              sender.status.toLowerCase() === "successful"
                                ? "bg-green-100 text-green-800"
                                : sender.status.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {sender.status.charAt(0).toUpperCase() +
                              sender.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(sender.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <Popover
                            open={popOpen}
                            onOpenChange={() => setPopOpen(!popOpen)}
                          >
                            <PopoverTrigger asChild>
                              <Button variant="ghost" aria-expanded={popOpen}>
                                <MoreHorizontal size={16} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandList>
                                  <CommandGroup>
                                    <CommandItem
                                      className="justify-start"
                                      onSelect={() => {
                                        /* View action */
                                      }}
                                    >
                                      <ExpandIcon size={18} />
                                      View Details
                                    </CommandItem>
                                    <CommandItem
                                      className="justify-start"
                                      onSelect={() => {
                                        window.location.href = `/dashboard/${wallet}/teams`;
                                      }}
                                    >
                                      <ArrowUpRight size={18} />
                                      Teams
                                    </CommandItem>
                                  </CommandGroup>
                                  <DropdownMenuSeparator />
                                  <CommandGroup>
                                    <CommandItem
                                      disabled={archiveLoading}
                                      onSelect={() =>
                                        openConfirm("archive", sender._id)
                                      }
                                    >
                                      {archiveLoading && (
                                        <Loader2
                                          className="animate-spin ml-2"
                                          size={16}
                                        />
                                      )}
                                      {!archiveLoading && <Archive size={18} />}
                                      Archive
                                    </CommandItem>
                                    <CommandItem
                                      disabled={deleteLoading}
                                      className="justify-start text-red-700"
                                      onSelect={() =>
                                        openConfirm("delete", sender._id)
                                      }
                                    >
                                      {deleteLoading ? (
                                        <Loader2
                                          className="animate-spin ml-2"
                                          size={16}
                                        />
                                      ) : (
                                        <Trash2 size={18} />
                                      )}
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
                  Showing {pagination.page} to {pagination.total} of{" "}
                  {pagination.totalPages} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(prev.page - 1, 1),
                      }))
                    }
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
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.page + 1, prev.totalPages),
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shared Confirm Dialog (single instance) */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmType === "delete"
                  ? "Confirm Delete"
                  : "Confirm Archive"}
              </DialogTitle>
              <DialogDescription>
                {confirmType === "delete"
                  ? "Are you sure you want to permanently delete this sender? This action cannot be undone."
                  : "Are you sure you want to archive this sender? You can restore archived senders later."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={confirmLoading}
              >
                Cancel
              </Button>
              <Button
                className="text-white flex items-center gap-2"
                onClick={handleConfirm}
                disabled={confirmLoading}
              >
                {confirmLoading && (
                  <Loader2 className="animate-spin" size={16} />
                )}
                {confirmType === "delete" ? "Delete" : "Archive"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
