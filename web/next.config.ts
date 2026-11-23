import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const config: NextConfig = {
  output: "export",
  // The naming core lives one level up in ../src; let the bundler see it.
  turbopack: { root: fileURLToPath(new URL("..", import.meta.url)) },
};

export default config;
