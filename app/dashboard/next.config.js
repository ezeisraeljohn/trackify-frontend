/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing config...
  allowedDevOrigins: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    // Do NOT add your production backend URL here unless you are developing from that domain.
    // Only add origins you use for local development.
  ],
  // ...existing config...
}

module.exports = nextConfig
