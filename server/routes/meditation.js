import express from "express";
import OpenAI from "openai";
import { authenticateToken } from "../middleware/auth.js";
import Meditation from "../models/Meditation.js";
import User from "../models/User.js";
import { generateVoice, mixAudio } from "../services/audioService.js";
import { sendEmail, sendSMS } from "../services/deliveryService.js";

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Generate meditation script
router.post("/generate-script", authenticateToken, async (req, res) => {
    try {
        const {
            goal,
            mood,
            challenges,
            affirmations,
            duration,
            voicePreference,
            backgroundAudio,
        } = req.body;

        // Validate input
        if (!goal || !mood || !challenges || !affirmations || !duration) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (duration < 5 || duration > 60) {
            return res
                .status(400)
                .json({ error: "Duration must be between 5 and 60 minutes" });
        }

        // Create meditation record
        const meditation = new Meditation({
            userId: req.userDoc._id,
            title: `Meditation for ${goal}`,
            inputData: {
                goal,
                mood,
                challenges,
                affirmations,
                duration,
                voicePreference,
                backgroundAudio,
            },
            status: "pending",
        });

        // Generate script using OpenAI
        const prompt = `Create a personalized guided meditation script based on the following information:

Goal: ${goal}
Current Mood: ${mood}
Life Challenges: ${challenges}
Personal Affirmations: ${affirmations}
Duration: ${duration} minutes
Voice Preference: ${voicePreference}

Please create a ${duration}-minute guided meditation script that:
1. Addresses the specific goal and challenges mentioned
2. Incorporates the personal affirmations naturally
3. Is appropriate for the current mood
4. Uses a ${voicePreference} voice tone
5. Includes breathing exercises, body scan, and visualization
6. Ends with the personal affirmations
7. Is written in a warm, supportive, and professional tone

Format the script with clear sections and timing cues. Make it deeply personal and therapeutic.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a professional meditation guide and therapist with expertise in creating personalized, therapeutic meditation scripts. Your scripts are warm, supportive, and deeply healing.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const script = completion.choices[0].message.content;

        // Update meditation with generated script
        meditation.script.original = script;
        meditation.script.final = script;
        meditation.status = "script_generated";
        await meditation.save();

        res.json({
            success: true,
            meditation: {
                id: meditation._id,
                title: meditation.title,
                script: meditation.script.final,
                status: meditation.status,
                inputData: meditation.inputData,
            },
        });
    } catch (error) {
        console.error("Script generation error:", error);
        res.status(500).json({ error: "Failed to generate meditation script" });
    }
});

// Update meditation script
router.put("/:id/script", authenticateToken, async (req, res) => {
    try {
        const { script } = req.body;

        if (!script) {
            return res
                .status(400)
                .json({ error: "Script content is required" });
        }

        const meditation = await Meditation.findOne({
            _id: req.params.id,
            userId: req.userDoc._id,
        });

        if (!meditation) {
            return res.status(404).json({ error: "Meditation not found" });
        }

        meditation.script.edited = script;
        meditation.script.final = script;
        await meditation.save();

        res.json({
            success: true,
            meditation: {
                id: meditation._id,
                script: meditation.script.final,
                status: meditation.status,
            },
        });
    } catch (error) {
        console.error("Script update error:", error);
        res.status(500).json({ error: "Failed to update meditation script" });
    }
});

// Rewrite meditation script
router.post("/:id/rewrite", authenticateToken, async (req, res) => {
    try {
        const { tone, length } = req.body;

        const meditation = await Meditation.findOne({
            _id: req.params.id,
            userId: req.userDoc._id,
        });

        if (!meditation) {
            return res.status(404).json({ error: "Meditation not found" });
        }

        const rewritePrompt = `Please rewrite this meditation script with the following modifications:

Original Script:
${meditation.script.final}

Modifications:
- Tone: ${tone || "maintain current tone"}
- Length: ${length || "maintain current length"}

Please provide a new version that maintains the core therapeutic elements while incorporating the requested changes.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a professional meditation guide. Rewrite the provided script according to the specified modifications while maintaining its therapeutic value.",
                },
                {
                    role: "user",
                    content: rewritePrompt,
                },
            ],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const newScript = completion.choices[0].message.content;

        meditation.script.edited = newScript;
        meditation.script.final = newScript;
        await meditation.save();

        res.json({
            success: true,
            meditation: {
                id: meditation._id,
                script: meditation.script.final,
                status: meditation.status,
            },
        });
    } catch (error) {
        console.error("Script rewrite error:", error);
        res.status(500).json({ error: "Failed to rewrite meditation script" });
    }
});

