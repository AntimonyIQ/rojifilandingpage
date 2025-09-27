export const seoConfig = {
    homepage: {
        title: "Global Transactions Made Simple for Local Businesses",
        description: "Rojifi is a modern digital finance platform providing secure, fast, and reliable financial services. Join thousands of users managing their finances with confidence.",
        keywords: "rojifi, digital finance, financial platform, secure banking, online finance, financial services",
        canonical: "/",
    },
    about: {
        title: "About Us",
        description: "Learn about Rojifi's mission to revolutionize digital finance. Discover our team, values, and commitment to secure financial services.",
        keywords: "about rojifi, company information, mission, team, digital finance innovation",
        canonical: "/about",
    },
    cards: {
        title: "Virtual Cards",
        description: "Get instant virtual cards for secure online payments and international transactions. Manage your spending with Rojifi's advanced card solutions.",
        keywords: "virtual cards, online payments, secure transactions, digital cards, international payments",
        canonical: "/cards",
    },
    contactus: {
        title: "Contact Us",
        description: "Get in touch with Rojifi's support team. We're here to help with your digital finance needs and answer any questions you may have.",
        keywords: "contact rojifi, customer support, help, contact form, get in touch",
        canonical: "/contactus",
    },
    help: {
        title: "Help Center",
        description: "Find help and support for using Rojifi's digital finance platform. Access guides, tutorials, and troubleshooting resources.",
        keywords: "help center, support, guides, tutorials, rojifi help, customer service",
        canonical: "/help",
    },
    multicurrency: {
        title: "Multi-Currency Solutions",
        description: "Manage multiple currencies with ease using Rojifi's advanced multi-currency wallet and exchange solutions for global transactions.",
        keywords: "multi-currency, currency exchange, global payments, foreign exchange, international finance",
        canonical: "/multicurrency",
    },
    otc: {
        title: "OTC Trading",
        description: "Access over-the-counter trading services with Rojifi. Enjoy competitive rates and secure transactions for large volume trades.",
        keywords: "OTC trading, over-the-counter, large volume trades, currency trading, wholesale trading",
        canonical: "/otc",
    },
    privacy: {
        title: "Privacy Policy",
        description: "Read Rojifi's privacy policy to understand how we protect and handle your personal information and financial data.",
        keywords: "privacy policy, data protection, terms and conditions, legal, user privacy",
        canonical: "/privacy",
    },
    "request-access": {
        title: "Request Access",
        description: "Request access to Rojifi's exclusive financial services. Join our platform and start your digital finance journey today.",
        keywords: "request access, join rojifi, exclusive access, platform registration, early access",
        canonical: "/request-access",
    },
    "forgot-password": {
        title: "Forgot Password",
        description: "Reset your Rojifi account password securely. Follow our simple steps to regain access to your account.",
        keywords: "forgot password, reset password, account recovery, password help",
        canonical: "/forgot-password",
    },
    "reset-password": {
        title: "Reset Password",
        description: "Create a new secure password for your Rojifi account. Complete the password reset process safely.",
        keywords: "reset password, new password, account security, password change",
        canonical: "/reset-password",
    },
    onboarding: {
        title: "Get Started",
        description: "Welcome to Rojifi! Complete your onboarding process to start using our comprehensive digital finance platform.",
        keywords: "onboarding, get started, setup account, welcome, new user",
        canonical: "/onboarding",
    },
    "verify-email": {
        title: "Verify Email",
        description: "Verify your email address to secure your Rojifi account and access all platform features.",
        keywords: "verify email, email verification, account security, email confirmation",
        canonical: "/verify-email",
    },
    faq: {
        title: "Frequently Asked Questions",
        description: "Find answers to common questions about Rojifi's digital finance platform, services, security, and account management.",
        keywords: "FAQ, help, support, questions, answers, rojifi help, frequently asked questions",
        canonical: "/faq",
    },
    terms: {
        title: "Terms & Conditions",
        description: "Read Rojifi's terms and conditions to understand the rules and guidelines for using our digital finance platform and services.",
        keywords: "terms and conditions, terms of service, legal agreement, user agreement, platform rules",
        canonical: "/terms",
    },
} as const;

export type SEOPageKey = keyof typeof seoConfig;
