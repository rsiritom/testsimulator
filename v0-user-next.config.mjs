/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/select-exam',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'selected-exam',
            value: '',
          },
        ],
      },
    ]
  },
}

export default nextConfig

