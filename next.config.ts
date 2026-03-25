import type { NextConfig } from "next";

/**
 * @opennextjs/cloudflare 기반 배포 설정.
 * 로컬 개발 시 Cloudflare 바인딩(D1, R2 등)은 `getCloudflareContext()`를
 * 통해 런타임에 접근하며, next.config에서의 별도 주입 불필요.
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "bcryptjs"],
  // ESLint flat config(eslint.config.mjs) 설정 문제로 빌드 시 임시 비활성화
  // 별도 `npm run lint` 스크립트로 로컬에서 수동 실행
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
