/** @type {import('next').NextConfig} */
require("dotenv").config;

const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  swcMinify: true,
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: `${backendUrl}/api/:path*`, // Proxy to Backend
    },
  ],
  images: { domains: [backendUrl] },
};

module.exports = nextConfig;
