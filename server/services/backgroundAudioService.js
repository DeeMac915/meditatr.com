const AWS = require("aws-sdk");

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
            Body: require("fs").readFileSync(filePath),
            ContentType: "audio/mpeg",
            ACL: "public-read",
        };

        const uploadResult = await s3.upload(uploadParams).promise();
        return uploadResult.Location;
    } catch (error) {
        console.error("Background audio upload error:", error);
        throw new Error("Failed to upload background audio");
    }
};

/**
 * Get background audio URL
 */
const getBackgroundAudioUrl = (audioType) => {
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/background-audio/${audioType}.mp3`;
};

/**
 * List available background audio types
 */
const getAvailableBackgroundAudio = () => {
    return [
        {
            value: "nature",
            label: "Nature Sounds",
            description: "Forest, birds, gentle wind",
            url: getBackgroundAudioUrl("nature"),
        },
        {
            value: "ocean",
            label: "Ocean Waves",
            description: "Calming ocean waves",
            url: getBackgroundAudioUrl("ocean"),
        },
        {
            value: "rain",
            label: "Rain Sounds",
            description: "Gentle rainfall",
            url: getBackgroundAudioUrl("rain"),
        },
        {
            value: "forest",
            label: "Forest Ambience",
            description: "Deep forest sounds",
            url: getBackgroundAudioUrl("forest"),
        },
        {
            value: "528-hz",
            label: "528 Hz Frequency",
            description: "Healing frequency tone",
            url: getBackgroundAudioUrl("528-hz"),
        },
        {
            value: "sleep",
            label: "Sleep Tones",
            description: "Deep sleep sounds",
            url: getBackgroundAudioUrl("sleep"),
        },
    ];
};

module.exports = {
    uploadBackgroundAudio,
    getBackgroundAudioUrl,
    getAvailableBackgroundAudio,
};
