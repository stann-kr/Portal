import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

/**
 * @file src/scripts/setup-admin.ts
 * @description 관리자 계정을 D1 데이터베이스에 생성하거나 기존 계정에 관리자 권한을 부여하는 스크립트.
 * 로컬 또는 원격 D1의 SQL 명령어를 생성하여 출력함.
 */

const email = process.argv[2];
const password = process.argv[3];
const displayName = process.argv[4] || "Stann";

if (!email || !password) {
  console.error(
    "Usage: npx tsx src/scripts/setup-admin.ts <email> <password> [displayName]",
  );
  process.exit(1);
}

async function generateSql() {
  const hash = await bcrypt.hash(password, 10);
  const id = randomUUID();

  const sql = `INSERT INTO profiles (id, email, password_hash, display_name, role) VALUES ('${id}', '${email}', '${hash}', '${displayName}', 'admin') ON CONFLICT(email) DO UPDATE SET role='admin', password_hash='${hash}';`;

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

generateSql().catch(console.error);
