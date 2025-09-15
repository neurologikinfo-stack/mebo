/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // 👈 permite tus buckets de Supabase
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // 👈 avatares de Google/Clerk
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // 👈 si algún día usas Cloudinary
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com", // 👈 si usas S3
      },
    ],
  },
};

export default nextConfig;
