import express from "express";
import { auth } from "../config/firebase.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid })
            .select("-__v")
            .lean();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber,
                preferences: user.preferences,
                subscription: user.subscription,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Failed to get user profile" });
    }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
    try {
        const { name, phoneNumber, preferences } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (preferences) updateData.preferences = preferences;

        const user = await User.findOneAndUpdate(
            { firebaseUid: req.user.uid },
            updateData,
            { new: true, select: "-__v" }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber,
                preferences: user.preferences,
                subscription: user.subscription,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Failed to update user profile" });
    }
});

// Create or get user account
router.post("/sync", authenticateToken, async (req, res) => {
    try {
        // The user is already created/found by the authenticateToken middleware
        const user = req.userDoc;

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber,
                preferences: user.preferences,
                subscription: user.subscription,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Sync user error:", error);
        res.status(500).json({ error: "Failed to sync user account" });
    }
});

export default router;
