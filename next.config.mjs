/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "cl1ro7kgga.ufs.sh",
      },
    ],
  },
};

export default nextConfig;