const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        sparse: true,
    },
    preferences: {
        defaultVoice: {
            type: String,
            enum: ["male", "female"],
            default: "female",
        },
        defaultDuration: {
            type: Number,
            default: 10,
        },
        defaultBackgroundAudio: {
            type: String,
            default: "nature",
        },
    },
    subscription: {
        type: {
            type: String,
            enum: ["free", "premium"],
            default: "free",
        },
        meditationsRemaining: {
            type: Number,
            default: 0,
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

userSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("User", userSchema);
