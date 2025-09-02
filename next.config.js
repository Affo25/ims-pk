/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    }
  },
  reactStrictMode: false,
  webpack: (config, { dev, isServer }) => {
    // Suppress the SWC platform warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      (warning) => {
        return warning.message && warning.message.includes('@next/swc');
      },
      /Managed item.*@next\/swc.*isn't a directory or doesn't contain a package\.json/,
    ];
    
    // Also suppress in stats
    config.stats = {
      ...config.stats,
      warningsFilter: [
        ...(config.stats?.warningsFilter || []),
        /webpack\.cache\.PackFileCacheStrategy/,
        /@next\/swc/,
      ]
    };

    return config;
  },
};

module.exports = nextConfig;
