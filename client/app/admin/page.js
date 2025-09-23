"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { adminAPI } from "../../lib/api";
import { useRouter } from "next/navigation";
import {
    Users,
    Mic,
    DollarSign,
    TrendingUp,
    Calendar,
    Loader2,
    BarChart3,
    Activity,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const response = await adminAPI.getDashboard();
            setStats(response.data.stats);
        } catch (error) {
            console.error("Fetch dashboard error:", error);
            if (error.response?.status === 403) {
                toast.error("Admin access required");
                router.push("/dashboard");
            } else {
                toast.error("Failed to load dashboard data");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Please sign in
                    </h2>
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 mb-6">
                        You don't have admin access to view this dashboard
                    </p>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Monitor platform usage, revenue, and user activity
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Users
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.users.total}
                                </p>
                                <p className="text-sm text-green-600">
                                    +{stats.users.newThisMonth} this month
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Meditations
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.meditations.total}
                                </p>
                                <p className="text-sm text-blue-600">
                                    {stats.meditations.completed} completed
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Mic className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Revenue
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${stats.revenue.total.toFixed(2)}
                                </p>
                                <p className="text-sm text-green-600">
                                    ${stats.revenue.thisMonth.toFixed(2)} this
                                    month
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Success Rate
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.meditations.total > 0
                                        ? Math.round(
                                              (stats.meditations.completed /
                                                  stats.meditations.total) *
                                                  100
                                          )
                                        : 0}
                                    %
                                </p>
                                <p className="text-sm text-gray-600">
                                    {stats.meditations.failed} failed
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Meditation Status */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-primary-600" />
                            <span>Meditation Status</span>
                        </h2>
                        <div className="space-y-4">
                            {stats.meditations.byStatus.map((status, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-gray-700 capitalize">
                                        {status._id.replace("_", " ")}
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {status.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue by Month */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-primary-600" />
                            <span>Revenue Trend</span>
                        </h2>
                        <div className="space-y-4">
                            {stats.revenue.byMonth
                                .slice(0, 6)
                                .map((month, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-gray-700">
                                            {new Date(
                                                month._id.year,
                                                month._id.month - 1
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            ${month.revenue.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Recent Meditations */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Recent Meditations
                        </h2>
                        <div className="space-y-4">
                            {stats.recent.meditations
                                .slice(0, 5)
                                .map((meditation, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {meditation.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {meditation.userId?.name ||
                                                    "Unknown User"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`status-badge ${
                                                    meditation.status ===
                                                    "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : meditation.status ===
                                                          "failed"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {meditation.status.replace(
                                                    "_",
                                                    " "
                                                )}
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(
                                                    meditation.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Recent Payments
                        </h2>
                        <div className="space-y-4">
                            {stats.recent.payments
                                .slice(0, 5)
                                .map((payment, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                ${payment.amount.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {payment.userId?.name ||
                                                    "Unknown User"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-900 capitalize">
                                                {payment.paymentMethod}
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(
                                                    payment.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
