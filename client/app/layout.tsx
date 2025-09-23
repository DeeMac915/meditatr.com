import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Meditation MVP - AI-Created Guided Meditations",
    description:
        "Create personalized guided meditations with AI. Get tailored meditation scripts, realistic voice generation, and calming background music.",
    keywords: [
        "meditation",
        "AI",
        "guided meditation",
        "wellness",
        "mindfulness",
    ],
    authors: [{ name: "Meditation MVP Team" }],
    openGraph: {
        title: "Meditation MVP - AI-Created Guided Meditations",
        description: "Create personalized guided meditations with AI",
        type: "website",
        locale: "en_US",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#363636",
                                color: "#fff",
                            },
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: "#10B981",
                                    secondary: "#fff",
                                },
                            },
                            error: {
                                duration: 5000,
                                iconTheme: {
                                    primary: "#EF4444",
                                    secondary: "#fff",
                                },
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
