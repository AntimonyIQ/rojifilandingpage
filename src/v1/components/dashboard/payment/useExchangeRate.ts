import Defaults from '@/v1/defaults/defaults';
import { Status } from '@/v1/enums/enums';
import { IResponse } from '@/v1/interface/interface';
import { session, SessionData } from '@/v1/session/session';
import { useState, useEffect, useCallback } from 'react';

interface ExchangeRateData {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    lastUpdated: Date;
    walletBalance: number;
    loading: boolean;
    isLive: boolean;
}

interface UseExchangeRateProps {
    fromCurrency: string;
    toCurrency: string;
    walletBalance: number;
    apiBaseUrl: string;
    enabled: boolean;
}

export interface ILiveExchnageRate {
    from: string,
    to: string,
    rate: number,
    icon: string
}

export const useExchangeRate = ({
    fromCurrency,
    toCurrency,
    walletBalance,
    apiBaseUrl,
    enabled
}: UseExchangeRateProps): ExchangeRateData => {
    const [exchangeData, setExchangeData] = useState<ExchangeRateData>({
        fromCurrency,
        toCurrency,
        rate: 0,
        lastUpdated: new Date(),
        walletBalance,
        loading: false,
        isLive: false
    });

    const storage: SessionData = session.getUserData();

    useEffect(() => {
        if (storage.exchangeRate && Array.isArray(storage.exchangeRate) && storage.exchangeRate.length > 0 && storage.providerIsLive !== undefined) {
            const targetRate = storage.exchangeRate.find((rate: ILiveExchnageRate) =>
                rate.from === "USD" && rate.to === toCurrency
            );

            // console.log("Saved exchange rates:", storage.exchangeRate, targetRate);

            if (targetRate) {
                setExchangeData(prev => ({
                    ...prev,
                    rate: targetRate.rate,
                    lastUpdated: new Date(),
                    walletBalance,
                    loading: false,
                    toCurrency: toCurrency,
                    fromCurrency: fromCurrency,
                    isLive: storage.providerIsLive
                }));
            } else {
                setExchangeData(prev => ({
                    ...prev,
                    loading: false,
                    rate: 0
                }));
            }
        }
    }, []);

    const fetchExchangeRate = useCallback(async () => {
        if (!enabled || !toCurrency) return;

        try {
            setExchangeData(prev => ({ ...prev, loading: true }));

            const response = await fetch(`${apiBaseUrl}/provider/rate/USD`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': storage.client.publicKey,
                    'x-rojifi-deviceid': storage.deviceId,
                    Authorization: `Bearer ${storage.authorization}`,
                },
            });

            const data: IResponse = await response.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData: { sampledRates: Array<ILiveExchnageRate>, isLive: boolean } = Defaults.PARSE_DATA(data.data, storage.client.privateKey, data.handshake);

                // Look for rate where 'to' matches toCurrency (EUR or GBP) and 'from' is either USD or the target currency
                const targetRate = parseData.sampledRates.find((rate: ILiveExchnageRate) =>
                    rate.from === "USD" && rate.to === toCurrency
                );

                // console.log("Target Rates is: ", targetRate);
                // console.log("toCurrency is : ", toCurrency);

                if (targetRate) {
                    setExchangeData(prev => ({
                        ...prev,
                        rate: targetRate.rate,
                        lastUpdated: new Date(),
                        walletBalance,
                        loading: false,
                        toCurrency: toCurrency,
                        fromCurrency: fromCurrency,
                        isLive: parseData.isLive
                    }));
                } else {
                    // If target rate not found, still set loading to false
                    // console.warn(`No exchange rate found for ${toCurrency} to USD`);
                    setExchangeData(prev => ({
                        ...prev,
                        loading: false,
                        rate: 0,
                        isLive: parseData.isLive
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch exchange rate:', error);
            setExchangeData(prev => ({ ...prev, loading: false }));
        }
    }, [enabled, fromCurrency, toCurrency, walletBalance, apiBaseUrl]);

    // Initial fetch
    useEffect(() => {
        if (enabled) {
            fetchExchangeRate();
        }
    }, [fetchExchangeRate, enabled]);

    // Auto-refresh every 15 minutes (increased from 10 to reduce API calls)
    // Only refresh if the component is still mounted and enabled
    useEffect(() => {
        if (!enabled) return;

        const interval = setInterval(() => {
            fetchExchangeRate();
        }, 15 * 60 * 1000); // 15 minutes

        return () => clearInterval(interval);
    }, [fetchExchangeRate, enabled]);

    // Update wallet balance when it changes
    useEffect(() => {
        setExchangeData(prev => ({ ...prev, walletBalance }));
    }, [walletBalance]);

    return exchangeData;
};