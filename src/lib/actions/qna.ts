/**
 * @file src/lib/actions/qna.ts
 * @description 1:1 Q&A 게시판 서버 액션 (Phase 6).
 * 학생: 본인 스레드 생성/조회, 답변 추가.
 * 어드민: 전체 스레드 조회, 답변 작성, 상태 변경.
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createDb } from "@/db/client";
import { qnaThreads, qnaReplies, profiles } from "@/db/schema";
import type { QnaStatus } from "@/db/schema";
import { and, eq, desc, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

// ─── 스레드 조회 ──────────────────────────────────

/**
 * 스레드 목록 조회.
 * 학생: 본인 스레드만, 어드민: 전체 + 학생 정보 포함.
 */
export async function getQnaThreads() {
  const session = await requireAuth();
  const db = createDb();
  const isAdmin = session.user.role === "admin";

  return db
    .select({
      id: qnaThreads.id,
      title: qnaThreads.title,
      status: qnaThreads.status,
      createdAt: qnaThreads.createdAt,
      updatedAt: qnaThreads.updatedAt,
      studentId: qnaThreads.studentId,
      studentName: profiles.displayName,
      studentEmail: profiles.email,
    })
    .from(qnaThreads)
    .leftJoin(profiles, eq(qnaThreads.studentId, profiles.id))
    .where(isAdmin ? undefined : eq(qnaThreads.studentId, session.user.id!))
    .orderBy(desc(qnaThreads.updatedAt));
}

/**
 * 특정 학생의 Q&A 스레드 목록 조회 (어드민 전용).
 * @param studentId 조회 대상 학생 ID
 */
export async function getQnaThreadsByStudent(studentId: string) {
  const session = await requireAuth();
  if (session.user.role !== "admin") throw new Error("Unauthorized");

  const db = createDb();
  return db
    .select({
      id: qnaThreads.id,
      title: qnaThreads.title,
      status: qnaThreads.status,
      createdAt: qnaThreads.createdAt,
      updatedAt: qnaThreads.updatedAt,
      studentId: qnaThreads.studentId,
      studentName: profiles.displayName,
      studentEmail: profiles.email,
    })
    .from(qnaThreads)
    .leftJoin(profiles, eq(qnaThreads.studentId, profiles.id))
    .where(eq(qnaThreads.studentId, studentId))
    .orderBy(desc(qnaThreads.updatedAt));
}

/**
 * 스레드 단건 + 답변 목록 조회.
 */
export async function getQnaThread(threadId: string) {
  const session = await requireAuth();
  const db = createDb();
  const isAdmin = session.user.role === "admin";

  const [thread] = await db
    .select({
      id: qnaThreads.id,
      title: qnaThreads.title,
      status: qnaThreads.status,
      createdAt: qnaThreads.createdAt,
      studentId: qnaThreads.studentId,
      studentName: profiles.displayName,
      studentEmail: profiles.email,
    })
    .from(qnaThreads)
    .leftJoin(profiles, eq(qnaThreads.studentId, profiles.id))
    .where(
      isAdmin
        ? eq(qnaThreads.id, threadId)
        : and(
            eq(qnaThreads.id, threadId),
            eq(qnaThreads.studentId, session.user.id!),
          ),
    )
    .limit(1);

  if (!thread) return null;

  const replies = await db
    .select({
      id: qnaReplies.id,
      contentHtml: qnaReplies.contentHtml,
      attachmentUrl: qnaReplies.attachmentUrl,
      createdAt: qnaReplies.createdAt,
      authorId: qnaReplies.authorId,
      authorName: profiles.displayName,
      authorEmail: profiles.email,
      authorRole: profiles.role,
    })
    .from(qnaReplies)
    .leftJoin(profiles, eq(qnaReplies.authorId, profiles.id))
    .where(eq(qnaReplies.threadId, threadId))
    .orderBy(qnaReplies.createdAt);

  return { ...thread, replies };
}

