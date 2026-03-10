/**
 * @file types/next-auth.d.ts
 * @description NextAuth.js 세션, 유저, JWT 토큰 타입에 `role` 필드를 확장 선언.
 * 이로써 코드베이스 전체에서 `(user as any).role` 패턴 없이 타입 안전하게 접근 가능.
 */
import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

type UserRole = "admin" | "student";

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole;
  }
}
