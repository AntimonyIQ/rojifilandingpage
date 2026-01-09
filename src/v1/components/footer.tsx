import { Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/v1/components/logo";

export function Footer() {
  return (
    <footer className="border-t bg-black text-white">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="/" className="flex items-center space-x-2">
              <Logo className="h-10 w-auto" color="white" />
            </a>
            <p className="mt-4 text-sm text-gray-400">
              Global Transactions Made Simple for Local Businesses
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.instagram.com/rojifi_"
                className="rounded-full bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/rojifi_"
                className="rounded-full bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/rojifi"
                className="rounded-full bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Products</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/multicurrency" className="hover:text-white">
                  Multi-currency Wallet
                </a>
              </li>
              <li>
                <a href="/otc" className="hover:text-white">
                  24/7 OTC Desk
                </a>
              </li>
              <li>
                <a href="/cards" className="hover:text-white">
                  Virtual Expense Cards
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/about" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-white">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/contactus" className="hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-white">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="py-5 text-slate-500 text-[12px]">
          Rojifi Technology Inc. is a limited company registered in British
          Columbia, Canada. Its registered number is BC1416726. We are
          authorized by the Financial Transaction and Reports Analysis Centre of
          Canada (FINTRAC) -MSB No. M23347431
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-sm text-gray-400">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p>Copyright © 2025 Rojifi</p>
            <div className="flex gap-4">
              {/* <a href="#" className="hover:text-white">
                                Security
                            </a> */}
              <a href="/privacy" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white">
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
