import { withPayload } from "@payloadcms/next/withPayload";
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    // Skip linting during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking errors during builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.symmetric.events",
      },
    ],
  },
};
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export default withPayload(config);
