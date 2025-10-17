import express from "express";
import Stripe from "stripe";
import paypal from "paypal-rest-sdk";
import { authenticateToken } from "../middleware/auth.js";
import Meditation from "../models/Meditation.js";
import Payment from "../models/Payment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Configure PayPal
paypal.configure({
    mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// Meditation pricing
const MEDITATION_PRICE = 4.99; // $4.99 per meditation

/**
 * Create Stripe payment intent
 */
router.post("/stripe/create-intent", authenticateToken, async (req, res) => {
    try {
        const { meditationId } = req.body;

        if (!meditationId) {
            return res.status(400).json({ error: "Meditation ID is required" });
        }

        // Verify meditation exists and belongs to user
        const meditation = await Meditation.findOne({
            _id: meditationId,
            userId: req.userDoc._id,
        });

        if (!meditation) {
            return res.status(404).json({ error: "Meditation not found" });
        }

        if (meditation.payment.status === "completed") {
            return res
                .status(400)
                .json({ error: "Meditation already paid for" });
        }

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(MEDITATION_PRICE * 100), // Convert to cents
            currency: "usd",
            metadata: {
                meditationId: meditationId,
                userId: req.userDoc._id.toString(),
            },
        });

        // Update meditation with payment info
        meditation.payment = {
            amount: MEDITATION_PRICE,
            currency: "USD",
            paymentMethod: "stripe",
            paymentId: paymentIntent.id,
            status: "pending",
        };
        await meditation.save();

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error("Stripe payment intent error:", error);
        res.status(500).json({ error: "Failed to create payment intent" });
    }
});

/**
 * Confirm Stripe payment
 */
router.post("/stripe/confirm", authenticateToken, async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res
                .status(400)
                .json({ error: "Payment intent ID is required" });
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntentId
        );

        // For MVP testing: Allow confirmation even if payment hasn't been processed through Stripe
        // In production, remove this and require paymentIntent.status === "succeeded"
        const isTestMode = process.env.NODE_ENV !== "production";

        if (!isTestMode && paymentIntent.status !== "succeeded") {
            return res.status(400).json({ error: "Payment not completed" });
        }

        // In test mode, log the actual status for debugging
        if (isTestMode) {
            console.log(
                "Test mode: Allowing payment confirmation with status:",
                paymentIntent.status
            );
        }

        // Find meditation and update payment status
        const meditation = await Meditation.findOne({
            "payment.paymentId": paymentIntentId,
            userId: req.userDoc._id,
        });

        if (!meditation) {
            return res.status(404).json({ error: "Meditation not found" });
        }

        // Update payment status
        meditation.payment.status = "completed";
        await meditation.save();

        // Create payment record
        const payment = new Payment({
            userId: req.userDoc._id,
            meditationId: meditation._id,
            amount: MEDITATION_PRICE,
            currency: "USD",
            paymentMethod: "stripe",
            externalPaymentId: paymentIntentId,
            status: "completed",
            metadata: {
                stripePaymentIntentId: paymentIntentId,
                stripeChargeId: paymentIntent.latest_charge,
            },
        });
        await payment.save();

        res.json({
            success: true,
            message: "Payment confirmed successfully",
            meditation: {
                id: meditation._id,
                status: meditation.status,
                payment: meditation.payment,
            },
        });
    } catch (error) {
        console.error("Stripe payment confirmation error:", error);
        res.status(500).json({ error: "Failed to confirm payment" });
    }
});

/**
 * Create PayPal payment
 */
