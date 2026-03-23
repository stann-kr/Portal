/**
 * @file auth.ts
 * @description NextAuth.js 핵심 인증 로직 (Node.js 런타임).
 * Cloudflare D1 DB 접근이 필요하므로 Edge Runtime 제외.
 * 자격증명 기반(Credentials) 인증: 이메일 + bcrypt 해시 비교.
 */
import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createDb } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";
import * as bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      /**
       * 자격증명 검증 로직.
       * Cloudflare Workers: D1 바인딩(env.DB)을 통해 접근. 로컬: Wrangler SQLite fallback 사용.
       * 프로덕션: Cloudflare Workers 런타임에서 env.DB로 자동 주입.
       *
       * @param credentials - { email, password }
       * @returns 유저 객체 (성공 시) 또는 null
       * @throws CredentialsSignin - 자격증명 불일치 시
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Cloudflare Workers 환경에서 D1 바인딩 획득 시도
        // OpenNext/__env__ 및 process.env 모두 확인
        let dbBinding = (process.env as any).DB;
        
        // 런타임에 따라 env.DB가 직접 전달되지 않을 때를 대비한 대체 확인
        if (!dbBinding && typeof globalThis !== "undefined") {
          dbBinding = (globalThis as any).env?.DB;
        }

        const db = createDb(dbBinding);

        try {
          const userList = await db
            .select()
            .from(profiles)
            .where(eq(profiles.email, credentials.email as string))
            .limit(1);

          const user = userList[0];
          if (!user || !user.passwordHash) {
            console.error("[auth] User not found:", credentials.email);
            return null; // CredentialsSignin 대신 null 반환 시 NextAuth가 표준 에러 처리
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash,
          );

          if (!isValid) {
            console.error("[auth] Password mismatch for:", credentials.email);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            role: (user.role as "admin" | "student") ?? "student",
          };
        } catch (err: any) {
          console.error("[auth] Runtime error in authorize:", err);
          // CallbackRouteError의 원인이 되는 하위 에러를 명확히 throw
          throw new Error(err.message || "Database connection error");
        }
      },
    }),
  ],
});
