/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    }
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
