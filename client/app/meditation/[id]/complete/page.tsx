"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { meditationAPI } from "@/lib/api";
import {
    CheckCircle,
    Download,
    Mail,
    Smartphone,
    Play,
    ArrowLeft,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Meditation {
    _id: string;
    title: string;
    status: string;
    error?: string;
    inputData: {
        duration: number;
        voicePreference: string;
        backgroundAudio: string;
    };
    audio?: {
        finalAudioUrl: string;
    };
    delivery?: {
        emailSent: boolean;
        smsSent: boolean;
    };
}

export default function CompletePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [meditation, setMeditation] = useState<Meditation | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [pollingTimer, setPollingTimer] = useState<NodeJS.Timeout | null>(
        null
    );

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (pollingTimer) {
                clearTimeout(pollingTimer);
            }
        };
    }, [pollingTimer]);

    useEffect(() => {
        if (id && user) {
            fetchMeditation();
        }
    }, [id, user]);

    const fetchMeditation = async () => {
        try {
            const response = await meditationAPI.getMeditation(id);
            const med = response.data.meditation;
            setMeditation(med);

            // If still processing, continue polling with exponential backoff
            if (med.status === "processing") {
                setProcessing(true);

                // Stop polling after 10 minutes (20 retries)
                if (retryCount >= 20) {
                    setProcessing(false);
                    toast.error(
                        "Processing is taking longer than expected. Please check back later."
                    );
                    return;
                }

                // Exponential backoff: 3s, 5s, 8s, 10s, then 10s intervals
                const delay =
                    retryCount < 3
                        ? 3000
                        : retryCount < 5
                        ? 5000
                        : retryCount < 8
                        ? 8000
                        : 10000;

                const timer = setTimeout(() => {
                    setRetryCount((prev) => prev + 1);
                    fetchMeditation();
                }, delay);

                setPollingTimer(timer);
            } else if (med.status === "completed") {
                setProcessing(false);
                if (pollingTimer) {
                    clearTimeout(pollingTimer);
                    setPollingTimer(null);
                }
                if (loading) {
                    toast.success("Your meditation is ready! 🎉");
                }
            } else if (med.status === "failed") {
                setProcessing(false);
                if (pollingTimer) {
                    clearTimeout(pollingTimer);
                    setPollingTimer(null);
                }
                toast.error(
                    "Meditation processing failed. Please contact support."
                );
            }
        } catch (error: any) {
            console.error("Fetch meditation error:", error);

            // If it's a rate limit error, stop polling
            if (error.response?.status === 429) {
                setProcessing(false);
                toast.error(
                    "Too many requests. Please refresh the page to check status."
                );
                return;
            }

            // For other errors, try a few more times with longer delays
            if (retryCount < 5) {
                const timer = setTimeout(() => {
                    setRetryCount((prev) => prev + 1);
                    fetchMeditation();
                }, 10000); // 10 second delay for errors
                setPollingTimer(timer);
            } else {
                toast.error("Failed to load meditation");
                router.push("/dashboard");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (meditation?.audio?.finalAudioUrl) {
            const link = document.createElement("a");
            link.href = meditation.audio.finalAudioUrl;
            link.download = `${meditation.title}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your meditation...</p>
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

    // Show failed view
    if (meditation.status === "failed") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-red-900 mb-4">
                            Processing Failed ❌
                        </h1>
                        <p className="text-gray-600 text-lg">
                            We encountered an error while creating your
                            meditation
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-red-900 mb-4">
                                Error Details
                            </h2>
                            <p className="text-red-700 mb-6">
                                {meditation.error ||
                                    "An unknown error occurred during processing."}
                            </p>
                            <div className="space-x-4">
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="btn-primary"
                                >
                                    Back to Dashboard
                                </button>
                                <button
                                    onClick={() => router.push("/create")}
                                    className="bg-white text-primary-600 border border-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <h3 className="font-semibold text-yellow-900 mb-2">
                            Need Help?
                        </h3>
                        <p className="text-yellow-800">
                            If this issue persists, please contact our support
                            team with meditation ID:{" "}
                            <strong>{meditation._id}</strong>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show processing view
    if (processing || meditation.status === "processing") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Creating Your Meditation ✨
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Please wait while we generate your personalized
                            meditation...
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-16 h-16 animate-spin text-primary-600 mb-6" />

                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Processing in Progress
                            </h2>

                            <p className="text-gray-600 mb-8 text-center max-w-md">
                                We're generating your voice narration, mixing it
                                with background audio, and preparing everything
                                for delivery. This typically takes 2-5 minutes.
                            </p>

                            <div className="w-full max-w-md space-y-4">
                                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                                        <span className="text-blue-700 font-bold">
                                            1
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Voice Generation
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Creating AI narration from your
                                            script
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                                        <span className="text-purple-700 font-bold">
                                            2
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Audio Mixing
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Combining voice with background
                                            music
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                                        <span className="text-green-700 font-bold">
                                            3
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Final Delivery
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Preparing email and SMS delivery
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800 text-center mb-4">
                                    💡 <strong>Tip:</strong> You can safely
                                    leave this page. We'll email and text you
                                    when your meditation is ready!
                                </p>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => {
                                            setRetryCount(0);
                                            fetchMeditation();
                                        }}
                                        className="text-sm bg-white text-primary-600 border border-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                                    >
                                        🔄 Check Status Manually
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Your Meditation is Ready! 🎉
                        </h1>
                        <p className="text-gray-600">
                            Your personalized meditation has been created and
                            delivered
                        </p>
                    </div>
                    <div className="w-32"></div> {/* Spacer for centering */}
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                            <h2 className="text-lg font-semibold text-green-800">
                                Meditation Complete!
                            </h2>
                            <p className="text-green-700">
                                Your meditation "{meditation.title}" has been
                                successfully created and delivered to your email
                                and phone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Meditation Details */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Meditation Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
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

                    {/* Audio Player */}
                    {meditation.audio?.finalAudioUrl && (
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Listen to Your Meditation
                            </h3>
                            <div className="audio-player">
                                <audio
                                    controls
                                    className="w-full mb-4"
                                    preload="metadata"
                                >
                                    <source
                                        src={meditation.audio.finalAudioUrl}
                                        type="audio/mpeg"
                                    />
                                    Your browser does not support the audio
                                    element.
                                </audio>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    {meditation.audio?.finalAudioUrl && (
                        <>
                            <button
                                onClick={handleDownload}
                                className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                            >
                                <Download size={20} />
                                <span>Download MP3</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition-colors duration-200">
                                <Play size={20} />
                                <span>Play Now</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Delivery Status */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Delivery Status
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    meditation.delivery?.emailSent
                                        ? "bg-green-100"
                                        : "bg-gray-100"
                                }`}
                            >
                                <Mail
                                    size={16}
                                    className={
                                        meditation.delivery?.emailSent
                                            ? "text-green-600"
                                            : "text-gray-400"
                                    }
                                />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    Email Delivery
                                </p>
                                <p className="text-sm text-gray-500">
                                    {meditation.delivery?.emailSent
                                        ? "Sent successfully"
                                        : "Pending"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    meditation.delivery?.smsSent
                                        ? "bg-green-100"
                                        : "bg-gray-100"
                                }`}
                            >
                                <Smartphone
                                    size={16}
                                    className={
                                        meditation.delivery?.smsSent
                                            ? "text-green-600"
                                            : "text-gray-400"
                                    }
                                />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    SMS Delivery
                                </p>
                                <p className="text-sm text-gray-500">
                                    {meditation.delivery?.smsSent
                                        ? "Sent successfully"
                                        : "Pending"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        What's Next?
                    </h2>
                    <div className="space-y-3">
                        <p className="text-gray-700">
                            • Your meditation is now saved in your personal
                            library
                        </p>
                        <p className="text-gray-700">
                            • You can access it anytime from your dashboard
                        </p>
                        <p className="text-gray-700">
                            • Create more personalized meditations for different
                            needs
                        </p>
                        <p className="text-gray-700">
                            • Share your experience with friends and family
                        </p>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => router.push("/create")}
                            className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                        >
                            <span>Create Another Meditation</span>
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="flex items-center justify-center space-x-2 border border-primary-600 text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                        >
                            <span>View My Library</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
