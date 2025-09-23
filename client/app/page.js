"use client";

import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import {
    ArrowRight,
    Brain,
    Mic,
    Music,
    Mail,
    Smartphone,
    CheckCircle,
    Star,
} from "lucide-react";

export default function HomePage() {
    const { user } = useAuth();

    const features = [
        {
            icon: <Brain className="w-8 h-8 text-primary-600" />,
            title: "AI-Generated Scripts",
            description:
                "Get personalized meditation scripts tailored to your specific goals, mood, and challenges using advanced AI technology.",
        },
        {
            icon: <Mic className="w-8 h-8 text-primary-600" />,
            title: "Realistic Voice Generation",
            description:
                "Experience ultra-realistic voice narration using ElevenLabs AI technology with male or female voice options.",
        },
        {
            icon: <Music className="w-8 h-8 text-primary-600" />,
            title: "Background Audio",
            description:
                "Choose from various calming background sounds including nature sounds, 528 Hz tones, and sleep music.",
        },
        {
            icon: <Mail className="w-8 h-8 text-primary-600" />,
            title: "Multi-Channel Delivery",
            description:
                "Receive your meditations via email, SMS, and in-browser playback for maximum convenience.",
        },
    ];

    const benefits = [
        "Personalized to your specific needs and goals",
        "Professional-quality audio production",
        "Multiple delivery methods for convenience",
        "Pay-per-meditation with no subscriptions",
        "Save all meditations in your personal library",
        "Edit and customize scripts before generation",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            AI-Created
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                                Guided Meditations
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Create deeply personalized guided meditations
                            tailored to your mental and emotional needs. Our AI
                            generates custom scripts, realistic voice narration,
                            and calming background music.
                        </p>

                        {user ? (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/create"
                                    className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <span>Create Your First Meditation</span>
                                    <ArrowRight size={20} />
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="border border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
                                >
                                    View Dashboard
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/auth/register"
                                    className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight size={20} />
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="border border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our AI-powered platform creates personalized
                            meditations in just a few simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                            >
                                <div className="flex justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-20 bg-gradient-to-r from-primary-50 to-secondary-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Simple 3-Step Process
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Create your personalized meditation in minutes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                1
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Share Your Needs
                            </h3>
                            <p className="text-gray-600">
                                Tell us about your goals, current mood,
                                challenges, and preferences. The more details
                                you provide, the more personalized your
                                meditation will be.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                2
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                AI Creates Your Script
                            </h3>
                            <p className="text-gray-600">
                                Our advanced AI generates a custom meditation
                                script tailored to your specific needs. You can
                                edit or request rewrites until it's perfect.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                3
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Receive Your Meditation
                            </h3>
                            <p className="text-gray-600">
                                Pay for your meditation and receive the final
                                audio via email, SMS, and in-browser playback.
                                It's saved to your personal library forever.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Why Choose Our Platform?
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Experience the future of personalized meditation
                                with our AI-powered platform that creates truly
                                unique meditations for your specific needs.
                            </p>

                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-3"
                                    >
                                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {benefit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Star className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Pay-Per-Meditation
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    No subscriptions, no commitments. Pay only
                                    for the meditations you create. Each
                                    meditation is $4.99 and includes unlimited
                                    access to your personal library.
                                </p>
                                <div className="text-3xl font-bold text-primary-600">
                                    $4.99
                                    <span className="text-lg text-gray-600 font-normal">
                                        {" "}
                                        per meditation
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Meditation Practice?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of users who have discovered the power of
                        personalized AI-generated meditations.
                    </p>

                    {user ? (
                        <Link
                            href="/create"
                            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center space-x-2"
                        >
                            <span>Create Your First Meditation</span>
                            <ArrowRight size={20} />
                        </Link>
                    ) : (
                        <Link
                            href="/auth/register"
                            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center space-x-2"
                        >
                            <span>Get Started Now</span>
                            <ArrowRight size={20} />
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