router.post("/paypal/create", authenticateToken, async (req, res) => {
    try {
        const { meditationId } = req.body;

        if (!meditationId) {
            return res.status(400).json({ error: "Meditation ID is required" });
        }

        // Verify meditation exists and belongs to user
        const meditation = await Meditation.findOne({
            _id: meditationId,
            userId: req.userDoc._id,
        });

        if (!meditation) {
            return res.status(404).json({ error: "Meditation not found" });
        }

        if (meditation.payment.status === "completed") {
            return res
                .status(400)
                .json({ error: "Meditation already paid for" });
        }

        // Create PayPal payment
        const payment = {
            intent: "sale",
            payer: {
                payment_method: "paypal",
            },
            redirect_urls: {
                return_url: `${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/payment/paypal/success?meditationId=${meditationId}`,
                cancel_url: `${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/payment/paypal/cancel?meditationId=${meditationId}`,
            },
            transactions: [
                {
                    amount: {
                        currency: "USD",
                        total: MEDITATION_PRICE.toFixed(2),
                    },
                    description: `Meditation: ${meditation.title}`,
                    custom: JSON.stringify({
                        meditationId: meditationId,
                        userId: req.userDoc._id.toString(),
                    }),
                },
            ],
        };

        paypal.payment.create(payment, async (error, payment) => {
            if (error) {
                console.error("PayPal payment creation error:", error);
                return res
                    .status(500)
                    .json({ error: "Failed to create PayPal payment" });
            }

            // Update meditation with payment info
            meditation.payment = {
                amount: MEDITATION_PRICE,
                currency: "USD",
                paymentMethod: "paypal",
                paymentId: payment.id,
                status: "pending",
            };
            await meditation.save();

            // Find approval URL
            const approvalUrl = payment.links.find(
                (link) => link.rel === "approval_url"
            );

            res.json({
                success: true,
                paymentId: payment.id,
                approvalUrl: approvalUrl.href,
            });
        });
    } catch (error) {
        console.error("PayPal payment creation error:", error);
        res.status(500).json({ error: "Failed to create PayPal payment" });
    }
});

/**
 * Execute PayPal payment
 */
router.post("/paypal/execute", authenticateToken, async (req, res) => {
    try {
        const { paymentId, payerId } = req.body;

        if (!paymentId || !payerId) {
            return res
                .status(400)
                .json({ error: "Payment ID and Payer ID are required" });
        }

        // Execute PayPal payment
        const executePayment = {
            payer_id: payerId,
        };

        paypal.payment.execute(
            paymentId,
            executePayment,
            async (error, payment) => {
                if (error) {
                    console.error("PayPal payment execution error:", error);
                    return res
                        .status(500)
                        .json({ error: "Failed to execute PayPal payment" });
                }

                if (payment.state !== "approved") {
                    return res
                        .status(400)
                        .json({ error: "Payment not approved" });
                }

                // Get custom data
                const customData = JSON.parse(payment.transactions[0].custom);
                const { meditationId, userId } = customData;

                // Verify user matches
                if (userId !== req.userDoc._id.toString()) {
                    return res.status(403).json({ error: "Unauthorized" });
                }

                // Find meditation and update payment status
                const meditation = await Meditation.findOne({
                    _id: meditationId,
                    userId: req.userDoc._id,
                });

                if (!meditation) {
                    return res
                        .status(404)
                        .json({ error: "Meditation not found" });
                }

                // Update payment status
                meditation.payment.status = "completed";
                await meditation.save();

                // Create payment record
                const paymentRecord = new Payment({
                    userId: req.userDoc._id,
                    meditationId: meditation._id,
                    amount: MEDITATION_PRICE,
                    currency: "USD",
                    paymentMethod: "paypal",
                    externalPaymentId: paymentId,
                    status: "completed",
                    metadata: {
                        paypalPaymentId: paymentId,
                        paypalPayerId: payerId,
                        paypalTransactionId:
                            payment.transactions[0].related_resources[0].sale
                                .id,
                    },
                });
                await paymentRecord.save();

                res.json({
                    success: true,
                    message: "Payment completed successfully",
                    meditation: {
                        id: meditation._id,
                        status: meditation.status,
                        payment: meditation.payment,
                    },
                });
            }
        );
    } catch (error) {
        console.error("PayPal payment execution error:", error);
        res.status(500).json({ error: "Failed to execute PayPal payment" });
    }
});

/**
 * Get payment history
 */
router.get("/history", authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const payments = await Payment.find({ userId: req.userDoc._id })
            .populate("meditationId", "title inputData.duration createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Payment.countDocuments({ userId: req.userDoc._id });

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
        console.error("Get payment history error:", error);
        res.status(500).json({ error: "Failed to get payment history" });
    }
});

/**
 * Get payment status for a meditation
 */
router.get("/meditation/:id/status", authenticateToken, async (req, res) => {
    try {
        const meditation = await Meditation.findOne({
            _id: req.params.id,
            userId: req.userDoc._id,
        }).select("payment status title");

        if (!meditation) {
            return res.status(404).json({ error: "Meditation not found" });
        }

        res.json({
            success: true,
            meditation: {
                id: meditation._id,
                title: meditation.title,
                status: meditation.status,
                payment: meditation.payment,
            },
        });
    } catch (error) {
        console.error("Get payment status error:", error);
        res.status(500).json({ error: "Failed to get payment status" });
    }
});

export default router;
