"use client";

import { Check, Zap, Heart, Star } from "lucide-react";

export default function Pricing() {
    const features = [
        "AI-generated personalized meditation scripts",
        "Ultra-realistic voice generation with ElevenLabs",
        "Professional background audio mixing",
        "Script editing and AI rewrite capabilities",
        "Multi-channel delivery (email, SMS, browser)",
        "Personal meditation library",
        "High-quality MP3 audio files",
        "24/7 access to your meditations",
    ];

    return (
        <section id="pricing" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Simple, Transparent
                        <span className="text-gradient block">
                            Pay-Per-Meditation
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        No subscriptions, no hidden fees. Pay only for the
                        meditations you create. Each meditation is a complete,
                        personalized experience tailored just for you.
                    </p>
                </div>

                {/* Pricing Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-12 text-center text-white">
                            <div className="flex items-center justify-center mb-4">
                                <Heart className="w-8 h-8 mr-2" />
                                <span className="text-2xl font-bold">
                                    Personalized Meditation
                                </span>
                            </div>
                            <div className="text-5xl font-bold mb-2">$4.99</div>
                            <div className="text-primary-100 text-lg">
                                per meditation
                            </div>
                            <p className="text-primary-100 mt-4 max-w-2xl mx-auto">
                                Each meditation is completely unique, generated
                                specifically for your needs, goals, and current
                                emotional state.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="px-8 py-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                                What's Included in Each Meditation
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start"
                                    >
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="text-center">
                                <a
                                    href="/auth/signup"
                                    className="btn-primary text-lg px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <Zap className="w-5 h-5 mr-2" />
                                    Create Your First Meditation
                                </a>
                                <p className="text-gray-500 text-sm mt-4">
                                    No credit card required to get started
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Why Pay-Per-Meditation */}
                <div className="mt-20">
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
                        Why Pay-Per-Meditation Works Better
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-blue-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                No Subscription Pressure
                            </h4>
                            <p className="text-gray-600">
                                Use our service when you need it, without
                                worrying about monthly fees or unused
                                subscriptions.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-green-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Quality Over Quantity
                            </h4>
                            <p className="text-gray-600">
                                Each meditation is crafted with care and
                                attention to detail, ensuring every experience
                                is meaningful.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-purple-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Personal Investment
                            </h4>
                            <p className="text-gray-600">
                                When you pay for each meditation, you're more
                                likely to use and benefit from your personalized
                                content.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-16 text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Secure Payment Methods
                    </h4>
                    <div className="flex justify-center items-center space-x-8 opacity-60">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg">
                            <span className="text-gray-700 font-medium">
                                Stripe
                            </span>
                        </div>
                        <div className="bg-gray-100 px-4 py-2 rounded-lg">
                            <span className="text-gray-700 font-medium">
                                PayPal
                            </span>
                        </div>
                        <div className="bg-gray-100 px-4 py-2 rounded-lg">
                            <span className="text-gray-700 font-medium">
                                Credit Cards
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
