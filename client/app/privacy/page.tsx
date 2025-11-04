export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Privacy Policy
                    </h1>

                    <div className="prose max-w-none">
                        <p className="text-gray-600 mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            1. Information We Collect
                        </h2>
                        <p className="text-gray-700 mb-6">
                            We collect information you provide directly to us,
                            such as when you create an account, create a
                            meditation, or contact us for support.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            2. How We Use Your Information
                        </h2>
                        <p className="text-gray-700 mb-6">
                            We use the information we collect to provide,
                            maintain, and improve our services, process
                            payments, and communicate with you.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            3. Information Sharing
                        </h2>
                        <p className="text-gray-700 mb-6">
                            We do not sell, trade, or otherwise transfer your
                            personal information to third parties without your
                            consent, except as described in this policy.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            4. Data Security
                        </h2>
                        <p className="text-gray-700 mb-6">
                            We implement appropriate security measures to
                            protect your personal information against
                            unauthorized access, alteration, disclosure, or
                            destruction.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            5. Your Rights
                        </h2>
                        <p className="text-gray-700 mb-6">
                            You have the right to access, update, or delete your
                            personal information. You can do this by contacting
                            us or using the account settings.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            6. Cookies
                        </h2>
                        <p className="text-gray-700 mb-6">
                            We use cookies and similar technologies to enhance
                            your experience on our platform and analyze usage
                            patterns.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            7. Contact Us
                        </h2>
                        <p className="text-gray-700 mb-6">
                            If you have any questions about this Privacy Policy,
                            please contact us at privacy@meditatr.com.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
