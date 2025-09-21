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
    });

    const sd: SessionData = session.getUserData();

    const fetchExchangeRate = useCallback(async () => {
        if (!enabled) return;

        try {
            setExchangeData(prev => ({ ...prev, loading: true }));

            const response = await fetch(`${apiBaseUrl}/provider/rate/USD`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceId,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });

            const data: IResponse = await response.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');
                const parseData: Array<ILiveExchnageRate> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                const targetRate = parseData.find((rate: any) => rate.to === toCurrency && rate.from === "USD");
                // console.log("Fetched exchange rates:", parseData, targetRate);
                if (targetRate) {
                    setExchangeData(prev => ({
                        ...prev,
                        rate: targetRate.rate,
                        lastUpdated: new Date(),
                        walletBalance,
                        loading: false,
                        toCurrency: targetRate.to
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch exchange rate:', error);
            setExchangeData(prev => ({ ...prev, loading: false }));
        }
    }, [fromCurrency, toCurrency, walletBalance]);

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