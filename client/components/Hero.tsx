"use client";

import Link from "next/link";
import { Play, Sparkles, Heart, Brain } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                <div className="text-center">
                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                        AI-Created
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                            Guided Meditations
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Create deeply personalized meditation experiences
                        tailored to your unique needs, goals, and current
                        emotional state with the power of AI.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <Link
                            href="/auth/signup"
                            className="btn-primary flex justify-center items-center bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Create Your First Meditation
                        </Link>
                        <Link
                            href="/#how-it-works"
                            className="btn-outline flex justify-center items-center border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4 rounded-xl font-semibold"
                        >
                            <Play className="w-5 h-5 mr-2" />
                            See How It Works
                        </Link>
                    </div>

                    {/* Features Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                AI-Powered Scripts
                            </h3>
                            <p className="text-primary-100 text-sm">
                                Generate personalized meditation scripts based
                                on your goals, mood, and challenges
                            </p>
                        </div>

                        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Realistic Voice
                            </h3>
                            <p className="text-primary-100 text-sm">
                                Ultra-realistic voice generation with ElevenLabs
                                for an immersive experience
                            </p>
                        </div>

                        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Instant Delivery
                            </h3>
                            <p className="text-primary-100 text-sm">
                                Receive your meditation via email, SMS, and
                                in-browser playback
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full blur-xl animate-pulse-slow"></div>
            <div
                className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-300 bg-opacity-20 rounded-full blur-xl animate-pulse-slow"
                style={{ animationDelay: "1s" }}
            ></div>
            <div
                className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-300 bg-opacity-20 rounded-full blur-xl animate-pulse-slow"
                style={{ animationDelay: "2s" }}
            ></div>
        </section>
    );
}
