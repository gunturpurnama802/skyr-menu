import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Penting untuk akses via IP LAN (192.168.x.x) di HP.
  // Next 15+ memblokir origin yang tidak di-allow di dev — bikin HMR gagal dan hydration tidak jalan,
  // akibatnya button React tidak ter-attach saat buka via IP (localhost tetap bisa).
  allowedDevOrigins: ["*"],
};

export default nextConfig;
