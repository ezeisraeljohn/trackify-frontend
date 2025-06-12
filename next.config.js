/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing config...
  allowedDevOrigins: [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://172.20.10.3:3000",
  "https://trackify-app-261177429117.us-central1.run.app"
],
  // ...existing config...
}

module.exports = nextConfig
