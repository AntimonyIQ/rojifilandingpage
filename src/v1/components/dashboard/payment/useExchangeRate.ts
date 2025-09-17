import { useState, useEffect, useCallback } from 'react';

interface ExchangeRateData {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    lastUpdated: Date;
    walletBalance: number;
    loading: boolean;
}

interface UseExchangeRateProps {
    fromCurrency: string;
    toCurrency: string;
    walletBalance: number;
    apiBaseUrl: string;
    authData: {
        publicKey: string;
        deviceId: string;
        authorization: string;
        privateKey: string;
    };
    enabled: boolean;
}

export const useExchangeRate = ({
    fromCurrency,
    toCurrency,
    walletBalance,
    apiBaseUrl,
    authData,
    enabled
}: UseExchangeRateProps): ExchangeRateData => {
    const [exchangeData, setExchangeData] = useState<ExchangeRateData>({
        fromCurrency,
        toCurrency,
        rate: 0,
        lastUpdated: new Date(),
        walletBalance,
        loading: false,
    });

    const fetchExchangeRate = useCallback(async () => {
        if (!enabled || !authData.publicKey) return;

        try {
            setExchangeData(prev => ({ ...prev, loading: true }));

            const response = await fetch(`${apiBaseUrl}/provider/rate/${fromCurrency}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-rojifi-handshake': authData.publicKey,
                    'x-rojifi-deviceid': authData.deviceId,
                    Authorization: `Bearer ${authData.authorization}`,
                },
            });

            const data = await response.json();

            if (data.status === 'SUCCESS' && data.handshake) {
                // Parse the data using your existing parsing logic
                // For now, I'm assuming a simple structure - you may need to adjust based on your actual API response
                const rates = data.data; // You might need to decrypt this with your PARSE_DATA function

                // Find the rate for the target currency
                const targetRate = rates.find((rate: any) => rate.to === toCurrency);

                if (targetRate) {
                    setExchangeData(prev => ({
                        ...prev,
                        rate: targetRate.rate,
                        lastUpdated: new Date(),
                        walletBalance,
                        loading: false,
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch exchange rate:', error);
            setExchangeData(prev => ({ ...prev, loading: false }));
        }
    }, [fromCurrency, toCurrency, walletBalance, apiBaseUrl, authData, enabled]);

    // Initial fetch
    useEffect(() => {
        if (enabled) {
            fetchExchangeRate();
        }
    }, [fetchExchangeRate, enabled]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        if (!enabled) return;

        const interval = setInterval(() => {
            fetchExchangeRate();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [fetchExchangeRate, enabled]);

    // Update wallet balance when it changes
    useEffect(() => {
        setExchangeData(prev => ({ ...prev, walletBalance }));
    }, [walletBalance]);

    return exchangeData;
};