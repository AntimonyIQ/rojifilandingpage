import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, CheckCircle, AlertCircle, CheckIcon, ChevronDown } from "lucide-react";
import { IDirectorAndShareholder } from "@/v1/interface/interface";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/v1/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/v1/components/ui/popover"
import { cn } from "@/v1/lib/utils";
import { session, SessionData } from "@/v1/session/session";


const BVNVerification: React.FC<{}> = ({ }) => {
    const [bvn, setBvn] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [directors, setDirectors] = useState<Array<IDirectorAndShareholder>>([]);
    const [selectedDirector, setSelectedDirector] = useState<IDirectorAndShareholder | null>(null);
    const [open, setOpen] = useState<boolean>(false);
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd && sd.sender) {
            setDirectors(sd.sender.directors || []);
        }
    }, []);

    // Validation functions
    const validateBVN = (value: string): boolean => {
        return /^\d{11}$/.test(value);
    };

    const isFormValid = (): boolean => {
        return validateBVN(bvn);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            // Call your API to verify BVN, NIN, and TIN for Naira wallet activation
            // Example: await verifyIdentity({ bvn, nin, tin });

        } catch (err: any) {
            setError(err.message || 'An error occurred during verification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6">
            <Card className="shadow-lg border-0">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <img src="https://flagcdn.com/w320/ng.png" alt="" className="w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Naira Wallet Activation
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                        Provide select director and provide their BVN to activate your Naira wallet.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Success Message */}
                    {success && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 font-medium">
                                Verification successful! Your Naira wallet has been activated and is ready for use.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-start justify-center gap-4">
                            <div className="w-full space-y-2">
                                <Label htmlFor="bankName">
                                    Select Director
                                    <span className="text-red-600"> *</span>
                                </Label>
                                <p className="text-xs text-gray-500">Notice: The selected director will be used to setup the Naira account.</p>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between mt-1"
                                        >
                                            {selectedDirector
                                                ? selectedDirector.firstName + " " + selectedDirector.lastName
                                                : "Select a director..."
                                            }
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search banks..." />
                                            <CommandList>
                                                <CommandEmpty>No director found.</CommandEmpty>
                                                <CommandGroup>
                                                    {directors.map((director) => (
                                                        <CommandItem
                                                            key={director._id}
                                                            value={director._id}
                                                            onSelect={(currentValue) => {
                                                                const selectedDirector = directors.find(d => d._id === currentValue);
                                                                if (selectedDirector) {
                                                                    selectedDirector && setSelectedDirector(selectedDirector);
                                                                }
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <CheckIcon
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedDirector?._id === director._id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex items-center">
                                                                {director.firstName} {director.lastName}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* BVN Input */}
                            <div className="space-y-2 w-full">
                                <Label htmlFor="bvn" className="text-sm font-medium text-gray-700">
                                    Director BVN <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    id="bvn"
                                    value={bvn}
                                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    placeholder=""
                                    className={`h-12 text-left text-lg tracking-wider ${bvn && !validateBVN(bvn) ? 'border-red-500 focus:border-red-500' : ''
                                        }`}
                                    maxLength={11}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !isFormValid()}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying Details...
                                </>
                            ) : (
                                <>
                                    Activate Naira Wallet
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Additional Information */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="text-center space-y-2">
                            <p className="text-xs text-gray-500">
                                Need help? <a href="mailto:support@rojifi.com" className="text-blue-600 hover:text-blue-800 underline">Contact our support team</a> for assistance
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card> 
        </div>
    );
}

export default BVNVerification;