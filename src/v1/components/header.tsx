"use client";

import { useState } from "react";
import { Button } from "@/v1/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/v1/components/logo";
import {
    MultiCurrencyWalletIcon,
    OTCDeskIcon,
    VirtualCardIcon,
} from "./product-icons";
import { AboutUsIcon, BlogIcon, HelpIcon } from "./company-icons";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <a href="/" className="flex items-center space-x-2">
                        <Logo className="h-10 w-auto" />
                    </a>
                    <nav className="hidden md:flex items-center gap-6">
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
                                Products <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute left-0 top-full hidden w-[600px] rounded-md border bg-background p-6 shadow-lg group-hover:block">
                                <h3 className="text-lg font-medium mb-4">Products</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <a
                                        href="/multicurrency"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <MultiCurrencyWalletIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">
                                                Multi-Currency Wallet
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Local and global currencies for your business
                                            </p>
                                        </div>
                                    </a>
                                    <a
                                        href="/otc"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <OTCDeskIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">OTC Desk</h4>
                                            <p className="text-sm text-muted-foreground">
                                                High value transactions at competitive rates
                                            </p>
                                        </div>
                                    </a>
                                    <a
                                        href="/cards"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <VirtualCardIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">Virtual USD Cards</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Cards you can trust for your online payments
                                            </p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
                                Company <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute left-0 top-full hidden w-[600px] rounded-md border bg-background p-6 shadow-lg group-hover:block">
                                <h3 className="text-lg font-medium mb-4">Company</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <a
                                        href="/about"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <AboutUsIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">About Us</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Rojifi is a B2B cross-border payment provider
                                            </p>
                                        </div>
                                    </a>
                                    <a
                                        href="#"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <BlogIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">Blog</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Stay informed on our latest updates and blog posts
                                            </p>
                                        </div>
                                    </a>
                                    <a
                                        href="/help"
                                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <HelpIcon className="h-6 w-6 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium">Help</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Get assistance and answers to your questions
                                            </p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                        {/* <a
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Rates
            </a>
            <a
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Blog
            </a> */}
                    </nav>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => (window.location.href = "/contactus")}
                    >
                        Contact Us
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() =>
                            (window.location.href = "https://use.rojifi.com/login")
                        }
                    >
                        Sign in
                    </Button>
                    <Button
                        className="text-white"
                        onClick={() =>
                            (window.location.href = "https://use.rojifi.com/request-access")
                        }
                    >
                        Request Access
                    </Button>
                </div>
                <button
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border/40"
                    >
                        <div className="container py-4 space-y-4">
                            <div className="space-y-2">
                                <div className="font-medium">Products</div>
                                <nav className="grid gap-1 pl-4">
                                    <div className="flex items-center gap-2 py-1">
                                        <MultiCurrencyWalletIcon className="h-5 w-5" />
                                        <a
                                            href="/multicurrency"
                                            className="text-sm hover:text-primary"
                                        >
                                            Multi-currency Wallet
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 py-1">
                                        <OTCDeskIcon className="h-5 w-5" />
                                        <a href="/otc" className="text-sm hover:text-primary">
                                            OTC Desk
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 py-1">
                                        <VirtualCardIcon className="h-5 w-5" />
                                        <a href="/cards" className="text-sm hover:text-primary">
                                            Virtual USD Cards
                                        </a>
                                    </div>
                                </nav>
                            </div>
                            <div className="space-y-2">
                                <div className="font-medium">Company</div>
                                <nav className="grid gap-1 pl-4">
                                    <div className="flex items-center gap-2 py-1">
                                        <AboutUsIcon className="h-5 w-5" />
                                        <a href="/about" className="text-sm hover:text-primary">
                                            About Us
                                        </a>
                                    </div>
                                    {/* <div className="flex items-center gap-2 py-1">
                    <BlogIcon className="h-5 w-5" />
                    <a href="#" className="text-sm hover:text-primary">
                      Blog
                    </a>
                  </div> */}
                                    <div className="flex items-center gap-2 py-1">
                                        <HelpIcon className="h-5 w-5" />
                                        <a href="/help" className="text-sm hover:text-primary">
                                            Help
                                        </a>
                                    </div>
                                </nav>
                            </div>
                            {/* <a
                href="#"
                className="block text-sm font-medium hover:text-primary"
              >
                Rates
              </a> */}
                            <div className="flex flex-col gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => (window.location.href = "/contactus")}
                                >
                                    Contact Us
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => (window.location.href = "/login")}
                                >
                                    Sign in
                                </Button>
                                <Button
                                    className="w-full text-white"
                                    onClick={() => (window.location.href = "/request-access")}
                                >
                                    Request Access
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
