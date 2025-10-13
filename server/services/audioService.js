import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import AWS from "aws-sdk";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";
import { v4 as uuidv4 } from "uuid";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set FFmpeg path - try to find it using 'which' command on Windows
// This helps when the server was running before FFmpeg was installed

try {
    if (process.platform === "win32") {
        // Try to find ffmpeg using where.exe on Windows
        const ffmpegPath = execSync("where.exe ffmpeg", { encoding: "utf-8" })
            .split("\n")[0]
            .trim();
        if (ffmpegPath) {
            ffmpeg.setFfmpegPath(ffmpegPath);
            console.log(`FFmpeg found at: ${ffmpegPath}`);
        }
    }
} catch (error) {
    console.warn(
        "FFmpeg not found in PATH. Make sure FFmpeg is installed and server is restarted."
    );
}

// Configure AWS S3 with extended timeouts and retry logic
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    httpOptions: {
        timeout: 300000, // 5 minutes total timeout for upload
        connectTimeout: 10000, // 10 seconds to establish connection
    },
    maxRetries: 3, // Retry failed requests up to 3 times
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

        // Generate audio using ElevenLabs (v2.x API)
        const audio = await elevenlabs.textToSpeech.convert(voiceId, {
            text: text,
            model_id: "eleven_multilingual_v2",
        });

        // Convert audio stream to buffer
        const chunks = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }
        const audioStream = Buffer.concat(chunks);

        // Upload to S3
        const fileName = `voice/${uuidv4()}.mp3`;
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: audioStream,
            ContentType: "audio/mpeg",
        };

        console.log(
            `Uploading voice audio to S3: ${fileName} (${(
                audioStream.length / 1024
            ).toFixed(2)} KB)`
        );

        const uploadResult = await s3.upload(uploadParams).promise();

        console.log(
            `Voice audio uploaded successfully: ${uploadResult.Location}`
        );

        return uploadResult.Location;
    } catch (error) {
        console.error("Voice generation error:", error);

        // Provide more specific error messages
        if (error.code === "TimeoutError" || error.code === "RequestTimeout") {
            throw new Error(
                `S3 upload timed out after ${
                    error.time
                        ? new Date(error.time).toISOString()
                        : "unknown time"
                }. ` +
                    `The audio file may be too large or network connectivity is poor.`
            );
        } else if (error.code === "NetworkingError") {
            throw new Error(
                `Network error while uploading to S3: ${error.message}. ` +
                    `Please check your internet connection.`
            );
        } else if (
            error.code === "CredentialsError" ||
            error.code === "AccessDenied"
        ) {
            throw new Error(
                `AWS credentials error: ${error.message}. ` +
                    `Please verify your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.`
            );
        } else if (error.message && error.message.includes("ElevenLabs")) {
            throw new Error(
                `ElevenLabs API error: ${error.message}. ` +
                    `Please check your ELEVENLABS_API_KEY and account quota.`
            );
        } else {
            throw new Error(
                `Failed to generate voice: ${
                    error.message || error.code || "Unknown error"
                }`
            );
        }
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

        // Download voice file using axios (better Windows compatibility)
        console.log("Downloading voice file from S3...");
        const voiceResponse = await axios.get(voiceUrl, {
            responseType: "arraybuffer",
            timeout: 60000, // 60 seconds
        });
        fs.writeFileSync(voiceFile, Buffer.from(voiceResponse.data));

        // Download background audio
        const backgroundUrl = BACKGROUND_AUDIO[backgroundType];
        if (!backgroundUrl) {
            throw new Error(`Invalid background audio type: ${backgroundType}`);
        }

        console.log("Downloading background audio from S3...");
        const backgroundResponse = await axios.get(backgroundUrl, {
            responseType: "arraybuffer",
            timeout: 60000, // 60 seconds
        });
        fs.writeFileSync(backgroundFile, Buffer.from(backgroundResponse.data));

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
        };

        console.log(
            `Uploading mixed audio to S3: ${fileName} (${(
                finalAudioBuffer.length / 1024
            ).toFixed(2)} KB)`
        );

        const uploadResult = await s3.upload(uploadParams).promise();

        console.log(
            `Mixed audio uploaded successfully: ${uploadResult.Location}`
        );

        // Clean up temporary files
        [voiceFile, backgroundFile, outputFile].forEach((file) => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });

        return uploadResult.Location;
    } catch (error) {
        console.error("Audio mixing error:", error);

        // Provide more specific error messages
        if (error.code === "EACCES") {
            throw new Error(
                `Network access denied. Please allow Node.js through Windows Firewall. Error: ${error.message}`
            );
        } else if (
            error.code === "ECONNREFUSED" ||
            error.code === "ETIMEDOUT"
        ) {
            throw new Error(
                `Cannot connect to download audio files. Please check your internet connection.`
            );
        } else if (
            error.code === "TimeoutError" ||
            error.code === "RequestTimeout"
        ) {
            throw new Error(
                `S3 upload timed out. The mixed audio file may be too large or network connectivity is poor.`
            );
        } else if (error.code === "NetworkingError") {
            throw new Error(
                `Network error while uploading mixed audio to S3: ${error.message}`
            );
        } else if (error.message && error.message.includes("ffmpeg")) {
            throw new Error(
                `FFMPEG mixing error: ${error.message}. Please check FFMPEG installation.`
            );
        } else if (error.response) {
            throw new Error(
                `Failed to download audio: HTTP ${error.response.status} - ${error.response.statusText}`
            );
        } else {
            throw new Error(
                `Failed to mix audio: ${
                    error.message || error.code || "Unknown error"
                }`
            );
        }
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
const getAudioFileSize = async (url) => {
    try {
        const response = await axios.head(url, { timeout: 30000 });
        const contentLength = response.headers["content-length"];
        return parseInt(contentLength) || 0;
    } catch (error) {
        throw error;
    }
};

export {
    generateVoice,
    mixAudio,
    getAudioDuration,
    getAudioFileSize,
    BACKGROUND_AUDIO,
};
