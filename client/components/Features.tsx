"use client";

import {
    Brain,
    Mic,
    Music,
    Mail,
    Smartphone,
    Edit3,
    Zap,
    Shield,
} from "lucide-react";

export default function Features() {
    const features = [
        {
            icon: Brain,
            title: "AI-Powered Script Generation",
            description:
                "Our advanced AI creates personalized meditation scripts based on your specific goals, current mood, life challenges, and personal affirmations.",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: Edit3,
            title: "Script Editing & Rewriting",
            description:
                "Edit your meditation script or use AI to rewrite it with different tones, lengths, or focuses. Full control over your meditation content.",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: Mic,
            title: "Ultra-Realistic Voice",
            description:
                "ElevenLabs technology generates incredibly realistic human-like voices. Choose between male and female voices for your meditation.",
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Music,
            title: "Background Audio Library",
            description:
                "Choose from various calming background sounds including 528Hz frequencies, nature sounds, rain, ocean waves, and sleep tones.",
            color: "from-orange-500 to-red-500",
        },
        {
            icon: Zap,
            title: "Professional Audio Mixing",
            description:
                "Advanced FFMPEG processing mixes your voice with background audio for a professional, studio-quality meditation experience.",
            color: "from-yellow-500 to-orange-500",
        },
        {
            icon: Mail,
            title: "Multi-Channel Delivery",
            description:
                "Receive your meditation via email with SendGrid, SMS with Twilio, and instant in-browser playback. Never lose access to your meditations.",
            color: "from-indigo-500 to-purple-500",
        },
        {
            icon: Smartphone,
            title: "Personal Meditation Library",
            description:
                "All your meditations are saved to your personal dashboard. Access, replay, and download your meditations anytime, anywhere.",
            color: "from-teal-500 to-cyan-500",
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description:
                "Your personal information and meditation data are protected with enterprise-grade security. Your privacy is our priority.",
            color: "from-gray-500 to-slate-500",
        },
    ];

    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Everything You Need for
                        <span className="text-gradient block">
                            Perfect Meditations
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Our platform combines cutting-edge AI technology with
                        professional audio processing to create deeply
                        personalized meditation experiences that adapt to your
                        unique needs.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {/* Icon */}
                                <div
                                    className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover Effect */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                                ></div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Ready to Experience Personalized Meditation?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Join thousands of users who have discovered the
                            power of AI-created guided meditations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/auth/signup" className="btn-primary">
                                Start Creating Meditations
                            </a>
                            <a href="/#how-it-works" className="btn-outline">
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
