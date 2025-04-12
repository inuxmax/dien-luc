/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Tạm thời tắt ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 