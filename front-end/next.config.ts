/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip auth routes during static export
  ...(process.env.NODE_ENV === 'production' && {
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
  }),
  // Handle CommonJS modules that need to be transpiled
  transpilePackages: ['@vanilla-extract/sprinkles'],
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config: {
    experiments: {
      asyncWebAssembly: boolean;
      topLevelAwait: boolean;
      layers: boolean;
    };
  }) => {
    config.experiments = {
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true, // optional, with some bundlers/frameworks it doesn't work without
    };

    return config;
  },
};

module.exports = nextConfig;
