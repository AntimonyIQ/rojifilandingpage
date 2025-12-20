import { useState, useEffect } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Repeat, Search, Trash, Trash2Icon, TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/v1/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { IPagination, IResponse, ITransaction } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
import Defaults from "@/v1/defaults/defaults";
import { Status } from "@/v1/enums/enums";
import PayAgainModal from "./pay-again-modal";

export function BeneficiaryView() {
  const [loading, setLoading] = useState<boolean>(false);
  const [beneficiaries, setBeneficiaries] = useState<Array<ITransaction>>([]);
  const [pagination, setPagination] = useState<IPagination>({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 100,
  });

  const [selectedTransaction, setSelectedTransaction] =
    useState<ITransaction | null>(null);
  const [search, setSearch] = useState("");
  const [payAgainOpen, setPayAgainOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const storage: SessionData = session.getUserData();

  useEffect(() => {
    setBeneficiaries(storage.beneficiaries || []);
    fetchBeneficiaries();
  }, [pagination.page, search]);

  const fetchBeneficiaries = async () => {
    try {
      if (beneficiaries.length === 0) setLoading(true);
      if (!storage.sender) throw new Error("Unknown Error");

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        includePagination: "true",
      });

      // Add filters
      params.append("search", search);
      params.append("primarySender", storage.sender._id);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const url: string = `${
        Defaults.API_BASE_URL
      }/transaction/beneficiary/?${params.toString()}`;

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
        if (!data.handshake)
          throw new Error(
            "Unable to process transaction response right now, please try again."
          );
        const parseData: Array<ITransaction> = Defaults.PARSE_DATA(
          data.data,
          storage.client.privateKey,
          data.handshake
        );

        setBeneficiaries(parseData);
        session.updateSession({ ...storage, beneficiaries: parseData });

        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayAgainSubmit = async (_data: any) => {
    try {
      // TODO: call API to pay again via walletService when available
      toast.success("Payment initiated successfully");
    } catch (err) {
      console.error("Error initiating payment:", err);
      toast.error("Failed to initiate payment");
    } finally {
      setPayAgainOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Beneficiary</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your beneficiaries history across all
            beneficiaries
          </p>
        </div>
      </div>

      {/* Beneficiaries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-900">
            All Beneficiaries
          </h2>
        </div>

        {/* Status Tabs and Currency Filter */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Status Tabs */}
          <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="py-4 flex flex-row items-center gap-2">
              <div className="relative">
                <Input
                  placeholder="Search Beneficiary"
                  className="w-full md:w-[300px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />
                <Search
                  size={20}
                  className="absolute right-2 top-2 text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center justify-end gap-4"></div>
        </div>

        {/* Beneficiary loading skeleton */}
        {loading && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Account Name
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Account number / IBAN
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Bank Name
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Country
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 animate-pulse"
                      >
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-28"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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

        {/* Beneficiaries Table */}
        {!loading && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Account Name
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Account number / IBAN
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Bank Name
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                        Country
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-20 text-center text-gray-500"
                        >
                          No beneficiaries found
                        </td>
                      </tr>
                    ) : (
                      beneficiaries.map((beneficiary) => (
                        <tr
                          key={beneficiary._id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedTransaction(beneficiary);
                            setViewDetailsOpen(true);
                          }}
                        >
                          <td
                            className="py-4 px-6 text-sm text-gray-900 font-medium whitespace-nowrap max-w-xs truncate"
                            title={beneficiary.beneficiaryAccountName}
                          >
                            {beneficiary.beneficiaryAccountName}
                          </td>
                          <td
                            className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap max-w-xs truncate"
                            title={beneficiary.beneficiaryAccountNumber}
                          >
                            {beneficiary.beneficiaryAccountNumber}
                          </td>
                          <td
                            className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap max-w-xs truncate"
                            title={beneficiary.beneficiaryBankName}
                          >
                            {beneficiary.beneficiaryBankName}
                          </td>
                          <td
                            className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap max-w-xs truncate"
                            title={beneficiary.beneficiaryCountry}
                          >
                            {beneficiary.beneficiaryCountry}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {beneficiaries.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} entries
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
              )}
            </CardContent>
          </Card>
        )}

        {/* View Details dialog */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Beneficiary Details
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Account Name
                </div>
                <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {selectedTransaction?.beneficiaryAccountName ?? "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Account Number / IBAN
                </div>
                <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {selectedTransaction?.beneficiaryAccountNumber ?? "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Beneficiary Address
                </div>
                <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-lg capitalize">
                  {selectedTransaction?.beneficiaryAddress
                    ? `${selectedTransaction?.beneficiaryAddress}, ${selectedTransaction.beneficiaryCity}, ${selectedTransaction.beneficiaryCountry}`
                    : "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Bank Name
                </div>
                <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {selectedTransaction?.beneficiaryBankName ?? "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Country
                </div>
                <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {selectedTransaction?.beneficiaryCountry ?? "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Swift/Sort Code
                </div>
                <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {selectedTransaction?.swiftCode ?? "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Amount
                </div>
                <div className="text-lg font-medium text-green-600 p-3 bg-green-50 rounded-lg">
                  $
                  {Number(
                    selectedTransaction?.beneficiaryAmount ||
                      selectedTransaction?.amount ||
                      0
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
            <div className=" flex items-center justify-between">
              <Button variant="outline" className="px-6 text-white bg-red-500">
                <Trash2Icon />
                <p>Remove</p>
              </Button>
              <DialogFooter className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setViewDetailsOpen(false)}
                  className="px-6"
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  className="text-white px-6"
                  disabled={storage.user.payoutEnabled === false ? true : false}
                  onClick={() => {
                    setViewDetailsOpen(false);
                    setPayAgainOpen(true);
                  }}
                >
                  <Repeat size={18} className="mr-2" />
                  Pay Again
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <PayAgainModal
        open={payAgainOpen}
        onClose={() => setPayAgainOpen(false)}
        transaction={beneficiaries[0]}
        onSubmit={handlePayAgainSubmit}
        action="pay-again"
      />
    </div>
  );
}
