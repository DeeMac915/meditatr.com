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
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import http from "http";
import https from "https";

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
        agent: false, // Use default agent for connection pooling
    },
    maxRetries: 3, // Retry failed requests up to 3 times
    // Use multipart uploads for files larger than 5MB
    multipartUploadThreshold: 5 * 1024 * 1024,
    multipartUploadSize: 5 * 1024 * 1024,
});

// Configure axios with connection pooling and keep-alive for better performance
const httpClient = axios.create({
    timeout: 120000, // 2 minutes
    maxContentLength: 100 * 1024 * 1024, // 100MB max
    maxBodyLength: 100 * 1024 * 1024,
    httpAgent: new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 50,
        maxFreeSockets: 10,
    }),
    httpsAgent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 50,
        maxFreeSockets: 10,
    }),
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

// Cache directory for background audio files
const backgroundAudioCacheDir = path.join(
    __dirname,
    "../../temp/background-audio-cache"
);

// Ensure cache directory exists
if (!fs.existsSync(backgroundAudioCacheDir)) {
    fs.mkdirSync(backgroundAudioCacheDir, { recursive: true });
}

/**
 * Get cached background audio file path or download if not cached
 * This significantly improves performance by avoiding repeated downloads
 */
const getCachedBackgroundAudio = async (backgroundType) => {
    const backgroundUrl = BACKGROUND_AUDIO[backgroundType];
    if (!backgroundUrl) {
        throw new Error(`Invalid background audio type: ${backgroundType}`);
    }

    // Create a safe filename from the URL
    const urlParts = backgroundUrl.split("/");
    const filename = urlParts[urlParts.length - 1].replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
    );
    const cachedFilePath = path.join(backgroundAudioCacheDir, filename);

    // Check if file exists in cache
    if (fs.existsSync(cachedFilePath)) {
        console.log(
            `Using cached background audio: ${backgroundType} (${cachedFilePath})`
        );
        return cachedFilePath;
    }

    // Download and cache the file
    console.log(
        `Downloading and caching background audio: ${backgroundType} from ${backgroundUrl}`
    );
    try {
        const response = await httpClient.get(backgroundUrl, {
            responseType: "stream",
            timeout: 120000, // 2 minutes
        });

        const writer = createWriteStream(cachedFilePath);
        await pipeline(response.data, writer);

        console.log(`Background audio cached successfully: ${cachedFilePath}`);
        return cachedFilePath;
    } catch (error) {
        // Clean up partial file on error
        if (fs.existsSync(cachedFilePath)) {
            try {
                fs.unlinkSync(cachedFilePath);
            } catch (cleanupError) {
                console.warn(
                    "Failed to clean up partial cache file:",
                    cleanupError
                );
            }
        }
        throw new Error(
            `Failed to download and cache background audio: ${error.message}`
        );
    }
};

/**
 * Generate voice from text using ElevenLabs
 * Optimized with streaming and efficient buffer handling
 */
