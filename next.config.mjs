/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/error-decode',
        destination: '/error-data',
        permanent: true,
      },
    ]
  },
}

export default nextConfig 