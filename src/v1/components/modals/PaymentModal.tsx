import React from 'react';
import { motion } from 'framer-motion';
// import { X } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    children: React.ReactNode;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    title = "Create New Payment",
    children
}) => {
    if (!isOpen) return null;

    /*
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose?.();
        }
    };
    */

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            // onClick={handleBackdropClick}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 min-h-[500px] max-h-[98vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(98vh-80px)]">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};