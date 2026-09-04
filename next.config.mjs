/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    outputFileTracingIncludes: {
      "/**": [
        "./data/generated/**/*",
        "./data/processed/**/*",
        "./backend/database/schema.sql",
      ],
    },
  },
};

export default nextConfig;
