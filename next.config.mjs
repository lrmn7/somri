/** @type {import('next').NextConfig} */
const nextConfig = {
  // Opsi di sini akan diaktifkan jika diperlukan
  // Misalnya, untuk mengizinkan gambar dari domain eksternal:
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
};

export default nextConfig;