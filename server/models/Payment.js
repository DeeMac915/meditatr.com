const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    meditationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meditation",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "USD",
    },
    paymentMethod: {
        type: String,
        enum: ["stripe", "paypal"],
        required: true,
    },
    externalPaymentId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded", "cancelled"],
        default: "pending",
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

paymentSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ externalPaymentId: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
