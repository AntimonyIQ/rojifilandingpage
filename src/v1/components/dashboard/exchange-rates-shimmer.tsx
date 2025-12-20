export function ExchangeRatesShimmer() {
    return (
        <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center -space-x-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse border-2 border-white" />
                            <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse border-2 border-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                    </div>
                </div>
            ))}
        </div>
    );
}
