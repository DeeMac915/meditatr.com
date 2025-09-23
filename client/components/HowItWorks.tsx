"use client";

import {
    User,
    FileText,
    CreditCard,
    Headphones,
    Mail,
    Smartphone,
    Edit3,
} from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            number: "01",
            icon: User,
            title: "Sign Up & Share Your Needs",
            description:
                "Create your account and fill out our detailed meditation form. Tell us about your goals, current mood, life challenges, and personal affirmations.",
            details: [
                "Choose your meditation duration (5-30 minutes)",
                "Select your preferred voice (male or female)",
                "Pick background audio from our curated library",
                "Share your specific goals and current emotional state",
            ],
        },
        {
            number: "02",
            icon: FileText,
            title: "AI Generates Your Script",
            description:
                "Our advanced AI analyzes your inputs and creates a personalized meditation script tailored specifically to your needs and preferences.",
            details: [
                "GPT-4 generates contextually relevant content",
                "Script addresses your specific goals and challenges",
                "Incorporates your personal affirmations naturally",
                "Optimized for your chosen duration",
            ],
        },
        {
            number: "03",
            icon: Edit3,
            title: "Edit & Customize",
            description:
                "Review your generated script and make any edits you want. Use our AI rewrite feature to adjust tone, length, or focus areas.",
            details: [
                "Full editing capabilities for complete control",
                "AI rewrite options for different approaches",
                "Preview your meditation before processing",
                "Save multiple versions if desired",
            ],
        },
        {
            number: "04",
            icon: CreditCard,
            title: "Secure Payment",
            description:
                "Pay securely with Stripe or PayPal. Our pay-per-meditation model means you only pay for what you create - no subscriptions required.",
            details: [
                "Secure payment processing with Stripe & PayPal",
                "Pay-per-meditation pricing ($4.99 per meditation)",
                "No subscriptions or recurring charges",
                "Instant payment confirmation",
            ],
        },
        {
            number: "05",
            icon: Headphones,
            title: "AI Voice & Audio Processing",
            description:
                "ElevenLabs converts your script to ultra-realistic speech, then our system mixes it with your chosen background audio for professional quality.",
            details: [
                "ElevenLabs generates realistic human-like voice",
                "Professional audio mixing with FFMPEG",
                "Background audio perfectly balanced",
                "High-quality MP3 output",
            ],
        },
        {
            number: "06",
            icon: Mail,
            title: "Multi-Channel Delivery",
            description:
                "Receive your meditation via email, SMS, and instant in-browser playback. Your meditation is also saved to your personal library.",
            details: [
                "Email delivery with SendGrid",
                "SMS notification with download link",
                "Instant in-browser audio player",
                "Saved to your personal meditation library",
            ],
        },
    ];

    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        How It Works
                        <span className="text-gradient block">
                            Simple & Powerful
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Creating your personalized meditation is as easy as
                        1-2-3. Our AI handles the complex work while you focus
                        on your wellness journey.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-16">
                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        const isEven = index % 2 === 0;

                        return (
                            <div
                                key={index}
                                className={`flex flex-col lg:flex-row items-center gap-12 ${
                                    !isEven ? "lg:flex-row-reverse" : ""
                                }`}
                            >
                                {/* Content */}
                                <div className="flex-1">
                                    <div className="max-w-lg">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-4">
                                                <IconComponent className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="text-4xl font-bold text-gray-300">
                                                {step.number}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                            {step.title}
                                        </h3>

                                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                            {step.description}
                                        </p>

                                        <ul className="space-y-2">
                                            {step.details.map(
                                                (detail, detailIndex) => (
                                                    <li
                                                        key={detailIndex}
                                                        className="flex items-start"
                                                    >
                                                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                                        <span className="text-gray-600">
                                                            {detail}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* Visual */}
                                <div className="flex-1 flex justify-center">
                                    <div className="relative">
                                        <div className="w-80 h-80 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center shadow-lg">
                                            <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center">
                                                <IconComponent className="w-12 h-12 text-white" />
                                            </div>
                                        </div>

                                        {/* Floating elements */}
                                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
                                        <div
                                            className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.5s" }}
                                        ></div>
                                        <div
                                            className="absolute top-1/2 -left-8 w-4 h-4 bg-blue-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "1s" }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-20">
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            Ready to Create Your First Meditation?
                        </h3>
                        <p className="text-primary-100 mb-8 text-lg max-w-2xl mx-auto">
                            Join thousands of users who have discovered the
                            power of personalized AI-created meditations. Start
                            your wellness journey today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/auth/signup"
                                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-xl transition-colors duration-200"
                            >
                                Get Started Now
                            </a>
                            <a
                                href="/#pricing"
                                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-xl transition-colors duration-200"
                            >
                                View Pricing
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
