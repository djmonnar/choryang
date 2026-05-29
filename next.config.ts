import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? "/choryang" : undefined,
  assetPrefix: isGithubPages ? "/choryang/" : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/choryang" : "",
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
