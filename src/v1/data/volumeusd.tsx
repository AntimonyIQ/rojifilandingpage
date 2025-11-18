
export type EstimatedMonthlyVolumeUsd =
    | "Usd500kTo1m"
    | "Usd1mTo5m"
    | "Usd5mTo10m"
    | "Usd10mTo20m"
    | "Usd20mTo50m"
    | "Usd50mPlus";

export interface IEstimatedMonthlyVolumeUsd {
    value: EstimatedMonthlyVolumeUsd;
    label: string;
}

const EstimatedMonthlyVolumeUsdOptions: IEstimatedMonthlyVolumeUsd[] = [
    { value: "Usd500kTo1m", label: "USD 500,000 to 1 million" },
    { value: "Usd1mTo5m", label: "USD 1 million to 5 million" },
    { value: "Usd5mTo10m", label: "USD 5 million to 10 million" },
    { value: "Usd10mTo20m", label: "USD 10 million to 20 million" },
    { value: "Usd20mTo50m", label: "USD 20 million to 50 million" },
    { value: "Usd50mPlus", label: "USD 50 million plus" },
];

export default EstimatedMonthlyVolumeUsdOptions;