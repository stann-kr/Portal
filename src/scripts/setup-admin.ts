/**
 * @file src/scripts/setup-admin.ts
 * @description 관리자 계정을 데이터베이스에 생성하거나 기존 계정에 관리자 권한을 부여하는 스크립트.
 *
 * 사용법:
 *   SQL 출력 모드 (기본):
 *     npx tsx src/scripts/setup-admin.ts <email> <password> [displayName]
 *
 *   로컬 직접 실행 모드 (--exec 플래그):
 *     npx tsx src/scripts/setup-admin.ts <email> <password> [displayName] --exec
 *     → Wrangler 로컬 SQLite에 직접 INSERT/UPSERT 실행
 */

import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const args = process.argv.slice(2);
const execFlag = args.includes("--exec");
const filteredArgs = args.filter((a) => a !== "--exec");

const email = filteredArgs[0];
const password = filteredArgs[1];
const displayName = filteredArgs[2] || "Stann";

if (!email || !password) {
  console.error(
    "Usage: npx tsx src/scripts/setup-admin.ts <email> <password> [displayName] [--exec]",
  );
  process.exit(1);
}

async function run() {
  const hash = await bcrypt.hash(password, 10);
  const id = randomUUID();

  const sql = `INSERT INTO profiles (id, email, password_hash, display_name, role) VALUES ('${id}', '${email}', '${hash}', '${displayName}', 'admin') ON CONFLICT(email) DO UPDATE SET role='admin', password_hash='${hash}';`;

  if (execFlag) {
    // 로컬 직접 실행 모드: Wrangler SQLite에 바로 삽입
    await runLocal(sql, email, hash, id, displayName);
  } else {
    // SQL 출력 모드 (기존 동작)
    printSqlCommands(sql);
  }
}

async function runLocal(
  sql: string,
  email: string,
  hash: string,
  id: string,
  displayName: string,
) {
  const path = await import("path");
  const fs = await import("fs");

  const wranglerD1Dir = path.join(
    process.cwd(),
    ".wrangler",
    "state",
    "v3",
    "d1",
    "miniflare-D1DatabaseObject",
  );

  if (!fs.existsSync(wranglerD1Dir)) {
    console.error(
      `\n❌ Wrangler 로컬 D1 SQLite를 찾을 수 없습니다.\n경로: ${wranglerD1Dir}\n\n먼저 마이그레이션을 실행하세요:\n  ./dev.sh migrate\n`,
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(wranglerD1Dir)
    .filter((f: string) => f.endsWith(".sqlite"));

  if (files.length === 0) {
    console.error(
      `\n❌ SQLite 파일이 없습니다. 먼저 마이그레이션을 실행하세요:\n  ./dev.sh migrate\n`,
    );
    process.exit(1);
  }

  const sqlitePath = path.join(wranglerD1Dir, files[0]);

  // dynamic import로 better-sqlite3 로드 (ESM/CJS 혼용 환경 대응)
  const Database = (await import("better-sqlite3" as string)).default;
  const db = new Database(sqlitePath);

  try {
    db.prepare(sql).run();
    console.log(`\n✅ 관리자 계정이 생성되었습니다!`);
    console.log(`   이메일: ${email}`);
    console.log(`   이름:   ${displayName}`);
    console.log(`   역할:   admin\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ 데이터베이스 오류: ${message}\n`);
    process.exit(1);
  } finally {
    db.close();
  }
}

function printSqlCommands(sql: string) {
  console.log(
    "\n✅ SQL 명령어가 생성되었습니다! 아래 명령어를 상황에 맞게 실행하세요:\n",
  );

  console.log("--- [ 로컬 전용 (Local) ] ---");
  console.log(
    `docker compose run --rm web npx wrangler d1 execute portal-db --local --command "${sql.replace(/"/g, '\\"')}"`,
  );

  console.log("\n--- [ 원격 전용 (Remote/Production) ] ---");
  console.log(
    `docker compose run --rm web npx wrangler d1 execute portal-db --remote --command "${sql.replace(/"/g, '\\"')}"`,
  );

  console.log(
    "\n⚠️  주의: 비밀번호가 포함된 해시값이 터미널 로그에 남지 않도록 실행 후 터미널을 클리어하는 것이 좋습니다.\n",
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
