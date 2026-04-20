/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  typescript: {
    // The `api/` directory is a separate Express project with its own tsconfig.
    // Next.js's build-time type checker scans it and fails on dependencies it
    // can't resolve from the root. We type-check the api separately.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
