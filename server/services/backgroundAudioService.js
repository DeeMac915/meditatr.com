import AWS from "aws-sdk";
import fs from "fs";

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

/**
 * Upload background audio files to S3
 */
const uploadBackgroundAudio = async (filePath, audioType) => {
    try {
        const fileName = `background-audio/${audioType}.mp3`;

        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: fs.readFileSync(filePath),
            ContentType: "audio/mpeg",
        };

        const uploadResult = await s3.upload(uploadParams).promise();
        return uploadResult.Location;
    } catch (error) {
        console.error("Background audio upload error:", error);
        throw new Error("Failed to upload background audio");
    }
};

/**
 * Get background audio URL from audioService.js
 */
const BACKGROUND_AUDIO = {
    pain_release:
        "https://meditatrbucket.s3.us-east-1.amazonaws.com/Pain-release.mp3",
    positive_transformation:
        "https://meditatrbucket.s3.us-east-1.amazonaws.com/Positive+Transformation.mp3",
    brain_power:
        "https://meditatrbucket.s3.us-east-1.amazonaws.com/Study+Brain+Power.mp3",
    sleep: "https://meditatrbucket.s3.us-east-1.amazonaws.com/Sleep.mp3",
};

const getBackgroundAudioUrl = (audioType) => {
    return BACKGROUND_AUDIO[audioType] || null;
};

/**
 * List available background audio types
 */
const getAvailableBackgroundAudio = () => {
    return [
        {
            value: "pain_release",
            label: "Pain Release",
            description: "Soothing tones for pain relief",
            url: BACKGROUND_AUDIO.pain_release,
        },
        {
            value: "positive_transformation",
            label: "Positive Transformation",
            description: "Uplifting and transformative sounds",
            url: BACKGROUND_AUDIO.positive_transformation,
        },
        {
            value: "brain_power",
            label: "Brain Power",
            description: "Focus and concentration enhancement",
            url: BACKGROUND_AUDIO.brain_power,
        },
        {
            value: "sleep",
            label: "Sleep Tones",
            description: "Deep sleep sounds",
            url: BACKGROUND_AUDIO.sleep,
        },
    ];
};

export {
    uploadBackgroundAudio,
    getBackgroundAudioUrl,
    getAvailableBackgroundAudio,
};
