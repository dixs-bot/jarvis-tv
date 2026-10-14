/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Ship the saved playlist snapshot with the /api/playlist serverless function.
  outputFileTracingIncludes: { "/api/playlist": ["./data/**"] },
};

export default nextConfig;
