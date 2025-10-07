"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus,
    Play,
    Download,
    Clock,
    Target,
    Heart,
    LogOut,
} from "lucide-react";

interface Meditation {
    id: string;
    goal: string;
    duration: number;
    status: string;
    createdAt: string;
    audioUrl?: string;
}

interface UserStats {
    totalMeditations: number;
    totalSpent: number;
}

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [meditations, setMeditations] = useState<Meditation[]>([]);
    const [userStats, setUserStats] = useState<UserStats>({
        totalMeditations: 0,
        totalSpent: 0,
    });
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/signin");
            return;
        }

        if (user) {
            fetchUserData();
        }
    }, [user, loading, router]);

    const fetchUserData = async () => {
        try {
            const token = await user?.getIdToken();

            // Fetch user profile and meditations in parallel
            const [profileResponse, meditationsResponse] = await Promise.all([
                fetch("/api/auth/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch("/api/meditation", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                setUserStats({
                    totalMeditations: profileData.totalMeditations || 0,
                    totalSpent: profileData.totalSpent || 0,
                });
            }

            if (meditationsResponse.ok) {
                const meditationsData = await meditationsResponse.json();
                setMeditations(meditationsData.meditations || []);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            // Ensure meditations is always an array
            setMeditations([]);
        } finally {
            setLoadingData(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "status-completed";
            case "processing":
                return "status-processing";
            case "failed":
                return "status-failed";
            default:
                return "status-pending";
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

    if (loading || loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                                Welcome back, {user?.displayName || "User"}!
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                Manage your personalized meditations and create
                                new ones.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <Link
                                href="/create-meditation"
                                className="btn-primary flex items-center justify-center"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                <span className="hidden sm:inline">
                                    Create New Meditation
                                </span>
                                <span className="sm:hidden">
                                    Create Meditation
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Heart className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Total Meditations
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {userStats.totalMeditations}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Total Spent
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${userStats.totalSpent.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    This Month
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        (meditations || []).filter((m) => {
                                            const created = new Date(
                                                m.createdAt
                                            );
                                            const now = new Date();
                                            return (
                                                created.getMonth() ===
                                                    now.getMonth() &&
                                                created.getFullYear() ===
                                                    now.getFullYear()
                                            );
                                        }).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meditations List */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Your Meditations
                        </h2>
                        {(meditations || []).length > 0 && (
                            <Link
                                href="/meditations"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View All
                            </Link>
                        )}
                    </div>

                    {(meditations || []).length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No meditations yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first personalized meditation to get
                                started on your wellness journey.
                            </p>
                            <Link
                                href="/create-meditation"
                                className="btn-primary flex items-center"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create Your First Meditation
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(meditations || [])
                                .slice(0, 5)
                                .map((meditation) => (
                                    <div
                                        key={meditation.id}
                                        className="meditation-card"
                                    >
                                        <div className="meditation-card-header">
                                            <div>
                                                <h3 className="meditation-card-title">
                                                    {meditation.goal}
                                                </h3>
                                                <div className="meditation-card-meta">
                                                    <span className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {meditation.duration}{" "}
                                                        minutes
                                                    </span>
                                                    <span className="mx-2">
                                                        •
                                                    </span>
                                                    <span>
                                                        {new Date(
                                                            meditation.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
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

                                        <div className="meditation-card-actions">
                                            {meditation.status ===
                                                "completed" &&
                                            meditation.audioUrl ? (
                                                <>
                                                    <button className="btn-primary flex items-center">
                                                        <Play className="w-4 h-4 mr-2" />
                                                        Play
                                                    </button>
                                                    <button className="btn-outline flex items-center">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </button>
                                                </>
                                            ) : meditation.status ===
                                              "script_generated" ? (
                                                <Link
                                                    href={`/meditation/${meditation.id}/payment`}
                                                    className="btn-primary"
                                                >
                                                    Complete Payment
                                                </Link>
                                            ) : (
                                                <span className="text-gray-500 text-sm">
                                                    {meditation.status ===
                                                    "processing"
                                                        ? "Your meditation is being processed..."
                                                        : "Processing..."}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Link
                                href="/create-meditation"
                                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                                    <Plus className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Create New Meditation
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Generate a personalized meditation
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="/meditations"
                                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <Heart className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        View All Meditations
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Browse your meditation library
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Recent Activity
                        </h3>
                        {(meditations || []).length > 0 ? (
                            <div className="space-y-3">
                                {(meditations || [])
                                    .slice(0, 3)
                                    .map((meditation) => (
                                        <div
                                            key={meditation.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {meditation.goal}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {new Date(
                                                        meditation.createdAt
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span
                                                className={`status-badge ${getStatusColor(
                                                    meditation.status
                                                )} text-xs`}
                                            >
                                                {getStatusText(
                                                    meditation.status
                                                )}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-sm">
                                No recent activity
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
