import { Footer } from "@/v1/components/footer"
import { Header } from "@/v1/components/header"
import { useSEO } from '@/hooks/useSEO';

export default function TermsOfOperationPage() {
    return (
        <>
            {useSEO({ page: 'terms' })}
            <main className="flex min-h-screen flex-col">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <img
                            src="https://www.rojifi.com/logo.png"
                            alt="Rojifi Logo"
                            className="h-12 w-auto"
                        />
                    </div>

                    {/* Terms Content */}
                    <div className="prose prose-gray max-w-none text-gray-800 leading-relaxed pb-8">
                        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">
                            Terms of Service
                        </h1>

                        <div className="text-sm text-gray-600 mb-6 text-center">
                            Version December 2025 v5
                        </div>

                        <p className="font-semibold text-gray-900 mb-6 text-center">
                            PLEASE READ THESE TERMS OF SERVICE CAREFULLY. BY ACCESSING THIS WEBSITE AND THE ROJIFI'S PLATFORM OR IN RESPECT OF TRANSACTIONS SUBMITTED BY YOU OR ON YOUR BEHALF THROUGH THE ROJIFI'S PLATFORM, YOU AGREE TO BE BOUND BY THE TERMS OF SERVICE BELOW. THESE TERMS OF SERVICE ARE SUBJECT TO CHANGE. ANY CHANGES WILL BE INCORPORATED INTO THE TERMS OF SERVICE POSTED TO THIS WEBSITE FROM TIME TO TIME.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <p className="mb-4">
                                    <strong>1)</strong> These Terms of Service governs your use of the Rojifi technology Inc platform and related services (each and together, "Platform"). For the purpose of these Terms of Service, "you" means the person that is acting on behalf of a company, and the company, that is applying for or has been provided access to the Platform. You may only apply for, open, and maintain access to the Platform if you agree to these Terms of Service.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>2)</strong> You further acknowledge and agree that Rojifi may from time-to-time use third party service providers to process transactions. In providing certain services, we use licensed and registered third-party providers. You agree that your continued use of our services constitutes your electronic acceptance of their terms and your consent to all applicable conditions therein.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>3)</strong> Rojifi does not provide any financial services or advise. Financial services are provided through our regulated and licensed partners and third-party service providers and financial institutions. Rojifi technology Inc is registered with the Financial Transactions and Reports Analysis Centre of Canada ("FINTRAC") as a money services business ("MSB"), MSB number M23347431. As a registered MSB, Rojifi technology Inc is able to provide foreign exchange dealing, money transferring and payment services. As a registered MSB, Rojifi technology Inc is subject to requirements imposed upon financial institutions to implement policies and procedures reasonably designed to detect and prevent money laundering and terrorist financing. Your access to and use of the Platform is subject to compliance with rojifi's AML/CTF Compliance Program.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>4)</strong> Subject to exemption pursuant to applicable regulatory requirements, access to the Platform is limited to companies organized and registered outside of the United States.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>5)</strong> By registering for, or using the Platform you (inclusive of the company on whose behalf you are acting) represent and warrant that at the time of application and at all times that company uses or has access to the Platform:
                                </p>
                                <ul className="list-disc ml-6 mb-4 space-y-2">
                                    <li>You / company is not engaged and will not engage in any prohibited activities (list of prohibited activities available upon request);</li>
                                    <li>The person that submits company's application:
                                        <ul className="list-disc ml-6 mt-2 space-y-1">
                                            <li>is an authorized representative of the company;</li>
                                            <li>is authorized to submit the application and all required information on behalf of company; and</li>
                                            <li>all information provided to rojifi and will be current, accurate, and complete.</li>
                                        </ul>
                                    </li>
                                    <li>You agree to be on-boarded as a client of rojifi and appoint rojifi as your agent in respect of transactions executed on the Platform;</li>
                                    <li>You agree to provide to rojifi, all required company and/or personal data required by rojifi to complete its verification and screening requirements.</li>
                                </ul>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>6)</strong> You will keep all company and personal data current, complete, and accurate at all times. We may require additional information from you at any time for verification purposes, or for other legitimate business purposes.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>7)</strong> Rojifi, its affiliates, and third-party service providers rely on the accuracy of the information you provide when registering and using the Platform. You may be required to verify information previously provided or provide additional information in the course of applying for or accessing the Platform.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>8)</strong> You acknowledge and agree that rojifi may use and provide the information provided by you to rojifi affiliates, and third-party service providers to validate the information you have provided and determine your eligibility for access to the Platform.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>9)</strong> When you or a third-party acting on your behalf submit instructions to execute transactions on the Platform, you are giving rojifi your permission to carry out those orders as your agent, which includes, among other things, acting on your behalf to settle a currency trade or receive settlement for a currency trade. To process orders, you or the third-party acting on your behalf must provide rojifi with full transactional information such as sender, beneficiary, account numbers, wallet addresses, bank names and other information as required.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>10)</strong> You agree that access to the Platform may not be (a) used for any purpose that is unlawful (b) used for any transaction involving any prohibited activities, (c) provided to or used for any transaction involving an individual, organization, country, or jurisdiction that is blocked or sanctioned by the United States, including those identified on any lists maintained by the U.S. Treasury Department's Office of Foreign Assets Control (OFAC), the U.S. Department of State, United Nations, European Union and the HMT Financial Sanctions List (d) used or accessed by third parties who are not company employees, contractors, or authorized agents of you or the company, (e) copied, modified, adapted or used to create derivative works of or republish the services; (f) reverse engineered, decompiled, disassembled, or otherwise used to attempt to derive the source code of the services; (g) accessed or used for purposes of comparison with or benchmarking against third party products or services or in order to build similar services or competitive services; (h) used to gain or attempt to gain unauthorized access to the Platform; or (i) used for any purpose not related to the business of the company.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>11)</strong> We may terminate your access to the Platform if we believe you are engaged in any prohibited activities or otherwise as determined in rojifi sole discretion. We may update the lists of prohibited activities at any time.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>12)</strong> You will keep your access to the Platform secure and only provide access to individuals that you have authorized to use the Platform on your behalf. You will take all reasonable steps to safeguard the privacy, confidentiality, and security of user credentials.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>13)</strong> We may add new fees or increase existing fees upon 30 days' notice to you or the third-party acting on your behalf, as applicable. We may also charge a new or increased fee when you affirmatively agree to such fee even if that is earlier than 30 days after receiving Notice.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>14)</strong> We do not guarantee that the Platform will always be offered or available to you. Platform features will change from time to time, and certain services may be discontinued. In the event that rojifi discontinues or modifies a certain function or service you are using in a way that materially reduces the features or functionality, we will make commercially reasonable efforts to provide at least 30 days advance notice to you or the third-party acting on your behalf, as applicable before the service is discontinued or materially modified.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>15)</strong> If we believe, in our sole discretion, that you or any user or other person associated with you has violated the terms of these Platform Terms of Service, violated applicable law, engaged in fraudulent or unfair activities, or has otherwise engaged in activities that violate our or others' rights, or created an undue risk of harm for us or others, we may take a number of actions to protect rojifi, its customers, and others at any time, in our sole discretion with or without notice. The actions we may take include, but not limited to:
                                </p>
                                <ul className="list-disc ml-6 mb-4 space-y-2">
                                    <li>terminating access to the Platform;</li>
                                    <li>limiting your access to the Platform;</li>
                                    <li>holding or otherwise restricting a cash or crypto balance, or payments for as long as reasonably needed to protect against the risk of liability or loss, to be determined in our sole discretion; and</li>
                                    <li>taking legal action.</li>
                                </ul>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>16)</strong> You acknowledge, understand, and agree that rojifi will collect, process, and share your data, including with affiliates and third-party service providers, for purposes that include providing the services and complying with our legal and regulatory obligations.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>17)</strong> You acknowledge that rojifi and its affiliates do not provide legal, financial, tax, IT, compliance, or other professional advice. You understand that you are responsible for any actions taken based upon information received from rojifi, and where professional advice is needed, that you should seek independent professional advice.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>18)</strong> Information we provide on our website and in other communications to you may contain third-party content or links to third-party sites and applications. We do not control any such third-party content, sites, or applications, and we are not responsible or liable for the availability, accuracy, completeness, or reliability of third-party content or for damages, losses, failures, or problems caused by, related to, or arising from such third-party content or the products or practices of third parties.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>19)</strong> Rojifi is not liable to you for consequential, indirect, special, exemplary, treble or punitive damages or lost profits or revenue, reputational harm, physical injury, or property damage arising from or related to your use of the Platform. Rojifi maximum liability to you is limited to the total amount of fees actually paid by you to rojifi in the twelve months preceding the event that is the basis of your claim.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>20)</strong> You are solely responsible for monitoring your account for unauthorized or suspicious activity, and we are not liable to you if you lose your funds due to unauthorized activity.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>21)</strong> We may immediately reject transactions to or from, suspend or terminate, your access to the Platform and/or freeze any funds without prior notice if: (a) we suspect you have violated these terms, our AML/CTF Compliance Program, or any applicable laws or regulations; (b) we are required to do so by applicable law or by any valid order we receive from law enforcement officials; (c) we suspect suspicious or unauthorized activity or any actual or attempted unauthorized access.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>22)</strong> THE PLATFORM IS PROVIDED AS IS AND AS AVAILABLE. ROJIFI DISCLAIMS ALL EXPRESS, IMPLIED, OR STATUTORY WARRANTIES OF TITLE, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE, AND ALL WARRANTIES OF NON-INFRINGEMENT. NOTHING IN THIS PLATFORM AGREEMENT WILL BE INTERPRETED TO CREATE OR IMPLY ANY SUCH WARRANTY.
                                </p>
                                <p className="mb-4">
                                    THIRD-PARTY SERVICES ARE NOT PROVIDED OR CONTROLLED BY ROJIFI. ROJIFI DOES NOT PROVIDE SUPPORT FOR AND DISCLAIMS ALL LIABILITY ARISING FROM FAILURES OR LOSSES CAUSED BY THIRD-PARTY SERVICES.
                                </p>
                                <p className="mb-4">
                                    ROJIFI DISCLAIMS ALL WARRANTIES AND DOES NOT GUARANTEE THAT (A) SERVICES AND DATA PROVIDED ARE ACCURATE OR ERROR-FREE; (B) THE PLATFORM WILL MEET YOUR SPECIFIC NEEDS OR REQUIREMENTS; (C) THE PLATFORM WILL BE USABLE BY COMPANY, ADMINISTRATORS, OR USERS AT ANY PARTICULAR TIME OR LOCATION; (D) SERVICES WILL BE UNINTERRUPTED, SECURE, OR FREE FROM HACKING, VIRUSES, OR MALICIOUS CODE; AND (E) ANY DEFECTS IN THE SERVICES WILL BE CORRECTED, EVEN WHEN WE ARE ADVISED OF SUCH DEFECTS.
                                </p>
                            </div>

                            <div>
                                <p className="mb-4">
                                    <strong>23)</strong> YOU AGREE TO DEFEND, INDEMNIFY AND HOLD HARMLESS ROJIFI, AND OUR RESPECTIVE OFFICERS, DIRECTORS, SHAREHOLDERS, PARTNERS, INDEPENDENT CONTRACTORS, EMPLOYEES, AND AGENTS (THE "INDEMNIFIED PARTIES") FROM AND AGAINST ALL LOSSES, LIABILITIES, ATTORNEYS' FEES, AND ALL RELATED EXPENSES ("LOSSES"), WHETHER IN TORT, CONTRACT, OR OTHERWISE, THAT ARISE OUT OF, RELATE TO, OR ARE ATTRIBUTABLE, IN WHOLE OR IN PART, TO A CLAIM, SUITS, OR PROCEEDINGS, BROUGHT BY A THIRD PARTY AGAINST AN INDEMNIFIED PARTY RELATED TO YOUR BREACH OF THESE TERMS OR ANY ACTIVITY BY YOU RELATED TO YOUR USE OF THE PLATFORM.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    )
}