// Background processing function
const processmeditationInBackground = async (
    meditationId,
    userEmail,
    userPhone
) => {
    try {
        console.log(
            `🔄 Starting background processing for meditation ${meditationId}`
        );

        const meditation = await Meditation.findById(meditationId);
        if (!meditation) {
            console.error("Meditation not found for processing:", meditationId);
            return;
        }

        // Update status to processing
        meditation.status = "processing";
        await meditation.save();

        // Generate voice using ElevenLabs
        console.log("🎙️ Generating voice...");
        const voiceFileUrl = await generateVoice(
            meditation.script.final,
            meditation.inputData.voicePreference
        );

        meditation.audio.voiceFileUrl = voiceFileUrl;
        await meditation.save();

        // Mix with background audio
        console.log("🎵 Mixing audio...");
        const finalAudioUrl = await mixAudio(
            voiceFileUrl,
            meditation.inputData.backgroundAudio,
            meditation.inputData.duration
        );

        meditation.audio.finalAudioUrl = finalAudioUrl;
        meditation.status = "completed";
        await meditation.save();

        console.log(`✅ Meditation processing completed: ${meditationId}`);

        // Send delivery notifications (non-blocking)
        try {
            const emailResult = await sendEmail(userEmail, meditation);
            if (emailResult) {
                meditation.delivery.emailSent = true;
                meditation.delivery.emailSentAt = new Date();
                console.log("✓ Email delivery successful");
            } else {
                console.warn(
                    "✗ Email delivery failed (check SendGrid configuration)"
                );
            }
        } catch (emailError) {
            console.error("Email delivery error:", emailError.message);
        }

        if (userPhone) {
            try {
                const smsResult = await sendSMS(userPhone, meditation);
                if (smsResult) {
                    meditation.delivery.smsSent = true;
                    meditation.delivery.smsSentAt = new Date();
                    console.log("✓ SMS delivery successful");
                } else {
                    console.warn(
                        "✗ SMS delivery failed (check Twilio configuration)"
                    );
                }
            } catch (smsError) {
                console.error("SMS delivery error:", smsError.message);
            }
        }

        await meditation.save();
    } catch (error) {
        console.error("❌ Background processing error:", error);

        // Update meditation status to failed
        try {
            const meditation = await Meditation.findById(meditationId);
            if (meditation) {
                meditation.status = "failed";
                meditation.error = error.message;
                await meditation.save();
            }
        } catch (updateError) {
            console.error("Failed to update meditation status:", updateError);
        }
    }
};

// Process meditation (generate voice and audio) - ASYNC
router.post("/:id/process", authenticateToken, async (req, res) => {
    try {
        const meditation = await Meditation.findOne({
            _id: req.params.id,
            userId: req.userDoc._id,
        });

        if (!meditation) {
            return res.status(404).json({ error: "Meditation not found" });
        }

        if (meditation.status !== "script_generated") {
            return res.status(400).json({
                error: `Meditation must have a generated script first. Current status: ${meditation.status}`,
            });
        }

        // Check if payment is completed
        if (!meditation.payment || meditation.payment.status !== "completed") {
            return res.status(400).json({
                error: "Payment must be completed before processing",
            });
        }

        // Start background processing (don't await - return immediately)
        setImmediate(() => {
            processmeditationInBackground(
                meditation._id,
                req.userDoc.email,
                req.userDoc.phoneNumber
            );
        });

        // Return immediately with processing status
        res.json({
            success: true,
            message:
                "Meditation processing started. This will take 2-5 minutes.",
            meditation: {
                id: meditation._id,
                status: "processing",
            },
        });
    } catch (error) {
        console.error("Meditation processing error:", error);

        // Update status to failed
        const meditation = await Meditation.findById(req.params.id);

        res.status(500).json({ error: "Failed to process meditation" });
    }
});

// Get user's meditations
router.get("/", authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const meditations = await Meditation.find({ userId: req.userDoc._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select("-script.original -script.edited")
            .lean();

        const total = await Meditation.countDocuments({
            userId: req.userDoc._id,
        });

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

// Get single meditation
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const meditation = await Meditation.findOne({
            _id: req.params.id,
            userId: req.userDoc._id,
        }).lean();

        if (!meditation) {
            return res.status(404).json({ error: "Meditation not found" });
        }

        res.json({
            success: true,
            meditation,
        });
    } catch (error) {
        console.error("Get meditation error:", error);
        res.status(500).json({ error: "Failed to get meditation" });
    }
});

export default router;
