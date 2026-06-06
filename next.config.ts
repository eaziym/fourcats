import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Avoid bundling Prisma in a way that drops model delegates (e.g. prisma.pet undefined).
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "sharp",
  ],
};

export default nextConfig;
