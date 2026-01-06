/**
 * Script to generate PWA icons from the logo
 * Run with: node scripts/generate-icons.js
 *
 * This script requires sharp to be installed:
 * npm install sharp --save-dev
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputLogo = path.join(__dirname, "../public/images/logo-ico.png");
const outputDir = path.join(__dirname, "../public/icons");

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
    try {
        // Check if logo exists
        if (!fs.existsSync(inputLogo)) {
            console.error(`Logo not found at: ${inputLogo}`);
            console.log("Please ensure logo.png exists in public/images/");
            process.exit(1);
        }

        console.log("Generating PWA icons...");

        // Generate icons for each size
        for (const size of iconSizes) {
            const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

            await sharp(inputLogo)
                .resize(size, size, {
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 1 },
                })
                .png()
                .toFile(outputPath);

            console.log(`✓ Generated icon-${size}x${size}.png`);
        }

        console.log("\n✅ All icons generated successfully!");
        console.log(`Icons saved to: ${outputDir}`);
    } catch (error) {
        console.error("Error generating icons:", error);
        process.exit(1);
    }
}

generateIcons();
