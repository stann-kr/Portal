/**
 * @file middleware.ts
 * @description NextAuth.js 인증 미들웨어.
 * Next.js App Router는 `src/middleware.ts`를 자동으로 인식함.
 * 역할 기반 리다이렉트 및 보호 라우트 처리를 담당.
 */
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  /**
   * 정적 파일, 이미지 최적화 경로, favicon 제외.
   * 나머지 모든 경로에 미들웨어 적용.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
