import mongoose from "mongoose";

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
            "processing",
            "voice_generated",
            "audio_mixed",
            "completed",
            "failed",
        ],
        default: "pending",
    },
    error: {
        type: String,
    },
    payment: {
        amount: {
            type: Number,
            required: false,
        },
        currency: {
            type: String,
            default: "USD",
        },
        paymentMethod: {
            type: String,
            enum: ["stripe", "paypal"],
            required: false,
        },
        paymentId: {
            type: String,
            required: false,
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

// Indexes for efficient queries
meditationSchema.index({ userId: 1, createdAt: -1 }); // For user's meditation list
meditationSchema.index({ status: 1 }); // For status filtering
meditationSchema.index({ "payment.status": 1 }); // For payment queries
meditationSchema.index({ createdAt: -1 }); // For admin queries
meditationSchema.index({ userId: 1, status: 1 }); // Compound index for user status queries

export default mongoose.model("Meditation", meditationSchema);
