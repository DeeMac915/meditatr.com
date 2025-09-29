/** @type {import('next').NextConfig} */
const nextConfig = {
    // Environment variables starting with NEXT_PUBLIC_ are automatically exposed
    // No need to manually configure them in the env object

    // Webpack configuration to handle compatibility issues
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Exclude problematic packages from client-side bundle
            config.resolve.fallback = {
                ...config.resolve.fallback,
                undici: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
