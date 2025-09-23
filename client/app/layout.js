import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../contexts/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Meditation MVP - AI-Created Guided Meditations",
    description:
        "Create personalized guided meditations with AI. Get tailored meditation scripts, realistic voice generation, and calming background music.",
    keywords:
        "meditation, AI, guided meditation, wellness, mindfulness, personalized",
    authors: [{ name: "Meditation MVP Team" }],
    viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
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
                                    primary: "#4ade80",
                                    secondary: "#fff",
                                },
                            },
                            error: {
                                duration: 5000,
                                iconTheme: {
                                    primary: "#ef4444",
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
