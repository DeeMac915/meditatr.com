import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import AWS from "aws-sdk";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
// Using built-in fetch (Node.js 18+)
// import fetch from "node-fetch";

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Initialize ElevenLabs
const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

// Voice IDs for different genders
const VOICE_IDS = {
    male: "pNInz6obpgDQGcFmaJgB", // Adam
    female: "EXAVITQu4vr4xnSDxMaL", // Bella
};

// Background audio options
const BACKGROUND_AUDIO = {
    pain_release:
        "https://meditatrbucket.s3.us-east-1.amazonaws.com/Pain-release.mp3",
    positive_transformation:
        "https://meditatrbucket.s3.us-east-1.amazonaws.com/Positive+Transformation.mp3",
    brain_power:
        "https://meditatrbucket.s3.us-east-1.amazonaws.com/Study+Brain+Power.mp3",
    sleep: "https://meditatrbucket.s3.us-east-1.amazonaws.com/Sleep.mp3",
};

/**
 * Generate voice from text using ElevenLabs
 */
const generateVoice = async (text, voicePreference = "female") => {
    try {
        const voiceId = VOICE_IDS[voicePreference];

        if (!voiceId) {
            throw new Error(`Invalid voice preference: ${voicePreference}`);
        }

        // Generate audio using ElevenLabs
        const audioBuffer = await elevenlabs.textToSpeech({
            voice_id: voiceId,
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
                style: 0.0,
                use_speaker_boost: true,
            },
        });

        // Convert buffer to stream
        const audioStream = Buffer.from(audioBuffer);

        // Upload to S3
        const fileName = `voice/${uuidv4()}.mp3`;
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: audioStream,
            ContentType: "audio/mpeg",
            ACL: "public-read",
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        return uploadResult.Location;
    } catch (error) {
        console.error("Voice generation error:", error);
        throw new Error("Failed to generate voice");
    }
};

/**
 * Mix voice with background audio using FFMPEG
 */
const mixAudio = async (voiceUrl, backgroundType, duration) => {
    try {
        const tempDir = path.join(__dirname, "../../temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const voiceFile = path.join(tempDir, `voice-${uuidv4()}.mp3`);
        const backgroundFile = path.join(tempDir, `background-${uuidv4()}.mp3`);
        const outputFile = path.join(tempDir, `final-${uuidv4()}.mp3`);

        // Download voice file
        const voiceResponse = await fetch(voiceUrl);
        const voiceBuffer = await voiceResponse.arrayBuffer();
        fs.writeFileSync(voiceFile, Buffer.from(voiceBuffer));

        // Download background audio
        const backgroundUrl = BACKGROUND_AUDIO[backgroundType];
        if (!backgroundUrl) {
            throw new Error(`Invalid background audio type: ${backgroundType}`);
        }

        const backgroundResponse = await fetch(backgroundUrl);
        const backgroundBuffer = await backgroundResponse.arrayBuffer();
        fs.writeFileSync(backgroundFile, Buffer.from(backgroundBuffer));

        // Mix audio using FFMPEG
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(voiceFile)
                .input(backgroundFile)
                .complexFilter([
                    "[0:a]volume=1.0[voice]",
                    "[1:a]volume=0.3,aloop=loop=-1:size=2e+09[bg]",
                    "[voice][bg]amix=inputs=2:duration=first:dropout_transition=2[out]",
                ])
                .outputOptions(["-map", "[out]"])
                .output(outputFile)
                .on("end", resolve)
                .on("error", reject)
                .run();
        });

        // Upload final audio to S3
        const finalAudioBuffer = fs.readFileSync(outputFile);
        const fileName = `meditations/${uuidv4()}.mp3`;

        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: finalAudioBuffer,
            ContentType: "audio/mpeg",
            ACL: "public-read",
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        // Clean up temporary files
        [voiceFile, backgroundFile, outputFile].forEach((file) => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });

        return uploadResult.Location;
    } catch (error) {
        console.error("Audio mixing error:", error);
        throw new Error("Failed to mix audio");
    }
};

/**
 * Get audio file duration
 */
const getAudioDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata.format.duration);
            }
        });
    });
};

/**
 * Get audio file size
 */
const getAudioFileSize = (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(url, { method: "HEAD" });
            const contentLength = response.headers.get("content-length");
            resolve(parseInt(contentLength) || 0);
        } catch (error) {
            reject(error);
        }
    });
};

export {
    generateVoice,
    mixAudio,
    getAudioDuration,
    getAudioFileSize,
    BACKGROUND_AUDIO,
};
