/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
    // Potong bundle lucide/recharts/framer di Android: hanya import yang dipakai
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // logo.png kecil — biarkan dioptimasi Next tanpa AVIF berat di HP lama
    formats: ["image/webp"],
  },
  compiler: {
    // Hilangkan console.* di production biar JS lebih kecil
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};
export default nextConfig;
