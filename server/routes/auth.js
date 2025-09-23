const express = require("express");
const { auth } = require("../config/firebase");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

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
        let user = await User.findOne({ firebaseUid: req.user.uid });

        if (!user) {
            user = new User({
                firebaseUid: req.user.uid,
                email: req.user.email,
                name: req.user.name || req.user.email.split("@")[0],
            });
            await user.save();
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
        console.error("Sync user error:", error);
        res.status(500).json({ error: "Failed to sync user account" });
    }
});

module.exports = router;
