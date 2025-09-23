"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { meditationAPI } from "../../lib/api";
import { useRouter } from "next/navigation";
import {
    Brain,
    Heart,
    Target,
    MessageSquare,
    Clock,
    Mic,
    Music,
    ArrowRight,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CreateMeditationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        goal: "",
        mood: "",
        challenges: "",
        affirmations: "",
        duration: 10,
        voicePreference: "female",
        backgroundAudio: "nature",
    });

    const moodOptions = [
        "Anxious",
        "Stressed",
        "Overwhelmed",
        "Sad",
        "Angry",
        "Frustrated",
        "Tired",
        "Restless",
        "Lonely",
        "Confused",
        "Peaceful",
        "Content",
        "Motivated",
        "Grateful",
        "Hopeful",
        "Calm",
    ];

    const backgroundAudioOptions = [
        {
            value: "nature",
            label: "Nature Sounds",
            description: "Forest, birds, gentle wind",
        },
        {
            value: "ocean",
            label: "Ocean Waves",
            description: "Calming ocean waves",
        },
        { value: "rain", label: "Rain Sounds", description: "Gentle rainfall" },
        {
            value: "forest",
            label: "Forest Ambience",
            description: "Deep forest sounds",
        },
        {
            value: "528-hz",
            label: "528 Hz Frequency",
            description: "Healing frequency tone",
        },
        {
            value: "sleep",
            label: "Sleep Tones",
            description: "Deep sleep sounds",
        },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMoodSelect = (mood) => {
        setFormData((prev) => ({
            ...prev,
            mood: prev.mood === mood ? "" : mood,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please sign in to create a meditation");
            router.push("/auth/login");
            return;
        }

        // Validation
        if (
            !formData.goal.trim() ||
            !formData.mood ||
            !formData.challenges.trim() ||
            !formData.affirmations.trim()
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const response = await meditationAPI.generateScript(formData);
            toast.success("Meditation script generated successfully!");
            router.push(`/meditation/${response.data.meditation.id}/edit`);
        } catch (error) {
            console.error("Script generation error:", error);
            toast.error(
                error.response?.data?.error ||
                    "Failed to generate meditation script"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Sign in required
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please sign in to create your personalized meditation
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Create Your Personalized Meditation
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tell us about your needs and goals, and our AI will
                        create a custom meditation script just for you.
                    </p>
                </div>

                {/* Form */}
                <div className="meditation-form">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Goal */}
                        <div>
                            <label className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-3">
                                <Target className="w-5 h-5 text-primary-600" />
                                <span>
                                    What is your main goal for this meditation?
                                </span>
                            </label>
                            <textarea
                                name="goal"
                                value={formData.goal}
                                onChange={handleChange}
                                placeholder="e.g., Reduce anxiety, improve sleep, find inner peace, build confidence, manage stress..."
                                className="form-textarea h-24"
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Be specific about what you want to achieve or
                                work on
                            </p>
                        </div>

                        {/* Current Mood */}
                        <div>
                            <label className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-3">
                                <Heart className="w-5 h-5 text-primary-600" />
                                <span>How are you feeling right now?</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {moodOptions.map((mood) => (
                                    <button
                                        key={mood}
                                        type="button"
                                        onClick={() => handleMoodSelect(mood)}
                                        className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                                            formData.mood === mood
                                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                                        }`}
                                    >
                                        {mood}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Select the mood that best describes your current
                                emotional state
                            </p>
                        </div>

                        {/* Life Challenges */}
                        <div>
                            <label className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-3">
                                <Brain className="w-5 h-5 text-primary-600" />
                                <span>
                                    What specific challenges are you facing?
                                </span>
                            </label>
                            <textarea
                                name="challenges"
                                value={formData.challenges}
                                onChange={handleChange}
                                placeholder="e.g., Work stress, relationship issues, health concerns, financial worries, life transitions..."
                                className="form-textarea h-24"
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Share the specific situations or challenges
                                you're dealing with
                            </p>
                        </div>

                        {/* Personal Affirmations */}
                        <div>
                            <label className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-3">
                                <MessageSquare className="w-5 h-5 text-primary-600" />
                                <span>
                                    What positive affirmations resonate with
                                    you?
                                </span>
                            </label>
                            <textarea
                                name="affirmations"
                                value={formData.affirmations}
                                onChange={handleChange}
                                placeholder="e.g., I am worthy of love and happiness, I trust in my ability to overcome challenges, I am at peace with myself..."
                                className="form-textarea h-24"
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Include positive statements or mantras that
                                you'd like to focus on
                            </p>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-3">
                                <Clock className="w-5 h-5 text-primary-600" />
                                <span>
                                    How long would you like your meditation to
                                    be?
                                </span>
                            </label>
                            <div className="flex space-x-4">
                                {[5, 10, 15, 20, 30].map((duration) => (
                                    <label
                                        key={duration}
                                        className="flex items-center space-x-2"
                                    >
                                        <input
                                            type="radio"
                                            name="duration"
                                            value={duration}
                                            checked={
                                                formData.duration === duration
                                            }
                                            onChange={handleChange}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-gray-700">
                                            {duration} minutes
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Voice Preference */}
                        <div>
                            <label className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-3">
                                <Mic className="w-5 h-5 text-primary-600" />
                                <span>Voice preference</span>
                            </label>
                            <div className="flex space-x-6">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="voicePreference"
                                        value="female"
                                        checked={
                                            formData.voicePreference ===
                                            "female"
                                        }
                                        onChange={handleChange}
                                        className="text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-gray-700">
                                        Female voice
                                    </span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="voicePreference"
                                        value="male"
                                        checked={
                                            formData.voicePreference === "male"
                                        }
                                        onChange={handleChange}
                                        className="text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-gray-700">
                                        Male voice
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Background Audio */}
                        <div>
                            <label className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-3">
                                <Music className="w-5 h-5 text-primary-600" />
                                <span>Background audio</span>
                            </label>
                            <div className="grid md:grid-cols-2 gap-4">
                                {backgroundAudioOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="backgroundAudio"
                                            value={option.value}
                                            checked={
                                                formData.backgroundAudio ===
                                                option.value
                                            }
                                            onChange={handleChange}
                                            className="text-primary-600 focus:ring-primary-500 mt-1"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {option.label}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {option.description}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>
                                            Generating your meditation...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Generate My Meditation Script
                                        </span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-sm text-gray-500 mt-3">
                                You'll be able to edit the script before payment
                                and processing
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
