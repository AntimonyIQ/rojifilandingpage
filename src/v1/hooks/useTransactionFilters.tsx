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

export function useTransactionFilters(): UseTransactionFiltersReturn {
    const [searchParams, setSearchParams] = useSearchParams();
    const [location] = useLocation();
    const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);

    // Parse URL parameters on mount and when URL changes
    useEffect(() => {
        const urlFilters: Partial<TransactionFilters> = {};

        // Parse status
        const statusParam = searchParams.get("status");
        if (statusParam && Object.values(TransactionStatus).includes(statusParam as TransactionStatus)) {
            urlFilters.status = statusParam as TransactionStatus;
        }

        // Parse currency
        const currencyParam = searchParams.get("currency");
        if (currencyParam) {
            urlFilters.currency = currencyParam;
        }

        // Parse owner
        const ownerParam = searchParams.get("owner");
        if (ownerParam) {
            urlFilters.owner = ownerParam;
        }

        // Parse search
        const searchParam = searchParams.get("search");
        if (searchParam) {
            urlFilters.search = searchParam;
        }

        // Parse dates
        const startDateParam = searchParams.get("startDate");
        if (startDateParam) {
            urlFilters.startDate = new Date(startDateParam);
        }

        const endDateParam = searchParams.get("endDate");
        if (endDateParam) {
            urlFilters.endDate = new Date(endDateParam);
        }

        // Parse pagination
        const pageParam = searchParams.get("page");
        if (pageParam) {
            urlFilters.page = parseInt(pageParam, 10) || 1;
        }

        const limitParam = searchParams.get("limit");
        if (limitParam) {
            urlFilters.limit = parseInt(limitParam, 10) || 10;
        }

        // Update filters with URL parameters
        setFilters(prev => ({ ...prev, ...urlFilters }));
    }, [searchParams]);

    // Update URL when filters change
    const updateUrl = useCallback((newFilters: Partial<TransactionFilters>) => {
        const params = new URLSearchParams();

        // Only add non-default values to URL
        if (newFilters.status && newFilters.status !== defaultFilters.status) {
            params.set("status", newFilters.status);
        }

        if (newFilters.currency && newFilters.currency !== defaultFilters.currency) {
            params.set("currency", newFilters.currency);
        }

        if (newFilters.owner && newFilters.owner !== defaultFilters.owner) {
            params.set("owner", newFilters.owner);
        }

        if (newFilters.search && newFilters.search !== defaultFilters.search) {
            params.set("search", newFilters.search);
        }

        if (newFilters.startDate) {
            params.set("startDate", newFilters.startDate.toISOString().split('T')[0]);
        }

        if (newFilters.endDate) {
            params.set("endDate", newFilters.endDate.toISOString().split('T')[0]);
        }

        if (newFilters.page && newFilters.page !== defaultFilters.page) {
            params.set("page", newFilters.page.toString());
        }

        if (newFilters.limit && newFilters.limit !== defaultFilters.limit) {
            params.set("limit", newFilters.limit.toString());
        }

        // Update URL without causing navigation
        const newUrl = params.toString() ? `${location}?${params.toString()}` : location;
        setSearchParams(params);
    }, [location, setSearchParams]);

    const updateFilter = useCallback((key: keyof TransactionFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        updateUrl(newFilters);
    }, [filters, updateUrl]);

    const updateMultipleFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        updateUrl(updatedFilters);
    }, [filters, updateUrl]);

    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
        setSearchParams(new URLSearchParams());
    }, [setSearchParams]);

    const getFilteredUrl = useCallback((customFilters: Partial<TransactionFilters>) => {
        const params = new URLSearchParams();
        const allFilters = { ...filters, ...customFilters };

        if (allFilters.status && allFilters.status !== defaultFilters.status) {
            params.set("status", allFilters.status);
        }
        if (allFilters.currency && allFilters.currency !== defaultFilters.currency) {
            params.set("currency", allFilters.currency);
        }
        if (allFilters.owner && allFilters.owner !== defaultFilters.owner) {
            params.set("owner", allFilters.owner);
        }
        if (allFilters.search && allFilters.search !== defaultFilters.search) {
            params.set("search", allFilters.search);
        }
        if (allFilters.startDate) {
            params.set("startDate", allFilters.startDate.toISOString().split('T')[0]);
        }
        if (allFilters.endDate) {
            params.set("endDate", allFilters.endDate.toISOString().split('T')[0]);
        }
        if (allFilters.page && allFilters.page !== defaultFilters.page) {
            params.set("page", allFilters.page.toString());
        }
        if (allFilters.limit && allFilters.limit !== defaultFilters.limit) {
            params.set("limit", allFilters.limit.toString());
        }

        return params.toString() ? `${location}?${params.toString()}` : location;
    }, [filters, location]);

    return {
        filters,
        updateFilter,
        updateMultipleFilters,
        resetFilters,
        getFilteredUrl,
    };
}
