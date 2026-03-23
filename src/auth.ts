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
       * setupDevPlatform()이 로컬 개발 시 process.env에 D1 바인딩을 주입함.
       * 프로덕션: Cloudflare Workers 런타임에서 env.DB로 자동 주입.
       *
       * @param credentials - { email, password }
       * @returns 유저 객체 (성공 시) 또는 null
       * @throws CredentialsSignin - 자격증명 불일치 시
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // setupDevPlatform()은 process.env에 D1Database 객체를 직접 주입함
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbBinding = (process.env as any).DB as any;

        const db = createDb(dbBinding);

        let userList: (typeof profiles.$inferSelect)[];
        try {
          userList = await db
            .select()
            .from(profiles)
            .where(eq(profiles.email, credentials.email as string))
            .limit(1);
        } catch (err) {
          // D1 마이그레이션 미적용 시 테이블 없음 에러 발생
          console.error("[auth] DB query failed. Run: ./dev.sh migrate", err);
          throw new CredentialsSignin("Service temporarily unavailable.");
        }

        const user = userList[0];
        if (!user || !user.passwordHash) {
          throw new CredentialsSignin("Invalid credentials.");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) {
          throw new CredentialsSignin("Invalid credentials.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: (user.role as "admin" | "student") ?? "student",
        };
      },
    }),
  ],
});
