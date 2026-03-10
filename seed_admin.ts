import { createDb } from "./src/db/client";
import { profiles } from "./src/db/schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function main() {
  const db = createDb();

  // 변경할 관리자 이메일과 패스워드 설정
  const adminEmail = "admin@stannlumo.com";
  const rawPassword = "adminpassword123!"; // 실제 사용시 변경 필수

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(rawPassword, salt);

  try {
    await db.insert(profiles).values({
      id: crypto.randomUUID(),
      email: adminEmail,
      displayName: "Stann Lumo (Admin)",
      role: "admin",
      passwordHash: passwordHash,
    });

    console.log("✅ Admin user seeded successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${rawPassword}`);
    console.log("⚠️ Please make sure to change this password in production.");
  } catch (err: any) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      console.log("⚠️ Admin user already exists with this email.");
    } else {
      console.error("❌ Failed to seed admin user:", err);
    }
  }
}

main().catch(console.error);
