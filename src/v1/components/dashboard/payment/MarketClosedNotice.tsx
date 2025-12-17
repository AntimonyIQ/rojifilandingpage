import { AlertCircle } from "lucide-react";

interface MarketClosedNoticeProps {
    currency: string;
}

export const MarketClosedNotice = ({ currency }: MarketClosedNoticeProps) => {
    return (
        <div className="w-full bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Market Currently Closed
                        </h3>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                        The <span className="font-bold text-orange-700">{currency}</span> exchange market is currently closed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MarketClosedNotice;
