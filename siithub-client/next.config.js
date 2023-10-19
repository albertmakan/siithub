/** @type {import('next').NextConfig} */
require("dotenv").config;

const backendHost = process.env.BACKEND_HOST || "localhost";
const backendPort = process.env.BACKEND_PORT || "3001";
const backendProtocol = process.env.BACKEND_PROTOCOL || "http";
const backendBase = process.env.BACKEND_BASE || "";
const backendUrl = `${backendProtocol}://${backendHost}:${backendPort}/${backendBase}`;

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
