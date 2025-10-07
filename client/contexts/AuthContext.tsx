"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Welcome back!");
        } catch (error: any) {
            console.error("Sign in error:", error);
            toast.error(error.message || "Failed to sign in");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            setLoading(true);
            const { user } = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Update the user's display name
            await updateProfile(user, { displayName: name });

            // Get the Firebase token for backend authentication
            const token = await user.getIdToken();
            console.log(token);
            console.log(user.uid);
            // Create user document in backend via API
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email,
                    name,
                    firebaseUid: user.uid,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || "Failed to create user profile"
                );
            }

            toast.success("Account created successfully!");
        } catch (error: any) {
            console.error("Sign up error:", error);
            toast.error(error.message || "Failed to create account");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success("Signed out successfully");
        } catch (error: any) {
            console.error("Logout error:", error);
            toast.error("Failed to sign out");
            throw error;
        }
    };

    const updateUserProfile = async (name: string) => {
        try {
            if (!user) throw new Error("No user logged in");

            await updateProfile(user, { displayName: name });

            // Update user profile in backend
            const token = await user.getIdToken();
            const response = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            toast.success("Profile updated successfully");
        } catch (error: any) {
            console.error("Update profile error:", error);
            toast.error(error.message || "Failed to update profile");
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        logout,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
