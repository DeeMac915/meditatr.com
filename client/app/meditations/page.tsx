"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Download, Clock, Loader2, Heart } from "lucide-react";
import { meditationAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface Meditation {
    _id: string;
    title: string;
    status: string;
    inputData: {
        goal: string;
        duration: number;
        voicePreference: string;
        backgroundAudio: string;
    };
    audio?: {
        finalAudioUrl: string;
    };
    createdAt: string;
}

export default function MeditationsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [meditations, setMeditations] = useState<Meditation[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/signin");
            return;
        }

        if (user) {
            fetchMeditations();
        }
    }, [user, loading, router]);

    const fetchMeditations = async () => {
        try {
            const response = await meditationAPI.getMeditations({});
            setMeditations(response.data.meditations || []);
        } catch (error) {
            console.error("Error fetching meditations:", error);
            toast.error("Failed to load meditations");
        } finally {
            setLoadingData(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "processing":
                return "bg-yellow-100 text-yellow-800";
            case "failed":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed":
                return "Ready";
            case "processing":
                return "Processing";
            case "failed":
                return "Failed";
            case "script_generated":
                return "Ready to Pay";
            default:
                return "Pending";
        }
    };

    const handleDownload = (meditation: Meditation) => {
        if (meditation.audio?.finalAudioUrl) {
            const link = document.createElement("a");
            link.href = meditation.audio.finalAudioUrl;
            link.download = `${meditation.title}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (loading || loadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your meditations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                            My Meditations
                        </h1>
                        <p className="text-gray-600">
                            All your personalized meditations in one place
                        </p>
                    </div>
                    <div className="w-32"></div> {/* Spacer for centering */}
                </div>

                {/* Meditations Grid */}
                {meditations.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No meditations yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Create your first personalized meditation to get
                            started.
                        </p>
                        <Link
                            href="/create"
                            className="btn-primary inline-flex items-center"
                        >
                            Create Meditation
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {meditations.map((meditation) => (
                            <div
                                key={meditation._id}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                            >
                                {/* Status Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            meditation.status
                                        )}`}
                                    >
                                        {getStatusText(meditation.status)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(
                                            meditation.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {meditation.title}
                                </h3>

                                {/* Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {meditation.inputData.duration} minutes
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <strong>Goal:</strong>{" "}
                                        {meditation.inputData.goal}
                                    </p>
                                    <p className="text-sm text-gray-600 capitalize">
                                        <strong>Voice:</strong>{" "}
                                        {meditation.inputData.voicePreference}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col space-y-2">
                                    {meditation.status === "completed" &&
                                    meditation.audio?.finalAudioUrl ? (
                                        <>
                                            <Link
                                                href={`/meditation/${meditation._id}/complete`}
                                                className="btn-primary flex items-center justify-center text-sm"
                                            >
                                                <Play className="w-4 h-4 mr-2" />
                                                Play
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDownload(meditation)
                                                }
                                                className="btn-outline flex items-center justify-center text-sm"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </button>
                                        </>
                                    ) : meditation.status ===
                                      "script_generated" ? (
                                        <Link
                                            href={`/meditation/${meditation._id}/payment`}
                                            className="btn-primary text-sm text-center"
                                        >
                                            Complete Payment
                                        </Link>
                                    ) : meditation.status === "processing" ? (
                                        <Link
                                            href={`/meditation/${meditation._id}/complete`}
                                            className="btn-outline text-sm text-center"
                                        >
                                            View Progress
                                        </Link>
                                    ) : meditation.status === "failed" ? (
                                        <Link
                                            href={`/meditation/${meditation._id}/complete`}
                                            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm text-center hover:bg-red-200"
                                        >
                                            View Error
                                        </Link>
                                    ) : (
                                        <span className="text-gray-500 text-sm text-center">
                                            {meditation.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
