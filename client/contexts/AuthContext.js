import React, { createContext, useContext, useEffect, useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { authAPI } from "../lib/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign up with email and password
    const signUp = async (email, password, name) => {
        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Update the user's display name
            await updateProfile(userCredential.user, {
                displayName: name,
            });

            // Get Firebase token and sync with backend
            const token = await userCredential.user.getIdToken();
            localStorage.setItem("firebaseToken", token);

            // Sync user with backend
            await authAPI.syncUser();

            toast.success("Account created successfully!");
            return userCredential.user;
        } catch (error) {
            console.error("Sign up error:", error);
            toast.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign in with email and password
    const signIn = async (email, password) => {
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Get Firebase token
            const token = await userCredential.user.getIdToken();
            localStorage.setItem("firebaseToken", token);

            // Sync user with backend
            await authAPI.syncUser();

            toast.success("Signed in successfully!");
            return userCredential.user;
        } catch (error) {
            console.error("Sign in error:", error);
            toast.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign out
    const logout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            localStorage.removeItem("firebaseToken");
            setUser(null);
            setUserProfile(null);
            toast.success("Signed out successfully!");
        } catch (error) {
            console.error("Sign out error:", error);
            toast.error("Error signing out");
        } finally {
            setLoading(false);
        }
    };

    // Update user profile
    const updateUserProfile = async (profileData) => {
        try {
            const response = await authAPI.updateProfile(profileData);
            setUserProfile(response.data.user);
            toast.success("Profile updated successfully!");
            return response.data.user;
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error("Failed to update profile");
            throw error;
        }
    };

    // Get user profile from backend
    const fetchUserProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            setUserProfile(response.data.user);
            return response.data.user;
        } catch (error) {
            console.error("Fetch profile error:", error);
            // If profile doesn't exist, sync user
            try {
                await authAPI.syncUser();
                const response = await authAPI.getProfile();
                setUserProfile(response.data.user);
                return response.data.user;
            } catch (syncError) {
                console.error("Sync user error:", syncError);
                return null;
            }
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Get fresh token
                const token = await firebaseUser.getIdToken();
                localStorage.setItem("firebaseToken", token);

                // Fetch user profile from backend
                await fetchUserProfile();
            } else {
                setUser(null);
                setUserProfile(null);
                localStorage.removeItem("firebaseToken");
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        logout,
        updateUserProfile,
        fetchUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
