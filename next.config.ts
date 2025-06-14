import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude problematic libSQL native binaries
      config.externals.push({
        "@libsql/darwin-arm64": "commonjs @libsql/darwin-arm64",
        "@libsql/darwin-x64": "commonjs @libsql/darwin-x64",
        "@libsql/linux-arm64-gnu": "commonjs @libsql/linux-arm64-gnu",
        "@libsql/linux-arm64-musl": "commonjs @libsql/linux-arm64-musl",
        "@libsql/linux-x64-gnu": "commonjs @libsql/linux-x64-gnu",
        "@libsql/linux-x64-musl": "commonjs @libsql/linux-x64-musl",
        "@libsql/win32-x64-msvc": "commonjs @libsql/win32-x64-msvc",
      });
    }

    // Add rules to ignore problematic files
    config.module.rules.push(
      {
        test: /\.md$/,
        use: "ignore-loader",
      },
      {
        test: /\.node$/,
        use: "ignore-loader",
      },
      {
        test: /\.(wasm|so|dylib|dll)$/,
        use: "ignore-loader",
      }
    );

    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      util: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    return config;
  },
};

export default nextConfig;
