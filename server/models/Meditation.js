const mongoose = require("mongoose");

const meditationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    inputData: {
        goal: {
            type: String,
            required: true,
        },
        mood: {
            type: String,
            required: true,
        },
        challenges: {
            type: String,
            required: true,
        },
        affirmations: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            min: 5,
            max: 60,
        },
        voicePreference: {
            type: String,
            enum: ["male", "female"],
            required: true,
        },
        backgroundAudio: {
            type: String,
            required: true,
        },
    },
    script: {
        original: {
            type: String,
            required: true,
        },
        edited: {
            type: String,
        },
        final: {
            type: String,
            required: true,
        },
    },
    audio: {
        voiceFileUrl: {
            type: String,
        },
        finalAudioUrl: {
            type: String,
        },
        duration: {
            type: Number,
        },
        fileSize: {
            type: Number,
        },
    },
    status: {
        type: String,
        enum: [
            "pending",
            "script_generated",
            "voice_generated",
            "audio_mixed",
            "completed",
            "failed",
        ],
        default: "pending",
    },
    payment: {
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
        paymentId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
        },
    },
    delivery: {
        emailSent: {
            type: Boolean,
            default: false,
        },
        smsSent: {
            type: Boolean,
            default: false,
        },
        emailSentAt: {
            type: Date,
        },
        smsSentAt: {
            type: Date,
        },
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

meditationSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
meditationSchema.index({ userId: 1, createdAt: -1 });
meditationSchema.index({ status: 1 });

module.exports = mongoose.model("Meditation", meditationSchema);
