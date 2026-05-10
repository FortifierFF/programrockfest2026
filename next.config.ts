import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prefer this app folder when another lockfile exists higher in the tree (dev warning fix).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
