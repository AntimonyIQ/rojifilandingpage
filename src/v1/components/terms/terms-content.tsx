"use client"

// Configuration object for easy updates
const TERMS_CONFIG = {
    title: "Terms & Conditions",
    lastUpdated: "September 27, 2025",
    sections: [
        { id: "acceptance-of-terms", title: "Acceptance of Terms" },
        { id: "services", title: "Services" },
        { id: "eligibility", title: "Eligibility" },
        { id: "user-obligations", title: "User Obligations" },
        { id: "fees-and-charges", title: "Fees and Charges" },
        { id: "intellectual-property", title: "Intellectual Property" },
        { id: "privacy-and-data-protection", title: "Privacy and Data Protection" },
        { id: "termination", title: "Termination" },
        { id: "governing-law", title: "Governing Law" },
        { id: "third-party-links", title: "Third-party Links and Services" },
        { id: "amendments", title: "Amendments" },
        { id: "contact-information", title: "Contact Information" }
    ]
}



export function TermsContent() {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        }
    }

    return (
        <section className="min-h-screen flex flex-col md:flex-row">
            {/* Fixed Left sidebar */}
            <div className="w-full md:w-1/4 md:fixed md:top-0 md:left-0 md:h-screen md:overflow-y-auto bg-gray-100 p-6 md:p-8 lg:p-12 z-10">
                <h1 className="text-3xl font-bold mb-2">{TERMS_CONFIG.title}</h1>
                <p className="text-sm text-gray-500 mb-8">Last updated: {TERMS_CONFIG.lastUpdated}</p>

                <div className="flex items-center gap-2 mb-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M4 6H20M4 12H20M4 18H12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="text-sm font-medium">Table of content</span>
                </div>

                <nav className="space-y-2 text-sm">
                    {TERMS_CONFIG.sections.map((section, index) => (
                        <div
                            key={section.id}
                            className="hover:text-primary cursor-pointer transition-colors"
                            onClick={() => scrollToSection(section.id)}
                        >
                            {index + 1}. {section.title}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Right content area with margin to account for fixed sidebar */}
            <div className="w-full md:w-3/4 md:ml-[25%] p-6 md:p-8 lg:p-12">
                <section id="acceptance-of-terms" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">1. Acceptance of Terms</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            These Terms & Conditions govern your access to and use of Rojifi's website, platform, products, and services,
                            including multi-currency wallets, OTC trading, virtual cards, and cross-border payment solutions.
                        </p>
                        <p className="text-gray-700">
                            By accessing or using the website of Rojifi Technology Inc., you agree to comply with and be bound by these
                            Terms and Conditions. If you do not agree, you must not use our website or services.
                        </p>
                    </div>
                </section>

                <section id="services" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">2. Services</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Rojifi provides cross-border payment services and related financial technology solutions subject to applicable
                            laws and regulations. Access to certain services may require account registration and verification in compliance
                            with Know Your Customer (KYC) and Anti-Money Laundering (AML) requirements.
                        </p>
                        <div className="ml-4">
                            <p className="text-gray-700 mb-2">
                                <strong>Multi-Currency Wallet:</strong> Store, convert, top up, and transact in multiple currencies;
                                send payouts to bank or mobile money accounts as supported.
                            </p>
                            <p className="text-gray-700 mb-2">
                                <strong>OTC Desk:</strong> Engage in large-volume FX trades with personalized rates and settlement terms.
                            </p>
                            <p className="text-gray-700">
                                <strong>Virtual USD Cards:</strong> Issue virtual cards to team members for secure spending,
                                subject to limits (e.g., up to $200,000).
                            </p>
                        </div>
                    </div>
                </section>

                <section id="eligibility" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">3. Eligibility</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            You must be a legally registered business or authorized representative, at least 18 years old,
                            and capable of forming binding contracts.
                        </p>
                        <p className="text-gray-700">
                            You must create an account and complete KYC/AML verification during onboarding. You agree to provide
                            accurate, current, and complete information and to update it as needed.
                        </p>
                    </div>
                </section>

                <section id="user-obligations" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">4. User Obligations</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-medium mb-3">You agree to:</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Provide accurate and complete information during registration and transactions.</li>
                                <li>Use our services only for lawful purposes.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium mb-3">You agree not to:</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Use Services for illegal purposes or violate applicable laws/regulations (including AML, sanctions, or tax laws).</li>
                                <li>Engage in fraudulent activity, misleading, or prohibited activities including money laundering, terrorism financing, or sanctions evasion, unauthorised access or misuse of the Platform.</li>
                                <li>Circumvent transaction limits or reverse engineered system bypass.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="fees-and-charges" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">5. Fees and Charges</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Rojifi may charge fees for transactions and services, which will be disclosed prior to completion of each transaction.
                            You are responsible for all applicable fees, charges, and taxes.
                        </p>
                    </div>
                </section>

                <section id="intellectual-property" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">6. Intellectual Property</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            All content on this website, including logos, text, graphics, software, and trademarks, are owned or licensed
                            by Rojifi and are protected by intellectual property laws. Unauthorized use is prohibited.
                        </p>
                    </div>
                </section>

                <section id="privacy-and-data-protection" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">7. Privacy and Data Protection</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Our Privacy Policy outlines how we collect, use, store, and protect data, including KYC, transaction,
                            technical, and identifiable information. Your data processing under these Terms is governed by that policy.
                        </p>
                    </div>
                </section>

                <section id="termination" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">8. Termination</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            We may suspend or terminate your access for reasons including KYC failure, suspicious activity,
                            policy violation, or legal obligation.
                        </p>
                        <p className="text-gray-700">
                            Upon termination, your rights to use the Platform cease immediately; we may retain your data and
                            transaction records as required by law or internal policy.
                        </p>
                    </div>
                </section>

                <section id="governing-law" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">9. Governing Law</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            These Terms shall be governed by and construed in accordance with the laws of the Province of British Columbia
                            and the federal laws of Canada.
                        </p>
                    </div>
                </section>

                <section id="third-party-links" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">10. Third-party Links and Services</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Rojifi may integrate third-party services for enhanced functionality and user experience.
                        </p>
                    </div>
                </section>

                <section id="amendments" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">11. Amendments</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            We may update these Terms as needed (e.g., new services, regulatory changes). Notice will be given via email
                            or Platform notification. Continued use after posting constitutes acceptance.
                        </p>
                    </div>
                </section>

                <section id="contact-information" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">12. Contact Information</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            For questions, please contact us at:
                        </p>
                        <div className="ml-4 space-y-2">
                            <p className="text-gray-700">
                                📧 Email: <a href="mailto:support@rojifi.com" className="text-primary hover:text-primary/80">support@rojifi.com</a>
                            </p>
                            <p className="text-gray-700">
                                ☎️ Telephone: <a href="tel:+2347038380109" className="text-primary hover:text-primary/80">+234 703 838 0109</a>
                            </p>
                        </div>
                    </div>
                </section>

                <section id="services" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">2. Services</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Rojifi provides cross-border payment services and related financial technology solutions subject to applicable
                            laws and regulations. Access to certain services may require account registration and verification in compliance
                            with Know Your Customer (KYC) and Anti-Money Laundering (AML) requirements.
                        </p>
                        <div className="ml-4">
                            <p className="text-gray-700 mb-2">
                                <strong>Multi-Currency Wallet:</strong> Store, convert, top up, and transact in multiple currencies;
                                send payouts to bank or mobile money accounts as supported.
                            </p>
                            <p className="text-gray-700 mb-2">
                                <strong>OTC Desk:</strong> Engage in large-volume FX trades with personalized rates and settlement terms.
                            </p>
                            <p className="text-gray-700">
                                <strong>Virtual USD Cards:</strong> Issue virtual cards to team members for secure spending,
                                subject to limits (e.g., up to $200,000).
                            </p>
                        </div>
                    </div>
                </section>

                <section id="eligibility" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">3. Eligibility</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            You must be a legally registered business or authorized representative, at least 18 years old,
                            and capable of forming binding contracts.
                        </p>
                        <p className="text-gray-700">
                            You must create an account and complete KYC/AML verification during onboarding. You agree to provide
                            accurate, current, and complete information and to update it as needed.
                        </p>
                    </div>
                </section>

                <section id="user-obligations" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">4. User Obligations</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-medium mb-3">You agree to:</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Provide accurate and complete information during registration and transactions.</li>
                                <li>Use our services only for lawful purposes.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium mb-3">You agree not to:</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Use Services for illegal purposes or violate applicable laws/regulations (including AML, sanctions, or tax laws).</li>
                                <li>Engage in fraudulent activity, misleading, or prohibited activities including money laundering, terrorism financing, or sanctions evasion, unauthorised access or misuse of the Platform.</li>
                                <li>Circumvent transaction limits or reverse engineered system bypass.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="fees-and-charges" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">5. Fees and Charges</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Rojifi may charge fees for transactions and services, which will be disclosed prior to completion of each transaction.
                            You are responsible for all applicable fees, charges, and taxes.
                        </p>
                    </div>
                </section>

                <section id="intellectual-property" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">6. Intellectual Property</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            All content on this website, including logos, text, graphics, software, and trademarks, are owned or licensed
                            by Rojifi and are protected by intellectual property laws. Unauthorized use is prohibited.
                        </p>
                    </div>
                </section>

                <section id="privacy-and-data-protection" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">7. Privacy and Data Protection</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Our Privacy Policy outlines how we collect, use, store, and protect data, including KYC, transaction,
                            technical, and identifiable information. Your data processing under these Terms is governed by that policy.
                        </p>
                    </div>
                </section>

                <section id="termination" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">8. Termination</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            We may suspend or terminate your access for reasons including KYC failure, suspicious activity,
                            policy violation, or legal obligation.
                        </p>
                        <p className="text-gray-700">
                            Upon termination, your rights to use the Platform cease immediately; we may retain your data and
                            transaction records as required by law or internal policy.
                        </p>
                    </div>
                </section>

                <section id="governing-law" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">9. Governing Law</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            These Terms shall be governed by and construed in accordance with the laws of the Province of British Columbia
                            and the federal laws of Canada.
                        </p>
                    </div>
                </section>

                <section id="third-party-links" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">10. Third-party Links and Services</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Rojifi may integrate third-party services for enhanced functionality and user experience.
                        </p>
                    </div>
                </section>

                <section id="amendments" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">11. Amendments</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            We may update these Terms as needed (e.g., new services, regulatory changes). Notice will be given via email
                            or Platform notification. Continued use after posting constitutes acceptance.
                        </p>
                    </div>
                </section>

                <section id="contact-information" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">12. Contact Information</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            For questions, please contact us at:
                        </p>
                        <div className="ml-4 space-y-2">
                            <p className="text-gray-700">
                                📧 Email: <a href="mailto:support@rojifi.com" className="text-primary hover:text-primary/80">support@rojifi.com</a>
                            </p>
                            <p className="text-gray-700">
                                ☎️ Telephone: <a href="tel:+2347038380109" className="text-primary hover:text-primary/80">+234 703 838 0109</a>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    )
}