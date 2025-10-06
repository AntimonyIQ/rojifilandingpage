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
    // onClose,
    title = "Create New Payment",
    children
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 min-h-[500px] max-h-[98vh] overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {/**
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                     */}
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(98vh-80px)]">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};