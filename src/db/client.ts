/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @file db/client.ts
 * @description Drizzle ORM 클라이언트 팩토리.
 *
 * 런타임 환경에 따라 두 가지 DB 드라이버를 사용:
 * - 프로덕션 (Cloudflare Workers): getCloudflareContext().env.DB → drizzle-orm/d1
 * - 로컬 개발 (Next.js dev): Wrangler가 저장한 로컬 SQLite 파일 → drizzle-orm/better-sqlite3
 *
 * ⚠️ OpenNext에서 D1 바인딩은 process.env.DB로 접근 불가.
 *    반드시 getCloudflareContext()를 통해 접근해야 합니다.
 */
import * as schema from "./schema";

export type DrizzleDb = ReturnType<typeof createLocalDb> | ReturnType<typeof createD1Db>;

type D1Database = {
  prepare: (query: string) => unknown;
  exec: (query: string) => Promise<unknown>;
};

/**
 * D1 바인딩을 직접 받아 Drizzle 인스턴스 생성 (Workers 프로덕션용).
 * @param d1 - Cloudflare D1Database 바인딩
 */
function createD1Db(d1: D1Database) {
  const { drizzle } = require("drizzle-orm/d1");
  return drizzle(d1, { schema });
}

/**
 * 환경에 따라 적절한 Drizzle DB 인스턴스를 반환하는 팩토리 함수.
 *
 * - Cloudflare Workers(프로덕션): getCloudflareContext().env.DB 를 통해 D1 접근
 * - 로컬 개발(Next.js dev server): Wrangler SQLite 파일 직접 접근
 *
 * @throws DB 바인딩 미발견 시 에러
 */
export function createDb(): DrizzleDb {
  // 프로덕션: OpenNext 환경에서 Cloudflare 바인딩 획득
  if (process.env.NODE_ENV !== "development") {
    try {
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      const d1 = ctx?.env?.DB as D1Database | undefined;

      if (d1) {
        return createD1Db(d1);
      }
    } catch {
      // Cloudflare 컨텍스트 획득 실패 시 로컬 환경으로 폴백
    }
  }

  // 로컬 개발: Wrangler가 저장한 SQLite 파일에 직접 접근
  if (process.env.NODE_ENV === "development") {
    return createLocalDb();
  }

  throw new Error(
    "[db] D1 Database binding 'DB' not found.\n" +
      "1. Ensure 'DB' binding exists in wrangler.toml\n" +
      "2. Ensure you are running in a Cloudflare Workers environment."
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
