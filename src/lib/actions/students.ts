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
import { profiles, curriculums, lessons, assignments, feedbacks } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
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

// ───────────────────────────────────────────────
// 학생 통합 스탯 조회 (Admin Dashboard 용)
// ───────────────────────────────────────────────

export type StudentRosterStat = {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date | null;
  currentModule: string | null;
  nextLessonDate: Date | null;
  pendingFeedbackCount: number;
};

/**
 * 모든 학생 레코드와 함께 진행 상황 스탯을 병합하여 반환합니다.
 */
export async function getStudentRosterStats(): Promise<StudentRosterStat[]> {
  await requireAdmin();
  const db = createDb();

  // 모든 학생 조회
  const allStudents = await db.select().from(profiles).where(eq(profiles.role, "student")).orderBy(desc(profiles.createdAt));

  // 모든 데이터 패치 (학생 수가 매우 많지 않음을 가정)
  // 향후 성능 이슈 시 raw sql join으로 최적화
  const allMods = await db.select().from(curriculums);
  const allLess = await db.select().from(lessons).orderBy(asc(lessons.scheduledAt));
  const allAssig = await db.select().from(assignments);
  const allFeeds = await db.select().from(feedbacks);

  const now = new Date();

  return allStudents.map((st: any) => {
    // 1. Current Module (완료되지 않은 가장 빠른 주차)
    const stMods = allMods.filter((m: any) => m.studentId === st.id && !m.isCompleted);
    stMods.sort((a: any, b: any) => a.weekNum - b.weekNum);
    const currentModule = stMods.length > 0 ? `Week 0${stMods[0].weekNum}: ${stMods[0].title}` : "All Completed";

    // 2. Next Lesson
    const upcomingLess = allLess.filter((l: any) => l.studentId === st.id && new Date(l.scheduledAt) >= now);
    const nextLessonDate = upcomingLess.length > 0 ? upcomingLess[0].scheduledAt : null;

    // 3. Pending Feedbacks
    // 학생의 애싸인먼트 중 코멘트(feedback)가 없는 것 개수
    const stAssig = allAssig.filter((a: any) => a.studentId === st.id);
    const pendingCount = stAssig.filter((a: any) => {
      // 해당 assignmentId를 가진 피드백이 하나라도 있는지 확인
      const hasFeedback = allFeeds.some((f: any) => f.assignmentId === a.id);
      return !hasFeedback;
    }).length;

    return {
      id: st.id,
      email: st.email,
      displayName: st.displayName,
      createdAt: st.createdAt,
      currentModule,
      nextLessonDate: nextLessonDate ? new Date(nextLessonDate) : null,
      pendingFeedbackCount: pendingCount,
    };
  });
}

