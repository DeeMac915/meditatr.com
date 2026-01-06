import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

// Load Inter via <link> at runtime to avoid build-time font fetching

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    title: "Meditatr - AI-Created Guided Meditations",
    description:
        "Create personalized guided meditations with AI. Get tailored meditation scripts, realistic voice generation, and calming background music.",
    keywords: [
        "meditation",
        "AI",
        "guided meditation",
        "wellness",
        "mindfulness",
    ],
    authors: [{ name: "Meditatr Team" }],
    openGraph: {
        title: "Meditatr - AI-Created Guided Meditations",
        description: "Create personalized guided meditations with AI",
        type: "website",
        locale: "en_US",
    },
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Meditatr",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: "#000000",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta name="apple-mobile-web-app-title" content="Meditatr" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body
                style={{
                    fontFamily:
                        "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
            >
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
