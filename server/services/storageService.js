import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

/**
 * Upload audio file to S3
 */
async function uploadToS3(audioBuffer, key) {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: audioBuffer,
            ContentType: "audio/mpeg",
            Metadata: {
                "uploaded-at": new Date().toISOString(),
            },
        };

        const result = await s3.upload(params).promise();
        console.log("Audio uploaded to S3:", result.Location);

        return result.Location;
    } catch (error) {
        console.error("S3 upload error:", error);
        throw new Error(`Failed to upload to S3: ${error.message}`);
    }
}

/**
 * Delete audio file from S3
 */
async function deleteFromS3(key) {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
        };

        await s3.deleteObject(params).promise();
        console.log("Audio deleted from S3:", key);

        return true;
    } catch (error) {
        console.error("S3 delete error:", error);
        throw new Error(`Failed to delete from S3: ${error.message}`);
    }
}

/**
 * Generate presigned URL for private audio access
 */
async function generatePresignedUrl(key, expiresIn = 3600) {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: expiresIn,
        };

        const url = await s3.getSignedUrlPromise("getObject", params);
        return url;
    } catch (error) {
        console.error("Presigned URL generation error:", error);
        throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
}

/**
 * Upload background audio tracks to S3 (admin function)
 */
async function uploadBackgroundTrack(fileBuffer, trackName) {
    try {
        const key = `background-audio/${trackName}.mp3`;

        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: "audio/mpeg",
        };

        const result = await s3.upload(params).promise();
        console.log("Background track uploaded:", result.Location);

        return result.Location;
    } catch (error) {
        console.error("Background track upload error:", error);
        throw new Error(`Failed to upload background track: ${error.message}`);
    }
}

/**
 * List all background tracks
 */
async function listBackgroundTracks() {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Prefix: "background-audio/",
            MaxKeys: 100,
        };

        const result = await s3.listObjectsV2(params).promise();

        return result.Contents.map((item) => ({
            key: item.Key,
            name: item.Key.replace("background-audio/", "").replace(".mp3", ""),
            size: item.Size,
            lastModified: item.LastModified,
            url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
        }));
    } catch (error) {
        console.error("List background tracks error:", error);
        throw new Error(`Failed to list background tracks: ${error.message}`);
    }
}

/**
 * Get S3 bucket statistics
 */
async function getBucketStats() {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            MaxKeys: 1000,
        };

        const result = await s3.listObjectsV2(params).promise();

        const meditations = result.Contents.filter((item) =>
            item.Key.startsWith("meditations/")
        );

        const backgroundTracks = result.Contents.filter((item) =>
            item.Key.startsWith("background-audio/")
        );

        const totalSize = result.Contents.reduce(
            (sum, item) => sum + item.Size,
            0
        );

        return {
            totalFiles: result.Contents.length,
            meditationFiles: meditations.length,
            backgroundTracks: backgroundTracks.length,
            totalSize: totalSize,
            totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
        };
    } catch (error) {
        console.error("Bucket stats error:", error);
        throw new Error(`Failed to get bucket stats: ${error.message}`);
    }
}

export {
    uploadToS3,
    deleteFromS3,
    generatePresignedUrl,
    uploadBackgroundTrack,
    listBackgroundTracks,
    getBucketStats,
};
