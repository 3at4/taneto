import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'export', // この行を追加
  // その他の既存設定もここに追加可能
};

export default withBundleAnalyzer(nextConfig);