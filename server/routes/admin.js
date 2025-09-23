const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const User = require("../models/User");
const Meditation = require("../models/Meditation");
const Payment = require("../models/Payment");

const router = express.Router();

// Admin middleware (you might want to add role-based access control)
const requireAdmin = (req, res, next) => {
    // For MVP, you can check if user email is in admin list
    const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",")
        : [];

    if (!adminEmails.includes(req.user.email)) {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

/**
 * Get dashboard statistics
 */
router.get("/dashboard", async (req, res) => {
    try {
        const [
            totalUsers,
            totalMeditations,
            totalRevenue,
            recentMeditations,
            recentPayments,
            meditationsByStatus,
            revenueByMonth,
        ] = await Promise.all([
            User.countDocuments(),
            Meditation.countDocuments(),
            Payment.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Meditation.find()
                .populate("userId", "name email")
                .sort({ createdAt: -1 })
                .limit(10)
                .select(
                    "title status createdAt inputData.duration payment.amount"
                )
                .lean(),
            Payment.find()
                .populate("userId", "name email")
                .populate("meditationId", "title")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
            Meditation.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Payment.aggregate([
                { $match: { status: "completed" } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                        },
                        revenue: { $sum: "$amount" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": -1, "_id.month": -1 } },
                { $limit: 12 },
            ]),
        ]);

        const stats = {
            users: {
                total: totalUsers,
                newThisMonth: await User.countDocuments({
                    createdAt: {
                        $gte: new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            1
                        ),
                    },
                }),
            },
            meditations: {
                total: totalMeditations,
                completed: await Meditation.countDocuments({
                    status: "completed",
                }),
                pending: await Meditation.countDocuments({ status: "pending" }),
                failed: await Meditation.countDocuments({ status: "failed" }),
                byStatus: meditationsByStatus,
            },
            revenue: {
                total: totalRevenue[0]?.total || 0,
                thisMonth: await Payment.aggregate([
                    {
                        $match: {
                            status: "completed",
                            createdAt: {
                                $gte: new Date(
                                    new Date().getFullYear(),
                                    new Date().getMonth(),
                                    1
                                ),
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$amount" } } },
                ]).then((result) => result[0]?.total || 0),
                byMonth: revenueByMonth,
            },
            recent: {
                meditations: recentMeditations,
                payments: recentPayments,
            },
        };

        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).json({ error: "Failed to get dashboard statistics" });
    }
});

/**
 * Get all users with pagination
 */
router.get("/users", async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "" } = req.query;
        const skip = (page - 1) * limit;

        const query = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: "i" } },
                      { email: { $regex: search, $options: "i" } },
                  ],
              }
            : {};

        const users = await User.find(query)
            .select("-__v")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await User.countDocuments(query);

        // Add meditation count for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const meditationCount = await Meditation.countDocuments({
                    userId: user._id,
                });
                const paymentCount = await Payment.countDocuments({
                    userId: user._id,
                });
                const totalSpent = await Payment.aggregate([
                    { $match: { userId: user._id, status: "completed" } },
                    { $group: { _id: null, total: { $sum: "$amount" } } },
                ]);

                return {
                    ...user,
                    stats: {
                        meditations: meditationCount,
                        payments: paymentCount,
                        totalSpent: totalSpent[0]?.total || 0,
                    },
                };
            })
        );

        res.json({
            success: true,
            users: usersWithStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ error: "Failed to get users" });
    }
});

/**
 * Get all meditations with pagination
 */
router.get("/meditations", async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "", search = "" } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { "inputData.goal": { $regex: search, $options: "i" } },
            ];
        }

        const meditations = await Meditation.find(query)
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select("-script.original -script.edited")
            .lean();

        const total = await Meditation.countDocuments(query);

        res.json({
            success: true,
            meditations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get meditations error:", error);
        res.status(500).json({ error: "Failed to get meditations" });
    }
});

/**
 * Get all payments with pagination
 */
router.get("/payments", async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "", method = "" } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) query.status = status;
        if (method) query.paymentMethod = method;

        const payments = await Payment.find(query)
            .populate("userId", "name email")
            .populate("meditationId", "title")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Payment.countDocuments(query);

        res.json({
            success: true,
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get payments error:", error);
        res.status(500).json({ error: "Failed to get payments" });
    }
});

/**
 * Get user details
 */
router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-__v").lean();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const [meditations, payments, totalSpent] = await Promise.all([
            Meditation.find({ userId: user._id })
                .select(
                    "title status createdAt inputData.duration payment.amount"
                )
                .sort({ createdAt: -1 })
                .lean(),
            Payment.find({ userId: user._id })
                .populate("meditationId", "title")
                .sort({ createdAt: -1 })
                .lean(),
            Payment.aggregate([
                { $match: { userId: user._id, status: "completed" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
        ]);

        res.json({
            success: true,
            user: {
                ...user,
                meditations,
                payments,
                totalSpent: totalSpent[0]?.total || 0,
            },
        });
    } catch (error) {
        console.error("Get user details error:", error);
        res.status(500).json({ error: "Failed to get user details" });
    }
});

/**
 * Update meditation status
 */
router.put("/meditations/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const validStatuses = [
            "pending",
            "script_generated",
            "voice_generated",
            "audio_mixed",
            "completed",
            "failed",
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const meditation = await Meditation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("userId", "name email");

        if (!meditation) {
            return res.status(404).json({ error: "Meditation not found" });
        }

        res.json({
            success: true,
            meditation,
        });
    } catch (error) {
        console.error("Update meditation status error:", error);
        res.status(500).json({ error: "Failed to update meditation status" });
    }
});

/**
 * Get system health
 */
router.get("/health", async (req, res) => {
    try {
        const health = {
            database: "connected",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || "development",
        };

        res.json({
            success: true,
            health,
        });
    } catch (error) {
        console.error("Health check error:", error);
        res.status(500).json({ error: "Failed to get system health" });
    }
});

module.exports = router;
