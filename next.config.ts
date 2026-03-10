import type { NextConfig } from "next";

/**
 * 로컬 개발 환경에서 Cloudflare 바인딩(D1, R2 등)을 Next.js에 주입.
 *
 * setupDevPlatform()의 내부 shouldSetupContinue() 함수는
 * globalThis.AsyncLocalStorage 존재 여부를 확인함.
 * Node.js 기본 환경에서는 globalThis에 없으므로 수동으로 등록 필요.
 */
if (process.env.NODE_ENV === "development") {
  // 1. AsyncLocalStorage를 globalThis에 등록 (setupDevPlatform 요구사항)
  if (!("AsyncLocalStorage" in globalThis)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AsyncLocalStorage } = require("async_hooks");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).AsyncLocalStorage = AsyncLocalStorage;
  }

  // 2. setupDevPlatform 호출 (async — 반드시 await 필요)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { setupDevPlatform } = require("@cloudflare/next-on-pages/next-dev");
  // Top-level await는 ESM에서만 동작. next.config.ts는 ESM으로 처리됨.
  // setupDevPlatform() Promise를 백그라운드에서 실행 (Next.js config 초기화 시점)
  setupDevPlatform().catch((err: Error) => {
    console.error("[next.config] setupDevPlatform failed:", err);
  });
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
