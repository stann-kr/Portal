/**
 * @file auth.config.ts
 * @description NextAuth.js 설정 (Edge Runtime 호환).
 * 미들웨어에서 사용 가능하도록 DB 접근 로직 없이 순수 설정만 포함.
 */
import type { NextAuthConfig } from "next-auth";

type UserRole = "admin" | "student";

export const authConfig: NextAuthConfig = {
  providers: [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * 페이지 접근 권한 제어 콜백.
     * 로그인 페이지 접근 시 이미 로그인된 사용자는 역할별 대시보드로 리다이렉트.
     * 그 외 모든 페이지는 로그인 필수.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login");

      if (isAuthPage) {
        if (isLoggedIn) {
          const role: UserRole = auth.user.role ?? "student";
          const target =
            role === "admin" ? "/dashboard/admin" : "/dashboard/student";
          return Response.redirect(new URL(target, nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    /**
     * JWT 생성/갱신 시 role을 토큰에 포함.
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? "student";
      }
      return token;
    },
    /**
     * 세션 객체에 JWT의 role 및 sub(user id) 전달.
     * NextAuth v5 JWT 전략에서 token.sub이 user.id를 담음.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  /**
   * Cloudflare Workers 및 리버스 프록시 환경에서의 호스트 신뢰 설정.
   * 미설정 시 NextAuth가 unknown host로 판단하여 /api/auth/callback/credentials로
   * redirect loop가 발생함.
   */
  trustHost: true,
};
