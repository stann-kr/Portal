/**
 * @file src/lib/actions/privateNotes.ts
 * @description 1:1 프라이빗 수업 게시판(노트) 관리를 위한 서버 액션.
 * Admin과 특정 Student만이 해당 노트를 읽고 쓸 수 있음.
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { createDb } from "@/db/client";
import { privateNotes, profiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

/**
 * 특정 학생의 프라이빗 노트 목록 조회.
 * Admin은 모든 학생의 노트를 볼 수 있고, 학생은 본인의 노트만 볼 수 있음.
 */
export async function getPrivateNotes(targetStudentId: string) {
  const session = await requireAuth();
  const userId = session.user.id!;
  const role = session.user.role;

  // 권한 체크: Admin이 아니면서, 대상 학생이 본인이 아니라면 거부
  if (role !== "admin" && userId !== targetStudentId) {
    throw new Error("Forbidden: Cannot access other student notes");
  }

  const db = createDb();
  
  // profile 정보와 조인하여 작성자 displayName 등을 가져올 수 있다
  const notes = await db
    .select({
      id: privateNotes.id,
      title: privateNotes.title,
      contentHtml: privateNotes.contentHtml,
      createdAt: privateNotes.createdAt,
      authorId: privateNotes.authorId,
      authorName: profiles.displayName,
    })
    .from(privateNotes)
    .leftJoin(profiles, eq(privateNotes.authorId, profiles.id))
    .where(eq(privateNotes.studentId, targetStudentId))
    .orderBy(desc(privateNotes.createdAt));

  return notes;
}

export type CreateNoteState = { error?: string; success?: boolean };

/**
 * 1:1 노트 작성.
 * @param targetStudentId 노트를 소유/공유할 대상 학생 ID
 */
export async function createPrivateNote(targetStudentId: string, _prev: CreateNoteState, formData: FormData): Promise<CreateNoteState> {
  const session = await requireAuth();
  const userId = session.user.id!;
  const role = session.user.role;

  if (role !== "admin" && userId !== targetStudentId) {
    return { error: "권한이 없습니다." };
  }

  const title = formData.get("title") as string;
  const rawHtml = formData.get("contentHtml") as string;

  if (!title || !rawHtml) return { error: "제목과 내용은 필수입니다." };

  // 서버사이드 XSS 방어: 클라이언트 DOMPurify와 이중 새니타이징
  const contentHtml = DOMPurify.sanitize(rawHtml);

  const db = createDb();
  const id = crypto.randomUUID();

  try {
    await db.insert(privateNotes).values({
      id,
      studentId: targetStudentId,
      authorId: userId,
      title,
      contentHtml,
    });
    
    // Admin 뷰(탭 통합 포함)와 Student 뷰 양쪽 모두 갱신
    revalidatePath(`/dashboard/admin/students/${targetStudentId}`);
    revalidatePath(`/dashboard/admin/students/${targetStudentId}/notes`);
    revalidatePath(`/dashboard/student/notes`);
    
    return { success: true };
  } catch (err) {
    return { error: "노트 작성 중 오류가 발생했습니다." };
  }
}

export async function deletePrivateNote(noteId: string) {
  const session = await requireAuth();
  const userId = session.user.id!;
  const role = session.user.role;

  const db = createDb();
  
  // 삭제할 노트 조회하여 권한 체크
  const note = await db.select().from(privateNotes).where(eq(privateNotes.id, noteId)).limit(1);
  if (note.length === 0) throw new Error("Not found");
  
  const targetNote = note[0];

  // 작성자 본인 또는 관리자만 삭제 가능
  if (role !== "admin" && targetNote.authorId !== userId) {
    throw new Error("Forbidden");
  }

  await db.delete(privateNotes).where(eq(privateNotes.id, noteId));
  revalidatePath(`/dashboard/admin/students/${targetNote.studentId}`);
  revalidatePath(`/dashboard/admin/students/${targetNote.studentId}/notes`);
  revalidatePath(`/dashboard/student/notes`);
}
