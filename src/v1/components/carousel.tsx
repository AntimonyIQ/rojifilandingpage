import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ICarouselData {
    id: number;
    title: string;
    desc: string;
}

const carouselItems: ICarouselData[] = [
    {
        id: 1,
        title: "Global Transactions Made Simple for Local Businesses",
        desc: "Effortlessly send and receive global payments to your business partners in more than 200+ currencies.",
    },
    {
        id: 2,
        title: "Empower your business with instant, unrestricted FX payments",
        desc: "Transform your payment process with lightning-fast transactions and infinite FX liquidity, empowering you to settle with partners worldwide without boundaries.",
    },
    {
        id: 3,
        title: "Secure & Fast",
        desc: "Experience lightning-fast transactions with military-grade encryption.",
    },
];

interface CarouselProps {
    data: ICarouselData[];
    interval?: number; // in milliseconds
}

interface CarouselState {
    current: number;
}

export class Carousel extends React.Component<CarouselProps, CarouselState> {
    intervalRef: NodeJS.Timeout | null = null;

    constructor(props: CarouselProps) {
        super(props);
        this.state = {
            current: 0,
        };
    }

    componentDidMount(): void {
        this.startAutoPlay();
    }

    componentWillUnmount(): void {
        this.stopAutoPlay();
    }

    startAutoPlay(): void {
        const { interval = 10000 } = this.props;
        this.intervalRef = setInterval(() => {
            this.setState((prev) => ({
                current: (prev.current + 1) % this.props.data.length,
            }));
        }, interval);
    }

    stopAutoPlay(): void {
        if (this.intervalRef) clearInterval(this.intervalRef);
    }

    render(): React.ReactNode {
        const { data } = this.props;
        const { current } = this.state;

        return (
            <div className="w-full max-w-xl px-4 py-6">
                {/* Indicators */}
                <div className="flex space-x-2 mb-6">
                    {data.map((_, index) => (
                        <div
                            key={index}
                            className="w-24 h-2 rounded-full bg-gray-300 overflow-hidden relative"
                        >
                            {index === current && (
                                <motion.div
                                    className="h-full bg-white absolute top-0 left-0"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Slide Content */}
                <div className="overflow-hidden min-h-[140px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={data[current].id}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-2"
                        >
                            <h2 className="text-4xl font-bold text-white">
                                {data[current].title}
                            </h2>
                            <p className="text-lg !text-white">
                                {data[current].desc}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        );
    }
}

export { carouselItems };
