"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { paymentAPI, meditationAPI } from "@/lib/api";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function PayPalSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading"
    );
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!user) {
            router.push("/auth/signin");
            return;
        }

        const paymentId = searchParams.get("paymentId");
        const payerId = searchParams.get("PayerID");
        const meditationId = searchParams.get("meditationId");

        if (!paymentId || !payerId) {
            setStatus("error");
            setErrorMessage("Missing payment information");
            return;
        }

        if (!meditationId) {
            setStatus("error");
            setErrorMessage("Missing meditation information");
            return;
        }

        executePayment(paymentId, payerId, meditationId);
    }, [user, searchParams, router]);

    const executePayment = async (
        paymentId: string,
        payerId: string,
        meditationId: string
    ) => {
        try {
            await paymentAPI.executePayPalPayment(paymentId, payerId);
            setStatus("success");
            toast.success("Payment completed successfully!");

            // Process the meditation
            try {
                await meditationAPI.processMeditation(meditationId);
                toast.success("Processing started! Redirecting you now...");

                // Redirect to meditation completion page
                setTimeout(() => {
                    router.push(`/meditation/${meditationId}/complete`);
                }, 2000);
            } catch (processError) {
                console.error("Meditation processing error:", processError);
                // Still redirect to dashboard even if processing fails
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
            }
        } catch (error) {
            console.error("PayPal payment execution error:", error);
            setStatus("error");
            setErrorMessage("Payment failed. Please try again.");
            toast.error("Payment failed. Please try again.");
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-primary-600 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Processing Payment...
                    </h1>
                    <p className="text-gray-600">
                        Please wait while we confirm your PayPal payment.
                    </p>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Payment Failed
                    </h1>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Payment Successful!
                </h1>
                <p className="text-gray-600 mb-6">
                    Your meditation is being processed. You'll be redirected to
                    your dashboard shortly.
                </p>
                <div className="animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                </div>
            </div>
        </div>
    );
}
