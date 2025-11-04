export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Terms of Service
                    </h1>

                    <div className="prose max-w-none">
                        <p className="text-gray-600 mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-gray-700 mb-6">
                            By accessing and using the Meditatr platform, you
                            accept and agree to be bound by the terms and
                            provision of this agreement.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            2. Use License
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Permission is granted to temporarily download one
                            copy of the materials on Meditatr for personal,
                            non-commercial transitory viewing only.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            3. Payment Terms
                        </h2>
                        <p className="text-gray-700 mb-6">
                            All meditation purchases are final. We offer a
                            pay-per-meditation model at $4.99 per meditation. No
                            refunds are provided once the meditation has been
                            generated.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            4. Privacy Policy
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Your privacy is important to us. Please review our
                            Privacy Policy, which also governs your use of the
                            platform.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            5. Disclaimer
                        </h2>
                        <p className="text-gray-700 mb-6">
                            The materials on Meditatr are provided on an 'as is'
                            basis. Meditatr makes no warranties, expressed or
                            implied, and hereby disclaims and negates all other
                            warranties.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            6. Limitations
                        </h2>
                        <p className="text-gray-700 mb-6">
                            In no event shall Meditatr or its suppliers be
                            liable for any damages arising out of the use or
                            inability to use the materials on Meditatr.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            7. Contact Information
                        </h2>
                        <p className="text-gray-700 mb-6">
                            If you have any questions about these Terms of
                            Service, please contact us at support@meditatr.com.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
