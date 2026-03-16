import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: '/api/core/:path*', destination: `${process.env.CORE_URL || 'http://localhost:8001'}/api/v1/:path*` },
      { source: '/api/auth-service/:path*', destination: `${process.env.AUTH_URL || 'http://localhost:8002'}/api/:path*` },
      { source: '/api/billing/:path*', destination: `${process.env.BILLING_URL || 'http://localhost:8003'}/:path*` },
      { source: '/api/analytics/:path*', destination: `${process.env.ANALYTICS_URL || 'http://localhost:8004'}/analytics/:path*` },
      { source: '/api/notifications/:path*', destination: `${process.env.NOTIFICATIONS_URL || 'http://localhost:8005'}/:path*` },
      { source: '/api/payments/:path*', destination: `${process.env.PAYMENTS_URL || 'http://localhost:8006'}/api/v1/:path*` },
      { source: '/api/runtime/:path*', destination: `${process.env.RUNTIME_URL || 'http://localhost:8007'}/api/v1/:path*` },
    ];
  },
};

export default nextConfig;