/**
 * 미답변(OPEN) 스레드 수 — 대시보드 위젯/뱃지용.
 * 어드민: 전체, 학생: 본인 것만.
 */
export async function getOpenThreadCount(): Promise<number> {
  const session = await requireAuth();
  const db = createDb();
  const isAdmin = session.user.role === "admin";

  const [row] = await db
    .select({ cnt: count() })
    .from(qnaThreads)
    .where(
      isAdmin
        ? eq(qnaThreads.status, "OPEN")
        : and(
            eq(qnaThreads.studentId, session.user.id!),
            eq(qnaThreads.status, "OPEN"),
          ),
    );

  return row?.cnt ?? 0;
}

// ─── 스레드 생성 ──────────────────────────────────

export type CreateThreadState = { error?: string };

/**
 * 새 Q&A 스레드 생성 (학생 전용).
 */
export async function createQnaThread(
  _prev: CreateThreadState,
  formData: FormData,
): Promise<CreateThreadState> {
  const session = await requireAuth();

  const title = (formData.get("title") as string)?.trim();
  const contentHtml = formData.get("contentHtml") as string;

  if (!title) return { error: "제목을 입력해주세요." };
  if (!contentHtml || contentHtml === "<p></p>")
    return { error: "내용을 입력해주세요." };

  const db = createDb();
  const threadId = crypto.randomUUID();
  const replyId = crypto.randomUUID();

  // 스레드 생성
  await db.insert(qnaThreads).values({
    id: threadId,
    studentId: session.user.id!,
    title,
    status: "OPEN",
  });

  // 첫 번째 질문을 reply로 저장
  await db.insert(qnaReplies).values({
    id: replyId,
    threadId,
    authorId: session.user.id!,
    contentHtml,
  });

  revalidatePath("/dashboard/qna");
  redirect(`/dashboard/qna/${threadId}`);
}

// ─── 답변 추가 ────────────────────────────────────

export type CreateReplyState = { error?: string };

/**
 * 답변/추가 질문 작성 (학생 + 어드민).
 * 어드민이 답변하면 스레드 상태를 ANSWERED로 자동 변경.
 */
export async function createQnaReply(
  threadId: string,
  _prev: CreateReplyState,
  formData: FormData,
): Promise<CreateReplyState> {
  const session = await requireAuth();
  const isAdmin = session.user.role === "admin";

  const contentHtml = formData.get("contentHtml") as string;
  if (!contentHtml || contentHtml === "<p></p>")
    return { error: "내용을 입력해주세요." };

  const db = createDb();

  await db.insert(qnaReplies).values({
    id: crypto.randomUUID(),
    threadId,
    authorId: session.user.id!,
    contentHtml,
  });

  // 어드민 답변 시 → ANSWERED로 자동 전환
  if (isAdmin) {
    await db
      .update(qnaThreads)
      .set({ status: "ANSWERED", updatedAt: new Date() })
      .where(eq(qnaThreads.id, threadId));
  } else {
    // 학생 추가 질문 시 → OPEN으로 재오픈
    await db
      .update(qnaThreads)
      .set({ status: "OPEN", updatedAt: new Date() })
      .where(eq(qnaThreads.id, threadId));
  }

  revalidatePath(`/dashboard/qna/${threadId}`);
  revalidatePath("/dashboard/qna");
  return {};
}

// ─── 상태 변경 ────────────────────────────────────

/**
 * 스레드 상태 변경 (어드민 전용).
 */
export async function updateThreadStatus(threadId: string, status: QnaStatus) {
  const session = await requireAuth();
  if (session.user.role !== "admin") throw new Error("Unauthorized");

  const db = createDb();
  await db
    .update(qnaThreads)
    .set({ status, updatedAt: new Date() })
    .where(eq(qnaThreads.id, threadId));

  revalidatePath(`/dashboard/qna/${threadId}`);
  revalidatePath("/dashboard/qna");
}
