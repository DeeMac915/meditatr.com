"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function PayPalCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Payment Cancelled
                </h1>
                <p className="text-gray-600 mb-6">
                    You cancelled the PayPal payment. No charges were made to
                    your account.
                </p>
                <div className="space-x-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="btn-primary"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="btn-outline"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}
