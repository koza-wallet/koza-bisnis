import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone testing on local network Wi-Fi without HMR cross-origin warnings
  allowedDevOrigins: ["10.166.152.36", "localhost:3005", "127.0.0.1:3005"],
};

export default nextConfig;
