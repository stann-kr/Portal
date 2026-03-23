/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @file db/client.ts
 * @description Drizzle ORM 클라이언트 팩토리.
 *
 * 런타임 환경에 따라 두 가지 DB 드라이버를 사용:
 * - 프로덕션 (Cloudflare Workers): D1Database 바인딩 → drizzle-orm/d1
 * - 로컬 개발 (Next.js dev): Wrangler가 저장한 로컬 SQLite 파일 → drizzle-orm/better-sqlite3
 *
 * setupDevPlatform()은 Next.js 15 RSC Server Action 컨텍스트에서 D1 바인딩을
 * 주입하지 못하는 알려진 이슈가 있으므로, 개발 환경에서는 SQLite 파일에 직접 접근.
 */
import * as schema from "./schema";

export type DrizzleDb = ReturnType<typeof createDb>;

/**
 * 환경에 따라 적절한 Drizzle DB 인스턴스 반환.
 * @param d1 - Cloudflare D1Database 바인딩 (프로덕션/Workers 환경)
 */
export function createDb(d1?: any) {
  // 프로덕션: D1 바인딩 사용
  if (d1) {
    const { drizzle } = require("drizzle-orm/d1");
    return drizzle(d1, { schema }) as ReturnType<
      typeof import("drizzle-orm/d1").drizzle<typeof schema>
    >;
  }

  // 로컬 개발: Wrangler가 저장한 SQLite 파일에 직접 접근
  if (process.env.NODE_ENV === "development") {
    return createLocalDb();
  }

  throw new Error(
    "D1 Database binding not found. Please check your wrangler.toml and environment variables.",
  );
}

/**
 * 개발 환경 전용: Wrangler 로컬 D1 SQLite 파일을 better-sqlite3로 직접 접근.
 * Wrangler는 로컬 D1을 `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`에 저장.
 */
function createLocalDb() {
  const path = require(/* webpackIgnore: true */ "pa" + "th");
  const fs = require(/* webpackIgnore: true */ "f" + "s");
  const Database = require(/* webpackIgnore: true */ "better-sqlite" + "3");
  const { drizzle } = require(/* webpackIgnore: true */ "drizzle-orm/better-sqlite" + "3");

  // Wrangler 로컬 D1 SQLite 파일 경로 탐색
  const wranglerD1Dir = path.join(
    process.cwd(),
    ".wrangler",
    "state",
    "v3",
    "d1",
    "miniflare-D1DatabaseObject",
  );

  let sqlitePath: string | null = null;

  if (fs.existsSync(wranglerD1Dir)) {
    const files = fs
      .readdirSync(wranglerD1Dir)
      .filter((f: string) => f.endsWith(".sqlite"));
    if (files.length > 0) {
      sqlitePath = path.join(wranglerD1Dir, files[0]);
    }
  }

  if (!sqlitePath) {
    throw new Error(
      `[dev] Wrangler local D1 SQLite not found at ${wranglerD1Dir}. ` +
        "Run: ./dev.sh migrate",
    );
  }

  const sqlite = new Database(sqlitePath);
  return drizzle(sqlite, { schema });
}
