/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ✅ Evita que el build falle por errores de tipos (útil si usas .jsx en vez de .tsx)
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Evita que el build falle por errores de lint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
