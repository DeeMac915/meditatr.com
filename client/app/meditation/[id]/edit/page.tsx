"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { meditationAPI } from "@/lib/api";
import {
    Edit3,
    RotateCcw,
    Check,
    ArrowLeft,
    Loader2,
    Save,
    RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface Meditation {
    _id: string;
    title: string;
    inputData: {
        goal: string;
        mood: string;
        duration: number;
        voicePreference: string;
    };
    script: {
        final: string;
    };
}

interface RewriteOptions {
    tone: string;
    length: string;
}

export default function EditMeditationPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [meditation, setMeditation] = useState<Meditation | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [rewriting, setRewriting] = useState(false);
    const [script, setScript] = useState("");
    const [rewriteOptions, setRewriteOptions] = useState<RewriteOptions>({
        tone: "",
        length: "",
    });

    useEffect(() => {
        if (id && user) {
            fetchMeditation();
        }
    }, [id, user]);

    const fetchMeditation = async () => {
        try {
            const response = await meditationAPI.getMeditation(id);
            setMeditation(response.data.meditation);
            setScript(response.data.meditation.script.final);
        } catch (error) {
            console.error("Fetch meditation error:", error);
            toast.error("Failed to load meditation");
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveScript = async () => {
        if (!script.trim()) {
            toast.error("Script cannot be empty");
            return;
        }

        setSaving(true);
        try {
            await meditationAPI.updateScript(id, script);
            toast.success("Script updated successfully!");
        } catch (error) {
            console.error("Save script error:", error);
            toast.error("Failed to save script");
        } finally {
            setSaving(false);
        }
    };

    const handleRewrite = async () => {
        if (!rewriteOptions.tone && !rewriteOptions.length) {
            toast.error("Please specify tone or length changes");
            return;
        }

        setRewriting(true);
        try {
            const response = await meditationAPI.rewriteScript(
                id,
                rewriteOptions
            );
            setScript(response.data.meditation.script);
            setRewriteOptions({ tone: "", length: "" });
            toast.success("Script rewritten successfully!");
        } catch (error) {
            console.error("Rewrite script error:", error);
            toast.error("Failed to rewrite script");
        } finally {
            setRewriting(false);
        }
    };

    const handleProceedToPayment = () => {
        router.push(`/meditation/${id}/payment`);
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
                            Edit Your Meditation Script
                        </h1>
                        <p className="text-gray-600">
                            Review and customize your AI-generated meditation
                            script
                        </p>
                    </div>
                    <div className="w-32"></div> {/* Spacer for centering */}
                </div>

                {/* Meditation Info */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Meditation Details
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
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
                                Mood:
                            </span>
                            <p className="text-gray-900">
                                {meditation.inputData.mood}
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
                    </div>
                </div>

                {/* Script Editor */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                            <Edit3 className="w-5 h-5 text-primary-600" />
                            <span>Meditation Script</span>
                        </h2>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleSaveScript}
                                disabled={saving}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                            >
                                <Save size={16} />
                                <span>{saving ? "Saving..." : "Save"}</span>
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        placeholder="Your meditation script will appear here..."
                    />

                    <div className="mt-4 text-sm text-gray-500">
                        Word count:{" "}
                        {
                            script.split(" ").filter((word) => word.length > 0)
                                .length
                        }{" "}
                        words
                    </div>
                </div>

                {/* Rewrite Options */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                        <RefreshCw className="w-5 h-5 text-primary-600" />
                        <span>AI Rewrite Options</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Change Tone
                            </label>
                            <select
                                value={rewriteOptions.tone}
                                onChange={(e) =>
                                    setRewriteOptions((prev) => ({
                                        ...prev,
                                        tone: e.target.value,
                                    }))
                                }
                                className="form-select"
                            >
                                <option value="">Keep current tone</option>
                                <option value="more gentle and soothing">
                                    More gentle and soothing
                                </option>
                                <option value="more energetic and uplifting">
                                    More energetic and uplifting
                                </option>
                                <option value="more professional and clinical">
                                    More professional and clinical
                                </option>
                                <option value="more personal and intimate">
                                    More personal and intimate
                                </option>
                                <option value="more spiritual and mystical">
                                    More spiritual and mystical
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Change Length
                            </label>
                            <select
                                value={rewriteOptions.length}
                                onChange={(e) =>
                                    setRewriteOptions((prev) => ({
                                        ...prev,
                                        length: e.target.value,
                                    }))
                                }
                                className="form-select"
                            >
                                <option value="">Keep current length</option>
                                <option value="shorter and more concise">
                                    Shorter and more concise
                                </option>
                                <option value="longer and more detailed">
                                    Longer and more detailed
                                </option>
                                <option value="more detailed with more guidance">
                                    More detailed with more guidance
                                </option>
                                <option value="simplified with less guidance">
                                    Simplified with less guidance
                                </option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleRewrite}
                        disabled={
                            rewriting ||
                            (!rewriteOptions.tone && !rewriteOptions.length)
                        }
                        className="mt-6 flex items-center space-x-2 px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {rewriting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                        <span>
                            {rewriting ? "Rewriting..." : "Rewrite Script"}
                        </span>
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleProceedToPayment}
                        className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                    >
                        <Check className="w-5 h-5" />
                        <span>Proceed to Payment ($4.99)</span>
                    </button>
                </div>

                <div className="text-center mt-6 text-sm text-gray-500">
                    <p>
                        Once you're satisfied with your script, proceed to
                        payment to generate your personalized meditation audio.
                    </p>
                </div>
            </div>
        </div>
    );
}
