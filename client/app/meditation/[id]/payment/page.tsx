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
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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

// Stripe Payment Form Component
const StripePaymentForm = ({
    meditationId,
    onPaymentSuccess,
}: {
    meditationId: string;
    onPaymentSuccess: () => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            // Create payment intent
            const response = await paymentAPI.createStripeIntent(meditationId);
            const { clientSecret } = response.data;

            // Confirm payment with Stripe
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error("Card element not found");
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: "Meditation User",
                        },
                    },
                }
            );

            if (error) {
                toast.error(`Payment failed: ${error.message}`);
            } else if (paymentIntent.status === "succeeded") {
                // Confirm payment on our backend
                await paymentAPI.confirmStripePayment(paymentIntent.id);
                toast.success(
                    "Payment successful! Processing your meditation..."
                );
                onPaymentSuccess();
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: "#424770",
                                "::placeholder": {
                                    color: "#aab7c4",
                                },
                            },
                            invalid: {
                                color: "#9e2146",
                            },
                        },
                    }}
                />
            </div>

            {/* Optional: Add billing details */}
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Name
                    </label>
                    <input
                        type="text"
                        placeholder="Full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        defaultValue="Test User"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                    </label>
                    <input
                        type="text"
                        placeholder="12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        defaultValue="10001"
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={!stripe || processing}
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
                        <span>Pay $29.90</span>
                    </>
                )}
            </button>
        </form>
    );
};

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

    const handlePaymentSuccess = async () => {
        await processMeditation();
    };

    const handlePayPalPayment = async () => {
        setProcessing(true);
        try {
            const response = await paymentAPI.createPayPalPayment(id);
            setPaypalApprovalUrl(response.data.approvalUrl);

            toast.success("Redirecting to PayPal...");

            // Redirect to PayPal
            window.location.href = response.data.approvalUrl;
        } catch (error) {
            console.error("PayPal payment error:", error);
            toast.error("Failed to create payment. Please try again.");
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
                                    $29.90
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

                        {/* Payment Form */}
                        {paymentMethod === "stripe" ? (
                            <Elements stripe={stripePromise}>
                                <StripePaymentForm
                                    meditationId={id}
                                    onPaymentSuccess={handlePaymentSuccess}
                                />
                            </Elements>
                        ) : (
                            <button
                                onClick={handlePayPalPayment}
                                disabled={processing}
                                className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Redirecting to PayPal...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        <span>Pay with PayPal</span>
                                    </>
                                )}
                            </button>
                        )}

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
