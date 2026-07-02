import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.daraz.pk" },
      { protocol: "https", hostname: "**.lazcdn.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "**.aliyuncs.com" },
      { protocol: "https", hostname: "**.cdnpk.net" },
      { protocol: "https", hostname: "**.darazstatic.com" },
      { protocol: "https", hostname: "**.daraz.com" },
    ],
  },
};

export default nextConfig;
