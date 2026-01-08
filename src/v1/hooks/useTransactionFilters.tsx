import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation } from "wouter";
import { TransactionStatus } from "@/v1/enums/enums";

interface TransactionFilters {
    status: TransactionStatus;
    currency: string;
    owner: string;
    search: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
}

interface UseTransactionFiltersReturn {
    filters: TransactionFilters;
    updateFilter: (key: keyof TransactionFilters, value: any) => void;
    updateMultipleFilters: (newFilters: Partial<TransactionFilters>) => void;
    resetFilters: () => void;
    getFilteredUrl: (filters: Partial<TransactionFilters>) => string;
}

const defaultFilters: TransactionFilters = {
    status: TransactionStatus.SUCCESSFUL,
    currency: "All",
    owner: "Everyone",
    search: "",
    page: 1,
    limit: 10,
};

// HELPER: Format date to YYYY-MM-DD using Local Time (prevents off-by-one day errors)
const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export function useTransactionFilters(): UseTransactionFiltersReturn {
    const [searchParams, setSearchParams] = useSearchParams();
    const [location] = useLocation();
    const [filters, setFilters] = useState<TransactionFilters>(() => {
        const params = new URLSearchParams(window.location.search);

        return {
            status: Object.values(TransactionStatus).includes(
                params.get("status") as TransactionStatus
            )
                ? (params.get("status") as TransactionStatus)
                : defaultFilters.status,

            currency:
                params.get("currency") ||
                params.get("wallet") ||
                defaultFilters.currency,
            owner: params.get("owner") || defaultFilters.owner,
            search: params.get("search") || defaultFilters.search,

            startDate: params.get("startDate")
                ? new Date(params.get("startDate")!)
                : undefined,
            endDate: params.get("endDate")
                ? new Date(params.get("endDate")!)
                : undefined,

            page: Number(params.get("page")) || defaultFilters.page,
            limit: Number(params.get("limit")) || defaultFilters.limit,
        };
    });

    // 2. BACK BUTTON SUPPORT
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const statusParam = params.get("status");

        if (statusParam && statusParam !== filters.status) {
            setFilters((prev) => ({
                ...prev,
                status: statusParam as TransactionStatus,
            }));
        }
    }, [searchParams]);

    // 3. Update URL logic
    const updateUrl = useCallback(
        (newFilters: Partial<TransactionFilters>) => {
            const params = new URLSearchParams(window.location.search); // Start with current params

            const setOrDelete = (key: string, value: any, defaultValue: any) => {
                if (value && value !== defaultValue) {
                    params.set(key, value.toString());
                } else {
                    params.delete(key);
                }
            };

            setOrDelete("status", newFilters.status, defaultFilters.status);
            setOrDelete("currency", newFilters.currency, defaultFilters.currency);
            setOrDelete("owner", newFilters.owner, defaultFilters.owner);
            setOrDelete("search", newFilters.search, defaultFilters.search);
            setOrDelete("page", newFilters.page, defaultFilters.page);
            setOrDelete("limit", newFilters.limit, defaultFilters.limit);

            if (newFilters.startDate) {
                params.set("startDate", formatLocalDate(newFilters.startDate));
            } else {
                params.delete("startDate");
            }

            if (newFilters.endDate) {
                params.set("endDate", formatLocalDate(newFilters.endDate));
            } else {
                params.delete("endDate");
            }

            setSearchParams(params);
        },
        [setSearchParams]
    );

    const updateFilter = useCallback(
        (key: keyof TransactionFilters, value: any) => {
            const newFilters = { ...filters, [key]: value };
            setFilters(newFilters);
            updateUrl(newFilters);
        },
        [filters, updateUrl]
    );

    const updateMultipleFilters = useCallback(
        (newFilters: Partial<TransactionFilters>) => {
            const updatedFilters = { ...filters, ...newFilters };
            setFilters(updatedFilters);
            updateUrl(updatedFilters);
        },
        [filters, updateUrl]
    );

    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
        setSearchParams(new URLSearchParams());
    }, [setSearchParams]);

    const getFilteredUrl = useCallback(
        (customFilters: Partial<TransactionFilters>) => {
            const params = new URLSearchParams();
            const allFilters = { ...filters, ...customFilters };

            // Re-use logic or manually set (Manually setting here for clarity/separation)
            if (allFilters.status && allFilters.status !== defaultFilters.status)
                params.set("status", allFilters.status);

            if (
                allFilters.currency &&
                allFilters.currency !== defaultFilters.currency
            )
                params.set("currency", allFilters.currency);

            if (allFilters.owner && allFilters.owner !== defaultFilters.owner)
                params.set("owner", allFilters.owner);

            if (allFilters.search && allFilters.search !== defaultFilters.search)
                params.set("search", allFilters.search);

            if (allFilters.startDate)
                params.set("startDate", formatLocalDate(allFilters.startDate));

            if (allFilters.endDate)
                params.set("endDate", formatLocalDate(allFilters.endDate));

            if (allFilters.page && allFilters.page !== defaultFilters.page)
                params.set("page", allFilters.page.toString());

            if (allFilters.limit && allFilters.limit !== defaultFilters.limit)
                params.set("limit", allFilters.limit.toString());

            return params.toString() ? `${location}?${params.toString()}` : location;
        },
        [filters, location]
    );

    return {
        filters,
        updateFilter,
        updateMultipleFilters,
        resetFilters,
        getFilteredUrl,
    };
}
