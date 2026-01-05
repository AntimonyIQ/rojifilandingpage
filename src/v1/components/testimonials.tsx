import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

// Using i.pravatar.cc API for realistic human face photos
// Format: https://i.pravatar.cc/{size}?img={number}
// Free, realistic photos, no API key needed

const testimonials = [
    {
        id: 1,
        name: "Peremobowel Ajididi",
        title: "CEO, Buidl Blocks",
        image: "https://i.pravatar.cc/150?img=12",
        company: "Game-Changing International Transactions",
        content:
            "Rojifi has transformed our international transactions. The multi-currency wallets and competitive exchange rates are a game-changer. Seamless process and 24/7 availability keep our global operations smooth.",
        rating: 5,
    },
    {
        id: 2,
        name: "Awele Wemembu",
        title: "Director of Operations",
        image: "https://i.pravatar.cc/150?img=45",
        company: "Effortless Expense Management",
        content:
            "Managing team expenses with Rojifi is effortless. Unlimited USD expense cards and instant currency conversion are perfect for our needs. Highly recommend!",
        rating: 4,
    },
    {
        id: 3,
        name: "Uche Chiedu",
        title: "Finance Manager",
        image: "https://i.pravatar.cc/150?img=33",
        company: "Essential for Global Business",
        content:
            "Trading with over 80 countries and handling large transactions has never been easier. Flexible rates and reliable 24/7 service make Rojifi essential for our business.",
        rating: 4,
    },
    {
        id: 4,
        name: "Sarah Johnson",
        title: "CFO, TechGrowth Inc",
        image: "https://i.pravatar.cc/150?img=47",
        company: "Streamlined Cross-Border Payments",
        content:
            "Rojifi has completely streamlined our cross-border payment processes. We've reduced transaction times by 70% and saved significantly on fees. The platform's reliability and customer support are outstanding.",
        rating: 5,
    },
    {
        id: 5,
        name: "Michael Okonkwo",
        title: "Head of Treasury",
        image: "https://i.pravatar.cc/150?img=59",
        company: "Exceptional Currency Management",
        content:
            "As a multinational company, managing multiple currencies was always challenging until we found Rojifi. Their platform gives us real-time visibility and control over our global financial operations. Truly exceptional service.",
        rating: 5,
    },
    {
        id: 6,
        name: "Amina Diallo",
        title: "Procurement Director",
        image: "https://i.pravatar.cc/150?img=38",
        company: "Simplified Vendor Payments",
        content:
            "Paying international vendors used to be a headache for our procurement team. With Rojifi, we can now make payments in local currencies with just a few clicks. Our vendors appreciate the prompt, hassle-free transactions.",
        rating: 4,
    },
    {
        id: 7,
        name: "David Chen",
        title: "E-commerce Entrepreneur",
        image: "https://i.pravatar.cc/150?img=68",
        company: "Perfect for Global E-commerce",
        content:
            "As an e-commerce business selling to customers worldwide, Rojifi has been a game-changer. The ability to accept payments in multiple currencies and manage everything in one platform has helped us scale internationally much faster.",
        rating: 4,
    },
]

export function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isHovering, setIsHovering] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Calculate the number of pages based on showing 3 testimonials at a time
    const totalPages = Math.ceil(testimonials.length / 3)

    // Check if we're on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)

        return () => {
            window.removeEventListener("resize", checkMobile)
        }
    }, [])

    const nextTestimonial = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % (isMobile ? testimonials.length : totalPages))
    }, [isMobile, totalPages])

    const prevTestimonial = useCallback(() => {
        setActiveIndex(
            (prev) =>
                (prev - 1 + (isMobile ? testimonials.length : totalPages)) % (isMobile ? testimonials.length : totalPages),
        )
    }, [isMobile, totalPages])

    // Auto-scroll functionality
    useEffect(() => {
        if (isHovering) return

        const interval = setInterval(() => {
            nextTestimonial()
        }, 5000)

        return () => clearInterval(interval)
    }, [isHovering, nextTestimonial])

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Feedback from Satisfied Clients</h2>
                    <p className="mt-4 text-muted-foreground">Hear what our clients say about Rojifi</p>
                </div>

                <div
                    className="mt-16 relative"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <div className="overflow-hidden">
                        {isMobile ? (
                            // Mobile view - 1 testimonial at a time
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                            >
                                {testimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                                        <div className="mx-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img
                                                    src={testimonial.image || "/placeholder.svg?height=64&width=64&query=person"}
                                                    alt={testimonial.name}
                                                    width={64}
                                                    height={64}
                                                    className="rounded-full"
                                                />
                                                <div>
                                                    <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                                </div>
                                            </div>

                                            <h4 className="mt-4 font-medium">{testimonial.company}</h4>
                                            <p className="mt-2 text-muted-foreground">{testimonial.content}</p>

                                            <div className="mt-4 flex">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-5 w-5 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Desktop view - 3 testimonials at a time with pagination
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                            >
                                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                                    <div key={pageIndex} className="w-full flex-shrink-0">
                                        <div className="grid grid-cols-3 gap-6 px-4">
                                            {testimonials.slice(pageIndex * 3, pageIndex * 3 + 3).map((testimonial) => (
                                                <div key={testimonial.id} className="flex-1">
                                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-full">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <img
                                                                src={testimonial.image || "/placeholder.svg?height=64&width=64&query=person"}
                                                                alt={testimonial.name}
                                                                width={64}
                                                                height={64}
                                                                className="rounded-full"
                                                            />
                                                            <div>
                                                                <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                                                                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                                            </div>
                                                        </div>

                                                        <h4 className="mt-4 font-medium">{testimonial.company}</h4>
                                                        <p className="mt-2 text-muted-foreground">{testimonial.content}</p>

                                                        <div className="mt-4 flex">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-5 w-5 ${i < testimonial.rating
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "fill-gray-200 text-gray-200"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border border-gray-200"
                        onClick={prevTestimonial}
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border border-gray-200"
                        onClick={nextTestimonial}
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="h-6 w-6 text-gray-600" />
                    </button>

                    <div className="mt-8 flex justify-center gap-2">
                        {Array.from({ length: isMobile ? testimonials.length : totalPages }).map((_, i) => (
                            <button
                                key={i}
                                className={`h-2 w-2 rounded-full ${i === activeIndex ? "bg-primary" : "bg-gray-200"}`}
                                onClick={() => setActiveIndex(i)}
                                aria-label={`Go to testimonial ${isMobile ? i + 1 : `page ${i + 1}`}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
