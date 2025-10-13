"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { meditationAPI, paymentAPI } from "@/lib/api";
import {
    CreditCard,
    Smartphone,
    Check,
    ArrowLeft,
    Loader2,
    Lock,
    Shield,
} from "lucide-react";
import toast from "react-hot-toast";

interface Meditation {
    _id: string;
    title: string;
    inputData: {
        goal: string;
        duration: number;
        voicePreference: string;
        backgroundAudio: string;
    };
}

export default function PaymentPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [meditation, setMeditation] = useState<Meditation | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("stripe");
    const [stripeClientSecret, setStripeClientSecret] = useState("");
    const [paypalApprovalUrl, setPaypalApprovalUrl] = useState("");

    useEffect(() => {
        if (id && user) {
            fetchMeditation();
        }
    }, [id, user]);

    const fetchMeditation = async () => {
        try {
            const response = await meditationAPI.getMeditation(id);
            setMeditation(response.data.meditation);
        } catch (error) {
            console.error("Fetch meditation error:", error);
            toast.error("Failed to load meditation");
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleStripePayment = async () => {
        setProcessing(true);
        try {
            const response = await paymentAPI.createStripeIntent(id);
            setStripeClientSecret(response.data.clientSecret);

            // In a real implementation, you would integrate with Stripe Elements here
            // For this MVP, we'll simulate the payment process
            toast.success(
                "Stripe payment intent created. Redirecting to payment..."
            );

            // Simulate payment success after 2 seconds
            setTimeout(async () => {
                try {
                    await paymentAPI.confirmStripePayment(
                        response.data.paymentIntentId
                    );
                    toast.success(
                        "Payment successful! Processing your meditation..."
                    );
                    await processMeditation();
                } catch (error) {
                    console.error("Payment confirmation error:", error);
                    toast.error("Payment failed. Please try again.");
                }
            }, 2000);
        } catch (error) {
            console.error("Stripe payment error:", error);
            toast.error("Failed to create payment. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handlePayPalPayment = async () => {
        setProcessing(true);
        try {
            const response = await paymentAPI.createPayPalPayment(id);
            setPaypalApprovalUrl(response.data.approvalUrl);

            // In a real implementation, you would redirect to PayPal here
            toast.success("PayPal payment created. Redirecting to PayPal...");

            // Simulate PayPal payment success after 2 seconds
            setTimeout(async () => {
                try {
                    // Simulate PayPal payment execution
                    await paymentAPI.executePayPalPayment(
                        response.data.paymentId,
                        "simulated_payer_id"
                    );
                    toast.success(
                        "Payment successful! Processing your meditation..."
                    );
                    await processMeditation();
                } catch (error) {
                    console.error("PayPal payment error:", error);
                    toast.error("Payment failed. Please try again.");
                }
            }, 2000);
        } catch (error) {
            console.error("PayPal payment error:", error);
            toast.error("Failed to create payment. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const processMeditation = async () => {
        try {
            // Start processing (returns immediately)
            await meditationAPI.processMeditation(id);

            toast.success("Processing started! Redirecting you now...");

            // Redirect to completion page which will poll for status
            router.push(`/meditation/${id}/complete`);
        } catch (error) {
            console.error("Meditation processing error:", error);
            toast.error(
                "Failed to start meditation processing. Please contact support."
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                        Loading payment information...
                    </p>
                </div>
            </div>
        );
    }

    if (!meditation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Meditation not found
                    </h2>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="btn-primary"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push(`/meditation/${id}/edit`)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Edit</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Complete Your Purchase
                        </h1>
                        <p className="text-gray-600">
                            Secure payment to generate your personalized
                            meditation
                        </p>
                    </div>
                    <div className="w-32"></div> {/* Spacer for centering */}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Meditation Summary */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Your Meditation
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Title:
                                </span>
                                <p className="text-gray-900 font-medium">
                                    {meditation.title}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Goal:
                                </span>
                                <p className="text-gray-900">
                                    {meditation.inputData.goal}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Duration:
                                </span>
                                <p className="text-gray-900">
                                    {meditation.inputData.duration} minutes
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Voice:
                                </span>
                                <p className="text-gray-900 capitalize">
                                    {meditation.inputData.voicePreference}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Background:
                                </span>
                                <p className="text-gray-900 capitalize">
                                    {meditation.inputData.backgroundAudio}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">
                                    Total
                                </span>
                                <span className="text-2xl font-bold text-primary-600">
                                    $4.99
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                One-time payment • No subscription required
                            </p>
                        </div>
                    </div>

                    {/* Payment Options */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Payment Method
                        </h2>

                        {/* Payment Method Selection */}
                        <div className="space-y-4 mb-8">
                            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors duration-200">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="stripe"
                                    checked={paymentMethod === "stripe"}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                    className="text-primary-600 focus:ring-primary-500"
                                />
                                <div className="ml-4 flex items-center space-x-3">
                                    <CreditCard className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            Credit/Debit Card
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Visa, Mastercard, American Express
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors duration-200">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="paypal"
                                    checked={paymentMethod === "paypal"}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                    className="text-primary-600 focus:ring-primary-500"
                                />
                                <div className="ml-4 flex items-center space-x-3">
                                    <Smartphone className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            PayPal
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Pay with your PayPal account
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Payment Button */}
                        <button
                            onClick={
                                paymentMethod === "stripe"
                                    ? handleStripePayment
                                    : handlePayPalPayment
                            }
                            disabled={processing}
                            className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing Payment...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    <span>Pay $4.99</span>
                                </>
                            )}
                        </button>

                        {/* Security Notice */}
                        <div className="mt-6 flex items-center space-x-2 text-sm text-gray-500">
                            <Shield className="w-4 h-4" />
                            <span>Your payment is secure and encrypted</span>
                        </div>
                    </div>
                </div>

                {/* What Happens Next */}
                <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        What happens next?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-primary-600 font-bold text-lg">
                                    1
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Payment Processing
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Your payment is processed securely through
                                Stripe or PayPal
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-primary-600 font-bold text-lg">
                                    2
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                AI Processing
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Your script is converted to voice and mixed with
                                background audio
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-primary-600 font-bold text-lg">
                                    3
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Delivery
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Receive your meditation via email, SMS, and
                                in-browser playback
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
