/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
 allowedDevOrigins: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "https://trackify-app-261177429117.us-central1.run.app"
  ],

}

export default nextConfig
