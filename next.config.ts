import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/core/:path*', destination: `${process.env.CORE_URL || 'https://core.flowlyai.kz'}/api/v1/:path*` },
      { source: '/api/auth-service/:path*', destination: `${process.env.AUTH_URL || 'https://auth.flowlyai.kz'}/api/:path*` },
      { source: '/api/billing/:path*', destination: `${process.env.BILLING_URL || 'https://billing.flowlyai.kz'}/:path*` },
      { source: '/api/analytics/:path*', destination: `${process.env.ANALYTICS_URL || 'https://analytics.flowlyai.kz'}/:path*` },
      { source: '/api/notifications/:path*', destination: `${process.env.NOTIFICATIONS_URL || 'https://notify.flowlyai.kz'}/:path*` },
      { source: '/api/payments/:path*', destination: `${process.env.PAYMENTS_URL || 'https://pay.flowlyai.kz'}/api/v1/:path*` },
      { source: '/api/runtime/:path*', destination: `${process.env.RUNTIME_URL || 'https://agents.flowlyai.kz'}/api/v1/:path*` },
    ];
  },
};

export default nextConfig;
