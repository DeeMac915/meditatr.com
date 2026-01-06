"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";

// Lazy load heavy components for better initial load performance
const Hero = lazy(() => import("@/components/Hero"));
const Features = lazy(() => import("@/components/Features"));
const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const Pricing = lazy(() => import("@/components/Pricing"));
const Footer = lazy(() => import("@/components/Footer"));

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>
                <Suspense fallback={<div className="min-h-screen" />}>
                    <Hero />
                    <Features />
                    <HowItWorks />
                    <Pricing />
                </Suspense>
            </main>
            <Suspense fallback={null}>
                <Footer />
            </Suspense>
        </div>
    );
}
