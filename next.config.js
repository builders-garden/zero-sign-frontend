/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude all markdown files from libsql packages from webpack processing
    config.module.rules.push({
      test: /\.(md|txt)$/,
      include: /node_modules\/@libsql/,
      loader: "ignore-loader",
    });

    // Also exclude LICENSE files
    config.module.rules.push({
      test: /LICENSE(\.md|\.txt)?$/,
      loader: "ignore-loader",
    });

    return config;
  },
};

module.exports = nextConfig;
