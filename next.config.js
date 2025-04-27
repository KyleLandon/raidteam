/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    experimental: {
        serverActions: true,
    },
    webpack: (config, { isServer }) => {
        // Fix module resolution for aliases
        config.resolve.alias = {
            ...config.resolve.alias,
        };
        // Ensure proper module resolution
        config.resolve.modules = ['node_modules', '.'];
        return config;
    },
};

module.exports = nextConfig;
