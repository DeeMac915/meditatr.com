"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Save, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface FormData {
    name: string;
    phoneNumber: string;
    preferences: {
        defaultVoice: string;
        defaultDuration: number;
        defaultBackgroundAudio: string;
    };
}

export default function ProfilePage() {
    const { user, userProfile, updateUserProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        phoneNumber: "",
        preferences: {
            defaultVoice: "female",
            defaultDuration: 10,
            defaultBackgroundAudio: "nature",
        },
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || "",
                phoneNumber: userProfile.phoneNumber || "",
                preferences: {
                    defaultVoice:
                        userProfile.preferences?.defaultVoice || "female",
                    defaultDuration:
                        userProfile.preferences?.defaultDuration || 10,
                    defaultBackgroundAudio:
                        userProfile.preferences?.defaultBackgroundAudio ||
                        "nature",
                },
            });
        }
    }, [userProfile]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        if (name.startsWith("preferences.")) {
            const prefKey = name.split(".")[1] as keyof FormData["preferences"];
            setFormData((prev) => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [prefKey]:
                        prefKey === "defaultDuration" ? parseInt(value) : value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateUserProfile(formData);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error("Failed to update profile");
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
                    <p className="text-gray-600 mb-6">
                        Sign in to view and edit your profile
                    </p>
                    <button
                        onClick={() => router.push("/auth/signin")}
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
                            Profile Settings
                        </h1>
                        <p className="text-gray-600">
                            Manage your account information and preferences
                        </p>
                    </div>
                    <div className="w-32"></div> {/* Spacer for centering */}
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Basic Information
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="form-input pl-10"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={user.email || ""}
                                            disabled
                                            className="form-input pl-10 bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Email cannot be changed
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="phoneNumber"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="form-input pl-10"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Used for SMS delivery of your
                                        meditations
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Meditation Preferences */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Meditation Preferences
                            </h2>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label
                                        htmlFor="defaultVoice"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Default Voice
                                    </label>
                                    <select
                                        id="defaultVoice"
                                        name="preferences.defaultVoice"
                                        value={
                                            formData.preferences.defaultVoice
                                        }
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="defaultDuration"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Default Duration
                                    </label>
                                    <select
                                        id="defaultDuration"
                                        name="preferences.defaultDuration"
                                        value={
                                            formData.preferences.defaultDuration
                                        }
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value={5}>5 minutes</option>
                                        <option value={10}>10 minutes</option>
                                        <option value={15}>15 minutes</option>
                                        <option value={20}>20 minutes</option>
                                        <option value={30}>30 minutes</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="defaultBackgroundAudio"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Default Background Audio
                                    </label>
                                    <select
                                        id="defaultBackgroundAudio"
                                        name="preferences.defaultBackgroundAudio"
                                        value={
                                            formData.preferences
                                                .defaultBackgroundAudio
                                        }
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="nature">
                                            Nature Sounds
                                        </option>
                                        <option value="ocean">
                                            Ocean Waves
                                        </option>
                                        <option value="rain">
                                            Rain Sounds
                                        </option>
                                        <option value="forest">
                                            Forest Ambience
                                        </option>
                                        <option value="528-hz">
                                            528 Hz Frequency
                                        </option>
                                        <option value="sleep">
                                            Sleep Tones
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Account Information
                            </h2>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">
                                            Account Type:
                                        </span>
                                        <p className="text-gray-900 capitalize">
                                            {userProfile?.subscription?.type ||
                                                "Free"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">
                                            Member Since:
                                        </span>
                                        <p className="text-gray-900">
                                            {userProfile?.createdAt
                                                ? new Date(
                                                      userProfile.createdAt
                                                  ).toLocaleDateString()
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span>
                                    {loading ? "Saving..." : "Save Changes"}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
