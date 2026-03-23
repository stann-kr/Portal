/**
 * @file src/lib/actions/students.ts
 * @description 학생 계정 관련 서버 액션.
 * Admin 전용: 학생 생성(초대), 목록 조회, 삭제.
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createDb } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

/** 관리자 권한 체크 유틸 */
async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin only.");
  }
  return session;
}

// ───────────────────────────────────────────────
// 학생 목록 조회
// ───────────────────────────────────────────────

/**
 * 모든 학생(role=student) 목록 조회.
 * @returns 학생 프로필 배열
 */
export async function getStudents() {
  await requireAdmin();
  const db = createDb();
  return db.select().from(profiles).where(eq(profiles.role, "student"));
}

/**
 * 전체 학생 수 조회 (대시보드 통계용).
 */
export async function getStudentCount(): Promise<number> {
  await requireAdmin();
  const db = createDb();
  const rows = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.role, "student"));
  return rows.length;
}

// ───────────────────────────────────────────────
// 학생 계정 생성
// ───────────────────────────────────────────────

export type CreateStudentState = {
  error?: string;
  success?: boolean;
};

/**
 * 학생 계정 생성 서버 액션 (FormData 기반).
 * @param _prev - 이전 상태 (useActionState용)
 * @param formData - { email, password, displayName }
 */
export async function createStudent(
  _prev: CreateStudentState,
  formData: FormData,
): Promise<CreateStudentState> {
  await requireAdmin();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;

  // 입력 검증
  if (!email || !password || !displayName) {
    return { error: "모든 필드를 입력해주세요." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }

  const db = createDb();

  // 이메일 중복 확인
  const existing = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { error: "이미 존재하는 이메일입니다." };
  }

  // 비밀번호 해시 및 계정 삽입
  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  await db.insert(profiles).values({
    id,
    email,
    passwordHash,
    displayName,
    role: "student",
  });

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin");
}

// ───────────────────────────────────────────────
// 학생 계정 삭제
// ───────────────────────────────────────────────

/**
 * 학생 계정 삭제.
 * @param studentId - 삭제할 학생 ID
 */
export async function deleteStudent(studentId: string): Promise<void> {
  await requireAdmin();
  const db = createDb();
  await db.delete(profiles).where(eq(profiles.id, studentId));
  revalidatePath("/dashboard/admin");
}

// ───────────────────────────────────────────────
// 학생 단건 조회
// ───────────────────────────────────────────────

/**
 * ID로 학생 단건 조회.
 * @param studentId - 학생 ID
 */
export async function getStudentById(studentId: string) {
  await requireAdmin();
  const db = createDb();
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, studentId))
    .limit(1);
  return rows[0] ?? null;
}
