import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a tunneled dev server (ngrok, etc.) load Next.js's dev-only static
  // resources. ngrok's free tier issues a new random subdomain each session,
  // hence the wildcard — tighten this to a specific origin if you reserve one.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.io"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
