/**
 * @file src/lib/actions/calendarEvents.ts
 * @description 개인 캘린더 이벤트 CRUD 서버 액션 (Phase 4).
 * 본인 이벤트만 조회/수정/삭제 가능.
 */
"use server";

import { revalidatePath } from "next/cache";
import { createDb } from "@/db/client";
import { calendarEvents } from "@/db/schema";
import type { CalendarEventType } from "@/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

// ─── 조회 ────────────────────────────────────────

/**
 * 특정 기간의 본인 캘린더 이벤트 목록 조회.
 * @param start 조회 시작 시각 (ISO string)
 * @param end   조회 종료 시각 (ISO string)
 */
export async function getCalendarEvents(start: string, end: string) {
  const session = await requireAuth();
  const db = createDb();

  return db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.userId, session.user.id!),
        gte(calendarEvents.startTime, new Date(start)),
        lte(calendarEvents.startTime, new Date(end)),
      ),
    );
}

// ─── 생성 ────────────────────────────────────────

export type CreateEventState = { error?: string; id?: string };

/**
 * 캘린더 이벤트 생성.
 */
export async function createCalendarEvent(
  _prev: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const session = await requireAuth();

  const title = (formData.get("title") as string)?.trim();
  const eventType = (formData.get("eventType") as CalendarEventType) || "NOTE";
  const startTimeRaw = formData.get("startTime") as string;
  const endTimeRaw = formData.get("endTime") as string;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!title) return { error: "제목을 입력해주세요." };
  if (!startTimeRaw) return { error: "시작 시간을 입력해주세요." };

  const startTime = new Date(startTimeRaw);
  const endTime = endTimeRaw ? new Date(endTimeRaw) : null;

  if (isNaN(startTime.getTime())) return { error: "시작 시간 형식이 올바르지 않습니다." };
  if (endTime && isNaN(endTime.getTime())) return { error: "종료 시간 형식이 올바르지 않습니다." };
  if (endTime && endTime <= startTime) return { error: "종료 시간은 시작 시간 이후여야 합니다." };

  const db = createDb();
  const id = crypto.randomUUID();

  await db.insert(calendarEvents).values({
    id,
    userId: session.user.id!,
    eventType,
    title,
    startTime,
    endTime: endTime ?? undefined,
    description,
  });

  revalidatePath("/dashboard/calendar");
  return { id };
}

// ─── 수정 ────────────────────────────────────────

/**
 * 캘린더 이벤트 수정 (드래그&드롭 날짜 변경 포함).
 */
export async function updateCalendarEvent(
  eventId: string,
  data: {
    title?: string;
    eventType?: CalendarEventType;
    startTime?: Date;
    endTime?: Date | null;
    description?: string | null;
  },
) {
  const session = await requireAuth();
  const db = createDb();

  await db
    .update(calendarEvents)
    .set(data)
    .where(
      and(
        eq(calendarEvents.id, eventId),
        eq(calendarEvents.userId, session.user.id!),
      ),
    );

  revalidatePath("/dashboard/calendar");
}

// ─── 삭제 ────────────────────────────────────────

/**
 * 캘린더 이벤트 삭제 (본인 이벤트만).
 */
export async function deleteCalendarEvent(eventId: string) {
  const session = await requireAuth();
  const db = createDb();

  await db
    .delete(calendarEvents)
    .where(
      and(
        eq(calendarEvents.id, eventId),
        eq(calendarEvents.userId, session.user.id!),
      ),
    );

  revalidatePath("/dashboard/calendar");
}
