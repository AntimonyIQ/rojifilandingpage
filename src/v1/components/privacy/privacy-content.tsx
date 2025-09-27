"use client"

// Configuration object for easy updates
const PRIVACY_CONFIG = {
    title: "Privacy Policy",
    lastUpdated: "July 19, 2024",
    sections: [
        { id: "introduction", title: "Introduction" },
        { id: "information-we-collect", title: "Information We Collect" },
        { id: "how-we-use-information", title: "How We Use Your Information" },
        { id: "information-sharing", title: "Information Sharing and Disclosure" },
        { id: "data-security", title: "Data Security" },
        { id: "data-retention", title: "Data Retention" },
        { id: "your-rights", title: "Your Rights and Choices" },
        { id: "international-transfers", title: "International Data Transfers" },
        { id: "cookies", title: "Cookies and Tracking Technologies" },
        { id: "third-party-services", title: "Third-Party Services" },
        { id: "children-privacy", title: "Children's Privacy" },
        { id: "policy-changes", title: "Changes to This Privacy Policy" },
        { id: "contact-us", title: "Contact Us" }
    ]
}

export function PrivacyContent() {
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
                <h1 className="text-3xl font-bold mb-2">{PRIVACY_CONFIG.title}</h1>
                <p className="text-sm text-gray-500 mb-8">Last updated: {PRIVACY_CONFIG.lastUpdated}</p>

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
                    {PRIVACY_CONFIG.sections.map((section, index) => (
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
                <section id="introduction" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">1. Introduction</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Welcome to Rojifi. We are committed to protecting your privacy and ensuring the security of your personal
                            information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                            when you use our cross-border payment services and platform.
                        </p>
                        <p className="text-gray-700">
                            Rojifi operates as a financial technology company providing multi-currency wallets, OTC trading services,
                            virtual cards, and cross-border payment solutions. By using our services, you agree to the collection and
                            use of information in accordance with this policy.
                        </p>
                        <p className="text-gray-700">
                            This policy applies to all users of our platform, including individuals and businesses that utilize our
                            services for international transactions, currency exchange, and financial operations.
                        </p>
                    </div>
                </section>

                <section id="information-we-collect" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">2. Information We Collect</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
                            <p className="text-gray-700 mb-3">We collect the following types of personal information:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <span className="font-medium">Identity Information:</span> Full name, date of birth, nationality,
                                    government-issued ID numbers
                                </li>
                                <li>
                                    <span className="font-medium">Contact Information:</span> Email address, phone number, physical
                                    address
                                </li>
                                <li>
                                    <span className="font-medium">Financial Information:</span> Bank account details, transaction history,
                                    payment card information
                                </li>
                                <li>
                                    <span className="font-medium">Business Information:</span> Company name, business registration
                                    details, tax identification numbers
                                </li>
                                <li>
                                    <span className="font-medium">Verification Documents:</span> Passport, driver's license, utility
                                    bills, business licenses
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-medium mb-3">Technical Information</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>IP address and device identifiers</li>
                                <li>Browser type and version</li>
                                <li>Operating system and device information</li>
                                <li>Usage data and platform interactions</li>
                                <li>Location data (with your consent)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-medium mb-3">Transaction Information</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Payment amounts and currencies</li>
                                <li>Recipient and sender details</li>
                                <li>Transaction dates and times</li>
                                <li>Exchange rates applied</li>
                                <li>Transaction purposes and descriptions</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="how-we-use-information" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">3. How We Use Your Information</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">We use your information for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <span className="font-medium">Service Provision:</span> To provide our cross-border payment services,
                                currency exchange, and virtual card services
                            </li>
                            <li>
                                <span className="font-medium">Identity Verification:</span> To comply with Know Your Customer (KYC) and
                                Anti-Money Laundering (AML) requirements
                            </li>
                            <li>
                                <span className="font-medium">Transaction Processing:</span> To execute, monitor, and complete financial
                                transactions
                            </li>
                            <li>
                                <span className="font-medium">Risk Management:</span> To assess and manage financial and operational
                                risks
                            </li>
                            <li>
                                <span className="font-medium">Customer Support:</span> To respond to inquiries and provide technical
                                assistance
                            </li>
                            <li>
                                <span className="font-medium">Legal Compliance:</span> To comply with applicable laws, regulations, and
                                legal obligations
                            </li>
                            <li>
                                <span className="font-medium">Service Improvement:</span> To analyze usage patterns and improve our
                                platform
                            </li>
                            <li>
                                <span className="font-medium">Communication:</span> To send important updates, notifications, and
                                marketing communications (with consent)
                            </li>
                        </ul>
                    </div>
                </section>

                <section id="information-sharing" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">4. Information Sharing and Disclosure</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">We may share your information in the following circumstances:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <span className="font-medium">Service Providers:</span> With trusted third-party service providers who
                                assist in our operations
                            </li>
                            <li>
                                <span className="font-medium">Financial Partners:</span> With banks, payment processors, and other
                                financial institutions to facilitate transactions
                            </li>
                            <li>
                                <span className="font-medium">Regulatory Authorities:</span> With government agencies and regulatory
                                bodies as required by law
                            </li>
                            <li>
                                <span className="font-medium">Legal Requirements:</span> When required by court orders, subpoenas, or
                                other legal processes
                            </li>
                            <li>
                                <span className="font-medium">Business Transfers:</span> In connection with mergers, acquisitions, or
                                asset sales
                            </li>
                            <li>
                                <span className="font-medium">Fraud Prevention:</span> To prevent fraud, money laundering, and other
                                illegal activities
                            </li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                            We do not sell, rent, or trade your personal information to third parties for marketing purposes without
                            your explicit consent.
                        </p>
                    </div>
                </section>

                <section id="data-security" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">5. Data Security</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">We implement robust security measures to protect your information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <span className="font-medium">Encryption:</span> All sensitive data is encrypted in transit and at rest
                                using industry-standard protocols
                            </li>
                            <li>
                                <span className="font-medium">Access Controls:</span> Strict access controls and authentication
                                mechanisms for our systems
                            </li>
                            <li>
                                <span className="font-medium">Regular Audits:</span> Regular security audits and vulnerability
                                assessments
                            </li>
                            <li>
                                <span className="font-medium">Employee Training:</span> Comprehensive security training for all
                                employees
                            </li>
                            <li>
                                <span className="font-medium">Incident Response:</span> Established procedures for detecting and
                                responding to security incidents
                            </li>
                            <li>
                                <span className="font-medium">Compliance:</span> Adherence to international security standards and
                                financial regulations
                            </li>
                        </ul>
                    </div>
                </section>

                <section id="data-retention" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">6. Data Retention</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            We retain your personal information for as long as necessary to provide our services and comply with legal
                            obligations:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <span className="font-medium">Account Information:</span> Retained for the duration of your account plus
                                7 years after closure
                            </li>
                            <li>
                                <span className="font-medium">Transaction Records:</span> Retained for 7 years as required by financial
                                regulations
                            </li>
                            <li>
                                <span className="font-medium">Identity Verification:</span> Retained for 7 years after account closure
                                for compliance purposes
                            </li>
                            <li>
                                <span className="font-medium">Marketing Data:</span> Retained until you withdraw consent or for 3 years
                                of inactivity
                            </li>
                        </ul>
                    </div>
                </section>

                <section id="your-rights" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">7. Your Rights and Choices</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">You have the following rights regarding your personal information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <span className="font-medium">Access:</span> Request access to your personal information
                            </li>
                            <li>
                                <span className="font-medium">Correction:</span> Request correction of inaccurate or incomplete
                                information
                            </li>
                            <li>
                                <span className="font-medium">Deletion:</span> Request deletion of your personal information (subject to
                                legal requirements)
                            </li>
                            <li>
                                <span className="font-medium">Portability:</span> Request transfer of your data to another service
                                provider
                            </li>
                            <li>
                                <span className="font-medium">Restriction:</span> Request restriction of processing in certain
                                circumstances
                            </li>
                            <li>
                                <span className="font-medium">Objection:</span> Object to processing based on legitimate interests
                            </li>
                            <li>
                                <span className="font-medium">Withdrawal:</span> Withdraw consent for marketing communications
                            </li>
                        </ul>
                    </div>
                </section>

                <section id="international-transfers" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">8. International Data Transfers</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            As a global financial services provider, we may transfer your information internationally. We ensure
                            appropriate safeguards are in place:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Adequacy decisions by relevant data protection authorities</li>
                            <li>Standard contractual clauses approved by regulatory bodies</li>
                            <li>Binding corporate rules for intra-group transfers</li>
                            <li>Certification schemes and codes of conduct</li>
                        </ul>
                    </div>
                </section>

                <section id="cookies" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">9. Cookies and Tracking Technologies</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">We use cookies and similar technologies to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Maintain your session and preferences</li>
                            <li>Analyze platform usage and performance</li>
                            <li>Provide personalized content and recommendations</li>
                            <li>Enhance security and prevent fraud</li>
                            <li>Deliver targeted marketing (with consent)</li>
                        </ul>
                        <p className="text-gray-700">
                            You can manage cookie preferences through your browser settings or our cookie preference center.
                        </p>
                    </div>
                </section>

                <section id="third-party-services" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">10. Third-Party Services</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Our platform may contain links to third-party websites or integrate with third-party services. We are not
                            responsible for the privacy practices of these external services. We encourage you to review their privacy
                            policies.
                        </p>
                    </div>
                </section>

                <section id="children-privacy" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">11. Children's Privacy</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal
                            information from children. If we become aware that we have collected information from a child, we will
                            take steps to delete it promptly.
                        </p>
                    </div>
                </section>

                <section id="policy-changes" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">12. Changes to This Privacy Policy</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
                            We will notify you of material changes through email or platform notifications. The updated policy will be
                            effective upon posting.
                        </p>
                    </div>
                </section>

                <section id="contact-us" className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">13. Contact Us</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            If you have questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">Rojifi Privacy Team</p>
                            <p>Email: legal@rojifi.com</p>
                        </div>
                        <p className="text-gray-700">
                            For data protection inquiries in specific jurisdictions, please contact our Data Protection Officer at
                            legal@rojifi.com.
                        </p>
                    </div>
                </section>
            </div>
        </section>
    )
}
