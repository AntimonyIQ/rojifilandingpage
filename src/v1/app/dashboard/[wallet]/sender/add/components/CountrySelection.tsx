import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Button } from "@/v1/components/ui/button";
import { CheckCircle, XCircle, ArrowUpRight, ArrowLeft, ChevronsUpDownIcon, CheckIcon } from "lucide-react";
import countries from "../../../../../../data/country_state.json";
import { Popover, PopoverContent, PopoverTrigger } from '@/v1/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/v1/components/ui/command';
import { cn } from '@/v1/lib/utils';

interface CountrySelectionProps {
    selectedCountry: string;
    onCountrySelect: (countryCode: string) => void;
    onBack: () => void;
    onContinue: () => void;
}

export const CountrySelection: React.FC<CountrySelectionProps> = ({
    selectedCountry,
    onCountrySelect,
    onBack,
    onContinue
}) => {
    const [countryPopover, setCountryPopover] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Select Country</h2>
                        <p className="text-lg text-gray-600">Choose the sender's country of incorporation to continue onboarding.</p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-4">
                                    Country of Incorporation <span className="text-red-500">*</span>
                                </label>
                                <Popover open={countryPopover} onOpenChange={() => setCountryPopover(!countryPopover)}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            size="lg"
                                            aria-expanded={countryPopover}
                                            className="w-full justify-between h-16 text-lg border-2 hover:border-primary focus:border-primary"
                                        >
                                            <div className="flex flex-row items-center gap-3">
                                                {selectedCountry &&
                                                    <img
                                                        src={`https://flagcdn.com/w320/${countries.find((country) => country.name === selectedCountry)?.iso2.toLowerCase()}.png`}
                                                        alt=""
                                                        width={30}
                                                        height={30}
                                                        className="rounded"
                                                    />
                                                }
                                                <span className={selectedCountry ? "text-gray-900" : "text-gray-500"}>
                                                    {selectedCountry
                                                        ? countries.find((country) => country.name === selectedCountry)?.name
                                                        : "Select country of incorporation..."}
                                                </span>
                                            </div>
                                            <ChevronsUpDownIcon className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[400px]">
                                        <Command>
                                            <CommandInput placeholder="Search country..." className="h-12 text-base" />
                                            <CommandList>
                                                <CommandEmpty>No country found.</CommandEmpty>
                                                <CommandGroup>
                                                    {countries.map((country, index) => (
                                                        <CommandItem
                                                            key={`${country.name}-${index}`}
                                                            value={country.name}
                                                            onSelect={(currentValue) => {
                                                                onCountrySelect(currentValue)
                                                                setCountryPopover(false)
                                                            }}
                                                            className="flex items-center gap-3 p-3 text-base cursor-pointer"
                                                        >
                                                            <CheckIcon
                                                                className={cn(
                                                                    "h-5 w-5",
                                                                    selectedCountry === country.name ? "opacity-100 text-primary" : "opacity-0"
                                                                )}
                                                            />
                                                            <img
                                                                src={`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`}
                                                                alt=""
                                                                width={30}
                                                                height={30}
                                                                className="rounded"
                                                            />
                                                            <span>{country.name}</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {selectedCountry == 'Nigeria' ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-green-800 font-medium">
                                            Selected: {countries.find((country) => country.name === selectedCountry)?.name}
                                        </span>
                                    </div>
                                </motion.div>
                            ):
                            (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <span className="text-red-800 font-medium">
                                           Country not available yet
                                        </span>
                                    </div>
                                </motion.div>
                            )
                            
                            }
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-12">
                        <Button variant="outline" onClick={onBack} size="lg" className="h-12 px-6 text-base">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Senders
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base"
                            disabled={!selectedCountry}
                            onClick={onContinue}
                            size="lg"
                        >
                            Continue
                            <ArrowUpRight className="h-5 w-5 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};