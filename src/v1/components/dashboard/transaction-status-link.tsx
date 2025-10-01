import React from "react";
import { Link } from "wouter";
import { TransactionStatus } from "@/v1/enums/enums";
import { useParams } from "wouter";

interface TransactionStatusLinkProps {
    status: TransactionStatus;
    children: React.ReactNode;
    className?: string;
    count?: number;
}

export const TransactionStatusLink: React.FC<TransactionStatusLinkProps> = ({
    status,
    children,
    className = "",
    count,
}) => {
    const { wallet } = useParams();

    const getStatusUrl = (status: TransactionStatus) => {
        return `/dashboard/${wallet}/transactions?status=${status}`;
    };

    return (
        <Link
            href={getStatusUrl(status)}
            className={className}
        >
            {children}
            {count !== undefined && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {count}
                </span>
            )}
        </Link>
    );
};

// Convenience components for common status links
export const CompletedTransactionsLink: React.FC<{ children: React.ReactNode; className?: string; count?: number }> = ({ children, className, count }) => (
    <TransactionStatusLink status={TransactionStatus.SUCCESSFUL} className={className} count={count}>
        {children}
    </TransactionStatusLink>
);

export const FailedTransactionsLink: React.FC<{ children: React.ReactNode; className?: string; count?: number }> = ({ children, className, count }) => (
    <TransactionStatusLink status={TransactionStatus.FAILED} className={className} count={count}>
        {children}
    </TransactionStatusLink>
);

export const ProcessingTransactionsLink: React.FC<{ children: React.ReactNode; className?: string; count?: number }> = ({ children, className, count }) => (
    <TransactionStatusLink status={TransactionStatus.PROCESSING} className={className} count={count}>
        {children}
    </TransactionStatusLink>
);
