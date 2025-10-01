import { TransactionsView } from "@/v1/components/dashboard/transactions-view"
import { useTransactionFilters } from "@/v1/hooks/useTransactionFilters"

export default function TransactionsPage() {
    // Initialize URL-based filtering
    const { filters } = useTransactionFilters();

    return <TransactionsView initialFilters={filters} />
}