const generateVoice = async (text, voicePreference = "female") => {
    const voiceId = VOICE_IDS[voicePreference];

    if (!voiceId) {
        throw new Error(`Invalid voice preference: ${voicePreference}`);
    }

    try {
        // Generate audio using ElevenLabs (v2.x API)
        const audio = await elevenlabs.textToSpeech.convert(voiceId, {
            text: text,
            model_id: "eleven_multilingual_v2",
        });

        // Stream chunks directly to buffer (more memory efficient)
        const chunks = [];
        let totalSize = 0;

        for await (const chunk of audio) {
            chunks.push(chunk);
            totalSize += chunk.length;
        }

        // Use Buffer.concat with pre-allocated size for better performance
        const audioStream = Buffer.concat(chunks, totalSize);

        // Upload to S3 with optimized settings
        const fileName = `voice/${uuidv4()}.mp3`;
        const fileSizeKB = (audioStream.length / 1024).toFixed(2);

        console.log(
            `Uploading voice audio to S3: ${fileName} (${fileSizeKB} KB)`
        );

        // Use managed upload for automatic multipart handling
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: audioStream,
            ContentType: "audio/mpeg",
            CacheControl: "public, max-age=31536000", // Cache for 1 year
        };

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
 * Download file using streaming for better memory efficiency
 */
const downloadFile = async (url, filePath) => {
    const response = await httpClient.get(url, {
        responseType: "stream",
        timeout: 120000, // 2 minutes
    });

    const writer = createWriteStream(filePath);
    await pipeline(response.data, writer);
};

/**
 * Mix voice with background audio using FFMPEG
 * Optimized with parallel downloads, streaming, and better FFmpeg settings
 */
const mixAudio = async (voiceUrl, backgroundType, duration) => {
    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const voiceFile = path.join(tempDir, `voice-${uuidv4()}.mp3`);
    const outputFile = path.join(tempDir, `final-${uuidv4()}.mp3`);

    // Get cached background audio (downloads only if not cached)
    let backgroundFile;
    try {
        backgroundFile = await getCachedBackgroundAudio(backgroundType);
    } catch (error) {
        throw new Error(`Failed to get background audio: ${error.message}`);
    }

    try {
        // Download voice file (this is unique per meditation, so no caching)
        console.log("Downloading voice file from S3...");
        await downloadFile(voiceUrl, voiceFile);

        console.log(
            "Voice file downloaded, starting mixing with cached background audio..."
        );

        // Mix audio using FFMPEG with optimized settings
        await new Promise((resolve, reject) => {
            const ffmpegProcess = ffmpeg()
                .input(voiceFile)
                .input(backgroundFile)
                .complexFilter([
                    "[0:a]volume=1.0[voice]",
                    "[1:a]volume=0.3,aloop=loop=-1:size=2e+09[bg]",
                    "[voice][bg]amix=inputs=2:duration=first:dropout_transition=2[out]",
                ])
                .outputOptions([
                    "-map",
                    "[out]",
                    "-acodec",
                    "libmp3lame", // Use libmp3lame for better performance
                    "-b:a",
                    "192k", // Bitrate for quality/size balance
                    "-ar",
                    "44100", // Sample rate
                    "-ac",
                    "2", // Stereo
                ])
                .output(outputFile)
                .on("start", (commandLine) => {
                    console.log("FFmpeg command:", commandLine);
                })
                .on("progress", (progress) => {
                    if (progress.percent) {
                        console.log(
                            `Processing: ${Math.round(progress.percent)}% done`
                        );
                    }
                })
                .on("end", () => {
                    console.log("Audio mixing completed");
                    resolve();
                })
                .on("error", (err) => {
                    console.error("FFmpeg error:", err);
                    reject(err);
                });

            // Set FFmpeg timeout (10 minutes max)
            setTimeout(() => {
                if (!ffmpegProcess.killed) {
                    ffmpegProcess.kill("SIGKILL");
                    reject(new Error("FFmpeg process timed out"));
                }
            }, 600000); // 10 minutes

            ffmpegProcess.run();
        });

        // Get file stats before upload
        const stats = fs.statSync(outputFile);
        const fileSizeKB = (stats.size / 1024).toFixed(2);

        console.log(`Uploading mixed audio to S3: ${fileSizeKB} KB`);

        // Use streaming upload for large files (more memory efficient)
        const fileName = `meditations/${uuidv4()}.mp3`;
        const fileStream = fs.createReadStream(outputFile);

        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: fileStream,
            ContentType: "audio/mpeg",
            CacheControl: "public, max-age=31536000", // Cache for 1 year
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        console.log(
            `Mixed audio uploaded successfully: ${uploadResult.Location}`
        );

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
    } finally {
        // Always clean up temporary files, even on error
        // Note: backgroundFile is cached and should NOT be deleted
        const filesToClean = [voiceFile, outputFile];
        for (const file of filesToClean) {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            } catch (cleanupError) {
                console.warn(
                    `Failed to clean up temp file ${file}:`,
                    cleanupError.message
                );
            }
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
 * Get audio file size with optimized HTTP client
 */
const getAudioFileSize = async (url) => {
    try {
        const response = await httpClient.head(url, { timeout: 30000 });
        const contentLength = response.headers["content-length"];
        return parseInt(contentLength) || 0;
    } catch (error) {
        // Fallback: try GET request with range header if HEAD fails
        try {
            const response = await httpClient.get(url, {
                headers: { Range: "bytes=0-0" },
                timeout: 30000,
            });
            const contentRange = response.headers["content-range"];
            if (contentRange) {
                const match = contentRange.match(/\/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            }
            return parseInt(response.headers["content-length"]) || 0;
        } catch (fallbackError) {
            throw new Error(
                `Failed to get audio file size: ${
                    error.message || fallbackError.message
                }`
            );
        }
    }
};

/**
 * Clear background audio cache (useful for updating background audio files)
 */
const clearBackgroundAudioCache = () => {
    try {
        if (fs.existsSync(backgroundAudioCacheDir)) {
            const files = fs.readdirSync(backgroundAudioCacheDir);
            files.forEach((file) => {
                const filePath = path.join(backgroundAudioCacheDir, file);
                try {
                    fs.unlinkSync(filePath);
                    console.log(`Cleared cached background audio: ${file}`);
                } catch (error) {
                    console.warn(
                        `Failed to delete ${filePath}:`,
                        error.message
                    );
                }
            });
            console.log("Background audio cache cleared successfully");
        }
    } catch (error) {
        console.error("Failed to clear background audio cache:", error);
        throw error;
    }
};

/**
 * Get cache statistics
 */
const getBackgroundAudioCacheStats = () => {
    try {
        if (!fs.existsSync(backgroundAudioCacheDir)) {
            return { count: 0, totalSize: 0, files: [] };
        }

        const files = fs.readdirSync(backgroundAudioCacheDir);
        let totalSize = 0;
        const fileStats = [];

        files.forEach((file) => {
            const filePath = path.join(backgroundAudioCacheDir, file);
            try {
                const stats = fs.statSync(filePath);
                totalSize += stats.size;
                fileStats.push({
                    name: file,
                    size: stats.size,
                    sizeKB: (stats.size / 1024).toFixed(2),
                });
            } catch (error) {
                console.warn(`Failed to stat ${filePath}:`, error.message);
            }
        });

        return {
            count: files.length,
            totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            files: fileStats,
        };
    } catch (error) {
        console.error("Failed to get cache stats:", error);
        return { count: 0, totalSize: 0, files: [] };
    }
};

export {
    generateVoice,
    mixAudio,
    getAudioDuration,
    getAudioFileSize,
    BACKGROUND_AUDIO,
    clearBackgroundAudioCache,
    getBackgroundAudioCacheStats,
};
