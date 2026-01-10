import { Button } from "@/v1/components/ui/button"
import { Input } from "@/v1/components/ui/input"
import { motion } from "framer-motion"
import nigeriaFlag from "../../public/nigeria-flag.png"
import usaFlag from "../../public/usa-flag.png"
import { useState } from "react"
import { session, SessionData } from "@/v1/session/session"
import { toast } from "sonner"
import Defaults from "@/v1/defaults/defaults"
import { IResponse } from "@/v1/interface/interface"
import { Status } from "@/v1/enums/enums"

export function CardsHero() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const storage: SessionData = session.getUserData();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
        if (!isValidEmail(email)) {
            toast.error("Enter a valid email address.");
            return;
        }

        try {
            setIsSubmitting(true);

            const res = await fetch(`${Defaults.API_BASE_URL}/vcard/waitlist`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-rojifi-handshake": storage.client.publicKey,
                    "x-rojifi-deviceid": storage.deviceid,
                },
                body: JSON.stringify({
                    email: email,
                }),
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                setIsSuccess(true);
                toast.success("Successfully joined the waitlist!");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-blue-50 py-16 md:py-24">
            <div className="container">
                <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm text-primary mb-4">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-2 h-4 w-4"
                            >
                                <path
                                    d="M12 3H4C2.89543 3 2 3.89543 2 5V11C2 12.1046 2.89543 13 4 13H12C13.1046 13 14 12.1046 14 11V5C14 3.89543 13.1046 3 12 3Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M2 7H14"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M6 10H7"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Stay Tuned
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Empower Your Business with Virtual USD Cards
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground flex items-start gap-2">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mt-0.5 flex-shrink-0"
                            >
                                <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span>
                                Issue virtual USD cards, monitor expenses in real-time, and streamline your financial operations.
                            </span>
                        </p>
                        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Input
                                    type="email"
                                    placeholder="Enter email address"
                                    className="h-12 pl-10 pr-4 rounded-md"
                                    value={email}
                                    onChange={(e) => {
                                        // Remove all spaces and only allow email-valid characters
                                        const value = e.target.value;
                                        const cleanedValue = value.trim().replace(/\s/g, '');
                                        // Only allow email-valid characters: letters, numbers, @, ., -, _
                                        const emailValue = cleanedValue.replace(/[^a-zA-Z0-9@.\-_]/g, '');
                                        setEmail(emailValue);
                                    }}
                                    disabled={isSubmitting || isSuccess}
                                    required
                                />
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                                >
                                    <path
                                        d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <Button
                                type="submit"
                                className="h-12 bg-primary text-white hover:bg-primary/90"
                                disabled={isSubmitting || isSuccess || !email}
                            >
                                {isSubmitting ? "Joining..." : isSuccess ? "Joined ✓" : "Join waitlist"}
                            </Button>
                        </form>
                    </motion.div>

                    <motion.div
                        className="rounded-xl bg-white p-6 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="relative">
                            <div className="flex justify-center mb-8">
                                <div className="relative w-64 h-40">
                                    <div className="absolute top-0 right-0 w-56 h-36 bg-black rounded-xl transform rotate-6 z-10">
                                        <div className="p-4 text-white h-full flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="text-xs">PREPAID CARD</div>
                                                <div className="text-sm font-bold">Rojifi</div>
                                            </div>
                                            <div className="text-2xl font-bold">$ 8,000</div>
                                            <div className="text-xs">PREPAID CARD</div>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 left-0 w-56 h-36 bg-black rounded-xl transform -rotate-6 z-20">
                                        <div className="p-4 text-white h-full flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="text-xs">PREPAID CARD</div>
                                                <div className="text-sm font-bold">Rojifi</div>
                                            </div>
                                            <div className="text-2xl font-bold">$ 8,000</div>
                                            <div className="text-xs">PREPAID CARD</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-md">
                                    <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                                        <img
                                            src={nigeriaFlag}
                                            alt="Nigeria"
                                            width={24}
                                            height={24}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="h-4 w-48 bg-blue-200 rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-md">
                                    <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                                        <img
                                            src={usaFlag}
                                            alt="USA"
                                            width={24}
                                            height={24}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="h-4 w-32 bg-blue-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
