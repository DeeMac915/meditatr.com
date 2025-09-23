"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { meditationAPI } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus,
    Play,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    Mic,
    Music,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const [meditations, setMeditations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
    });

    useEffect(() => {
        if (user) {
            fetchMeditations();
        }
    }, [user]);

    const fetchMeditations = async () => {
        try {
            const response = await meditationAPI.getMeditations({ limit: 20 });
            setMeditations(response.data.meditations);

            // Calculate stats
            const total = response.data.meditations.length;
            const completed = response.data.meditations.filter(
                (m) => m.status === "completed"
            ).length;
            const pending = response.data.meditations.filter((m) =>
                [
                    "pending",
                    "script_generated",
                    "voice_generated",
                    "audio_mixed",
                ].includes(m.status)
            ).length;
            const failed = response.data.meditations.filter(
                (m) => m.status === "failed"
            ).length;

            setStats({ total, completed, pending, failed });
        } catch (error) {
            console.error("Fetch meditations error:", error);
            toast.error("Failed to load meditations");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "failed":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                );
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "pending":
                return "Generating Script";
            case "script_generated":
                return "Ready for Payment";
            case "voice_generated":
                return "Creating Audio";
            case "audio_mixed":
                return "Finalizing";
            case "completed":
                return "Ready";
            case "failed":
                return "Failed";
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "failed":
                return "bg-red-100 text-red-800";
            default:
                return "bg-blue-100 text-blue-800";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Please sign in
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Sign in to view your meditation dashboard
                    </p>
                    <button
                        onClick={() => router.push("/auth/login")}
                        className="btn-primary"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back,{" "}
                            {userProfile?.name || user.displayName || "User"}!
                        </h1>
                        <p className="text-gray-600">
                            Manage your personalized meditations and create new
                            ones
                        </p>
                    </div>

                    <Link
                        href="/create"
                        className="mt-4 sm:mt-0 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Create New Meditation</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Meditations
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Mic className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Completed
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.completed}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    In Progress
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.pending}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Failed
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    {stats.failed}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meditations List */}
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Your Meditations
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                            <p className="text-gray-600">
                                Loading your meditations...
                            </p>
                        </div>
                    ) : meditations.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mic className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No meditations yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first personalized meditation to get
                                started
                            </p>
                            <Link
                                href="/create"
                                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 inline-flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Create Your First Meditation</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {meditations.map((meditation) => (
                                <div
                                    key={meditation._id}
                                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {meditation.title}
                                                </h3>
                                                <span
                                                    className={`status-badge ${getStatusColor(
                                                        meditation.status
                                                    )}`}
                                                >
                                                    {getStatusText(
                                                        meditation.status
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                                                <div className="flex items-center space-x-1">
                                                    <Clock size={14} />
                                                    <span>
                                                        {
                                                            meditation.inputData
                                                                .duration
                                                        }{" "}
                                                        min
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Mic size={14} />
                                                    <span className="capitalize">
                                                        {
                                                            meditation.inputData
                                                                .voicePreference
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Music size={14} />
                                                    <span className="capitalize">
                                                        {
                                                            meditation.inputData
                                                                .backgroundAudio
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar size={14} />
                                                    <span>
                                                        {formatDate(
                                                            meditation.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm">
                                                <span className="font-medium">
                                                    Goal:
                                                </span>{" "}
                                                {meditation.inputData.goal}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(meditation.status)}

                                            <div className="flex space-x-2">
                                                {meditation.status ===
                                                    "script_generated" && (
                                                    <Link
                                                        href={`/meditation/${meditation._id}/edit`}
                                                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200 transition-colors duration-200"
                                                    >
                                                        Edit & Pay
                                                    </Link>
                                                )}

                                                {meditation.status ===
                                                    "completed" && (
                                                    <>
                                                        <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200">
                                                            <Play size={16} />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200">
                                                            <Download
                                                                size={16}
                                                            />
                                                        </button>
                                                    </>
                                                )}

                                                {meditation.status ===
                                                    "failed" && (
                                                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors duration-200">
                                                        Retry
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
