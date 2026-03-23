/**
 * @file src/lib/actions/feedbacks.ts
 * @description 타임스탬프 피드백 관련 서버 액션.
 * Admin: 피드백 작성/삭제.
 * 공통: 과제별 피드백 목록 조회.
 */
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createDb } from "@/db/client";
import { feedbacks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Admin only");
  return session;
}

// ───────────────────────────────────────────────
// 조회
// ───────────────────────────────────────────────

/**
 * 과제별 피드백 목록 조회 (타임스탬프 오름차순).
 */
export async function getFeedbacksByAssignment(assignmentId: string) {
  const db = createDb();
  return db
    .select()
    .from(feedbacks)
    .where(eq(feedbacks.assignmentId, assignmentId))
    .orderBy(asc(feedbacks.timeMarker));
}

// ───────────────────────────────────────────────
// Admin: 피드백 작성
// ───────────────────────────────────────────────

export type CreateFeedbackState = { error?: string; success?: boolean };

/**
 * 타임스탬프 피드백 작성 (Admin 전용).
 * @param assignmentId - 대상 과제 ID
 * @param _prev - useActionState 이전 상태
 * @param formData - { timeMarker(초 단위), content }
 */
export async function createFeedback(
  assignmentId: string,
  _prev: CreateFeedbackState,
  formData: FormData,
): Promise<CreateFeedbackState> {
  await requireAdmin();

  const timeMarkerStr = formData.get("timeMarker") as string;
  const content = (formData.get("content") as string)?.trim();

  if (!content) return { error: "피드백 내용을 입력해주세요." };

  // "MM:SS" 또는 "초" 입력 처리
  let timeMarker: number;
  if (timeMarkerStr.includes(":")) {
    const [m, s] = timeMarkerStr.split(":").map(Number);
    timeMarker = (m || 0) * 60 + (s || 0);
  } else {
    timeMarker = Number(timeMarkerStr) || 0;
  }

  const db = createDb();
  await db.insert(feedbacks).values({
    id: crypto.randomUUID(),
    assignmentId,
    timeMarker,
    content,
  });

  revalidatePath(`/dashboard/student/assignments/${assignmentId}`);
  return { success: true };
}

// ───────────────────────────────────────────────
// Admin: 피드백 삭제
// ───────────────────────────────────────────────

/**
 * 피드백 삭제 (Admin 전용).
 */
export async function deleteFeedback(feedbackId: string, assignmentId: string) {
  await requireAdmin();
  const db = createDb();
  await db.delete(feedbacks).where(eq(feedbacks.id, feedbackId));
  revalidatePath(`/dashboard/student/assignments/${assignmentId}`);
}

// ───────────────────────────────────────────────
// 유틸: 초 → "MM:SS" 변환
// ───────────────────────────────────────────────

/** @param seconds - 타임스탬프 (초 단위) */
export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
